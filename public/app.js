(function(){
'use strict';
var E = window.YojanaEngine, S = [], DATA = { meta: {}, schemes: [] };
var lang = 'hi';
function T(o){ return typeof o === 'string' ? o : (o[lang] || o.en); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function inr(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
function fill(s, o){ return s.replace(/\{(\w+)\}/g, function(_, k){ return o[k]; }); }

/* ---------------------------------------------------------------- words */
var W = {
  brand:{en:'Meri Yojana',hi:'मेरी योजना'}, brandSub:{en:'District Karnal',hi:'ज़िला करनाल'},
  heroSub:{en:'Find the government schemes meant for you',hi:'जानिए कौन-सी सरकारी योजनाएँ आपके लिए हैं'},
  heroP:{en:'Answer a few simple questions. The questions change with your answers, so you are only asked what matters for you.',
         hi:'कुछ आसान सवालों के जवाब दीजिए। सवाल आपके जवाबों के अनुसार बदलते हैं, इसलिए केवल वही पूछा जाएगा जो आपके काम का है।'},
  f1:{en:'Usually 6 short questions, never more than 8',hi:'आम तौर पर 6 छोटे सवाल, 8 से ज़्यादा कभी नहीं'},
  f2:{en:'Nothing you enter is saved or sent anywhere',hi:'आपकी कोई जानकारी न सहेजी जाती है, न कहीं भेजी जाती है'},
  f3:{en:'Central and Haryana Government schemes available in Karnal',hi:'करनाल में उपलब्ध केंद्र और हरियाणा सरकार की योजनाएँ'},
  start:{en:'Start',hi:'शुरू करें'}, next:{en:'Next',hi:'आगे'}, back:{en:'Back',hi:'पीछे'}, see:{en:'See my schemes',hi:'मेरी योजनाएँ देखें'},
  qof:{en:'Question {a} of up to {b}',hi:'सवाल {a} / अधिकतम {b}'},
  needAnswer:{en:'Choose an answer to continue.',hi:'आगे बढ़ने के लिए एक जवाब चुनें।'},
  none:{en:'None of these',hi:'इनमें से कोई नहीं'}, pns:{en:'Prefer not to say',hi:'नहीं बताना चाहते'},
  dataLine:{en:'{n} schemes, list updated {d}.',hi:'{n} योजनाएँ, सूची {d} को अद्यतन।'},
  updated:{en:'New: the scheme list was updated on {d}.',hi:'नया: योजना सूची {d} को अद्यतन हुई।'},
  loadFail:{en:'The scheme list could not be loaded. Check your connection and reload the page.',hi:'योजना सूची लोड नहीं हो सकी। इंटरनेट जाँचें और पेज दोबारा खोलें।'},
  loading:{en:'Loading…',hi:'लोड हो रहा है…'},
  resH:{en:'Your schemes',hi:'आपकी योजनाएँ'},
  eligN:{en:'you appear eligible for',hi:'योजनाओं के लिए आप पात्र दिखते हैं'},
  checkN:{en:'to check with the office',hi:'योजनाओं की कार्यालय से पुष्टि करें'},
  eligH:{en:'You appear eligible',hi:'आप पात्र दिखते हैं'},
  eligNote:{en:'Your answers meet every condition on record. The office makes the final decision.',hi:'आपके जवाब रिकॉर्ड की हर शर्त पूरी करते हैं। अंतिम निर्णय कार्यालय करेगा।'},
  checkH:{en:'Check these',hi:'इनकी पुष्टि करें'},
  checkNote:{en:'You may be eligible. Read the condition in yellow and confirm it yourself or with the office.',hi:'आप पात्र हो सकते हैं। पीले हिस्से में लिखी शर्त पढ़ें और खुद या कार्यालय से पुष्टि करें।'},
  lifeH:{en:'If your situation changes',hi:'अगर आपकी स्थिति बदले'},
  everyoneH:{en:'For everyone in Karnal',hi:'करनाल में सभी के लिए'},
  everyoneNote:{en:'These have no special condition. They are listed last so your own schemes come first.',hi:'इनकी कोई विशेष शर्त नहीं है। ये अंत में हैं ताकि आपकी अपनी योजनाएँ पहले दिखें।'},
  unless:{en:'Yes, unless this applies to you:',hi:'हाँ, बशर्ते यह आप पर लागू न हो:'},
  onEvent:{en:'If: {e}',hi:'यदि: {e}'},
  lifeNote:{en:'These apply on events such as a birth, marriage, death, accident or illness, or to special groups.',hi:'ये योजनाएँ जन्म, विवाह, मृत्यु, दुर्घटना, बीमारी जैसी घटनाओं पर या विशेष वर्गों के लिए हैं।'},
  noElig:{en:'No scheme matched every condition. Look at the ones to check below.',hi:'किसी योजना की सभी शर्तें पूरी नहीं हुईं। नीचे पुष्टि वाली योजनाएँ देखें।'},
  docsH:{en:'Documents to keep ready',hi:'ये दस्तावेज़ तैयार रखें'},
  docsNote:{en:'Combined for all the schemes you appear eligible for.',hi:'आपकी सभी पात्र योजनाओं के लिए एक साथ।'},
  print:{en:'Print / save PDF',hi:'प्रिंट / PDF सहेजें'}, wa:{en:'Share on WhatsApp',hi:'WhatsApp पर भेजें'}, again:{en:'Start again',hi:'फिर से शुरू करें'},
  verified:{en:'Verified online Sep-2026',hi:'ऑनलाइन जाँचा सितं. 2026'},
  pending:{en:'Confirm details with department',hi:'विभाग से विवरण पुष्टि करें'},
  more:{en:'How to apply, documents, full rules',hi:'आवेदन कैसे करें, दस्तावेज़, पूरे नियम'},
  contact:{en:'Contact:',hi:'संपर्क:'}, howH:{en:'How to apply',hi:'आवेदन कैसे करें'}, modeH:{en:'Mode',hi:'माध्यम'},
  linkH:{en:'Website',hi:'वेबसाइट'}, docsList:{en:'Documents',hi:'दस्तावेज़'}, rulesH:{en:'Eligibility (as recorded)',hi:'पात्रता (रिकॉर्ड अनुसार)'},
  benH:{en:'Benefit',hi:'लाभ'}, slabH:{en:'Rates by class / group',hi:'कक्षा / वर्ग अनुसार राशि'},
  enOnly:{en:'',hi:'विवरण अंग्रेज़ी में हैं।'},
  applyWithin:{en:'Apply within: {w}',hi:'आवेदन की समय-सीमा: {w}'},
  foot:{en:'Prepared by the District Administration, Karnal. This is guidance, not a sanction. Eligibility is decided by the department after checking documents and Parivar Pehchan Patra data.',
        hi:'ज़िला प्रशासन, करनाल द्वारा तैयार। यह केवल मार्गदर्शन है, स्वीकृति नहीं। पात्रता का निर्णय विभाग दस्तावेज़ों व परिवार पहचान पत्र के आँकड़ों की जाँच के बाद करेगा।'},
  waHead:{en:'My schemes – District Karnal',hi:'मेरी योजनाएँ – ज़िला करनाल'},
  waMore:{en:'+ {n} more on the website',hi:'+ {n} और वेबसाइट पर'},
  stepH:{en:'Next step',hi:'अगला कदम'},
  stepOnline:{en:'Apply online',hi:'ऑनलाइन आवेदन करें'},
  stepOnlineNoLink:{en:'Apply online through the Antyodaya Saral portal or at any CSC / Atal Seva Kendra.',hi:'अंत्योदय सरल पोर्टल पर या किसी भी CSC / अटल सेवा केंद्र से ऑनलाइन आवेदन करें।'},
  stepCsc:{en:'Your CSC / Atal Seva Kendra can do this for you.',hi:'आपका CSC / अटल सेवा केंद्र यह आपके लिए कर सकता है।'},
  stepAuto:{en:'No form to fill. The benefit comes automatically through Parivar Pehchan Patra, school or anganwadi records. If you have not received it, ask:',hi:'कोई फ़ॉर्म नहीं भरना। लाभ परिवार पहचान पत्र, स्कूल या आँगनवाड़ी रिकॉर्ड से अपने-आप मिलता है। न मिला हो तो पूछें:'},
  stepBank:{en:'Apply at your bank or post office.',hi:'अपने बैंक या डाकघर में आवेदन करें।'},
  stepOffice:{en:'Go to this office with the documents:',hi:'दस्तावेज़ लेकर इस कार्यालय में जाएँ:'},
  stepSchool:{en:'Ask at the school, college or institution.',hi:'स्कूल, कॉलेज या संस्थान में पूछें।'},
  forN:{en:'needed for {n} of your schemes',hi:'आपकी {n} योजनाओं के लिए'},
  for1:{en:'needed for: {s}',hi:'इसके लिए: {s}'},
  slipTitle:{en:'My schemes – District Karnal',hi:'मेरी योजनाएँ – ज़िला करनाल'},
  slipDate:{en:'Printed {d}. Take this slip and the documents to the office or CSC.',hi:'{d} को प्रिंट। यह पर्ची और दस्तावेज़ कार्यालय या CSC पर ले जाएँ।'},
  office:{en:'Office',hi:'कार्यालय'}, site:{en:'Check again at',hi:'दोबारा देखें'},
  schemeH:{en:'Scheme',hi:'योजना'}, schemeNote:{en:'Conditions are shown as recorded. Answer the questions to see whether they apply to you.',hi:'शर्तें रिकॉर्ड अनुसार दिखाई गई हैं। जानने के लिए कि ये आप पर लागू हैं या नहीं, सवालों के जवाब दें।'},
  findMine:{en:'Find my schemes',hi:'मेरी योजनाएँ खोजें'}, linkThis:{en:'Link to this scheme',hi:'इस योजना का लिंक'},
  notFound:{en:'No scheme with this id.',hi:'इस आईडी की कोई योजना नहीं।'}
};
var REASON = {
  exclusion:{en:'Not for: {t}',hi:'इनके लिए नहीं: {t}'},
  gap:{en:'Condition in the rules: {t}',hi:'नियमों में शर्त: {t}'},
  income_border:{en:'Family income must be up to {t} a year. Confirm yours.',hi:'पारिवारिक आय {t} प्रति वर्ष तक होनी चाहिए। अपनी आय की पुष्टि करें।'},
  income_unknown:{en:'Family income must be up to {t} a year.',hi:'पारिवारिक आय {t} प्रति वर्ष तक होनी चाहिए।'},
  notasked_income:{en:'Family income must be up to {t} a year.',hi:'पारिवारिक आय {t} प्रति वर्ष तक होनी चाहिए।'},
  cat_unknown:{en:'Only for: {t}',hi:'केवल इनके लिए: {t}'}, notasked_cat:{en:'Only for: {t}',hi:'केवल इनके लिए: {t}'},
  cat_other:{en:'Only for: {t}',hi:'केवल इनके लिए: {t}'}, cat_note:{en:'Category rule: {t}',hi:'वर्ग की शर्त: {t}'},
  age_unknown:{en:'Age limit: {t} years',hi:'आयु सीमा: {t} वर्ष'},
  dis_unknown:{en:'Needs a disability certificate of at least {t}%',hi:'कम से कम {t}% दिव्यांगता प्रमाणपत्र आवश्यक'},
  dis_border:{en:'Needs a disability certificate of at least {t}%',hi:'कम से कम {t}% दिव्यांगता प्रमाणपत्र आवश्यक'},
  notasked_dis:{en:'Needs a disability certificate of at least {t}%',hi:'कम से कम {t}% दिव्यांगता प्रमाणपत्र आवश्यक'},
  res_border:{en:'Needs {t} years of residence in Haryana',hi:'हरियाणा में {t} वर्ष का निवास आवश्यक'},
  res_unknown:{en:'Needs {t} years of residence in Haryana',hi:'हरियाणा में {t} वर्ष का निवास आवश्यक'},
  notasked_occ:{en:'Only for: {t}',hi:'केवल इनके लिए: {t}'}, notasked_class:{en:'Only for: {t}',hi:'केवल इनके लिए: {t}'},
  notasked_gender:{en:'Only for a particular gender – see the rules',hi:'केवल एक लिंग के लिए – नियम देखें'}
};
function reasonText(r){ var t = /income/.test(r.key) ? inr(r.text) : r.text; return fill(T(REASON[r.key] || REASON.gap), {t: esc(t)}); }
var DOCS = {
  ppp:{en:'Parivar Pehchan Patra (Family ID)',hi:'परिवार पहचान पत्र'}, aadhaar:{en:'Aadhaar card',hi:'आधार कार्ड'},
  bank:{en:'Bank passbook (Aadhaar-linked)',hi:'बैंक पासबुक (आधार से जुड़ी)'}, photo:{en:'Passport-size photo',hi:'पासपोर्ट साइज़ फ़ोटो'},
  caste:{en:'Caste certificate',hi:'जाति प्रमाणपत्र'}, income:{en:'Income certificate',hi:'आय प्रमाणपत्र'},
  residence:{en:'Residence / domicile proof',hi:'निवास / अधिवास प्रमाण'}, disability:{en:'Disability certificate / UDID',hi:'दिव्यांगता प्रमाणपत्र / UDID'},
  age:{en:'Age proof / birth certificate',hi:'आयु प्रमाण / जन्म प्रमाणपत्र'}, death:{en:'Death certificate',hi:'मृत्यु प्रमाणपत्र'},
  marriage:{en:'Marriage certificate / card',hi:'विवाह प्रमाणपत्र / कार्ड'}, labour:{en:'Labour board registration / membership',hi:'श्रम बोर्ड पंजीकरण / सदस्यता'},
  land:{en:'Land record (jamabandi / fard)',hi:'भूमि रिकॉर्ड (जमाबंदी / फर्द)'}, school:{en:'School / college certificate or marksheet',hi:'स्कूल / कॉलेज प्रमाणपत्र या अंकतालिका'},
  ration:{en:'Ration card (BPL / AAY)',hi:'राशन कार्ड (बीपीएल / एएवाई)'}, medical:{en:'Medical / hospital papers',hi:'चिकित्सा / अस्पताल के कागज़'}
};
var SECTOR = {'Agriculture':'कृषि','Disability / Social Security':'दिव्यांगता / सामाजिक सुरक्षा','Education / Scholarship':'शिक्षा / छात्रवृत्ति',
  'Energy':'ऊर्जा','Food & Civil Supplies':'खाद्य एवं आपूर्ति','Forest / Environment':'वन / पर्यावरण','Governance / Local Area Development':'स्थानीय क्षेत्र विकास',
  'Health':'स्वास्थ्य','Horticulture':'बागवानी','Housing / Rural':'आवास / ग्रामीण','Housing / Urban':'आवास / शहरी','Industry / MSME':'उद्योग / MSME',
  'Labour Welfare':'श्रम कल्याण','Livestock':'पशुपालन','Rural Development':'ग्रामीण विकास','Rural Livelihoods':'ग्रामीण आजीविका',
  'SC/BC Welfare':'अनुसूचित जाति / पिछड़ा वर्ग कल्याण','Skill / Employment':'कौशल / रोज़गार','Social Security':'सामाजिक सुरक्षा','Sports':'खेल',
  'Transport':'परिवहन','Urban Development':'शहरी विकास','Women & Child':'महिला एवं बाल'};

/* ---------------------------------------------------------------- questions */
var TYPES = [
  {v:'Student',en:'Student',hi:'विद्यार्थी',sen:'School, ITI, polytechnic or college',shi:'स्कूल, आईटीआई, पॉलिटेक्निक या कॉलेज'},
  {v:'Individual',en:'Myself as a person',hi:'स्वयं व्यक्ति के रूप में',sen:'Pensions, health, personal support',shi:'पेंशन, स्वास्थ्य, व्यक्तिगत सहायता'},
  {v:'Household',en:'My family / household',hi:'मेरा परिवार',sen:'Ration, housing, gas, family schemes',shi:'राशन, आवास, गैस, पारिवारिक योजनाएँ'},
  {v:'Worker',en:'Worker / labourer',hi:'श्रमिक / मज़दूर',sen:'Construction, factory, unorganised work',shi:'निर्माण, फ़ैक्टरी, असंगठित कार्य'},
  {v:'Farmer',en:'Farmer / livestock / fish',hi:'किसान / पशुपालक / मत्स्य पालक',sen:'Crops, animals, fisheries',shi:'फसल, पशु, मछली पालन'},
  {v:'Enterprise',en:'Own business or self-help group',hi:'अपना व्यवसाय या स्वयं सहायता समूह',sen:'Loans, subsidies, SHG support',shi:'ऋण, अनुदान, SHG सहायता'}
];
var CATS = [
  {v:'SC',en:'Scheduled Caste (SC)',hi:'अनुसूचित जाति (SC)'},{v:'BC-A',en:'Backward Class – A (BC-A)',hi:'पिछड़ा वर्ग – ए (BC-A)'},
  {v:'BC-B',en:'Backward Class – B (BC-B)',hi:'पिछड़ा वर्ग – बी (BC-B)'},{v:'DNT',en:'Vimukt / Denotified Tribe (DNT)',hi:'विमुक्त जाति (DNT)'},
  {v:'ST',en:'Scheduled Tribe (ST)',hi:'अनुसूचित जनजाति (ST)'},{v:'MINORITY',en:'Minority community',hi:'अल्पसंख्यक समुदाय'},
  {v:'EWS',en:'Economically Weaker Section (EWS)',hi:'आर्थिक रूप से कमज़ोर वर्ग (EWS)'},
  {v:'BPL',en:'Family has a BPL card',hi:'परिवार के पास बीपीएल कार्ड है'},{v:'AAY',en:'Family has an Antyodaya (AAY) card',hi:'परिवार के पास अंत्योदय (AAY) कार्ड है'},
  {v:'GEN',en:'General / none of these',hi:'सामान्य / इनमें से कोई नहीं'},{v:'UNK',en:W.pns.en,hi:W.pns.hi}
];
var INCOME = [
  {v:'i1',en:'Up to ₹1 lakh',hi:'₹1 लाख तक'},{v:'i2',en:'₹1 lakh – ₹1.8 lakh',hi:'₹1 लाख – ₹1.8 लाख'},
  {v:'i3',en:'₹1.8 lakh – ₹2.5 lakh',hi:'₹1.8 लाख – ₹2.5 लाख'},{v:'i4',en:'₹2.5 lakh – ₹3 lakh',hi:'₹2.5 लाख – ₹3 लाख'},
  {v:'i5',en:'₹3 lakh – ₹8 lakh',hi:'₹3 लाख – ₹8 लाख'},{v:'i6',en:'More than ₹8 lakh',hi:'₹8 लाख से अधिक'},{v:'UNK',en:W.pns.en,hi:W.pns.hi}
];
var OCC = {
  bocw:{en:'Construction worker (HBOCW Board)',hi:'निर्माण श्रमिक (HBOCW बोर्ड)'},
  hlwb:{en:'Factory / shop worker contributing to Labour Welfare Board',hi:'फ़ैक्टरी / दुकान कर्मचारी (श्रम कल्याण बोर्ड अंशदाता)'},
  unorganised:{en:'Other unorganised worker',hi:'अन्य असंगठित श्रमिक'}, farmer:{en:'Farmer',hi:'किसान'},
  livestock:{en:'Keeps cattle, buffalo, goats, sheep or poultry',hi:'गाय, भैंस, बकरी, भेड़ या मुर्गी पालन'},
  dairy_coop:{en:'Member of a dairy cooperative',hi:'दुग्ध सहकारी समिति के सदस्य'},
  fish:{en:'Fish farmer',hi:'मछली पालक'}, sports:{en:'Sportsperson',hi:'खिलाड़ी'},
  shg:{en:'Member of a self-help group (SHG)',hi:'स्वयं सहायता समूह (SHG) सदस्य'},
  entrepreneur:{en:'Running or starting a business',hi:'व्यवसाय चला रहे हैं या शुरू कर रहे हैं'},
  jobseeker:{en:'Unemployed / looking for a job',hi:'बेरोज़गार / नौकरी की तलाश'},
  journalist:{en:'Accredited journalist',hi:'मान्यता प्राप्त पत्रकार'}, vendor:{en:'Street vendor',hi:'रेहड़ी-पटरी विक्रेता'},
  artisan:{en:'Artisan / craftsperson',hi:'कारीगर / शिल्पकार'},
  exserviceman:{en:'Ex-serviceman or widow of one',hi:'पूर्व सैनिक या उनकी विधवा'},
  esm_child:{en:'Child of an ex-serviceman',hi:'पूर्व सैनिक की संतान'},
  defence:{en:'Serving / former Armed Forces, CAPF or Agniveer',hi:'सेवारत / पूर्व सशस्त्र बल, CAPF या अग्निवीर'},
  tree_owner:{en:'Owns or looks after a tree over 75 years old',hi:'75 वर्ष से पुराने पेड़ के मालिक / संरक्षक'}
};
var CLASSES = (function(){ var a=[]; for (var i=1;i<=12;i++) a.push({v:'c'+i,en:'Class '+i,hi:'कक्षा '+i});
  return a.concat([{v:'iti',en:'ITI',hi:'आईटीआई'},{v:'diploma',en:'Diploma',hi:'डिप्लोमा'},
  {v:'ug',en:'Graduation',hi:'स्नातक'},{v:'pg',en:'Post-grad',hi:'स्नातकोत्तर'},{v:'phd',en:'Ph.D.',hi:'पीएच.डी.'}]); })();
var DIS = [
  {v:'none',en:'No disability',hi:'कोई दिव्यांगता नहीं'},{v:'d1',en:'Yes – below 40%',hi:'हाँ – 40% से कम'},
  {v:'d2',en:'Yes – 40% to 59%',hi:'हाँ – 40% से 59%'},{v:'d3',en:'Yes – 60% to 69%',hi:'हाँ – 60% से 69%'},
  {v:'d4',en:'Yes – 70% or more',hi:'हाँ – 70% या अधिक'},{v:'UNK',en:W.pns.en,hi:W.pns.hi}
];
var SIT_EVENTS = {
  birth:{en:'Pregnancy or a baby born recently',hi:'गर्भावस्था या हाल में शिशु का जन्म'},
  marriage:{en:'A marriage in the family (recent or planned)',hi:'परिवार में विवाह (हाल में या तय)'},
  death:{en:'Death of an earning member or worker',hi:'कमाने वाले सदस्य / श्रमिक की मृत्यु'},
  accident:{en:'Accident, injury or animal / dog bite',hi:'दुर्घटना, चोट या पशु / कुत्ते का काटना'},
  diagnosis:{en:'Serious illness diagnosed (cancer, TB, rare disease)',hi:'गंभीर बीमारी (कैंसर, टीबी, दुर्लभ रोग)'},
  acid:{en:'Survivor of an acid attack',hi:'तेज़ाब हमले से पीड़ित'}
};
var SIT_SPECIAL = {
  widow:{en:'Widow or destitute woman',hi:'विधवा या निराश्रित महिला'},
  child_care:{en:'Child without parental care (orphan, abandoned, foster)',hi:'माता-पिता की देखभाल से वंचित बच्चा (अनाथ, परित्यक्त)'},
  shelter:{en:'Homeless or needs a shelter home',hi:'बेघर या आश्रय गृह की आवश्यकता'},
  victim:{en:'Victim of a crime or atrocity',hi:'अपराध या अत्याचार से पीड़ित'},
  unemployed:{en:'Educated but unemployed',hi:'शिक्षित पर बेरोज़गार'},
  family_planning:{en:'Family-planning operation (sterilisation)',hi:'परिवार नियोजन ऑपरेशन (नसबंदी)'},
  freedom:{en:'Freedom fighter, Emergency or Hindi satyagrahi, or their dependant',hi:'स्वतंत्रता सेनानी, आपातकाल या हिंदी सत्याग्रही, या उनके आश्रित'},
  kashmiri:{en:'Kashmiri migrant family',hi:'कश्मीरी प्रवासी परिवार'},
  padma:{en:'Padma award winner',hi:'पद्म पुरस्कार विजेता'}
};
var RES = [
  {v:'r0',en:'Less than 1 year',hi:'1 वर्ष से कम'},{v:'r1',en:'1 to 3 years',hi:'1 से 3 वर्ष'},{v:'r2',en:'3 to 5 years',hi:'3 से 5 वर्ष'},
  {v:'r3',en:'5 to 15 years',hi:'5 से 15 वर्ष'},{v:'r4',en:'15 years or more',hi:'15 वर्ष या अधिक'}
];
var Q = {
  types:{title:{en:'Who are you looking for schemes for?',hi:'आप किसके लिए योजनाएँ देख रहे हैं?'},
         hint:{en:'Choose all that apply. Person and family are already ticked because they cover everyone.',hi:'जो-जो लागू हों, सभी चुनें। व्यक्ति और परिवार पहले से चुने हैं क्योंकि ये सभी पर लागू होते हैं।'}},
  about:{title:{en:'About the person',hi:'व्यक्ति के बारे में'},hint:{en:'Some schemes are only for women, for certain ages, or for persons with a disability.',hi:'कुछ योजनाएँ केवल महिलाओं, किसी आयु या दिव्यांग व्यक्तियों के लिए हैं।'}},
  category:{title:{en:'Does the family belong to any of these?',hi:'क्या परिवार इनमें से किसी वर्ग में आता है?'},hint:{en:'Choose all that apply – a caste category and a ration card can both be ticked.',hi:'जो लागू हों सभी चुनें – जाति वर्ग और राशन कार्ड दोनों चुने जा सकते हैं।'}},
  income:{title:{en:'Yearly family income',hi:'परिवार की वार्षिक आय'},hint:{en:'As shown in the Parivar Pehchan Patra, if you know it.',hi:'परिवार पहचान पत्र में दर्ज आय, यदि पता हो।'}},
  occupation:{title:{en:'Do any of these apply to you or your family?',hi:'क्या इनमें से कुछ आप या आपके परिवार पर लागू है?'},hint:{en:'Choose all that apply.',hi:'जो-जो लागू हों, सभी चुनें।'}},
  'class':{title:{en:'Which class or course is the student in?',hi:'विद्यार्थी किस कक्षा या कोर्स में है?'},hint:{en:'Choose one.',hi:'एक चुनें।'}},
  disability:{title:{en:'Does the person have a disability certificate?',hi:'क्या व्यक्ति के पास दिव्यांगता प्रमाणपत्र है?'},hint:{en:'Choose the percentage on the certificate.',hi:'प्रमाणपत्र में दर्ज प्रतिशत चुनें।'}},
  event:{title:{en:'Does any of these apply now?',hi:'क्या अभी इनमें से कुछ लागू है?'},hint:{en:'Choose all that apply. Schemes for other situations are still listed at the end.',hi:'जो लागू हों सभी चुनें। अन्य स्थितियों की योजनाएँ भी अंत में दिखेंगी।'}},
  residence:{title:{en:'How long has the family lived in Haryana?',hi:'परिवार कितने वर्षों से हरियाणा में रह रहा है?'},hint:{en:'Choose one.',hi:'एक चुनें।'}}
};

/* ---------------------------------------------------------------- state */
var st;
function reset(){ st = { screen:'start', ans:{}, draft:null, history:[], skipped:{}, err:'', ticked:{} }; }
reset();
var KEY = {types:'types',category:'cats',income:'income',occupation:'occ','class':'cls',disability:'dis',event:'events',residence:'res'};
var SINGLE = {income:1,'class':1,disability:1,residence:1};
var EXCLUSIVE = {GEN:1,UNK:1,none:1};

function asked(){ return st.history.filter(function(q){ return q !== 'types'; }); }
function forget(q){ if (q === 'about'){ delete st.ans.gender; delete st.ans.age; delete st.ans.about_done; delete st.ans.dis; } else delete st.ans[KEY[q]]; }
function draftFor(q){
  if (q === 'about') return { gender: st.ans.gender || null, age: st.ans.age != null ? String(st.ans.age) : '', dis: st.ans.dis || null };
  var v = st.ans[KEY[q]];
  if (q === 'types') return v ? v.slice() : ['Individual','Household'];
  return Array.isArray(v) ? v.slice() : (v || null);
}
/* ---------------------------------------------------------------- history and addresses
   Each screen is a browser history entry, so the phone's Back button moves between questions instead of
   leaving the site. Results and single schemes have addresses in the fragment (#/...), which browsers never
   send to a server: nothing a person enters leaves the phone. */
function snapshot(){ return JSON.parse(JSON.stringify({ screen: st.screen, ans: st.ans, history: st.history, skipped: st.skipped, scheme: st.scheme || null })); }
function b64(o){ return btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64(t){ try { return JSON.parse(atob(t.replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return null; } }
function urlFor(){
  if (st.screen === 'start') return '#/';
  if (st.screen === 'results') return '#/results/' + b64({ a: st.ans, h: st.history, k: st.skipped });
  if (st.screen === 'scheme') return '#/scheme/' + encodeURIComponent(st.scheme);
  return '#/q/' + (st.history.indexOf(st.screen) + 1);
}
function remember(replace){
  var depth = (history.state && history.state.depth) || 0;
  try { history[replace ? 'replaceState' : 'pushState']({ st: snapshot(), depth: replace ? depth : depth + 1 }, '', urlFor()); } catch (e) {}
}
function restore(snap){
  st = { screen: snap.screen, ans: snap.ans || {}, history: snap.history || [], skipped: snap.skipped || {}, scheme: snap.scheme, draft: null, err: '', ticked: {} };
  if (st.screen !== 'start' && st.screen !== 'results' && st.screen !== 'scheme') st.draft = draftFor(st.screen);
}
function fromHash(){
  var h = location.hash, m;
  if ((m = /^#\/results\/([\w-]+)$/.exec(h)) && (m = unb64(m[1])) && m.a && m.h) restore({ screen: 'results', ans: m.a, history: m.h, skipped: m.k });
  else if ((m = /^#\/scheme\/([\w-]+)$/.exec(h))) restore({ screen: 'scheme', scheme: decodeURIComponent(m[1]) });
  else reset();
}
window.addEventListener('popstate', function(e){
  if (e.state && e.state.st) restore(e.state.st);
  else if (/^#\//.test(location.hash) || !location.hash) fromHash();
  else return;                                         // an in-page anchor such as #elig
  render(); window.scrollTo(0,0);
});
function go(q){ st.screen = q; st.draft = draftFor(q); st.err = ''; render(); remember(); window.scrollTo(0,0); var h = document.getElementById('qh'); if (h) h.focus({preventScroll:true}); }
function commit(){
  var q = st.screen, d = st.draft;
  if (q === 'about'){
    if (!d.gender || !d.dis || d.dis === 'yes'){ st.err = T(W.needAnswer); return render(); }
    var a = d.age.trim() === '' ? null : parseInt(d.age, 10);
    if (a != null && (isNaN(a) || a > 120)){ st.err = T({en:'Enter an age between 0 and 120, or leave it blank.',hi:'0 से 120 के बीच आयु लिखें, या खाली छोड़ें।'}); return render(); }
    st.ans.gender = d.gender; st.ans.age = a; st.ans.about_done = true; st.ans.dis = d.dis;
  } else {
    if (d == null || (Array.isArray(d) && !d.length)){ st.err = T(W.needAnswer); return render(); }
    st.ans[KEY[q]] = d;
  }
  var i = st.history.indexOf(q);
  st.history.slice(i + 1).forEach(forget);   // later answers may no longer apply
  st.history = st.history.slice(0, i + 1);
  var n = E.nextQuestion(S, st.ans, asked());
  st.skipped = n.skipped;
  remember(true);                            // keep this screen's answers in its history entry
  if (n.next){ st.history.push(n.next); go(n.next); }
  else { st.screen = 'results'; st.err = ''; render(); remember(); window.scrollTo(0,0); }
}
function back(){
  if (st.screen === 'results'){ go(st.history[st.history.length - 1]); return; }
  var i = st.history.indexOf(st.screen);
  if (i <= 0){ reset(); render(); return; }
  st.history = st.history.slice(0, i);
  go(st.history[i - 1]);
}
function previewAns(){
  var a = JSON.parse(JSON.stringify(st.ans)), q = st.screen, d = st.draft;
  if (q === 'about'){ if (d.gender) a.gender = d.gender; }
  else if (KEY[q] && d != null && !(Array.isArray(d) && !d.length)) a[KEY[q]] = d;
  return a;
}

/* ---------------------------------------------------------------- rendering */
var app = document.getElementById('app'), bar = document.getElementById('actbar');
function optBtn(o, pressed, single, sub){
  return '<button type="button" class="opt'+(single?' single':'')+'" data-v="'+esc(o.v)+'" aria-pressed="'+(pressed?'true':'false')+'">'+
    '<span class="box" aria-hidden="true"></span><span class="t">'+esc(T(o))+(sub?'<span class="s">'+esc(sub)+'</span>':'')+'</span></button>';
}
function progress(){
  var cur = st.history.indexOf(st.screen) + 1;
  var others = asked().filter(function(q){ return q !== st.screen; });
  var total = Math.max(cur, Math.min(E.MAX_SCREENS, 1 + others.length + E.remainingEstimate(S, st.ans, others)));
  var t = '';
  for (var i = 1; i <= total; i++) t += '<span class="'+(i < cur ? 'done' : i === cur ? 'now' : '')+'"></span>';
  return '<p class="qcount">'+fill(T(W.qof), {a:cur, b:total})+'</p><div class="ticks" aria-hidden="true">'+t+'</div>';
}
function render(){
  document.documentElement.lang = lang;
  document.title = T({en:'Meri Yojana – Karnal',hi:'मेरी योजना – करनाल'});
  document.getElementById('brand').innerHTML = esc(T(W.brand)) + '<small>'+esc(T(W.brandSub))+'</small>';
  document.getElementById('l-hi').setAttribute('aria-pressed', lang === 'hi');
  document.getElementById('l-en').setAttribute('aria-pressed', lang === 'en');
  var s = st.screen;
  app.innerHTML = '<div class="screen">'+(s === 'start' ? renderStart() : s === 'results' ? renderResults() : s === 'scheme' ? renderScheme() : renderQ(s))+'</div>';
  renderBar(); wire();
}
function renderStart(){
  var m = DATA.meta, h = '<section class="hero"><h1>'+esc(T(W.brand))+'<span class="sub">'+esc(T(W.heroSub))+'</span></h1>'+
    '<p>'+esc(T(W.heroP))+'</p><ul class="facts"><li>'+esc(T(W.f1))+'</li><li>'+esc(T(W.f2))+'</li><li>'+esc(T(W.f3))+'</li></ul>';
  if (m.built) h += '<p class="meta">'+esc(fill(T(W.dataLine), {d: m.built.split(' ')[0], n: m.schemes}))+'</p>';
  if (updatedSince) h += '<p class="updated">'+esc(fill(T(W.updated), {d: m.built.split(' ')[0]}))+'</p>';
  if (loadError) h += '<p class="err" role="alert">'+esc(T(W.loadFail))+'</p>';
  return h + '</section>';
}
function renderQ(q){
  var d = st.draft, h = progress() + '<h1 class="q" id="qh" tabindex="-1">'+esc(T(Q[q].title))+'</h1><p class="hint">'+esc(T(Q[q].hint))+'</p>';
  function list(arr, isOn, single){ return arr.map(function(o){ return optBtn(o, isOn(o.v), single); }).join(''); }
  function inArr(v){ return d && d.indexOf && d.indexOf(v) >= 0; }
  function eq(v){ return d === v; }
  if (q === 'types') h += '<div class="opts">' + TYPES.map(function(o){ return optBtn(o, inArr(o.v), false, lang === 'hi' ? o.shi : o.sen); }).join('') + '</div>';
  else if (q === 'about'){
    var G = [{v:'F',en:'Female',hi:'महिला'},{v:'M',en:'Male',hi:'पुरुष'},{v:'T',en:'Transgender',hi:'ट्रांसजेंडर'}];
    h += '<div class="field"><label id="gl">'+esc(T({en:'Gender',hi:'लिंग'}))+'</label><div class="opts" role="group" aria-labelledby="gl">'+
      list(G, function(v){ return d.gender === v; }, true)+'</div></div>'+
      '<div class="field"><label for="age">'+esc(T({en:'Age in years (leave blank if not sure)',hi:'आयु वर्षों में (पक्का न हो तो खाली छोड़ें)'}))+'</label>'+
      '<div class="age"><button type="button" data-age="-1" aria-label="−1">−</button><input id="age" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" value="'+esc(d.age)+'">'+
      '<button type="button" data-age="1" aria-label="+1">+</button></div></div>';
    var yn = [{v:'no',en:'No',hi:'नहीं'},{v:'yes',en:'Yes',hi:'हाँ'}];
    h += '<div class="field"><label id="dl">'+esc(T(Q.disability.title))+'</label><div class="opts grid" role="group" aria-labelledby="dl">'+
      yn.map(function(o){ return '<button type="button" class="opt single" data-dis="'+o.v+'" aria-pressed="'+((o.v === 'no' ? d.dis === 'none' : (d.dis && d.dis !== 'none')) ? 'true' : 'false')+'"><span class="box" aria-hidden="true"></span><span class="t">'+esc(T(o))+'</span></button>'; }).join('')+'</div>';
    if (d.dis && d.dis !== 'none') h += '<p class="hint sub">'+esc(T(Q.disability.hint))+'</p><div class="opts">'+
      list(DIS.filter(function(o){ return o.v !== 'none'; }), function(v){ return d.dis === v; }, true)+'</div>';
    h += '</div>';
  }
  else if (q === 'category') h += '<div class="opts">' + list(CATS, inArr) + '</div>';
  else if (q === 'income') h += '<div class="opts">' + list(INCOME, eq, true) + '</div>';
  else if (q === 'occupation'){
    var opts = E.occOptions(E.candidates(S, st.ans)).filter(function(k){ return OCC[k]; }).map(function(k){ return {v:k, en:OCC[k].en, hi:OCC[k].hi}; });
    opts.push({v:'none', en:W.none.en, hi:W.none.hi});
    h += '<div class="opts">' + list(opts, inArr) + '</div>';
  }
  else if (q === 'class') h += '<div class="opts grid">' + list(CLASSES, eq, true) + '</div>';
  else if (q === 'disability') h += '<div class="opts">' + list(DIS, eq, true) + '</div>';
  else if (q === 'event'){
    var ev = E.eventOptions(E.candidates(S, st.ans));
    var a = ev.filter(function(k){ return SIT_EVENTS[k]; }).map(function(k){ return {v:k,en:SIT_EVENTS[k].en,hi:SIT_EVENTS[k].hi}; });
    var b = ev.filter(function(k){ return SIT_SPECIAL[k]; }).map(function(k){ return {v:k,en:SIT_SPECIAL[k].en,hi:SIT_SPECIAL[k].hi}; });
    if (a.length) h += '<p class="group-h">'+esc(T({en:'Recent or coming events',hi:'हाल की या आने वाली घटनाएँ'}))+'</p><div class="opts">'+list(a, inArr)+'</div>';
    if (b.length) h += '<p class="group-h">'+esc(T({en:'Special situations',hi:'विशेष परिस्थितियाँ'}))+'</p><div class="opts">'+list(b, inArr)+'</div>';
    h += '<p class="group-h"></p><div class="opts">'+optBtn({v:'none',en:W.none.en,hi:W.none.hi}, inArr('none'))+'</div>';
  }
  else if (q === 'residence') h += '<div class="opts">' + list(RES, eq, true) + '</div>';
  return h + '<p class="err" role="alert">'+esc(st.err)+'</p>';
}
function sectorName(sec){ return lang === 'hi' && SECTOR[sec] ? SECTOR[sec] : sec; }
/* Long English names are "Short name – explanation" or "Short name (detail)": show the short part as the title. */
function splitName(n){
  if (n.length <= 60) return { head: n, tail: '' };
  var m = /^(.{12,70}?)(?: – | \(| - )(.+)$/.exec(n);
  return m ? { head: m[1], tail: n.slice(m[1].length).replace(/^[\s–-]+/, '') } : { head: n, tail: '' };
}
/* First sentence of the recorded benefit, as the one line a person reads first. */
function benefitLine(s){
  var b = (s.benefit_short || s.benefit || '').replace(/^[•\-\s]+/, '');
  var m = /[.;]\s+[A-Z₹•]/.exec(b), first = m ? b.slice(0, m.index + 1) : b;   // no lookbehind: older phone browsers
  if (first.length > 150){ var cut = first.lastIndexOf(' ', 140); first = first.slice(0, cut > 60 ? cut : 140) + '…'; }
  return first;
}
/* One plain next step from the recorded mode, link and nodal officer. Nothing here is invented:
   the mode decides the wording, the link and the office come from the record. */
function nextStep(s){
  var m = s.mode || '', h = '<div class="next"><b>'+esc(T(W.stepH))+'</b>';
  if (/pro-active/i.test(m)) h += esc(T(W.stepAuto)) + ' ' + esc(s.nodal);
  else if (/bank|post office/i.test(m) && !/online/i.test(m)) h += esc(T(W.stepBank)) + (s.link ? '<br><a class="go" href="'+esc(s.link)+'" target="_blank" rel="noopener">'+esc(s.link.replace(/^https?:\/\//,''))+'</a>' : '');
  else if (/online|portal|app|saral|udid|mfmb|tracking/i.test(m)){
    h += s.link ? '<a class="go" href="'+esc(s.link)+'" target="_blank" rel="noopener">'+esc(T(W.stepOnline))+': '+esc(s.link.replace(/^https?:\/\//,''))+'</a>' : esc(T(W.stepOnlineNoLink));
    if (/csc|saral/i.test(m) || !s.link) h += '<br>'+esc(T(W.stepCsc));
    else h += '<br>'+esc(T(W.stepCsc));
  }
  else if (/school|institutional|mis|cluster|hsrlm|test/i.test(m)) h += esc(T(W.stepSchool)) + ' ' + esc(s.nodal);
  else h += esc(T(W.stepOffice)) + ' ' + esc(s.nodal);
  return h + '</div>';
}
function nameOf(s){ return lang === 'hi' && s.name_hi ? s.name_hi : s.name; }
function card(x, kind){
  var s = x.scheme, ev = x.ev, en = splitName(s.name);
  var title = lang === 'hi' ? s.name_hi : en.head, alt = lang === 'hi' ? en.head + (en.tail ? ' – ' + en.tail : '') : (en.tail ? en.tail : s.name_hi);
  var h = '<article class="card '+kind+'" id="s-'+esc(s.id)+'"><span class="stamp'+(s.verified?'':' pending')+'">'+esc(T(s.verified ? W.verified : W.pending))+'</span>';
  h += '<h4>'+esc(title)+'</h4>'+(alt?'<p class="alt">'+esc(alt)+'</p>':'');
  if (s.benefit_short || s.benefit) h += '<p class="ben">'+esc(benefitLine(s))+'</p>';
  if (ev.window) h += '<span class="window">'+esc(fill(T(W.applyWithin), {w: ev.window}))+'</span>';
  var ms = (ev.slabs || []).filter(function(z){ return z.match; });
  if (ms.length && ms.length < ev.slabs.length) h += '<ul class="slabs">'+ms.map(function(z){ return '<li class="m">'+esc(z.label)+(z.benefit?' – '+esc(z.benefit):'')+'</li>'; }).join('')+'</ul>';
  if (kind !== 'elig' && ev.reasons.length) h += '<div class="why">'+(kind === 'cond' ? '<p><b>'+esc(T(W.unless))+'</b></p>' : '')+ev.reasons.map(function(r){ return '<p>'+reasonText(r)+'</p>'; }).join('')+'</div>';
  if (kind !== 'life') h += nextStep(s);
  if (s.nodal) h += '<p class="contact"><b>'+esc(T(W.contact))+'</b> '+esc(s.nodal)+'</p>';
  h += '<details><summary>'+esc(T(W.more))+'</summary><div class="det">';
  if (W.enOnly[lang]) h += '<p class="meta">'+esc(W.enOnly[lang])+'</p>';
  if (s.benefit) h += '<h5>'+esc(T(W.benH))+'</h5><p>'+esc(s.benefit)+'</p>';
  if (s.slabs && s.slabs.length) h += '<h5>'+esc(T(W.slabH))+'</h5><ul class="slabs">'+ev.slabs.map(function(z){ return '<li class="'+(z.match?'m':'')+'">'+esc(z.label)+(z.benefit?' – '+esc(z.benefit):'')+'</li>'; }).join('')+'</ul>';
  if (s.how) h += '<h5>'+esc(T(W.howH))+'</h5><p>'+esc(s.how)+'</p>';
  if (s.mode) h += '<h5>'+esc(T(W.modeH))+'</h5><p>'+esc(s.mode)+'</p>';
  if (s.link) h += '<h5>'+esc(T(W.linkH))+'</h5><p><a href="'+esc(s.link)+'" target="_blank" rel="noopener">'+esc(s.link.replace(/^https?:\/\//,''))+'</a></p>';
  if (s.docs && s.docs.length) h += '<h5>'+esc(T(W.docsList))+'</h5><ul>'+s.docs.map(function(d){ return '<li>'+esc(d)+'</li>'; }).join('')+'</ul>';
  if (s.elig_text) h += '<h5>'+esc(T(W.rulesH))+'</h5><p>'+esc(s.elig_text)+'</p>';
  return h + '<p class="meta">'+esc(s.id)+' | '+esc(s.dept)+'</p><a class="plink" href="#/scheme/'+esc(s.id)+'">'+esc(T(W.linkThis))+' ↗</a></div></details></article>';
}
/* Most specific to the person first; verified before unverified; then by id for a stable order. */
function bySpecificity(list){
  return list.slice().sort(function(a, b){
    return E.specificity(b.scheme) - E.specificity(a.scheme) || (b.scheme.verified ? 1 : 0) - (a.scheme.verified ? 1 : 0) || (a.scheme.id < b.scheme.id ? -1 : 1);
  });
}
/* A "check" scheme whose only open point is an exclusion the person can judge for themselves. */
function exclusionOnly(x){ return x.ev.reasons.length > 0 && x.ev.reasons.every(function(r){ return r.key === 'exclusion' || r.key === 'cat_note'; }); }
function groupBy(list, keyOf, nameOf_){
  var groups = {}, order = [];
  list.forEach(function(x){ var k = keyOf(x); if (!groups[k]){ groups[k] = []; order.push(k); } groups[k].push(x); });
  return { order: order, groups: groups, name: nameOf_ };
}
function renderGroups(g, kind){
  return g.order.map(function(k){ return '<h3 class="sector">'+esc(g.name(k))+' ('+g.groups[k].length+')</h3>'+g.groups[k].map(function(x){ return card(x, kind || (x.ev.status === 'eligible' ? 'elig' : 'cond')); }).join(''); }).join('');
}
/* Sectors in the order their most specific scheme appears, so the person's own sector leads. */
function bySector(list, kind){
  var g = groupBy(bySpecificity(list), function(x){ return x.scheme.sector || '—'; }, sectorName);
  return renderGroups(g, kind);
}
/* Life-event schemes grouped by the event that would make them apply. */
function byEvent(list){
  var g = groupBy(bySpecificity(list), function(x){ return E.hardEvents(x.scheme)[0] || 'other'; },
    function(k){ var o = SIT_EVENTS[k] || SIT_SPECIAL[k]; return fill(T(W.onEvent), {e: o ? T(o) : T(W.none)}); });
  return renderGroups(g, 'life');
}
function renderScheme(){
  var s = S.filter(function(x){ return x.id === st.scheme; })[0];
  var h = '<h1 class="q" id="qh" tabindex="-1">'+esc(T(W.schemeH))+'</h1>';
  if (!s) return h + '<p class="empty">'+esc(T(W.notFound))+'</p>';
  h += '<p class="hint">'+esc(T(W.schemeNote))+'</p>' + card({ scheme: s, ev: E.evaluate(s, {}, {}) }, 'info');
  return h + '<p class="foot">'+esc(T(W.foot))+'</p>';
}
var RES_CACHE;
function renderResults(){
  var R = RES_CACHE = E.results(S, st.ans, st.skipped), docs = E.docsChecklist(R.eligible);
  var everyone = R.eligible.filter(function(x){ return E.specificity(x.scheme) === 0; });
  var own = R.eligible.filter(function(x){ return E.specificity(x.scheme) > 0; });
  var cond = R.check.filter(exclusionOnly), check = R.check.filter(function(x){ return !exclusionOnly(x); });
  var yes = bySpecificity(own.concat(cond));
  docs = E.docsChecklist(yes);
  var docFor = {}; yes.forEach(function(x){ (x.scheme.docs_canon || []).forEach(function(d){ (docFor[d] = docFor[d] || []).push(x.scheme); }); });
  var h = '<h1 class="q">'+esc(T(W.resH))+'</h1>';
  h += '<div class="sum"><a class="e" href="#elig"><b>'+yes.length+'</b>'+esc(T(W.eligN))+'</a><a class="c" href="#check"><b>'+check.length+'</b>'+esc(T(W.checkN))+'</a></div>';
  h += '<div class="rbar noprint"><button type="button" class="btn" id="b-print">'+esc(T(W.print))+'</button><a class="btn" id="b-wa" target="_blank" rel="noopener" href="#">'+esc(T(W.wa))+'</a></div>';
  if (docs.length) h += '<section class="docs"><h2 class="sec first">'+esc(T(W.docsH))+'</h2><p class="secnote">'+esc(T(W.docsNote))+'</p><ul>'+
    docs.map(function(d){ var f = docFor[d] || [], sub = f.length === 1 ? fill(T(W.for1), {s: esc(lang === 'hi' ? f[0].name_hi : splitName(f[0].name).head)}) : fill(T(W.forN), {n: f.length});
      return '<li><label class="chk"><input type="checkbox"'+(st.ticked[d] ? ' checked' : '')+' data-doc="'+esc(d)+'"><span>'+esc(T(DOCS[d]))+'<small>'+sub+'</small></span></label></li>'; }).join('')+'</ul></section>';
  h += '<h2 class="sec" id="elig">'+esc(T(W.eligH))+' ('+yes.length+')</h2><p class="secnote">'+esc(T(W.eligNote))+'</p>';
  h += yes.length ? renderGroups(groupBy(bySpecificity(yes), function(x){ return x.scheme.sector || '—'; }, sectorName), null) : '<p class="empty">'+esc(T(W.noElig))+'</p>';
  h += '<h2 class="sec" id="check">'+esc(T(W.checkH))+' ('+check.length+')</h2><p class="secnote">'+esc(T(W.checkNote))+'</p>' + bySector(check, 'check');
  if (everyone.length) h += '<details class="lifebox"><summary>'+esc(T(W.everyoneH))+' ('+everyone.length+')</summary><p class="secnote">'+esc(T(W.everyoneNote))+'</p>'+bySector(everyone, 'elig')+'</details>';
  if (R.event.length) h += '<details class="lifebox"><summary>'+esc(T(W.lifeH))+' ('+R.event.length+')</summary><p class="secnote">'+esc(T(W.lifeNote))+'</p>'+byEvent(R.event)+'</details>';
  h += slip(yes, check, docs);
  return h + '<p class="foot">'+esc(T(W.foot))+'<br>'+esc(fill(T(W.dataLine), {d: (DATA.meta.built || '').split(' ')[0], n: DATA.meta.schemes}))+'</p>';
}
/* The printable slip: one or two pages a person can carry to the office. */
function slip(yes, check, docs){
  function line(x){ var s = x.scheme; return '<li><b>'+esc(lang === 'hi' ? s.name_hi : splitName(s.name).head)+'</b>'+(lang === 'hi' ? ' <small>('+esc(splitName(s.name).head)+')</small>' : '')+
    '<br>'+esc(benefitLine(s))+'<br><small>'+esc(T(W.office))+': '+esc(s.nodal)+(s.link ? ' · '+esc(s.link.replace(/^https?:\/\//,'')) : '')+'</small></li>'; }
  var d = new Date(), ds = ('0'+d.getDate()).slice(-2)+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+d.getFullYear();
  var h = '<section class="slip" aria-hidden="true"><h1>'+esc(T(W.slipTitle))+'</h1><p class="sub">'+esc(fill(T(W.slipDate), {d: ds}))+'</p>';
  h += '<h2>'+esc(T(W.eligH))+' ('+yes.length+')</h2><ol>'+yes.map(line).join('')+'</ol>';
  if (check.length) h += '<h2>'+esc(T(W.checkH))+' ('+check.length+')</h2><ol>'+check.map(function(x){ return '<li><b>'+esc(lang === 'hi' ? x.scheme.name_hi : splitName(x.scheme.name).head)+'</b><br><small>'+x.ev.reasons.map(reasonText).join('; ')+'</small></li>'; }).join('')+'</ol>';
  if (docs.length) h += '<h2>'+esc(T(W.docsH))+'</h2><ul class="d">'+docs.map(function(k){ return '<li>'+esc(T(DOCS[k]))+'</li>'; }).join('')+'</ul>';
  return h + '<p class="foot">'+esc(T(W.foot))+(/^https?:$/.test(location.protocol) ? '<br>'+esc(T(W.site))+': '+esc(location.origin + location.pathname) : '')+'</p></section>';
}
function waText(){
  var R = RES_CACHE, L = [T(W.waHead), '', T(W.eligH) + ':'];
  var yes = bySpecificity(R.eligible.filter(function(x){ return E.specificity(x.scheme) > 0; }).concat(R.check.filter(exclusionOnly)));
  var check = bySpecificity(R.check.filter(function(x){ return !exclusionOnly(x); }));
  yes.slice(0, 10).forEach(function(x, i){ var s = x.scheme; L.push((i+1)+'. '+(lang === 'hi' ? s.name_hi : splitName(s.name).head)+' – '+(s.link ? s.link : s.nodal)); });
  if (yes.length > 10) L.push(fill(T(W.waMore), {n: yes.length - 10}));
  if (check.length){ L.push('', T(W.checkH) + ':'); check.slice(0, 5).forEach(function(x, i){ L.push((i+1)+'. '+(lang === 'hi' ? x.scheme.name_hi : splitName(x.scheme.name).head)); }); if (check.length > 5) L.push(fill(T(W.waMore), {n: check.length - 5})); }
  var docs = E.docsChecklist(yes);
  if (docs.length) L.push('', T(W.docsH) + ': ' + docs.map(function(d){ return T(DOCS[d]); }).join(', '));
  var t = L.join('\n');
  t = t.length > 3500 ? t.slice(0, 3500) + '…' : t;
  return /^https?:$/.test(location.protocol) ? t + '\n\n' + location.origin + location.pathname : t;
}
function renderBar(){
  var s = st.screen, h;
  if (s === 'start') h = '<button type="button" class="btn primary" id="b-next"'+(S.length ? '' : ' disabled')+'>'+esc(T(S.length ? W.start : W.loading))+'</button>';
  else if (s === 'results') h = '<button type="button" class="btn" id="b-back">'+esc(T(W.back))+'</button><button type="button" class="btn primary" id="b-again">'+esc(T(W.again))+'</button>';
  else if (s === 'scheme') h = '<button type="button" class="btn primary" id="b-again">'+esc(T(W.findMine))+'</button>';
  else {
    var last = !E.nextQuestion(S, previewAns(), asked()).next;
    h = '<button type="button" class="btn" id="b-back">'+esc(T(W.back))+'</button><button type="button" class="btn primary" id="b-next">'+esc(T(last ? W.see : W.next))+'</button>';
  }
  bar.innerHTML = h;
}
function wire(){
  app.querySelectorAll('.opt').forEach(function(b){
    b.addEventListener('click', function(){
      var q = st.screen, v = b.getAttribute('data-v'), dv = b.getAttribute('data-dis');
      if (q === 'about'){
        if (dv) st.draft.dis = dv === 'no' ? 'none' : (st.draft.dis && st.draft.dis !== 'none' ? st.draft.dis : 'yes');
        else if (DIS.some(function(o){ return o.v === v; }) && v !== 'none') st.draft.dis = v;
        else st.draft.gender = v;
      }
      else if (SINGLE[q]) st.draft = v;
      else {
        var d = (st.draft || []).slice(), i = d.indexOf(v);
        if (i >= 0) d.splice(i, 1);
        else { d = EXCLUSIVE[v] ? [] : d.filter(function(x){ return !EXCLUSIVE[x]; }); d.push(v); }
        st.draft = d;
      }
      st.err = '';
      var y = window.scrollY; render(); window.scrollTo(0, y);
      var again = app.querySelector('.opt[data-v="'+v+'"]'); if (again) again.focus({preventScroll:true});
    });
  });
  var age = document.getElementById('age');
  if (age){
    age.addEventListener('input', function(){ age.value = age.value.replace(/[^0-9]/g,''); st.draft.age = age.value; });
    app.querySelectorAll('[data-age]').forEach(function(b){ b.addEventListener('click', function(){
      var n = parseInt(st.draft.age || '0', 10) + parseInt(b.getAttribute('data-age'), 10);
      st.draft.age = String(Math.max(0, Math.min(120, n))); age.value = st.draft.age; }); });
  }
  var n = document.getElementById('b-next');
  if (n) n.onclick = function(){ if (st.screen === 'start'){ st.history = ['types']; go('types'); } else commit(); };
  var b = document.getElementById('b-back'); if (b) b.onclick = function(){ if (history.state && history.state.depth > 0) history.back(); else back(); };
  var g = document.getElementById('b-again'); if (g) g.onclick = function(){ reset(); render(); remember(); window.scrollTo(0,0); };
  var p = document.getElementById('b-print'); if (p) p.onclick = function(){ window.print(); };
  app.querySelectorAll('.chk input').forEach(function(c){ c.addEventListener('change', function(){ st.ticked[c.getAttribute('data-doc')] = c.checked; }); });
  var w = document.getElementById('b-wa'); if (w) w.href = 'https://wa.me/?text=' + encodeURIComponent(waText());
}
document.getElementById('l-hi').onclick = function(){ lang = 'hi'; render(); };
document.getElementById('l-en').onclick = function(){ lang = 'en'; render(); };
var updatedSince = false, loadError = false;
function boot(d){
  DATA = d; S = d.schemes;
  try {                                                   // interface convenience only: which list version this phone saw last
    var seen = localStorage.getItem('my-data-built');
    if (seen && seen !== d.meta.built) updatedSince = true;
    localStorage.setItem('my-data-built', d.meta.built);
  } catch (e) {}
  fromHash();
  if (st.screen === 'start' && app.querySelector('.hero')){   // keep the hero that is already painted; just finish it
    var hero = app.querySelector('.hero'), m = d.meta, extra = '';
    if (m.built) extra += '<p class="meta">'+esc(fill(T(W.dataLine), {d: m.built.split(' ')[0], n: m.schemes}))+'</p>';
    if (updatedSince) extra += '<p class="updated">'+esc(fill(T(W.updated), {d: m.built.split(' ')[0]}))+'</p>';
    hero.insertAdjacentHTML('beforeend', extra); renderBar(); wire();
  } else render();
  remember(true);
}
render();                                                  // start screen at once, before the scheme list arrives
fetch('data.json').then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); }).then(boot)
  .catch(function(){ loadError = true; render(); });
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
})();

