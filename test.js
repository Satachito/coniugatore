const { VERBS, conjugate } = require("./app.js");
const byInf = Object.fromEntries(VERBS.map(v => [v.inf, v]));
let fail = 0, pass = 0;

function eq(inf, key, idx, expected) {
  const c = conjugate(byInf[inf]);
  const got = idx === null ? c[key] : c[key][idx];
  if (got !== expected) { fail++; console.log(`FAIL ${inf} ${key}[${idx}] => "${got}" (expected "${expected}")`); }
  else pass++;
}

// essere
eq("essere","pres",0,"sono"); eq("essere","pres",2,"è"); eq("essere","impf",3,"eravamo");
eq("essere","pr",0,"fui"); eq("essere","fut",0,"sarò"); eq("essere","cond",2,"sarebbe");
eq("essere","cong",0,"sia"); eq("essere","cong",4,"siate"); eq("essere","cong",5,"siano");
eq("essere","ci",2,"fosse"); eq("essere","pp",0,"sono stato/-a"); eq("essere","pp",3,"siamo stati/-e");
eq("essere","impA",0,"sii"); eq("essere","impA",3,"siate"); eq("essere","ger",null,"essendo");
// avere
eq("avere","pres",0,"ho"); eq("avere","pres",5,"hanno"); eq("avere","impf",0,"avevo");
eq("avere","pr",0,"ebbi"); eq("avere","pr",1,"avesti"); eq("avere","pr",2,"ebbe"); eq("avere","pr",5,"ebbero");
eq("avere","fut",0,"avrò"); eq("avere","cong",0,"abbia"); eq("avere","cong",3,"abbiamo"); eq("avere","cong",4,"abbiate");
eq("avere","ci",0,"avessi"); eq("avere","impA",0,"abbi"); eq("avere","part",null,"avuto");
// andare
eq("andare","pres",0,"vado"); eq("andare","pres",3,"andiamo"); eq("andare","pres",5,"vanno");
eq("andare","pr",0,"andai"); eq("andare","fut",0,"andrò"); eq("andare","cong",0,"vada");
eq("andare","cong",4,"andiate"); eq("andare","cong",5,"vadano"); eq("andare","impA",0,"va'");
eq("andare","pp",0,"sono andato/-a"); eq("andare","pp",5,"sono andati/-e"); eq("andare","impN",0,"non andare");
// fare
eq("fare","pres",0,"faccio"); eq("fare","pres",3,"facciamo"); eq("fare","pres",5,"fanno");
eq("fare","impf",0,"facevo"); eq("fare","pr",0,"feci"); eq("fare","pr",1,"facesti"); eq("fare","pr",2,"fece"); eq("fare","pr",5,"fecero");
eq("fare","fut",0,"farò"); eq("fare","cong",0,"faccia"); eq("fare","cong",3,"facciamo"); eq("fare","cong",4,"facciate");
eq("fare","ci",0,"facessi"); eq("fare","ger",null,"facendo"); eq("fare","part",null,"fatto"); eq("fare","impA",0,"fa'");
// dire
eq("dire","pres",0,"dico"); eq("dire","pres",4,"dite"); eq("dire","impf",0,"dicevo");
eq("dire","pr",0,"dissi"); eq("dire","pr",1,"dicesti"); eq("dire","fut",0,"dirò");
eq("dire","cong",0,"dica"); eq("dire","ger",null,"dicendo"); eq("dire","part",null,"detto"); eq("dire","impA",0,"di'");
// stare / dare
eq("stare","pres",0,"sto"); eq("stare","pr",0,"stetti"); eq("stare","fut",0,"starò");
eq("stare","cong",0,"stia"); eq("stare","ci",0,"stessi"); eq("stare","impA",0,"sta'"); eq("stare","pp",0,"sono stato/-a");
eq("stare","impf",0,"stavo");
eq("dare","pres",2,"dà"); eq("dare","pr",0,"diedi"); eq("dare","pr",1,"desti"); eq("dare","cong",0,"dia");
eq("dare","ci",0,"dessi"); eq("dare","impf",0,"davo"); eq("dare","impA",0,"da'"); eq("dare","part",null,"dato");
// potere / volere / dovere / sapere
eq("potere","pres",0,"posso"); eq("potere","pres",2,"può"); eq("potere","pr",0,"potei");
eq("potere","fut",0,"potrò"); eq("potere","cong",0,"possa"); eq("potere","cong",3,"possiamo");
eq("volere","pres",0,"voglio"); eq("volere","pr",0,"volli"); eq("volere","fut",0,"vorrò");
eq("volere","cond",0,"vorrei"); eq("volere","cong",0,"voglia");
eq("dovere","pres",0,"devo"); eq("dovere","pres",3,"dobbiamo"); eq("dovere","pr",0,"dovetti");
eq("dovere","fut",0,"dovrò"); eq("dovere","cong",0,"debba"); eq("dovere","cong",4,"dobbiate");
eq("sapere","pres",0,"so"); eq("sapere","pres",3,"sappiamo"); eq("sapere","pr",0,"seppi");
eq("sapere","fut",0,"saprò"); eq("sapere","cong",0,"sappia"); eq("sapere","impA",0,"sappi");
// bere / venire / uscire / tenere / rimanere
eq("bere","pres",0,"bevo"); eq("bere","impf",0,"bevevo"); eq("bere","pr",0,"bevvi"); eq("bere","pr",1,"bevesti");
eq("bere","fut",0,"berrò"); eq("bere","cong",0,"beva"); eq("bere","ger",null,"bevendo"); eq("bere","part",null,"bevuto");
eq("venire","pres",0,"vengo"); eq("venire","pres",1,"vieni"); eq("venire","pr",0,"venni"); eq("venire","pr",1,"venisti");
eq("venire","fut",0,"verrò"); eq("venire","cong",0,"venga"); eq("venire","part",null,"venuto"); eq("venire","pp",0,"sono venuto/-a");
eq("uscire","pres",0,"esco"); eq("uscire","pres",3,"usciamo"); eq("uscire","cong",0,"esca"); eq("uscire","part",null,"uscito");
eq("tenere","pres",0,"tengo"); eq("tenere","pres",1,"tieni"); eq("tenere","pr",0,"tenni"); eq("tenere","fut",0,"terrò");
eq("rimanere","pres",0,"rimango"); eq("rimanere","pr",0,"rimasi"); eq("rimanere","fut",0,"rimarrò"); eq("rimanere","part",null,"rimasto");
// morire / nascere / piacere
eq("morire","pres",0,"muoio"); eq("morire","pres",1,"muori"); eq("morire","pres",3,"moriamo"); eq("morire","part",null,"morto");
eq("nascere","pr",0,"nacqui"); eq("nascere","pr",1,"nascesti"); eq("nascere","part",null,"nato"); eq("nascere","pp",0,"sono nato/-a");
eq("piacere","pres",0,"piaccio"); eq("piacere","pres",2,"piace"); eq("piacere","pr",2,"piacque"); eq("piacere","part",null,"piaciuto");
// 強変化遠過去の -ere 動詞
eq("prendere","pr",0,"presi"); eq("prendere","pr",1,"prendesti"); eq("prendere","pr",2,"prese"); eq("prendere","pr",5,"presero");
eq("prendere","part",null,"preso"); eq("prendere","fut",0,"prenderò");
eq("mettere","pr",0,"misi"); eq("mettere","part",null,"messo");
eq("vedere","pr",0,"vidi"); eq("vedere","fut",0,"vedrò"); eq("vedere","part",null,"visto");
eq("leggere","pr",0,"lessi"); eq("leggere","part",null,"letto");
eq("scrivere","pr",0,"scrissi"); eq("scrivere","part",null,"scritto");
eq("chiedere","pr",0,"chiesi"); eq("chiedere","part",null,"chiesto");
eq("rispondere","pr",0,"risposi"); eq("rispondere","part",null,"risposto");
eq("vivere","pr",0,"vissi"); eq("vivere","fut",0,"vivrò"); eq("vivere","part",null,"vissuto");
eq("conoscere","pr",0,"conobbi"); eq("conoscere","part",null,"conosciuto");
eq("decidere","pr",0,"decisi"); eq("decidere","part",null,"deciso");
eq("perdere","pr",0,"persi"); eq("perdere","part",null,"perso");
eq("vincere","pr",0,"vinsi"); eq("vincere","part",null,"vinto");
eq("correre","pr",0,"corsi"); eq("correre","part",null,"corso");
eq("scendere","pr",0,"scesi"); eq("scendere","part",null,"sceso"); eq("scendere","pp",0,"sono sceso/-a");
eq("chiudere","pr",0,"chiusi"); eq("chiudere","part",null,"chiuso");
eq("aprire","part",null,"aperto"); eq("offrire","part",null,"offerto");
// つづり調整
eq("cercare","pres",1,"cerchi"); eq("cercare","pres",3,"cerchiamo"); eq("cercare","pres",4,"cercate");
eq("cercare","fut",0,"cercherò"); eq("cercare","cong",0,"cerchi"); eq("cercare","cong",5,"cerchino");
eq("pagare","pres",1,"paghi"); eq("pagare","fut",0,"pagherò");
eq("giocare","pres",1,"giochi"); eq("giocare","fut",0,"giocherò");
eq("mangiare","pres",1,"mangi"); eq("mangiare","pres",3,"mangiamo"); eq("mangiare","fut",0,"mangerò");
eq("mangiare","part",null,"mangiato"); eq("mangiare","pr",0,"mangiai");
eq("cominciare","pres",1,"cominci"); eq("cominciare","fut",0,"comincerò");
eq("studiare","pres",1,"studi"); eq("studiare","pres",3,"studiamo"); eq("studiare","fut",0,"studierò");
// 規則動詞
eq("parlare","pres",0,"parlo"); eq("parlare","pres",1,"parli"); eq("parlare","pres",3,"parliamo"); eq("parlare","pres",5,"parlano");
eq("parlare","impf",0,"parlavo"); eq("parlare","impf",3,"parlavamo");
eq("parlare","pr",0,"parlai"); eq("parlare","pr",2,"parlò"); eq("parlare","pr",5,"parlarono");
eq("parlare","fut",0,"parlerò"); eq("parlare","cond",0,"parlerei");
eq("parlare","cong",0,"parli"); eq("parlare","cong",4,"parliate"); eq("parlare","cong",5,"parlino");
eq("parlare","ci",0,"parlassi"); eq("parlare","ci",4,"parlaste");
eq("parlare","ger",null,"parlando"); eq("parlare","part",null,"parlato"); eq("parlare","pp",0,"ho parlato");
eq("parlare","impA",0,"parla"); eq("parlare","impA",1,"parli"); eq("parlare","impN",0,"non parlare");
eq("credere","pres",0,"credo"); eq("credere","pr",0,"credei"); eq("credere","fut",0,"crederò");
eq("credere","cong",0,"creda"); eq("credere","ci",0,"credessi"); eq("credere","part",null,"creduto");
eq("dormire","pres",0,"dormo"); eq("dormire","pres",4,"dormite"); eq("dormire","pr",0,"dormii");
eq("dormire","pr",2,"dormì"); eq("dormire","fut",0,"dormirò"); eq("dormire","cong",0,"dorma");
eq("partire","pp",0,"sono partito/-a"); eq("arrivare","pp",2,"è arrivato/-a"); eq("tornare","pp",3,"siamo tornati/-e");
// -isc 型
eq("capire","pres",0,"capisco"); eq("capire","pres",1,"capisci"); eq("capire","pres",2,"capisce");
eq("capire","pres",3,"capiamo"); eq("capire","pres",4,"capite"); eq("capire","pres",5,"capiscono");
eq("capire","pr",0,"capii"); eq("capire","fut",0,"capirò");
eq("capire","cong",0,"capisca"); eq("capire","cong",3,"capiamo"); eq("capire","cong",5,"capiscano");
eq("capire","part",null,"capito"); eq("capire","impA",0,"capisci");
eq("finire","pres",0,"finisco"); eq("finire","pres",3,"finiamo");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
