import {seed} from './species.js?v=22';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ============================================================================
// STANDAARD SUPABASE VERBINDING (Zodat vrienden direct jouw data en foto's zien)
// ============================================================================
const DEFAULT_SUPABASE_URL = 'https://ungxityeqrsyvykemaep.supabase.co'; 
const DEFAULT_SUPABASE_KEY = 'sb_publishable_eWyAc7GqPMxz9LKKl3b-JA_kjoCdhEa';
// ============================================================================

const validPages=['dashboard','vogels','fotos','ontdekken','statistieken','instellingen'];
const rarityOrder=['Algemeen','Schaars','Zeldzaam','Dwaalgast'];

const fallbackAlgemeen=new Set(["Knobbelzwaan","Rotgans","Brandgans","Grauwe Gans","Toendrarietgans","Kleine Rietgans","Kolgans","Eider","Zwarte Zee-eend","Brilduiker","Nonnetje","Grote Zaagbek","Middelste Zaagbek","Bergeend","Krooneend","Tafeleend","Kuifeend","Zomertaling","Slobeend","Krakeend","Smient","Wilde Eend","Pijlstaart","Wintertaling","Dodaars","Fuut","Geoorde Fuut","Holenduif","Houtduif","Turkse Tortel","Gierzwaluw","Koekoek","Waterral","Waterhoen","Meerkoet","Ooievaar","Blauwe Reiger","Grote Zilverreiger","Kleine Zilverreiger","Lepelaar","Jan-van-gent","Aalscholver","Scholekster","Kluut","Zilverplevier","Goudplevier","Bontbekplevier","Kleine Plevier","Kievit","Regenwulp","Wulp","Grutto","Rosse Grutto","Oeverloper","Witgat","Zwarte Ruiter","Groenpootruiter","Bosruiter","Tureluur","Houtsnip","Watersnip","Steenloper","Kanoet","Kemphaan","Krombekstrandloper","Drieteenstrandloper","Bonte Strandloper","Kleine Strandloper","Drieteenmeeuw","Kokmeeuw","Dwergmeeuw","Zwartkopmeeuw","Stormmeeuw","Kleine Mantelmeeuw","Zilvermeeuw","Geelpootmeeuw","Pontische Meeuw","Grote Mantelmeeuw","Dwergstern","Zwarte Stern","Visdief","Noordse Stern","Grote Stern","Wespendief","Bruine Kiekendief","Blauwe Kiekendief","Sperwer","Havik","Zeearend","Buizerd","Kerkuil","Steenuil","Ransuil","Bosuil","IJsvogel","Groene Specht","Zwarte Specht","Middelste Bonte Specht","Grote Bonte Specht","Kleine Bonte Specht","Torenvalk","Boomvalk","Slechtvalk","Wielewaal","Grauwe Klauwier","Ekster","Gaai","Kauw","Roek","Zwarte Kraai","Raaf","Goudhaan","Vuurgoudhaan","Pimpelmees","Koolmees","Kuifmees","Zwarte Mees","Matkop","Glanskop","Baardman","Staartmees","Boomleeuwerik","Veldleeuwerik","Oeverzwaluw","Boerenzwaluw","Huiszwaluw","Cetti's Zanger","Bladkoning","Fluiter","Tjiftjaf","Fitis","Zwartkop","Tuinfluiter","Braamsluiper","Grasmus","Sprinkhaanzanger","Snor","Spotvogel","Bosrietzanger","Kleine Karekiet","Rietzanger","Boomklever","Boomkruiper","Winterkoning","Spreeuw","Beflijster","Merel","Kramsvogel","Zanglijster","Koperwiek","Grote Lijster","Grauwe Vliegenvanger","Roodborst","Nachtegaal","Blauwborst","Bonte Vliegenvanger","Zwarte Roodstaart","Gekraagde Roodstaart","Paapje","Roodborsttapuit","Tapuit","Heggenmus","Huismus","Ringmus","Engelse Kwikstaart","Gele Kwikstaart","Noordse Kwikstaart","Grote Gele Kwikstaart","Witte Kwikstaart","Rouwkwikstaart","Boompieper","Graspieper","Oeverpieper","Waterpieper","Keep","Vink","Appelvink","Goudvink","Groenling","Kneu","Frater","Kleine Barmsijs","Grote Barmsijs","Kruisbek","Putter","Europese Kanarie","Sijs","Sneeuwgors","Geelgors","Rietgors","Grote Canadese Gans","Nijlgans","Fazant","Rotsduif","Halsbandparkiet"]);
const fallbackSchaars=new Set(["Kleine Zwaan","Wilde Zwaan","Witbuikrotgans","Zwarte Rotgans","Roodhalsgans","Taigarietgans","Dwerggans","IJseend","Grote Zee-eend","Casarca","Witoogeend","Topper","Kwartel","Patrijs","Flamingo","Roodhalsfuut","Kuifduiker","Zomertortel","Nachtzwaluw","Porseleinhoen","Kraanvogel","Roodkeelduiker","Parelduiker","IJsduiker","Noordse Stormvogel","Grauwe Pijlstormvogel","Noordse Pijlstormvogel","Zwarte Ooievaar","Roerdomp","Woudaap","Kwak","Koereiger","Purperreiger","Zwarte Ibis","Steltkluut","Morinelplevier","Strandplevier","Poelruiter","Bokje","Temmincks Strandloper","Paarse Strandloper","Blonde Ruiter","Gestreepte Strandloper","Grauwe Franjepoot","Rosse Franjepoot","Alk","Zeekoet","Kleinste Jager","Kleine Jager","Middelste Jager","Grote Jager","Kleine Burgemeester","Grote Burgemeester","Lachstern","Reuzenstern","Witwangstern","Witvleugelstern","Visarend","Rode Wouw","Zwarte Wouw","Ruigpootbuizerd","Velduil","Oehoe","Hop","Bijeneter","Draaihals","Roodpootvalk","Smelleken","Klapekster","Bonte Kraai","Buidelmees","Strandleeuwerik","Roodstuitzwaluw","Pallas' Boszanger","Humes Bladkoning","Siberische Tjiftjaf","Waterrietzanger","Grote Karekiet","Graszanger","Pestvogel","Kleine Vliegenvanger","Grote Pieper","Duinpieper","Roodkeelpieper","Roodmus","Grote Kruisbek","IJsgors","Ortolaan","Grauwe Gors","Zwarte Zwaan","Indische Gans","Mandarijneend","Chileense Flamingo","Grote Alexanderparkiet"]);
const fallbackZeldzaam=new Set(["Kleine Canadese Gans","Sneeuwgans","Ross' Gans","Koningseider","Stellers Eider","Brilzee-eend","Amerikaanse Zee-eend","Ringsnaveleend","Kleine Topper","Blauwvleugeltaling","Amerikaanse Smient","Amerikaanse Wintertaling","Korhoen","Oosterse Tortel","Alpengierzwaluw","Vale Gierzwaluw","Kwartelkoning","Klein Waterhoen","Kleinst Waterhoen","Geelsnavelduiker","Stormvogeltje","Vaal Stormvogeltje","Kuhls Pijlstormvogel","Grote Pijlstormvogel","Vale Pijlstormvogel","Ralreiger","Kuifaalscholver","Dwergaalscholver","Griel","Amerikaanse Goudplevier","Aziatische Goudplevier","Steppekievit","Witstaartkievit","Terekruiter","Kleine Geelpootruiter","Grote Grijze Snip","Poelsnip","Vorkstaartplevier","Steppevorkstaartplevier","Breedbekstrandloper","Bairds Strandloper","Bonapartes Strandloper","Grote Franjepoot","Papegaaiduiker","Zwarte Zeekoet","Kleine Alk","Vorkstaartmeeuw","Kleine Kokmeeuw","Lachmeeuw","Franklins Meeuw","Ringsnavelmeeuw","Dougalls Stern","Grijze Wouw","Slangenarend","Vale Gier","Monniksgier","Schreeuwarend","Bastaardarend","Dwergarend","Steenarend","Steppekiekendief","Grauwe Kiekendief","Arendbuizerd","Ruigpootuil","Dwergooruil","Sneeuwuil","Scharrelaar","Grijskopspecht","Kleine Torenvalk","Eleonora's Valk","Giervalk","Roodoogvireo","Bruine Klauwier","Turkestaanse Klauwier","Daurische Klauwier","Kleine Klapekster","Roodkopklauwier","Notenkraker","Kuifleeuwerik","Kortteenleeuwerik","Rotszwaluw","Grauwe Fitis","Noordse Boszanger","Raddes Boszanger","Bruine Boszanger","Bergfluiter","Balkanbergfluiter","Iberische Tjiftjaf","Sperwergrasmus","Westelijke Baardgrasmus","Balkanbaardgrasmus","Provençaalse Grasmus","Kleine Sprinkhaanzanger","Siberische Sprinkhaanzanger","Krekelzanger","Kleine Spotvogel","Oostelijke Vale Spotvogel","Orpheusspotvogel","Veldrietzanger","Struikrietzanger","Zwartkoprietzanger","Rotskruiper","Taigaboomkruiper","Roze Spreeuw","Waterspreeuw","Goudlijster","Siberische Lijster","Vale Lijster","Bruine Lijster","Zwartkeellijster","Noordse Nachtegaal","Roodkeelnachtegaal","Blauwstaart","Withalsvliegenvanger","Izabeltapuit","Woestijntapuit","Bonte Tapuit","Alpenheggenmus","Balkankwikstaart","Citroenkwikstaart","Mongoolse Pieper","Siberische Boompieper","Petsjorapieper","Siberische Waterpieper","Haakbek","Woestijnvink","Witstuitbarmsijs","Witbandkruisbek","Zwartkopgors","Cirlgors","Witkopgors","Wilgengors","Dwerggors","Bosgors","Noordse Waterlijster","Zwartkopzanger","Mirtezanger","Rosse Stekelstaart","Kleinste Canadese Gans","Heilige Ibis","Monniksparkiet","Huiskraai","Bruinkopdiksnavelmees"]);

function getRarity(s){
    if(s.rarity && rarityOrder.includes(s.rarity)) return s.rarity;
    if(fallbackAlgemeen.has(s.name)) return 'Algemeen';
    if(fallbackSchaars.has(s.name)) return 'Schaars';
    if(fallbackZeldzaam.has(s.name)) return 'Zeldzaam';
    return 'Dwaalgast';
}

const groupPaths = {
    "Zwanen en ganzen": `<path d="M18 6c-1.8 0-3 1.4-3 3.4 0 2.6-.7 5.2-2.2 6.4-2.8-.4-6.4.4-8.8 3.2 0 1.6 1.8 2.6 4.8 2.6h9.4c2.8 0 4.6-1.6 4.6-3.8 0-2-1.4-3.4-3.6-3.8 1-1.4 1.6-3.6 1.6-5.4 0-1.6-1.2-2.6-2.8-2.6zm2.8 1.6l2.4.7-2.4.9v-1.6z"/>`,
    "Eenden en zaagbekken": `<path d="M18.2 9.2c-1.8 0-3.1 1.3-3.1 3 0 .7.2 1.4.5 1.9-2.8-.3-6.6.4-9.2 1.9L3.8 14.5 3 18.2c1.4 2.4 4.4 3.4 8.6 3.4h6.6c3.2 0 5.2-1.5 5.2-3.6 0-1.6-1.1-2.8-2.8-3.3.5-.7.8-1.6.8-2.5 0-1.7-1.4-3-3.2-3zm3.2 1.4l2.8.8-2.8.8v-1.6z"/>`,
    "Hoenderachtigen": `<path d="M17.5 8.5c-1.4 0-2.5 1.1-2.5 2.5 0 .6.2 1.1.4 1.5-3.2-.2-6.8 1.4-8.9 4.5l-2.5 2 1.2 1.2 2.2-.8c1.5.9 3.4 1.4 5.6 1.4 3.8 0 6.5-2.2 6.5-5.2 0-1.2-.5-2.2-1.2-3 .5-.5.7-1.1.7-1.8 0-1.3-1.1-2.3-2.5-2.3zm2.5 1.2l2 .6-2 .6v-1.2zM11 20.8v2.7h1.5v-2.7H11zm3 0v2.7h1.5v-2.7H14z"/>`,
    "Futen en flamingo's": `<path d="M17.5 4.5l-2.2 1.2 1.4 1.3c-.6 1.6-1.2 4.8-1.5 7.2-3.2-.3-6.8.8-9.2 3.6l-.8 2.2c1.8 1.2 4.8 1.8 8.8 1.8h4.8c2.4 0 4-1.2 4-3 0-1.4-.9-2.5-2.4-3 .3-2.4.9-5.8 1.6-7.6 0-1.5-1.1-2.6-2.5-2.6l-2-1.1zm2.8 2.4l3.2.7-3.2.7V6.9z"/>`,
    "Duiven en zandhoenders": `<path d="M17.2 7.5c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.2.5 1.6-2.8.2-5.8 1.8-8.2 4.6L3.2 19l1.4 1.4 3.4-1.4c1.6.9 3.4 1.3 5.2 1.3 4.2 0 7-2.6 7-6 0-1.4-.5-2.6-1.4-3.5.5-.5.8-1.2.8-2 0-1.5-1.1-2.7-2.4-2.7zm2.4 1.4l2.2.7-2.2.7V8.9zM11.5 20.3v2.7H13v-2.7h-1.5zm2.5 0v2.7h1.5v-2.7H14z"/>`,
    "Nachtzwaluwen, gierzwaluwen en koekoeken": `<path d="M12 10.5c-2.6-3.8-6.8-6.4-10.5-7 1.8 3.6 4.8 7 8.2 8.8L6.5 18l3.5-2.2 2 1.4 2-1.4 3.5 2.2-3.2-5.7c3.4-1.8 6.4-5.2 8.2-8.8-3.7.6-7.9 3.2-10.5 7z"/>`,
    "Rallen, kraanvogels en trappen": `<path d="M17.2 7.5c-1.4 0-2.5 1.1-2.5 2.5 0 .7.2 1.3.6 1.8-2.8.2-5.8 1.6-7.8 4L5.2 14l-.7 3.2c1.4 2 3.8 3.1 7 3.1 3.8 0 6.5-2 6.5-4.8 0-1.3-.5-2.4-1.4-3.2.6-.5 1-1.3 1-2.3 0-1.4-1.1-2.5-2.4-2.5zm2.4 1.2l2.6.8-2.6.8V8.7zM10.5 20.2v3.3H12v-3.3h-1.5zm3 0v3.3H15v-3.3h-1.5z"/>`,
    "Duikers en stormvogels": `<path d="M17.8 9.5c-1.6 0-2.8 1.2-2.8 2.8 0 .7.2 1.3.6 1.8-3.4-.2-7.8.6-10.8 2.5L2.5 16l-.5 2.8c2 1.6 5.6 2.4 10.2 2.4h6.2c2.6 0 4.4-1.1 4.4-2.8 0-1.3-.9-2.3-2.4-2.7.5-.6.8-1.4.8-2.3 0-1.6-1.4-2.9-3.4-2.9zm3.4 1.2l3.3.7-3.3.8v-1.5z"/>`,
    "Ooievaars, pelikanen, reigers en lepelaars": `<path d="M18.2 3.8c-1.3 0-2.4 1-2.4 2.3 0 2.2-1.4 4.8-2.6 6.4-2.6 0-5.4 1.2-7.4 3.4l-1.8 2.1h7.8v5.5h1.5V18h2v5.5h1.5V17.8c2-.6 3.4-2 3.4-3.8 0-1.3-.7-2.4-1.8-3.1 1-1.5 1.8-3.6 1.8-5.2 0-1.1-.9-1.9-2-1.9zm2 1l3.6.7-3.6.8V4.8z"/>`,
    "Genten en aalscholvers": `<path d="M17.5 5.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.8-.5 3.8-1.4 5-2.6.4-5.2 2-7.2 4.6L4 20.5l2.2.8 2.4-1.6c1.4.6 2.9.9 4.4.9 3.6 0 6.2-2.2 6.2-5.4 0-1.6-.6-3-1.7-4 .7-1.1 1.1-2.5 1.1-3.8 0-1.3-1.1-2.2-2.1-2.2zm2.1 1.1l3.2.6-1.2 1.2-2-.6V6.3z"/>`,
    "Plevieren, kluten en kieviten": `<path d="M17.2 7.8c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.2.5 1.7-2.8.2-5.8 1.5-8 3.8l-3 1.8.8 1.3 3.2-.8c1.4.7 3 1.1 4.8 1.1 3.8 0 6.4-2 6.4-4.8 0-1.2-.5-2.3-1.3-3.1.5-.5.8-1.2.8-2 0-1.5-1.1-2.7-2.5-2.7zm2.5 1.3l2.5.6-2.5.7V9.1zM11 19.4v4.1h1.5v-4.1H11zm3 0v4.1h1.5v-4.1H14z"/>`,
    "Wulpen, ruiters en snippen": `<path d="M16.5 7.5c-1.5 0-2.6 1.1-2.6 2.6 0 .6.2 1.2.5 1.6-2.8.2-5.8 1.5-8 3.9l-2.9 1.9.8 1.2 3.1-.8c1.4.7 3 1.1 4.8 1.1 3.6 0 6.1-1.9 6.1-4.6 0-1.2-.5-2.2-1.3-3 .5-.5.8-1.1.8-1.9 0-1.4-1-2.5-2.3-2.5zm2.2 1.2c2.2.2 4.1 1.4 4.8 3.4l-1.1.5c-.7-1.4-2-2.3-3.7-2.6V8.7zM10.8 19v4.5h1.4V19h-1.4zm2.8 0v4.5H15V19h-1.4z"/>`,
    "Strandlopers en franjepoten": `<path d="M16.8 8.8c-1.4 0-2.5 1.1-2.5 2.5 0 .6.2 1.1.5 1.5-2.6.2-5.4 1.3-7.4 3.4l-2.9 1.6.7 1.2 2.9-.7c1.3.6 2.8 1 4.4 1 3.4 0 5.8-1.8 5.8-4.3 0-1.1-.4-2-1.2-2.7.5-.4.7-1.1.7-1.8 0-1.3-1-2.4-2-2.4zm2 1.1l2.8.6-2.8.6V9.9zM11 19.3v3.7h1.4v-3.7H11zm2.8 0v3.7h1.4v-3.7h-1.4z"/>`,
    "Alkachtigen en jagers": `<path d="M15.5 5c-2.2 0-3.8 1.6-3.8 3.8 0 1.2.4 2.2 1 3-2.2 1.5-3.7 4-3.7 6.8 0 1.6.8 2.8 2.2 3.4h5.6c2.2 0 3.7-1.6 3.7-4.2 0-3.2-1.4-6-3.4-7.4.6-.7 1-1.6 1-2.6C18.1 6.2 17 5 15.5 5zm2.6 1.8c1.8.2 3.2 1.2 3.4 2.6-.9.6-2.1.9-3.4.9V6.8z"/>`,
    "Meeuwen": `<path d="M12 12.2C8.8 8.2 4.6 6.5 1.5 7.2c2.4 1.6 5.2 4.2 7.4 7.4L6.8 18l3.4-1.4 1.8 1.2 1.8-1.2 3.4 1.4-2.1-3.4c2.2-3.2 5-5.8 7.4-7.4-3.1-.7-7.3 1-10.5 5z"/>`,
    "Sterns": `<path d="M12 11.5C8.6 7.4 4.2 5.2 1.2 5.6c2.8 2 5.8 5 7.8 8.2L5.5 20l4.6-3.4 1.9 1.6 1.9-1.6 4.6 3.4-3.5-6.2c2-3.2 5-6.2 7.8-8.2-3-.4-7.4 1.8-10.8 5.9z"/>`,
    "Roofvogels": `<path d="M12 10.2C8.4 6.8 4 5.5 1 6.5l1.8 1.2L1.2 9l2.2.8-.8 1.4c2.8.2 5.4 1.4 7.2 3.4L7.8 19h8.4l-2-4.4c1.8-2 4.4-3.2 7.2-3.4l-.8-1.4 2.2-.8-1.6-1.3L23 6.5c-3-1-7.4.3-11 3.7z"/>`,
    "Uilen": `<path d="M8.2 4.5l1.6 2.2c1.4-.4 3-.4 4.4 0l1.6-2.2.9 3.2c1.2 1 1.9 2.5 1.9 4.2 0 1.4-.4 2.7-1.1 3.7.7 1.2 1.1 2.6 1.1 4.1 0 2.2-1.4 3.8-3.6 3.8H9c-2.2 0-3.6-1.6-3.6-3.8 0-1.5.4-2.9 1.1-4.1-.7-1-1.1-2.3-1.1-3.7 0-1.7.7-3.2 1.9-4.2l.9-3.2zm1.8 5.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm4 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm-2 2.6l-1 1.6 1 1.2 1-1.2-1-1.6z"/>`,
    "Hop, ijsvogels en spechten": `<path d="M7 3v18h2.2V3H7zm6.8 2.8c-1.4 0-2.5 1.1-2.5 2.5 0 .6.2 1.1.5 1.6l-2.6 1.6.8 1.2 1.8-1c-.5 1.2-.8 2.6-.8 4.1 0 2.6 1.5 4.8 3.8 6.2l1.2-1.2c-1.2-1.2-1.8-2.8-1.8-4.6 0-1.8.6-3.4 1.6-4.5.4-.5.7-1.1.7-1.8 0-1.4-.8-2.6-1.9-3.1l1.2-1H13.8zm-2.5 1.7l-2.1.6 2.1.6V7.5z"/>`,
    "Valken": `<path d="M12 9.8C8.2 5.8 3.8 4.2 1 4.8c2.6 2.2 5.4 5.4 7.6 8.8L6.4 19.5l3.8-2 1.8 1.5 1.8-1.5 3.8 2-2.2-5.9c2.2-3.4 5-6.6 7.6-8.8-2.8-.6-7.2 1-11 5z"/>`,
    "Klauwieren en wielewaal": `<path d="M17.2 7.5c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.2.5 1.6-2.8.3-5.8 1.9-8 4.7L3.2 19.5l1.4 1.3 3.4-1.6c1.5.8 3.2 1.2 5 1.2 3.9 0 6.6-2.4 6.6-5.6 0-1.3-.5-2.5-1.3-3.3.5-.5.8-1.2.8-2 0-1.5-1-2.7-2.4-2.7zm2.4 1.2l2.6.6-.6 1.1-2-.5V8.7zM11.2 20.4v3.1h1.5v-3.1h-1.5zm2.8 0v3.1h1.5v-3.1H14z"/>`,
    "Kraaiachtigen": `<path d="M17.5 6.8c-1.6 0-2.9 1.3-2.9 2.9 0 .7.2 1.3.6 1.8-3 .3-6.2 2-8.5 5L2.8 19.5l1.5 1.5 3.6-1.6c1.6.9 3.5 1.3 5.5 1.3 4.2 0 7.1-2.6 7.1-6.1 0-1.4-.5-2.7-1.4-3.6.5-.5.8-1.3.8-2.1 0-1.6-1.1-2.8-2.4-2.8zm2.4 1.2l3.1.8-3.1 1V8zM11.2 20.7v2.8h1.5v-2.8h-1.5zm3 0v2.8h1.5v-2.8h-1.5z"/>`,
    "Mezen en goudhaantjes": `<path d="M16.2 8.2c-1.6 0-2.9 1.3-2.9 2.9 0 .5.1 1 .4 1.4-2.6.2-5.2 1.6-7 3.9L3.5 18.8l1.2 1.3 2.9-1.2c1.4.9 3.1 1.4 5 1.4 3.8 0 6.4-2.3 6.4-5.4 0-1.2-.5-2.3-1.2-3.1.4-.5.6-1.1.6-1.8 0-1.5-1-2.5-2.2-2.5zm2.2 1.3l1.8.6-1.8.6V9.5zM11 20.3v3.2h1.4v-3.2H11zm2.8 0v3.2h1.4v-3.2h-1.4z"/>`,
    "Leeuweriken en zwaluwen": `<path d="M12 11.2C8.6 7 4.2 4.8 1.2 5.4c2.8 2.2 5.6 5.4 7.6 8.6L5 20.5l5.2-3.8 1.8 1.5 1.8-1.5 5.2 3.8-3.8-6.5c2-3.2 4.8-6.4 7.6-8.6-3-.6-7.4 1.6-10.8 5.8z"/>`,
    "Zangers": `<path d="M16.8 8c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.1.5 1.5-2.7.2-5.6 1.7-7.7 4.3L3.2 19l1.3 1.3 3.3-1.4c1.5.8 3.2 1.2 5 1.2 3.8 0 6.4-2.3 6.4-5.4 0-1.3-.5-2.4-1.3-3.2.5-.5.8-1.1.8-1.9 0-1.4-1-2.6-2.4-2.6zm2.4 1.3l2.4.5-2.4.6V9.3zM11.2 20.1v3.4h1.4v-3.4h-1.4zm2.8 0v3.4h1.4v-3.4H14z"/>`,
    "Lijsters, spreeuwen en boomklevers": `<path d="M17.2 7.2c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.2.5 1.6-2.8.3-5.8 1.8-8 4.6L3.4 18.8l1.4 1.4 3.3-1.4c1.6.9 3.4 1.3 5.3 1.3 4 0 6.8-2.5 6.8-5.8 0-1.4-.5-2.6-1.4-3.4.5-.5.8-1.2.8-2 0-1.5-1.1-2.7-2.4-2.7zm2.4 1.3l2.4.7-2.4.7V8.5zM11.2 20.1v3.4h1.5v-3.4h-1.5zm2.8 0v3.4h1.5v-3.4H14z"/>`,
    "Vliegenvangers, roodstaarten en tapuiten": `<path d="M16.6 7.8c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.1.5 1.6-2.6.3-5.4 1.8-7.4 4.4L3.6 19.2l1.3 1.3 3.1-1.4c1.5.8 3.1 1.2 4.9 1.2 3.7 0 6.3-2.3 6.3-5.4 0-1.3-.5-2.4-1.3-3.2.5-.5.8-1.1.8-1.9 0-1.4-1-2.5-2.1-2.5zm2.1 1.3l2.1.5-2.1.6V9.1zM11 20.3v3.2h1.4v-3.2H11zm2.8 0v3.2h1.4v-3.2h-1.4z"/>`,
    "Mussen, heggenmussen, kwikstaarten en piepers": `<path d="M16.8 8c-1.5 0-2.7 1.2-2.7 2.7 0 .6.2 1.1.5 1.5-2.7.2-5.6 1.7-7.8 4.3L2.8 19.2l1.3 1.3 3.5-1.5c1.5.8 3.2 1.2 5 1.2 3.8 0 6.4-2.3 6.4-5.4 0-1.3-.5-2.4-1.3-3.2.5-.5.8-1.1.8-1.9 0-1.4-1-2.6-2.2-2.6zm2.2 1.3l2.1.6-2.1.6V9.3zM11.2 20.2v3.3h1.4v-3.3h-1.4zm2.8 0v3.3h1.4v-3.3H14z"/>`,
    "Vinken": `<path d="M16.8 7.8c-1.6 0-2.8 1.2-2.8 2.8 0 .6.2 1.1.5 1.6-2.7.2-5.6 1.7-7.7 4.3L3.2 19l1.4 1.4 3.2-1.4c1.5.8 3.3 1.3 5.2 1.3 3.9 0 6.6-2.4 6.6-5.6 0-1.3-.5-2.5-1.3-3.3.5-.5.8-1.2.8-2 0-1.5-1-2.6-2.3-2.6zm2.3 1.1l2.4 1.1-2.4 1.1V8.9zM11.2 20.3v3.2h1.5v-3.2h-1.5zm2.8 0v3.2h1.5v-3.2H14z"/>`,
    "Gorzen en Amerikaanse zangers": `<path d="M16.8 7.8c-1.6 0-2.8 1.2-2.8 2.8 0 .6.2 1.1.5 1.6-2.7.2-5.6 1.7-7.7 4.3L3.2 19l1.4 1.4 3.2-1.4c1.5.8 3.3 1.3 5.2 1.3 3.9 0 6.6-2.4 6.6-5.6 0-1.3-.5-2.5-1.3-3.3.5-.5.8-1.2.8-2 0-1.5-1-2.6-2.3-2.6zm2.3 1.2l2.2.9-2.2.9V9zM11.2 20.3v3.2h1.5v-3.2h-1.5zm2.8 0v3.2h1.5v-3.2H14z"/>`,
    "Gevestigde exoten": `<path d="M16.5 6.5c-1.8 0-3.2 1.4-3.2 3.2 0 .7.2 1.3.6 1.8-2.8.4-5.6 2.2-7.6 5.2L2.8 21l1.6 1.2 3.2-2c1.5.7 3.2 1.1 5 1.1 4 0 6.8-2.5 6.8-6 0-1.5-.5-2.8-1.4-3.8.5-.6.8-1.3.8-2.2 0-1.6-1.1-2.8-2.3-2.8zm2.3 1.2c1.6.2 2.8 1.2 2.8 2.6l-1.4.4c-.2-.8-.7-1.3-1.4-1.5V7.7zM11.2 21.3v2.2h1.5v-2.2h-1.5zm2.8 0v2.2h1.5v-2.2H14z"/>`
};

function groupIcon(groupName, size=48){
    const path = groupPaths[groupName] || groupPaths["Zangers"];
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#a3425e" style="opacity:0.82;display:block">${path}</svg>`;
}

function getHashPage(){
    const h=location.hash.replace('#','');
    return validPages.includes(h)?h:'dashboard';
}

function getHeroTimeProps() {
    const h = new Date().getHours();
    if(h >= 5 && h < 11) return {class:'morning', eye:'VROEGE VOGEL', title:'De natuur ontwaakt', emoji:'🌅'};
    if(h >= 18 || h < 5) return {class:'night', eye:'NACHTUIL', title:'Tijd voor uilen en nachtzwaluwen', emoji:'🌙'};
    return {class:'', eye:'JOUW LEVENSLIJST', title:'Houd je waarnemingen bij', emoji:'🔭'};
}

function spawnFeathers() {
    for(let i=0; i<6; i++){
        let f = document.createElement('div');
        f.className='feather';
        f.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c25977" stroke-width="1.5"><path d="M12 2C8 6 6 10 6 15c0 3.3 2.7 6 6 6s6-2.7 6-6c0-5-2-9-6-13z"/><path d="M12 2v20M9 10l3 3M15 11l-3 3M10 16l2 2"/></svg>`;
        f.style.left = (10 + Math.random()*80) + 'vw';
        f.style.animationDuration = (2.5 + Math.random()*2) + 's';
        f.style.animationDelay = (Math.random()*0.3) + 's';
        document.body.appendChild(f);
        setTimeout(()=>f.remove(), 4500);
    }
}

let page=getHashPage(),term='',group='Alle groepen',rarity='Alle zeldzaamheden',filter='alle',sortBy='standaard',modal=null, busy=false, message='',msgType='notice';
let species=seed.map((s,idx)=>({...s, idx, rarity:getRarity(s)}));
let entries=JSON.parse(localStorage.getItem('vogelboek-entries')||'{}');
let supabase=null,session=null,cloud=false,canEdit=false;

let savedConfig=JSON.parse(localStorage.getItem('vogelboek-config')||'null');
let hasDefault = DEFAULT_SUPABASE_URL.startsWith('https://') && DEFAULT_SUPABASE_KEY.length > 10;
let config = (savedConfig?.url && savedConfig?.key) ? savedConfig : (hasDefault ? {url:DEFAULT_SUPABASE_URL.trim(), key:DEFAULT_SUPABASE_KEY.trim()} : null);

const STORE='vogelboek-entries';
function saveLocal(){localStorage.setItem(STORE,JSON.stringify(entries))}
function notify(t,typ='notice'){message=t;msgType=typ;render()}

async function initCloud(){
    render();
    if(!config?.url||!config?.key){ canEdit=true; return; }
    try{
        const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
        supabase=createClient(config.url,config.key);
        const {data:{session:s}}=await supabase.auth.getSession();
        session=s; canEdit=!!s;
        await fetchCloud();
        if(location.hash.includes('access_token=')){ history.replaceState(null,'','#dashboard'); page='dashboard'; }
        supabase.auth.onAuthStateChange((_event,s)=>{ session=s; canEdit=!!s; setTimeout(()=>fetchCloud(),0); });
    }catch(e){ message='Cloudverbinding mislukt: '+e.message; msgType='error'; }
    render();
}

async function fetchCloud(){
    if(!supabase)return;
    try{
        const {data,error}=await supabase.from('observations').select('species_id,seen_date,location,photo_path,created_at');
        if(error)throw error;
        entries={};
        for(const d of data)entries[d.species_id]={seen:true,date:d.seen_date||'',location:d.location||'',photoPath:d.photo_path||''};
        cloud=true; photoCache={};
        render();
    }catch(e){notify('Ophalen mislukt: '+e.message,'error')}
}

async function persist(id,obj,file){
    if(!canEdit || !session) throw Error('Log in om aan te passen.');
    let path=obj.photoPath||null;
    if(file){
        if(!file.type.startsWith('image/'))throw Error('Kies een afbeeldingsbestand.');
        if(file.size>8*1024*1024)throw Error('Foto max 8 MB.');
        path=session.user.id+'/'+id+'/'+crypto.randomUUID()+'-'+file.name.replace(/[^a-zA-Z0-9_.-]/g,'_');
        const up=await supabase.storage.from('bird-photos').upload(path,file,{contentType:file.type});
        if(up.error)throw up.error;
    }
    const {error}=await supabase.from('observations').upsert({user_id:session.user.id,species_id:id,seen_date:obj.date||null,location:obj.location||null,photo_path:path},{onConflict:'user_id,species_id'});
    if(error)throw error;
    entries[id]={...obj,photoPath:path};
}

async function removeEntry(id){
    if(!canEdit || !session) throw Error('Log in om te verwijderen.');
    const {error}=await supabase.from('observations').delete().eq('species_id',id);
    if(error)throw error;
    delete entries[id];
}

async function photoUrl(id){
    let e=entries[id];
    if(!e)return '';
    if(e.photo)return e.photo;
    if(!e.photoPath||!supabase)return '';
    const pub=supabase.storage.from('bird-photos').getPublicUrl(e.photoPath);
    if(pub?.data?.publicUrl) return pub.data.publicUrl;
    const {data,error}=await supabase.storage.from('bird-photos').createSignedUrl(e.photoPath,3600);
    return error?'':data.signedUrl;
}

let photoCache={};
async function loadPhotos(){
    if(!supabase)return;
    const ps=Object.entries(entries).filter(([id,e])=>e.photoPath&&!Object.prototype.hasOwnProperty.call(photoCache,id));
    await Promise.all(ps.map(async([id])=>{photoCache[id]=await photoUrl(id)}));
    render();
}

function countSeen(){return Object.keys(entries).filter(k=>entries[k]?.seen).length}
function countPhoto(){return Object.values(entries).filter(x=>x.seen&&(x.photo||x.photoPath)).length}

const iconHome = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const iconBird = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>`;
const iconCam = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
const iconSearch = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const iconChart = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`;
const iconGear = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

const tabs=[
  ['dashboard',iconHome,'Overzicht'],
  ['vogels',iconBird,'Alle vogels'],
  ['fotos',iconCam,"Mijn foto's"],
  ['ontdekken',iconSearch,'Ontdekken'],
  ['statistieken',iconChart,'Statistieken']
];

function nav(){return tabs.map(([k,icon,title])=>`<button data-page="${k}" class="${k===page?'active':''}" style="display:flex;align-items:center;gap:12px"><span style="display:inline-flex;width:20px;justify-content:center;align-items:center">${icon}</span><span>${title}</span></button>`).join('')}
function header(title,sub){return `<div class="top"><div><div class="eyebrow">Mijn persoonlijke natuurdagboek</div><h1>${title}</h1>${sub?`<div class="muted">${sub}</div>`:''}</div></div>`}
function stat(label,value){return `<div class="stat"><span>${label}</span><b>${value}</b></div>`}

function dashboard(){
    const seen=countSeen(),photos=countPhoto();
    const recent=species.filter(s=>entries[s.id]?.seen).slice(-5);
    const tp = getHeroTimeProps();
    
    return `<div class="top"><div><div class="eyebrow">Mijn persoonlijke natuurdagboek</div><h1>Welkom in je vogelboek</h1><div class="muted">Overzicht van al je waarnemingen en foto's.</div></div></div>
<div class="hero ${tp.class}"><div><div class="eyebrow" style="color:rgba(255,255,255,0.7)">${tp.eye}</div><h2>${tp.title}</h2><p>Vink je soorten af, voeg je eigen foto's toe en bekijk welke vogels je nog kunt ontdekken.</p><button class="button" style="margin-top:18px;background:white;color:black" data-page="vogels">Bekijk alle vogels →</button></div><div style="font-size:75px">${tp.emoji}</div></div>
<div class="stats">${stat('Soorten gezien',seen)}${stat("Met eigen foto",photos)}${stat('Nog zonder foto',seen-photos)}${stat('Dit jaar',Object.values(entries).filter(e=>e.seen&&e.date?.startsWith(new Date().getFullYear().toString())).length)}</div>
<div class="layout"><section class="panel"><div class="panel-header"><h2>Jouw waarnemingen</h2><button class="link" data-page="vogels">Alle vogels →</button></div>${recent.length?recent.map(s=>rowitem(s)).join(''):'<div class="empty">Nog geen waarnemingen.</div>'}</section><section class="panel"><h2>Op zoek naar...</h2><p class="sectionlead">Je eigen ontdek-lijst: soorten die je nog wilt zien en gefotografeerde soorten die ontbreken.</p><button class="button" data-page="ontdekken">Bekijk je zoeklijst</button></section></div>`;
}

function rowitem(s, blur=false){
    let e=entries[s.id],src=e?.photo||photoCache[s.id];
    let hwText = e?.date || e?.location ? `<br><span class="handwritten">${esc(e.date||'')} ${e.date&&e.location?',':''} ${esc(e.location||'')}</span>` : '';
    let thumb = src 
        ? `<img class="thumb ${blur?'wazig':''}" src="${esc(src)}" alt="${esc(s.name)}">`
        : `<div class="thumb ${blur?'wazig':''}" style="display:flex;align-items:center;justify-content:center">${groupIcon(s.group,28)}</div>`;

    return `<div class="rowitem">${thumb}<div><b>${esc(s.name)}</b><br><span style="font-size:11px">${esc(s.group)} · ${esc(s.rarity)}</span>${hwText}</div><button class="link" data-edit="${esc(s.id)}">${canEdit?'Bewerk →':'Bekijk →'}</button></div>`;
}

function card(s){
    const e=entries[s.id],src=e?.photo||photoCache[s.id];
    const bottomBtns = canEdit
        ? `<div class="bird-bottom"><button data-toggle="${esc(s.id)}">${e?.seen?'✓ Gezien':'＋ Gezien'}</button><button data-edit="${esc(s.id)}">Details →</button></div>`
        : `<div class="bird-bottom"><button data-edit="${esc(s.id)}" style="width:100%">Bekijk details →</button></div>`;
    
    let topVisual = src 
        ? `<img src="${esc(src)}" alt="${esc(s.name)}">`
        : groupIcon(s.group, 52);

    return `<div class="bird-card"><div class="bird-top">${topVisual}<div class="flag">${e?.seen?'✓ Gezien':'○ Niet gezien'}</div></div><div class="bird-info"><b>${esc(s.name)}</b><small>${esc(s.scientific)}</small><div class="counter" style="margin-top:8px">${esc(s.group)} · ${esc(s.rarity)} · ${src?'foto':'geen foto'}</div></div>${bottomBtns}</div>`;
}

function stampCard(s){const e=entries[s.id],src=e?.photo||photoCache[s.id];return `<div class="stamp-wrapper" data-edit="${esc(s.id)}"><div class="stamp-card"><img src="${esc(src)}" alt="${esc(s.name)}"><div class="stamp-name">${esc(s.name)}</div></div></div>`}

function vogels(){
    let groups=[...new Set(species.map(s=>s.group))].sort();
    let arr=species.filter(s=>
        (s.name+' '+s.scientific).toLowerCase().includes(term.toLowerCase()) &&
        (group==='Alle groepen'||s.group===group) &&
        (rarity==='Alle zeldzaamheden'||s.rarity===rarity) &&
        (filter==='alle'||(filter==='gezien'&&entries[s.id]?.seen)||(filter==='ongezien'&&!entries[s.id]?.seen)||(filter==='zonderfoto'&&entries[s.id]?.seen&&!entries[s.id]?.photo&&!entries[s.id]?.photoPath))
    );

    arr = [...arr].sort((a,b)=>{
        const seenA = entries[a.id]?.seen ? 1 : 0;
        const seenB = entries[b.id]?.seen ? 1 : 0;
        if(sortBy==='gezien-eerst' && seenA!==seenB) return seenB - seenA;
        if(sortBy==='ongezien-eerst' && seenA!==seenB) return seenA - seenB;
        if(sortBy==='naam-az') return a.name.localeCompare(b.name,'nl');
        return a.idx - b.idx;
    });

    return `${header('Alle vogels','Zoek, sorteer en bouw je persoonlijke levenslijst op.')}<div class="toolbar" style="margin-bottom:18px"><div class="filterbar"><input class="input search" id="search" placeholder="🔎 Zoek Nederlandse of Latijnse naam" value="${esc(term)}"><select class="select" id="group"><option>Alle groepen</option>${groups.map(g=>`<option ${group===g?'selected':''}>${esc(g)}</option>`).join('')}</select><select class="select" id="rarity"><option>Alle zeldzaamheden</option>${rarityOrder.map(r=>`<option ${rarity===r?'selected':''}>${esc(r)}</option>`).join('')}</select><select class="select" id="filter"><option value="alle" ${filter==='alle'?'selected':''}>Filter: Alle soorten</option><option value="gezien" ${filter==='gezien'?'selected':''}>Alleen gezien</option><option value="ongezien" ${filter==='ongezien'?'selected':''}>Alleen niet gezien</option><option value="zonderfoto" ${filter==='zonderfoto'?'selected':''}>Foto ontbreekt</option></select><select class="select" id="sort"><option value="standaard" ${sortBy==='standaard'?'selected':''}>Sorteer: Taxonomisch</option><option value="gezien-eerst" ${sortBy==='gezien-eerst'?'selected':''}>Sorteer: Gezien eerst</option><option value="ongezien-eerst" ${sortBy==='ongezien-eerst'?'selected':''}>Sorteer: Niet gezien eerst</option><option value="naam-az" ${sortBy==='naam-az'?'selected':''}>Sorteer: Naam (A–Z)</option></select></div><span class="counter">${arr.length} van ${species.length} soorten <small class="muted" style="display:block;font-size:11px;text-align:right">Bron: Dutch Avifauna (CSNA)</small></span></div><div class="birds">${arr.map(card).join('')}</div>${arr.length?'':'<div class="empty">Geen soorten gevonden voor deze filters.</div>'}`;
}

function fotos(){const birds=species.filter(s=>entries[s.id]?.seen&&(entries[s.id].photo||entries[s.id].photoPath));const missing=species.filter(s=>entries[s.id]?.seen&&!entries[s.id].photo&&!entries[s.id].photoPath);return `${header("Mijn foto's",'Jouw eigen vogelfotocollectie.')}${birds.length?`<div class="photo-collage">${birds.map(stampCard).join('')}</div>`:'<div class="empty">Nog geen foto toegevoegd.</div>'}<section class="panel" style="margin-top:35px"><h2>Gezien, maar nog geen foto</h2>${missing.length?missing.map(s=>rowitem(s)).join(''):'<p class="muted">Nog geen soorten zonder foto.</p>'}</section>`}

function ontdekken(){
    const missing=species.filter(s=>entries[s.id]?.seen&&!entries[s.id]?.photo&&!entries[s.id]?.photoPath);
    const unseen=species.filter(s=>!entries[s.id]?.seen);
    return `${header('Ontdekken','Welke vogel wordt jouw volgende?')}<div class="grid2" style="margin-top:20px;align-items:start"><section class="panel"><div class="panel-header"><h2>Wel gezien, geen foto</h2><span class="pill">${missing.length}</span></div>${missing.length?missing.slice(0,15).map(s=>rowitem(s)).join(''):'<p class="muted">Geen soorten zonder foto.</p>'}</section><section class="panel"><div class="panel-header"><h2>Nog te ontdekken</h2><span class="pill">${unseen.length}</span></div>${unseen.slice(0,15).map(s=>rowitem(s, true)).join('')}</section></div>`;
}

function stats(){
    const seen=species.filter(s=>entries[s.id]?.seen),total=species.length;
    const rarities=rarityOrder.map(r=>({r,n:seen.filter(s=>s.rarity===r).length,total:species.filter(s=>s.rarity===r).length}));
    const groups=[...new Set(species.map(s=>s.group))].map(g=>({g,n:seen.filter(s=>s.group===g).length,total:species.filter(s=>s.group===g).length})).sort((a,b)=>b.n-a.n);
    return `${header('Statistieken','Jouw vogeldagboek in cijfers.')}
<div class="stats">${stat('Levenslijst',seen.length)}${stat('Voortgang catalogus',total?Math.round(100*seen.length/total)+'%':'0%')}${stat('Foto’s',countPhoto())}</div>
<section class="panel"><h2>Zeldzaamheid</h2>${rarities.map(x=>`<div class="chartline"><label>${esc(x.r)}</label><div class="track"><div style="width:${x.total?100*x.n/x.total:0}%"></div></div><span>${x.n}/${x.total}</span></div>`).join('')}</section>
<section class="panel"><h2>Vogelgroepen</h2>${groups.map(x=>`<div class="chartline"><label>${esc(x.g)}</label><div class="track"><div style="width:${x.total?100*x.n/x.total:0}%"></div></div><span>${x.n}/${x.total}</span></div>`).join('')}</section>`;
}

function settings(){return `${header('Instellingen','Beheer voor de eigenaar van dit vogelboek.')}
<div class="layout"><section class="panel"><h2>${canEdit&&session?'Mijn account':'Eigenaar login'}</h2>${canEdit&&session?`<p>Ingelogd als <b>${esc(session.user.email)}</b>. Je kunt waarnemingen en foto's toevoegen of bewerken.</p><button class="button alt" id="logout">Uitloggen</button>`:`<p class="sectionlead">Dit vogelboek staat in de deel-modus zodat bezoekers alle waarnemingen en foto's direct kunnen bekijken. Log hieronder in als je zelf de eigenaar bent en wijzigingen wilt aanbrengen.</p><form id="loginform"><label class="formfield">E-mailadres<input type="email" class="input" name="email" required></label><label class="formfield">Wachtwoord<input type="password" class="input" name="password" minlength="6" required></label><button class="button" value="login" name="action">Inloggen als eigenaar</button></form>`}</section>
<section class="panel"><h2>Back-up van je gegevens</h2><p class="sectionlead">Download de waarnemingen als JSON-bestand.</p><button class="button alt" id="export">Download JSON-back-up</button></section></div>`}

function modalHtml(){
    if(!modal)return '';
    const s=species.find(x=>x.id===modal);
    if(!s)return '';
    const e=entries[s.id]||{}, src=e.photo||photoCache[s.id];
    const hwText = e.date || e.location ? `<span class="handwritten" style="font-size:22px; margin-top:5px; padding-left:4px">${esc(e.date||'')} ${e.date&&e.location?',':''} ${esc(e.location||'')}</span>` : '';
    
    if(!canEdit){
        return `<div class="overlay" id="overlay"><div class="modal"><div class="modalhead"><div><div class="eyebrow">${esc(s.group)} · ${esc(s.rarity)}</div><h2 style="margin:5px 0">${esc(s.name)}</h2><i class="muted">${esc(s.scientific)}</i></div><button class="x" id="close">×</button></div><div style="margin-top:20px">${src?`<img class="photo" style="height:auto;max-height:380px;margin-bottom:16px;border-radius:12px" src="${esc(src)}" alt="Eigen foto">`:''}<div class="grid2"><div class="stat" style="padding:14px"><span>Status</span><b style="font-size:18px">${e.seen?'✓ Gezien':'○ Nog niet gezien'}</b></div><div class="stat" style="padding:14px"><span>Notitie</span><br>${hwText||'<span class="muted" style="font-size:13px">—</span>'}</div></div></div></div></div>`;
    }
    return `<div class="overlay" id="overlay"><div class="modal"><div class="modalhead"><div><div class="eyebrow">${esc(s.group)} · ${esc(s.rarity)}</div><h2 style="margin:5px 0">${esc(s.name)}</h2><i class="muted">${esc(s.scientific)}</i></div><button class="x" id="close">×</button></div><form id="obsform" style="margin-top:22px"><label class="formfield" style="display:flex;align-items:center;gap:10px;flex-direction:row;font-size:16px"><input type="checkbox" id="seen" name="seen" ${e.seen?'checked':''} style="width:19px;height:19px"> Deze soort heb ik gezien</label><div id="obsfields"><div class="grid2"><label class="formfield">Datum <small>optioneel</small><input class="input" type="date" name="date" value="${esc(e.date||'')}"></label><label class="formfield">Locatie <small>optioneel</small><input class="input" name="location" maxlength="240" placeholder="Bijv. Lauwersmeer" value="${esc(e.location||'')}"></label></div><label class="formfield">Mijn eigen foto <small>optioneel; jpg/png/webp, maximaal 8 MB online</small><input class="input" type="file" name="photo" accept="image/*"></label>${src?`<img class="photo" src="${esc(src)}" alt="Eigen foto">`:''}</div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:25px"><button type="button" class="button danger" id="delete" ${!e.seen?'disabled':''}>Verwijder waarneming</button><button type="submit" class="button" id="save">Opslaan</button></div></form></div></div>`;
}

function render(){const views={dashboard,vogels,fotos,ontdekken,statistieken:stats,instellingen:settings};$('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="logo">Mijn Vogelboek<small>Vogels verzamelen</small></div><div class="nav">${nav()}</div><div class="foot"><div class="account"><button class="button alt" data-page="instellingen" style="display:flex;align-items:center;justify-content:center;gap:9px;font-size:15px">${iconGear}<span>Instellingen</span></button></div><p>Een online dagboek voor vogels.</p></div></aside><main class="main">${message?`<div class="notice ${msgType}">${esc(message)} <button class="link" id="dismiss">×</button></div>`:''}${(views[page]||dashboard)()}</main><nav class="mobile-nav">${tabs.map(([k,ic,t])=>`<button data-page="${k}" class="${k===page?'active':''}"><span style="font-size:19px;display:flex;align-items:center;height:22px">${ic}</span>${t}</button>`).join('')}<button data-page="instellingen" class="${page==='instellingen'?'active':''}"><span style="font-size:19px;display:flex;align-items:center;height:22px">${iconGear}</span><span>Instellingen</span></button></nav></div>${modalHtml()}`;const f=$('#obsfields');if(f&&$('#seen'))f.style.opacity=$('#seen').checked?'1':'.45';if(supabase&&Object.values(entries).some(e=>e.photoPath)&&Object.entries(entries).some(([id,e])=>e.photoPath&&!Object.prototype.hasOwnProperty.call(photoCache,id)))loadPhotos()}

window.addEventListener('hashchange',()=>{
    const newPage=getHashPage();
    if(newPage!==page || modal!==null){
        page=newPage;
        modal=null;
        render();
        window.scrollTo(0,0);
    }
});

document.addEventListener('click',async ev=>{let t=ev.target.closest('[data-page],[data-edit],[data-toggle],#close,#delete,#logout,#export,#dismiss');if(!t)return;if(t.dataset.page){const target=t.dataset.page;if(location.hash==='#'+target){page=target;modal=null;render();window.scrollTo(0,0)}else{location.hash=target}}else if(t.dataset.edit){modal=t.dataset.edit;render()}else if(t.dataset.toggle){const id=t.dataset.toggle;try{let wasSeen = entries[id]?.seen; if(wasSeen){await removeEntry(id)}else{await persist(id,{seen:true,date:'',location:''}); spawnFeathers();}render()}catch(e){notify(e.message,'error')}}else if(t.id==='close'){modal=null;render()}else if(t.id==='dismiss'){message='';render()}else if(t.id==='delete'){if(!confirm('Wil je deze waarneming verwijderen?'))return;try{await removeEntry(modal);modal=null;render()}catch(e){notify(e.message,'error')}}else if(t.id==='logout'){await supabase.auth.signOut();session=null;canEdit=false;await fetchCloud();render()}else if(t.id==='export'){const payload=JSON.stringify({version:1,species,entries},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download='mijn-vogelboek-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}});
document.addEventListener('input',e=>{if(e.target.id==='search'){let pos=e.target.selectionStart;term=e.target.value;render();const el=$('#search');el.focus();el.setSelectionRange(pos,pos)}});
document.addEventListener('change',async e=>{if(e.target.id==='group'){group=e.target.value;render()}else if(e.target.id==='rarity'){rarity=e.target.value;render()}else if(e.target.id==='filter'){filter=e.target.value;render()}else if(e.target.id==='sort'){sortBy=e.target.value;render()}else if(e.target.id==='seen'){$('#obsfields').style.opacity=e.target.checked?'1':'.45'}});
document.addEventListener('submit',async ev=>{if(ev.target.id==='obsform'){ev.preventDefault();const f=ev.target;if(busy)return;busy=true;try{let justSeen = false; if(!f.elements.seen.checked){await removeEntry(modal)}else{const old=entries[modal]||{}; if(!old.seen) justSeen=true; await persist(modal,{...old,seen:true,date:f.elements.date.value,location:f.elements.location.value},f.elements.photo.files[0]);if(cloud){delete photoCache[modal];if(entries[modal].photoPath)photoCache[modal]=await photoUrl(modal)}}modal=null;notify('Waarneming opgeslagen.','success'); if(justSeen) spawnFeathers();}catch(e){notify('Opslaan mislukt: '+e.message,'error')}finally{busy=false}}else if(ev.target.id==='loginform'){ev.preventDefault();const f=ev.target;const email=f.elements.email.value,password=f.elements.password.value;try{const result=await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;notify('Je bent ingelogd als eigenaar.','success')}catch(e){notify(e.message,'error')}}});
initCloud();
