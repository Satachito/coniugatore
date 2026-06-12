"use strict";

/* =====================================================
   イタリア語動詞活用エンジン
   ===================================================== */

const PRON = [
  ["io", "私"],
  ["tu", "君"],
  ["lui / lei / Lei", "彼・彼女・あなた"],
  ["noi", "私たち"],
  ["voi", "君たち・あなたたち"],
  ["loro", "彼ら"],
];
const IMP_PRON = ["tu", "Lei", "noi", "voi"];

const PRES_END = {
  are: ["o", "i", "a", "iamo", "ate", "ano"],
  ere: ["o", "i", "e", "iamo", "ete", "ono"],
  ire: ["o", "i", "e", "iamo", "ite", "ono"],
};
const FUT_END = ["ò", "ai", "à", "emo", "ete", "anno"];
const COND_END = ["ei", "esti", "ebbe", "emmo", "este", "ebbero"];
const IMPF_SIGN = { are: "av", ere: "ev", ire: "iv" };
const CI_SIGN = { are: "ass", ere: "ess", ire: "iss" };
// 遠過去: 弱形 (tu, noi, voi) と強形のない規則形 (io, lui, loro)
const PR_WEAK = { are: ["asti", "ammo", "aste"], ere: ["esti", "emmo", "este"], ire: ["isti", "immo", "iste"] };
const PR_REG = { are: ["ai", "ò", "arono"], ere: ["ei", "é", "erono"], ire: ["ii", "ì", "irono"] };
const PART_END = { are: "ato", ere: "uto", ire: "ito" };
const AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"];
const ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"];
const STRESSED = [0, 1, 2, 5];

const deacc = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// -are 動詞のつづり調整: i/e で始まる語尾の前で
//   -care/-gare → h を挿入 (cerchi) / -ciare/-giare → i を落とす (mangi) / -iare → i の重複を避ける (studi)
function orthoIt(stem, ending) {
  if (!/^[ieéè]/.test(ending)) return stem;
  if (stem.endsWith("ci") || stem.endsWith("gi")) return stem.slice(0, -1);
  if (stem.endsWith("i") && ending.startsWith("i")) return stem.slice(0, -1);
  if (stem.endsWith("c") || stem.endsWith("g")) return stem + "h";
  return stem;
}

// plain=true なら不規則・-isc・つづり調整なしの素の活用 (ハイライト判定の基準)
function conjugate(v, plain) {
  const inf = v.inf;
  const cl = inf.slice(-3); // are / ere / ire
  const stem = inf.slice(0, -3);
  const wk = (!plain && v.wkStem) || stem;       // 弱語幹 (fare→fac, dire→dic, bere→bev)
  const wcl = (!plain && v.wkCls) || cl;         // 弱語幹の活用クラス

  /* --- 直説法現在 --- */
  let pres = PRES_END[cl].map((e, i) => {
    let st = stem;
    if (!plain) {
      if (v.isc && STRESSED.includes(i)) st = stem + "isc";
      if (cl === "are") st = orthoIt(st, e);
    }
    return st + e;
  });
  if (!plain && v.presOv) pres = v.presOv.slice();

  /* --- 直説法半過去 --- */
  const impf = (!plain && v.impfOv)
    ? v.impfOv.slice()
    : ["o", "i", "a", "amo", "ate", "ano"].map((e) => wk + IMPF_SIGN[wcl] + e);

  /* --- 直説法遠過去 --- */
  let pr;
  if (!plain && v.prOv) pr = v.prOv.slice();
  else if (!plain && v.prStem) {
    const w = PR_WEAK[wcl];
    pr = [v.prStem + "i", wk + w[0], v.prStem + "e", wk + w[1], wk + w[2], v.prStem + "ero"];
  } else {
    const w = PR_WEAK[wcl], r = PR_REG[wcl];
    pr = [wk + r[0], wk + w[0], wk + r[1], wk + w[1], wk + w[2], wk + r[2]];
  }

  /* --- 未来・条件法 --- */
  let fs;
  if (!plain && v.futS) fs = v.futS;
  else if (cl === "ire") fs = stem + "ir";
  else fs = ((cl === "are" && !plain) ? orthoIt(stem, "e") : stem) + "er";
  const fut = FUT_END.map((e) => fs + e);
  const cond = COND_END.map((e) => fs + e);

  /* --- 接続法現在 --- */
  let cong;
  {
    let cs;
    const irr = !plain && !!(v.congS || v.presOv || v.isc);
    if (plain) cs = stem;
    else if (v.congS) cs = v.congS;
    else if (v.presOv) cs = pres[0].replace(/o$/, "");
    else if (v.isc) cs = stem + "isc";
    else cs = (cl === "are") ? orthoIt(stem, "i") : stem;
    const sg = cs + ((cl === "are" && !irr) ? "i" : "a");
    const noi = pres[3];
    const voi = noi.replace(/iamo$/, "iate");
    cong = [sg, sg, sg, noi, voi, sg + "no"];
    if (!plain && v.congOv) cong = v.congOv.slice();
  }

  /* --- 接続法半過去 --- */
  const ci = (!plain && v.congImpfOv)
    ? v.congImpfOv.slice()
    : (() => {
        const c = wk + CI_SIGN[wcl];
        return [c + "i", c + "i", c + "e", c + "imo", wk + PR_WEAK[wcl][2], c + "ero"];
      })();

  /* --- ジェルンディオ・過去分詞 --- */
  let ger = wk + (wcl === "are" ? "ando" : "endo");
  if (!plain && v.ger) ger = v.ger;
  let part = (!plain && v.part) ? v.part : wk + PART_END[wcl];

  /* --- 近過去 (助動詞 avere / essere) --- */
  const aux = (!plain && v.aux === "e") ? "e" : "a";
  let pp;
  if (aux === "e") {
    const pl = part.replace(/o$/, "i");
    pp = ESSERE.map((a, i) => a + " " + (i < 3 ? part + "/-a" : pl + "/-e"));
  } else {
    pp = AVERE.map((a) => a + " " + part);
  }

  /* --- 命令法 --- */
  let impA = null, impN = null;
  if (!v.noImp) {
    const tu = (!plain && v.tu) ? v.tu : (cl === "are" && !v.presOv ? pres[2] : pres[1]);
    const voi2 = (!plain && v.impVoi) ? v.impVoi : pres[4];
    impA = [tu, cong[2], pres[3], voi2];
    impN = ["non " + inf, "non " + cong[2], "non " + pres[3], "non " + voi2];
  }

  return { pres, pp, impf, pr, fut, cond, cong, ci, impA, impN, ger, part, aux, inf };
}

/* =====================================================
   動詞データ
   presOv  = 直説法現在の全人称上書き
   congS   = 接続法現在の語幹 (単数・3複)
   prStem  = 遠過去の強変化語幹 (io/lui/loro)
   prOv    = 遠過去の全人称上書き
   wkStem  = 弱語幹 (半過去・ジェルンディオなどに使う)
   futS    = 未来・条件法の語幹
   isc     = -isc 型 -ire 動詞
   aux     = "e" なら近過去は essere 支配 (過去分詞が性数一致)
   ===================================================== */
const VERBS = [
  // --- 最重要の不規則動詞 ---
  { inf: "essere", ja: "〜である・いる", presOv: ["sono", "sei", "è", "siamo", "siete", "sono"], impfOv: ["ero", "eri", "era", "eravamo", "eravate", "erano"], prOv: ["fui", "fosti", "fu", "fummo", "foste", "furono"], futS: "sar", congS: "si", congImpfOv: ["fossi", "fossi", "fosse", "fossimo", "foste", "fossero"], part: "stato", aux: "e", tu: "sii", impVoi: "siate", note: "イタリア語の最重要動詞。近過去は essere 自身が助動詞で「sono stato/-a」。" },
  { inf: "avere", ja: "持つ・〜がある", presOv: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"], congS: "abbi", prStem: "ebb", futS: "avr", tu: "abbi", impVoi: "abbiate", note: "近過去を作る助動詞。h は発音しない (ho, hai, ha, hanno)。" },
  { inf: "andare", ja: "行く", presOv: ["vado", "vai", "va", "andiamo", "andate", "vanno"], futS: "andr", aux: "e", tu: "va'", note: "「andare a + 不定詞」で「〜しに行く」。命令形 tu は va'。" },
  { inf: "venire", ja: "来る", presOv: ["vengo", "vieni", "viene", "veniamo", "venite", "vengono"], prStem: "venn", futS: "verr", part: "venuto", aux: "e" },
  { inf: "fare", ja: "する・作る", presOv: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"], wkStem: "fac", wkCls: "ere", prStem: "fec", futS: "far", part: "fatto", tu: "fa'", note: "天候表現 (fa caldo など) にも使う。半過去 facevo はラテン語語幹 fac- から。" },
  { inf: "dire", ja: "言う", presOv: ["dico", "dici", "dice", "diciamo", "dite", "dicono"], wkStem: "dic", wkCls: "ere", prStem: "diss", part: "detto", tu: "di'" },
  { inf: "stare", ja: "いる・〜の状態だ", presOv: ["sto", "stai", "sta", "stiamo", "state", "stanno"], congS: "sti", prOv: ["stetti", "stesti", "stette", "stemmo", "steste", "stettero"], congImpfOv: ["stessi", "stessi", "stesse", "stessimo", "steste", "stessero"], futS: "star", part: "stato", aux: "e", tu: "sta'", note: "「stare + ジェルンディオ」で進行形 (sto parlando)。Come stai?「元気?」" },
  { inf: "dare", ja: "与える", presOv: ["do", "dai", "dà", "diamo", "date", "danno"], congS: "di", prOv: ["diedi", "desti", "diede", "demmo", "deste", "diedero"], congImpfOv: ["dessi", "dessi", "desse", "dessimo", "deste", "dessero"], futS: "dar", tu: "da'", note: "3人称単数 dà のアクセント記号は前置詞 da と区別するため。" },
  { inf: "potere", ja: "〜できる", presOv: ["posso", "puoi", "può", "possiamo", "potete", "possono"], futS: "potr", noImp: true },
  { inf: "volere", ja: "〜したい・欲しい", presOv: ["voglio", "vuoi", "vuole", "vogliamo", "volete", "vogliono"], prStem: "voll", futS: "vorr", noImp: true, note: "条件法 vorrei「〜したいのですが」は依頼の定番表現。" },
  { inf: "dovere", ja: "〜しなければならない", presOv: ["devo", "devi", "deve", "dobbiamo", "dovete", "devono"], congS: "debb", prStem: "dovett", futS: "dovr", noImp: true },
  { inf: "sapere", ja: "知る・〜できる(技能)", presOv: ["so", "sai", "sa", "sappiamo", "sapete", "sanno"], congS: "sappi", prStem: "sepp", futS: "sapr", tu: "sappi", note: "情報・技能の「知っている・できる」。人や場所なら conoscere。" },
  { inf: "bere", ja: "飲む", presOv: ["bevo", "bevi", "beve", "beviamo", "bevete", "bevono"], wkStem: "bev", wkCls: "ere", prStem: "bevv", futS: "berr", note: "ラテン語語幹 bev- で活用する (bevevo, bevuto)。" },
  { inf: "uscire", ja: "出る・出かける", presOv: ["esco", "esci", "esce", "usciamo", "uscite", "escono"], aux: "e" },
  { inf: "rimanere", ja: "残る・とどまる", presOv: ["rimango", "rimani", "rimane", "rimaniamo", "rimanete", "rimangono"], prStem: "rimas", futS: "rimarr", part: "rimasto", aux: "e" },
  { inf: "tenere", ja: "持つ・保つ", presOv: ["tengo", "tieni", "tiene", "teniamo", "tenete", "tengono"], prStem: "tenn", futS: "terr" },
  { inf: "morire", ja: "死ぬ", presOv: ["muoio", "muori", "muore", "moriamo", "morite", "muoiono"], part: "morto", aux: "e" },
  { inf: "nascere", ja: "生まれる", prStem: "nacqu", part: "nato", aux: "e", note: "Sono nato/-a a ...「私は〜で生まれました」。" },
  { inf: "piacere", ja: "気に入る・好かれる", presOv: ["piaccio", "piaci", "piace", "piacciamo", "piacete", "piacciono"], prStem: "piacqu", part: "piaciuto", aux: "e", note: "「Mi piace la pizza」のように好まれる物が主語になる構文に注意。" },
  { inf: "prendere", ja: "取る・(乗り物に)乗る・注文する", prStem: "pres", part: "preso" },
  { inf: "mettere", ja: "置く・入れる・着る", prStem: "mis", part: "messo" },
  { inf: "vedere", ja: "見る・会う", prStem: "vid", futS: "vedr", part: "visto" },
  { inf: "leggere", ja: "読む", prStem: "less", part: "letto" },
  { inf: "scrivere", ja: "書く", prStem: "scriss", part: "scritto" },
  { inf: "chiedere", ja: "尋ねる・頼む", prStem: "chies", part: "chiesto" },
  { inf: "rispondere", ja: "答える", prStem: "rispos", part: "risposto" },
  { inf: "vivere", ja: "住む・生きる", prStem: "viss", futS: "vivr", part: "vissuto" },
  { inf: "conoscere", ja: "知っている・面識がある", prStem: "conobb", part: "conosciuto" },
  { inf: "decidere", ja: "決める", prStem: "decis", part: "deciso" },
  { inf: "perdere", ja: "失う・負ける・乗り遅れる", prStem: "pers", part: "perso" },
  { inf: "vincere", ja: "勝つ", prStem: "vins", part: "vinto" },
  { inf: "correre", ja: "走る", prStem: "cors", part: "corso" },
  { inf: "scendere", ja: "降りる・下る", prStem: "sces", part: "sceso", aux: "e" },
  { inf: "chiudere", ja: "閉める・閉まる", prStem: "chius", part: "chiuso" },
  { inf: "aprire", ja: "開ける", part: "aperto" },
  { inf: "offrire", ja: "おごる・提供する", part: "offerto" },

  // --- つづり調整のある -are 動詞 ---
  { inf: "cercare", ja: "探す", note: "tu/noi や未来形で h を入れて [k] 音を保つ (cerchi, cercherò)。「cercare di + 不定詞」で「〜しようとする」。" },
  { inf: "giocare", ja: "遊ぶ・(スポーツを)する" },
  { inf: "dimenticare", ja: "忘れる" },
  { inf: "pagare", ja: "払う" },
  { inf: "mangiare", ja: "食べる", note: "i は発音上の飾りなので mangi, mangerò では落ちる。" },
  { inf: "cominciare", ja: "始める・始まる", note: "「cominciare a + 不定詞」で「〜し始める」。" },
  { inf: "viaggiare", ja: "旅行する" },
  { inf: "studiare", ja: "勉強する" },

  // --- 規則動詞 (-are) ---
  { inf: "parlare", ja: "話す", note: "-are 規則動詞の代表。まずこの活用を完全に覚えよう。" },
  { inf: "lavorare", ja: "働く" },
  { inf: "comprare", ja: "買う" },
  { inf: "ascoltare", ja: "聞く" },
  { inf: "guardare", ja: "見る・眺める" },
  { inf: "aspettare", ja: "待つ" },
  { inf: "chiamare", ja: "呼ぶ・電話する", note: "再帰形 chiamarsi で「〜という名前である」(Mi chiamo ...)。" },
  { inf: "portare", ja: "持っていく・運ぶ・身につける" },
  { inf: "pensare", ja: "考える・思う" },
  { inf: "abitare", ja: "住んでいる" },
  { inf: "amare", ja: "愛する" },
  { inf: "cantare", ja: "歌う" },
  { inf: "arrivare", ja: "着く・到着する", aux: "e" },
  { inf: "tornare", ja: "帰る・戻る", aux: "e" },
  { inf: "entrare", ja: "入る", aux: "e" },
  { inf: "diventare", ja: "〜になる", aux: "e" },

  // --- 規則動詞 (-ere / -ire) ---
  { inf: "credere", ja: "信じる・思う", note: "-ere 規則動詞の代表。" },
  { inf: "ricevere", ja: "受け取る" },
  { inf: "ripetere", ja: "繰り返す" },
  { inf: "dormire", ja: "眠る", note: "-ire 規則動詞 (-isc が付かないタイプ) の代表。" },
  { inf: "partire", ja: "出発する", aux: "e" },
  { inf: "sentire", ja: "聞く・感じる" },
  { inf: "seguire", ja: "ついて行く・続ける・(講義を)受ける" },
  { inf: "servire", ja: "役立つ・給仕する" },

  // --- -isc 型 (-ire) ---
  { inf: "capire", ja: "理解する", isc: true, note: "-isc 型の代表。io/tu/lui/loro で -isc- が入り、noi/voi では入らない。" },
  { inf: "finire", ja: "終える・終わる", isc: true, note: "「finire di + 不定詞」で「〜し終える」。" },
  { inf: "preferire", ja: "〜の方を好む", isc: true },
  { inf: "pulire", ja: "掃除する", isc: true },
  { inf: "spedire", ja: "送る・発送する", isc: true },
];

/* --- 動詞の分類とバッジ --- */
function metaOf(v) {
  const stem = v.inf.slice(0, -3);
  const cl = v.inf.slice(-3);
  let g, badge;
  if (v.presOv || v.prStem || v.prOv || v.futS || v.congS || v.wkStem) { g = "irr"; badge = "不規則動詞"; }
  else if (v.isc) { g = "isc"; badge = "-isc 型 (-ire)"; }
  else if (cl === "are" && /(c|g|ci|gi|i)$/.test(stem) && orthoIt(stem, "i") !== stem) { g = "orth"; badge = "つづり調整 -" + (stem.endsWith("ci") || stem.endsWith("gi") ? stem.slice(-2) : stem.slice(-1)) + "are"; }
  else if (v.part) { g = "reg"; badge = "規則動詞 (過去分詞のみ不規則)"; }
  else { g = "reg"; badge = "規則動詞 -" + cl; }
  if (v.badge) badge = v.badge;
  return { g, badge };
}

const GROUPS = [
  ["irr", "不規則動詞"],
  ["isc", "-isc 型動詞"],
  ["orth", "つづり調整動詞"],
  ["reg", "規則動詞"],
];

const TENSES = [
  { key: "pres", es: "Presente", ja: "直説法現在", hint: "現在の事実・習慣「〜する、〜している」" },
  { key: "pp", es: "Passato prossimo", ja: "直説法近過去", hint: "日常会話の過去「〜した」。essere 支配では過去分詞が主語に性数一致" },
  { key: "impf", es: "Imperfetto", ja: "直説法半過去", hint: "過去の習慣・状態・背景描写「〜していた、〜だった」" },
  { key: "pr", es: "Passato remoto", ja: "直説法遠過去", hint: "物語・歴史の叙述。日常会話では(特に北部で)まれ" },
  { key: "fut", es: "Futuro semplice", ja: "直説法未来", hint: "未来の事柄・推量「〜するだろう」" },
  { key: "cond", es: "Condizionale presente", ja: "条件法現在", hint: "婉曲・願望「〜したいのですが (vorrei)」・仮定の帰結" },
  { key: "cong", es: "Congiuntivo presente", ja: "接続法現在", hint: "意見・願望・感情などの従属節で「Penso che + 接続法」" },
  { key: "ci", es: "Congiuntivo imperfetto", ja: "接続法半過去", hint: "時制の一致・非現実の仮定「Se + 接続法半過去」" },
];

/* Node でのテスト用エクスポート */
if (typeof module !== "undefined") {
  module.exports = { VERBS, conjugate, metaOf, PRON, TENSES };
}

/* =====================================================
   UI
   ===================================================== */
if (typeof document !== "undefined") {

  const $ = (sel, el) => (el || document).querySelector(sel);
  const verbByInf = Object.fromEntries(VERBS.map((v) => [v.inf, v]));
  let current = null;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* --- サイドバーの動詞一覧 --- */
  function renderList(filter) {
    const q = filter ? deacc(filter.trim().toLowerCase()) : "";
    const listEl = $("#verb-list");
    let html = "";
    let firstMatch = null;
    for (const [g, label] of GROUPS) {
      const verbs = VERBS.filter((v) => metaOf(v).g === g)
        .filter((v) => !q || deacc(v.inf).includes(q) || v.ja.includes(filter.trim()));
      if (!verbs.length) continue;
      html += `<h2 class="group-label">${label}</h2><ul class="verbs">`;
      for (const v of verbs) {
        if (!firstMatch) firstMatch = v.inf;
        const sel = current === v.inf ? " selected" : "";
        html += `<li><button class="verb-btn${sel}" data-inf="${esc(v.inf)}">` +
          `<span class="v-inf">${esc(v.inf)}</span><span class="v-ja">${esc(v.ja)}</span></button></li>`;
      }
      html += "</ul>";
    }
    listEl.innerHTML = html || `<p class="no-match">「${esc(filter)}」に一致する動詞がありません</p>`;
    listEl.dataset.first = firstMatch || "";
  }

  /* --- 活用表 --- */
  function tenseTable(forms, base) {
    let rows = "";
    forms.forEach((f, i) => {
      const irr = base && base[i] !== f ? " class=\"irr\"" : "";
      rows += `<tr><th><span class="pron">${PRON[i][0]}</span><span class="pron-ja">${PRON[i][1]}</span></th><td${irr}>${esc(f)}</td></tr>`;
    });
    return `<table>${rows}</table>`;
  }

  function renderVerb(inf) {
    const v = verbByInf[inf];
    if (!v) return;
    current = inf;
    const c = conjugate(v);
    const n = conjugate(v, true); // 規則活用との比較用
    const { badge, g } = metaOf(v);
    const auxBadge = c.aux === "e"
      ? `<span class="badge badge-aux">近過去 essere 支配</span>` : "";

    let html = `
      <div class="verb-head">
        <div class="verb-title">
          <h1>${esc(v.inf)}</h1>
          <span class="badge badge-${g}">${esc(badge)}</span>
          ${auxBadge}
        </div>
        <p class="meaning">${esc(v.ja)}</p>
        ${v.note ? `<p class="note">💡 ${esc(v.note)}</p>` : ""}
        <div class="nonfinite">
          <div><span class="nf-label">不定詞</span><span class="nf-form">${esc(v.inf)}</span></div>
          <div><span class="nf-label">ジェルンディオ</span><span class="nf-form${c.ger !== n.ger ? " irr" : ""}">${esc(c.ger)}</span></div>
          <div><span class="nf-label">過去分詞</span><span class="nf-form${c.part !== n.part ? " irr" : ""}">${esc(c.part)}</span></div>
        </div>
      </div>
      <div class="cards">`;

    for (const t of TENSES) {
      html += `
        <section class="card">
          <h3>${t.ja} <span class="es">${t.es}</span></h3>
          <p class="hint">${t.hint}</p>
          ${tenseTable(c[t.key], n[t.key])}
        </section>`;
    }

    // 命令法
    html += `
      <section class="card card-imp">
        <h3>命令法 <span class="es">Imperativo</span></h3>
        <p class="hint">命令・依頼「〜しなさい」。tu への否定命令は non + 不定詞!</p>`;
    if (c.impA) {
      let rows = "";
      c.impA.forEach((f, i) => {
        const irrA = n.impA && n.impA[i] !== f ? " class=\"irr\"" : "";
        const irrN = n.impN && n.impN[i] !== c.impN[i] ? " class=\"irr\"" : "";
        rows += `<tr><th>${IMP_PRON[i]}</th><td${irrA}>${esc(f)}</td><td${irrN}>${esc(c.impN[i])}</td></tr>`;
      });
      html += `<table><tr class="imp-head"><th></th><td>肯定</td><td>否定</td></tr>${rows}</table>`;
    } else {
      html += `<p class="hint">この動詞では命令法は通常使われません。</p>`;
    }
    html += `</section></div>`;

    $("#main").innerHTML = html;
    document.querySelectorAll(".verb-btn").forEach((b) =>
      b.classList.toggle("selected", b.dataset.inf === inf));
    history.replaceState(null, "", "#" + encodeURIComponent(inf));
    window.scrollTo(0, 0);
  }

  /* --- 練習モード --- */
  const QUIZ_TENSES = TENSES.filter((t) => t.key !== "pp");
  let quiz = null, score = { ok: 0, total: 0 };

  function newQuestion() {
    const v = VERBS[Math.floor(Math.random() * VERBS.length)];
    const t = QUIZ_TENSES[Math.floor(Math.random() * QUIZ_TENSES.length)];
    const p = Math.floor(Math.random() * 6);
    quiz = { v, t, p, answer: conjugate(v)[t.key][p], done: false };
    $("#q-verb").textContent = v.inf;
    $("#q-ja").textContent = v.ja;
    $("#q-tense").textContent = t.ja;
    $("#q-pron").textContent = PRON[p][0] + "(" + PRON[p][1] + ")";
    $("#q-input").value = "";
    $("#q-feedback").textContent = "";
    $("#q-feedback").className = "";
    $("#q-input").focus();
  }

  function checkAnswer(reveal) {
    if (!quiz) return;
    const fb = $("#q-feedback");
    const ans = $("#q-input").value.trim().toLowerCase();
    if (reveal) {
      fb.textContent = "答え: " + quiz.answer;
      fb.className = "reveal";
      if (!quiz.done) { score.total++; quiz.done = true; }
    } else if (ans === quiz.answer) {
      fb.textContent = "✅ 正解! " + quiz.answer;
      fb.className = "ok";
      if (!quiz.done) { score.ok++; score.total++; quiz.done = true; }
    } else if (deacc(ans) === deacc(quiz.answer)) {
      fb.textContent = "⚠️ アクセント記号に注意: " + quiz.answer;
      fb.className = "almost";
      if (!quiz.done) { score.total++; quiz.done = true; }
    } else {
      fb.textContent = "❌ もう一度";
      fb.className = "ng";
      if (!quiz.done) { score.total++; quiz.done = true; }
    }
    $("#q-score").textContent = `正解 ${score.ok} / ${score.total}`;
  }

  /* --- イベント --- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".verb-btn");
    if (btn) renderVerb(btn.dataset.inf);
  });

  const search = $("#search");
  search.addEventListener("input", () => renderList(search.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = $("#verb-list").dataset.first;
      if (first) renderVerb(first);
    }
  });

  $("#quiz-open").addEventListener("click", () => {
    $("#quiz").hidden = false;
    if (!quiz) newQuestion(); else $("#q-input").focus();
  });
  $("#quiz-close").addEventListener("click", () => { $("#quiz").hidden = true; });
  $("#q-check").addEventListener("click", () => checkAnswer(false));
  $("#q-reveal").addEventListener("click", () => checkAnswer(true));
  $("#q-next").addEventListener("click", newQuestion);
  $("#q-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer(false);
  });
  document.querySelectorAll(".accent-btn").forEach((b) =>
    b.addEventListener("click", () => {
      const inp = $("#q-input");
      const s = inp.selectionStart;
      inp.value = inp.value.slice(0, s) + b.textContent + inp.value.slice(inp.selectionEnd);
      inp.focus();
      inp.setSelectionRange(s + 1, s + 1);
    }));

  /* --- 初期表示 --- */
  renderList("");
  const fromHash = decodeURIComponent(location.hash.slice(1));
  renderVerb(verbByInf[fromHash] ? fromHash : "parlare");
}
