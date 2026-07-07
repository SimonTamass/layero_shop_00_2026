/* ═══════════════════════════════════════════════════════════════════
   LAYERO SHOP — demo termékadatok
   A képek a prezentációs oldal meglévő fotói (assets/...).
   Éles induláskor csak ezt a fájlt kell valós adatokra cserélni.

   Mezők: leiras = rövid leírás (termékkártya + ár alatti szöveg),
          hosszu = hosszú leírás bekezdései (termékoldal alsó blokk),
          specs  = [címke, érték] párok a spec-táblázathoz.
   ═══════════════════════════════════════════════════════════════════ */

var SHOP_CATS = [
  { id: 'lampak',      nev: 'Tematikus lámpák',   leiras: 'Névre szóló, világító ajándékok', img: 'assets/images/categories/layero-asset-0227-1100.webp' },
  { id: 'kulcstartok', nev: 'Kulcstartók',        leiras: 'Apró, mégis személyes darabok',   img: 'assets/images/categories/layero-asset-0226-1100.webp' },
  { id: 'dekoraciok',  nev: 'Dekorációk',         leiras: 'Vázák, kaspók, lakásdíszek',      img: 'assets/images/categories/layero-asset-0223-1100.webp' },
  { id: 'ceges',       nev: 'Céges megoldások',   leiras: 'Logós ajándék, QR + NFC display', img: 'assets/images/categories/layero-asset-0222-1100.webp' },
  { id: 'rajongoi',    nev: 'Gyűjtői / rajongói', leiras: 'Film, játék, sport, hobbi',       img: 'assets/images/categories/layero-asset-0225-1100.webp' },
  { id: 'egyedi',      nev: 'Egyedi rendelés',    leiras: 'A te ötleted, mi megvalósítjuk',  img: 'assets/images/categories/layero-asset-0224-1100.webp' }
];

var SHOP_PRODUCTS = [
  /* ── Tematikus lámpák ── */
  { id: 'szam-lampa-nevvel',   nev: 'Névre szóló szám-lámpa',        cat: 'lampak',      ar: 189, regi_ar: 239, badge: 'Bestseller',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0009.png', 'assets/termekvilag/hero_slider/layero-asset-0013.png'],
    leiras: 'Kedvenc játékos, mezszám és név egyben — LED háttérfénnyel világító, egyedi gyártású asztali lámpa.',
    hosszu: [
      'A szám-lámpa a legszemélyesebb ajándékaink egyike: a kiválasztott szám sziluettjébe komponáljuk a kedvenc játékos alakját, alá pedig a saját neved vagy az ünnepelt neve kerül. Bekapcsolva a meleg fehér LED egyenletesen világítja át a rétegeket, és a kontraszt kirajzolja a teljes jelenetet.',
      'A lámpa rendelésre készül: a szám, a név, a sportág és a póz is cserélhető. Foci, kosár, kézilabda vagy bármilyen más téma — küldd el, mire gondolsz, és a digitális tervet jóváhagyásra megmutatjuk gyártás előtt.',
      'USB-ről működik, érintőkapcsolóval. Stabil, súlyozott talpat kap, így polcra, éjjeliszekrényre és íróasztalra is biztonságosan kihelyezhető.'
    ],
    specs: [['Anyag', 'PLA biopolimer, matt felület'], ['Méret', 'kb. 18 × 20 cm (Közepes)'], ['Világítás', 'meleg fehér LED, USB'], ['Kapcsoló', 'érintős, a talpban'], ['Személyre szabás', 'szám, név, sportág, póz'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'programozo-lampa',    nev: 'Programozó kör-lámpa',          cat: 'lampak',      ar: 219,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0018.png', 'assets/termekvilag/hero_slider/layero-asset-0009.png'],
    leiras: 'Egyedi névvel és üzenettel gravírozott, áramkör-mintás világító dekoráció a jövő informatikusának.',
    hosszu: [
      'Ballagásra, diplomára vagy első munkanapra: a programozó kör-lámpa egy teljes kis világot rajzol fénybe — monitorok előtt ülő alak, szerverek, áramkör-minták, és középen a saját kódsorod: Név = "…", Üzenet = "…".',
      'A szöveg tetszőlegesen átírható, így ugyanez a design működik mérnöknek, gamernek vagy bárkinek, akinek a képernyő a második otthona. A kétrétegű előlap nappal is szép kontrasztot ad, este pedig a meleg háttérfény emeli ki a részleteket.'
    ],
    specs: [['Anyag', 'PLA biopolimer'], ['Átmérő', 'kb. 20 cm'], ['Világítás', 'meleg fehér LED, USB'], ['Személyre szabás', 'név + egyedi üzenet'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'jurassic-lampa',      nev: 'Dínós henger-lámpa névvel',     cat: 'lampak',      ar: 199, regi_ar: 249,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0011.png', 'assets/termekvilag/hero_slider/layero-asset-0017.png'],
    leiras: 'Kőmintás felületű, névre szóló henger-lámpa dinós motívummal — a gyerekszoba kedvence.',
    hosszu: [
      'A henger-lámpa különlegessége a litofán technika: a fal vastagságának változása rajzolja ki a képet, így kikapcsolva egyszerű kőmintás hengert látsz, bekapcsolva viszont előtűnik a teljes dinós jelenet és a név.',
      'Éjszakai fénynek is tökéletes: a meleg, szűrt fény nem vakít, a gyerekszobában pont annyi világosságot ad, amennyi az elalváshoz kell. A név betűtípusa a témához illeszkedik, és bármilyen névvel kérhető.'
    ],
    specs: [['Anyag', 'PLA, litofán technika'], ['Méret', 'kb. 11 × 19 cm'], ['Világítás', 'meleg fehér LED, USB'], ['Személyre szabás', 'név, motívum'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'hullam-gomblampa',    nev: 'Hullám asztali lámpa',          cat: 'lampak',      ar: 249, regi_ar: 299, badge: 'Új', visszakuldheto: true,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0016.png', 'assets/termekvilag/hero_slider/layero-asset-0019.png'],
    leiras: 'Organikus, csavart bordázatú lámpabúra fa lábakon, meleg fényű LED-del — skandináv hangulat bármelyik szobába.',
    hosszu: [
      'A hullám lámpa nem személyre szabott darab, hanem designtárgy: a csavart bordázat úgy szórja szét a fényt, hogy a búra teljes felülete egyenletesen izzik, árnyékjáték nélkül. Nappali dohányzóasztalra, hálószoba éjjeliszekrényére vagy dolgozósarokba egyaránt illik.',
      'A tömörfa hatású lábak és a matt búra kellemesen semleges párost alkotnak, így bármilyen belső térhez passzol — a skandináv minimáltól az indusztriálig.'
    ],
    specs: [['Anyag', 'PLA búra, fa hatású láb'], ['Méret', 'kb. 22 × 30 cm'], ['Világítás', 'E14 foglalat, LED izzóval'], ['Kapcsoló', 'vezetéken'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'karacsonyi-lampa',    nev: 'Karácsonyi kedvenc-lámpa',      cat: 'lampak',      ar: 229, badge: 'Szezonális',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0017.png', 'assets/termekvilag/hero_slider/layero-asset-0019.png'],
    leiras: 'Világító ünnepi jelenet a te kutyusaiddal — fotó alapján készül, hogy a család minden tagja ott legyen a fa alatt.',
    hosszu: [
      'Küldj egy-két fotót a kedvenceidről, és mi sziluettként belerajzoljuk őket az ünnepi jelenetbe: kanapé, ajándékok, hópelyhek, gömbök — és középen ők. A kész lámpa bekapcsolva meleg, ünnepi fénnyel világítja meg a jelenetet.',
      'Az adventi időszak legkeresettebb darabja, ezért novembertől érdemes időben rendelni. Kutyán kívül macskával, nyuszival vagy akár az egész családdal is kérhető.'
    ],
    specs: [['Anyag', 'PLA biopolimer'], ['Átmérő', 'kb. 20 cm'], ['Világítás', 'meleg fehér LED, USB'], ['Személyre szabás', 'fotó alapján, több kedvenc'], ['Gyártási idő', '7–12 munkanap (szezonban)']] },
  { id: 'holdfeny-lampa',      nev: 'Holdfény erdei lámpa',          cat: 'lampak',      ar: 159, regi_ar: 199,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0019.png', 'assets/termekvilag/hero_slider/layero-asset-0017.png'],
    leiras: 'Szarvasos, hegyvidéki sziluett kör-lámpa rejtett világítással — nappal dísz, este hangulatfény.',
    hosszu: [
      'A holdfény lámpa a természet nyugalmát hozza a szobába: hegyvonulat, fenyves és egy szarvas sziluettje rajzolódik ki a kör alakú, holdat idéző fénylap előtt. A rejtett LED-sor hátulról világít, így a fény puha és vakításmentes.',
      'Több méretben készül, így polcra, komódra és nagyobb felületre is találsz megfelelőt. Szarvas helyett farkas, medve vagy saját motívum is kérhető.'
    ],
    specs: [['Anyag', 'PLA biopolimer'], ['Méret', '3 méretben (16 / 20 / 26 cm)'], ['Világítás', 'rejtett LED-sor, USB'], ['Személyre szabás', 'motívum cserélhető'], ['Gyártási idő', '5–10 munkanap']] },

  /* ── Kulcstartók ── */
  { id: 'logos-kulcstarto',    nev: 'Logós kulcstartó',              cat: 'kulcstartok', ar: 39, badge: 'Bestseller',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0027.png', 'assets/termekvilag/hero_slider/layero-asset-0022.png'],
    leiras: 'Egyedi logóval, kétszínű nyomtatással készült, strapabíró kulcstartó — darabonként vagy céges csomagban.',
    hosszu: [
      'A logós kulcstartó a legegyszerűbb módja annak, hogy a márkád ott legyen az emberek zsebében — szó szerint. A logót kétszínű, domború nyomtatással visszük fel, így nem kopik és nem pattogzik le, ellentétben a matricázott vagy festett megoldásokkal.',
      'Egy darabot is legyártunk, de igazán céges mennyiségben éri meg: rendezvényre, csapatépítőre vagy törzsvásárlói ajándéknak 50–500 darabos tételben is vállaljuk, mennyiségi kedvezménnyel. Kérj árajánlatot a kapcsolat oldalon.'
    ],
    specs: [['Anyag', 'PETG, extra strapabíró'], ['Méret', 'kb. 4 × 5,5 cm'], ['Kivitel', 'kétszínű, domború logó'], ['Szerelék', 'fém karika + lánc'], ['Mennyiségi kedvezmény', '50 db felett'], ['Gyártási idő', '3–7 munkanap']] },
  { id: 'csapat-kulcstarto',   nev: 'Csapat-kulcstartó szett',       cat: 'kulcstartok', ar: 149,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0027.png', 'assets/termekvilag/hero_slider/layero-asset-0009.png'],
    leiras: '6 darabos szett kluboknak, baráti társaságoknak — egységes design, egyedi nevekkel minden darabon.',
    hosszu: [
      'Egy csapat, egy design, hat név: a szett minden darabja ugyanazt a formavilágot viseli, de mindenki a sajátját kapja. Fociedzésre, pecás bandának, motoros klubnak vagy a baráti körnek — a közös identitás apró, hordható formája.',
      'A szett alapára 6 darabra vonatkozik; nagyobb csapatnak darabonként bővíthető. A forma, a színek és a betűtípus is igazítható a csapat arculatához.'
    ],
    specs: [['Anyag', 'PETG'], ['Tartalom', '6 db, egyedi nevekkel'], ['Bővíthető', 'igen, darabonként'], ['Személyre szabás', 'forma, szín, nevek'], ['Gyártási idő', '5–10 munkanap']] },

  /* ── Dekorációk ── */
  { id: 'tulipan-vaza',        nev: 'Tulipán üvegcső-váza',          cat: 'dekoraciok',  ar: 119, regi_ar: 149, badge: 'Új',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0020.png', 'assets/termekvilag/hero_slider/layero-asset-0025.png'],
    leiras: 'Minimál fa-hatású keret üvegcsővel és nyomtatott tulipánnal — örök virág, ami sosem hervad el.',
    hosszu: [
      'A tulipán-váza kétféleképpen él: a nyomtatott, kézzel nem megkülönböztethető tulipánnal örök dísz, az üvegcsőbe azonban élő virágot is tehetsz, és akkor klasszikus egyszálas váza lesz belőle.',
      'Anyák napjára, nőnapra vagy köszönetajándéknak ideális — olyan virág, ami évek múlva is ugyanúgy áll az ablakpárkányon. A tulipán színe választható, a keret pedig natúr fa hatású vagy festett kivitelben készül.'
    ],
    specs: [['Anyag', 'PLA keret, valódi üvegcső'], ['Méret', 'kb. 8 × 22 cm'], ['Tulipán színe', 'piros / sárga / rózsaszín'], ['Élő virághoz', 'igen, az üvegcső kivehető'], ['Gyártási idő', '3–7 munkanap']] },
  { id: 'leveles-kaspo',       nev: 'Leveles kaspó',                 cat: 'dekoraciok',  ar: 99, visszakuldheto: true,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0025.png', 'assets/termekvilag/hero_slider/layero-asset-0020.png'],
    leiras: 'Botanikus formavilágú, rétegzett levelekből épülő kaspó réz-hatású belsővel — élő növénynek vagy szárazvirágnak.',
    hosszu: [
      'A kaspó falát egymásra boruló, erezetükben is kidolgozott levelek alkotják, a belső réz-hatású henger pedig meleg kontrasztot ad a mélyzöld külsőnek. Élő növénnyel és szárazvirág-kompozícióval egyaránt mutatós.',
      'A leveles külső több színben készül — mélyzöld, olíva, terrakotta —, a belső henger kivehető, így a locsolás sem probléma.'
    ],
    specs: [['Anyag', 'PLA, kivehető belső henger'], ['Méret', 'kb. 14 × 16 cm'], ['Színek', 'mélyzöld / olíva / terrakotta'], ['Vízálló belső', 'igen'], ['Gyártási idő', '3–7 munkanap']] },
  { id: 'szarvas-bortarto',    nev: 'Szarvas bortartó szobor',       cat: 'dekoraciok',  ar: 149,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0021.png', 'assets/termekvilag/hero_slider/layero-asset-0025.png'],
    leiras: 'Kőhatású, fekvő szarvas formájú palacktartó — elegáns ajándék borkedvelőknek, bárpultra és nappaliba.',
    hosszu: [
      'A fekvő szarvas agancsai közé fektetett palack olyan, mintha egy kastély borospincéjéből érkezett volna. A kőhatású, márványmintás felület nemes megjelenést ad, a súlyozott talp pedig stabilan tartja a legnehezebb palackot is.',
      'Névnapra, házavatóra, főnöknek vagy após-ajándéknak telitalálat — és a palack elfogyása után is marad belőle egy szobor.'
    ],
    specs: [['Anyag', 'PLA, kő hatású felület'], ['Méret', 'kb. 28 × 20 cm'], ['Terhelhetőség', 'standard 0,75 l palack'], ['Gravírozás', 'név / dátum kérhető a talpra'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'eletfa-mecses-szett', nev: 'Életfa mécses-szett (1–10)',    cat: 'dekoraciok',  ar: 179,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0014.png', 'assets/termekvilag/hero_slider/layero-asset-0020.png'],
    leiras: 'Tíz mécsestartó, amin egy fa nő évről évre — évfordulóra, születésnapokra, vagy adventi visszaszámláláshoz.',
    hosszu: [
      'Az életfa szett tíz mécsestartóból áll: az elsőn még csak egy hajtás, a tizediken terebélyes lombkorona — a fa évről évre nő, ahogy a kapcsolatotok, a gyerek vagy a vállalkozás is. Minden évfordulón eggyel több mécses kerül az asztalra.',
      'LED-es teamécsessel és hagyományos mécsessel is használható. A számok helyére évszámok vagy nevek is kérhetők, így emléktárgyból akár családi rituálé is lehet.'
    ],
    specs: [['Anyag', 'PLA, hőálló betéttel'], ['Tartalom', '10 db mécsestartó'], ['Mécses', 'LED és gyertya is'], ['Személyre szabás', 'számok / évszámok / nevek'], ['Gyártási idő', '5–10 munkanap']] },

  /* ── Céges megoldások ── */
  { id: 'qr-nfc-display',      nev: 'QR + NFC asztali display',      cat: 'ceges',       ar: 179, regi_ar: 219, badge: 'B2B kedvenc',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0022.png', 'assets/termekvilag/hero_slider/layero-asset-0027.png'],
    leiras: 'Étlap, Google-értékelés vagy weboldal egy érintésre: asztali display beépített NFC chippel és QR kóddal — a te logóddal.',
    hosszu: [
      'A vendég odaérinti a telefonját — és már nyílik is az étlap, a foglalási oldal vagy a Google-értékelő felület. A displaybe NFC chip kerül, a nyomtatott QR kód pedig a régebbi telefonokon is működik. Nincs matrica, nincs kopás: a kód és a felirat a tárgy részeként, domborítva készül.',
      'Referencia: a Bázis Bisztró asztalain két hét alatt megduplázta a beérkező Google-értékelések számát. Étterembe, kávézóba, szépségszalonba, rendelőbe — mindenhova, ahol az ügyfél vár valamire, és közben a kezében a telefon.',
      'Az ár egy darabra vonatkozik, teljes arculati testreszabással. Több asztalos szettekre mennyiségi kedvezményt adunk.'
    ],
    specs: [['Anyag', 'PLA/PETG, domborított grafika'], ['Méret', 'kb. 12 × 18 cm'], ['NFC', 'programozott chip, cserélhető cél-URL'], ['QR', 'domborított, kopásálló'], ['Testreszabás', 'logó, színek, felirat'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'ceges-ajandekcsomag', nev: 'Céges ajándékcsomag',           cat: 'ceges',       ar: 449,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0027.png', 'assets/termekvilag/hero_slider/layero-asset-0022.png'],
    leiras: 'Logózott ajándéktárgyak díszdobozban — partnereknek, munkatársaknak, rendezvényekre.',
    hosszu: [
      'Év végi partnerajándék, onboarding-csomag az új kollégáknak vagy rendezvényes VIP-doboz: a csomagot közösen állítjuk össze a büdzsé és az alkalom alapján. Kulcstartó, telefonállvány, pultdísz, világító logó — mind a ti arculatotokban.',
      'A feltüntetett ár egy közepes, 3 tételes díszdobozos csomag irányára. Pontos ajánlatot a darabszám és az összetétel alapján adunk, 24 órán belül.'
    ],
    specs: [['Tartalom', 'igény szerint, 2–5 tétel'], ['Csomagolás', 'logózott díszdoboz'], ['Minimum', '5 csomag'], ['Ajánlat', '24 órán belül'], ['Gyártási idő', '10–15 munkanap']] },

  /* ── Gyűjtői / rajongói ── */
  { id: 'bagoly-figura',       nev: 'Diplomás bagoly figura',        cat: 'rajongoi',    ar: 139, regi_ar: 179,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0023.png', 'assets/termekvilag/hero_slider/layero-asset-0010.png'],
    leiras: 'Ballagási emlék talapzattal, névvel, gratulációval és évszámmal — a tudás szimbóluma, ami a polcon marad.',
    hosszu: [
      'A virágcsokor elhervad, a bagoly marad: a diplomás bagoly talapzatán a saját üzeneted áll — „Gratulálunk Robi! Sok sikert! 2025" —, és még húsz év múlva is ott ül majd a könyvespolcon, a diploma mellett.',
      'A talapzat felirata teljesen szabad szöveg, a kalap bojtjának színe pedig a szak színéhez igazítható. Óvodai és iskolai ballagásra kicsinyített változat is kérhető.'
    ],
    specs: [['Anyag', 'PLA, többszínű nyomtatás'], ['Magasság', 'kb. 18 cm talapzattal'], ['Felirat', 'szabad szöveg, 3 sor'], ['Bojt színe', 'választható'], ['Gyártási idő', '5–10 munkanap']] },
  { id: 'camino-szobor',       nev: 'El Camino emlék-szobor',        cat: 'rajongoi',    ar: 189, badge: 'Egyedi',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0010.png', 'assets/termekvilag/hero_slider/layero-asset-0023.png'],
    leiras: 'Személyre szabott zarándok-figura névvel, megtett távval és évszámmal — egy nagy út méltó lezárása.',
    hosszu: [
      'Aki végigment a Caminón, az tudja: az út nem ér véget Santiagóban. A zarándok-szobor a mosolygó vándort örökíti meg — kagylóval a nyakában, bottal a kezében —, a talapzatra pedig a név, a megtett kilométer és az évszám kerül.',
      'Nemcsak Caminóra: maratonra, Szent Jakab-útra, El Caminóra, teljesítménytúrára vagy bármilyen nagy személyes mérföldkőre készítünk emlékművet. A figura pózálható és cserélhető elemekkel kérhető.'
    ],
    specs: [['Anyag', 'PLA, kő hatású felület'], ['Magasság', 'kb. 20 cm'], ['Felirat', 'név + táv + évszám'], ['Egyediesítés', 'póz, kellékek'], ['Gyártási idő', '7–12 munkanap']] },
  { id: 'fan-art-lampa',       nev: 'Fan-art világító logó',         cat: 'rajongoi',    ar: 209,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0012.png', 'assets/termekvilag/hero_slider/layero-asset-0013.png'],
    leiras: 'Kedvenc játékod vagy filmed címere világító kivitelben — gyűjtői darab, egyedi gyártásban.',
    hosszu: [
      'A gyűjtői polc koronája: a kedvenc franchise-od címere éldiódás háttérvilágítással, méretre gyártva. A többrétegű, többszínű előlap nappal is részletgazdag, bekapcsolva viszont megelevenedik.',
      'Bármilyen címerrel, logóval vagy emblémával kérhető — a képen látható Assassin’s Creed darab csak egy példa a sok közül. A kontúrt követő forma miatt minden darab egyedi tervezést kap.'
    ],
    specs: [['Anyag', 'PLA, többrétegű előlap'], ['Méret', 'kb. 25 × 25 cm-ig'], ['Világítás', 'LED-szalag, USB'], ['Téma', 'szabadon választható'], ['Gyártási idő', '7–12 munkanap']] },
  { id: 'sorozat-lampa',       nev: 'Sorozat kör-lámpa névvel',      cat: 'rajongoi',    ar: 219, badge: 'Új',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0013.png', 'assets/termekvilag/hero_slider/layero-asset-0012.png'],
    leiras: 'Kétvilágú, kétszínű LED-es kör-lámpa a kedvenc sorozatod hangulatával — és a te neveddel a fényben.',
    hosszu: [
      'Fent a normális világ meleg fehér fényben, lent a tükörvilág vészjósló vörösben — a kétzónás LED külön hangulatot ad a jelenet két felének, középen pedig a saját neved világít a címfelirat mellett.',
      'A koncepció bármilyen sorozatra, filmre vagy játékra adaptálható: a lényeg a kettéosztott, kétszínű világítás és a személyre szabott felirat.'
    ],
    specs: [['Anyag', 'PLA biopolimer'], ['Átmérő', 'kb. 22 cm'], ['Világítás', 'kétzónás LED (fehér + színes)'], ['Személyre szabás', 'név + téma'], ['Gyártási idő', '7–12 munkanap']] },
  { id: 'f1-palyaterkep',      nev: 'F1 pálya-falikép',              cat: 'rajongoi',    ar: 259, regi_ar: 319,
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0015.png', 'assets/termekvilag/hero_slider/layero-asset-0012.png'],
    leiras: 'A teljes szezon összes versenypályája egy keretben, domború nyomtatással — a Forma–1 rajongók falidísze.',
    hosszu: [
      'Mind a 24 pálya íve domborúan emelkedik ki a mélyfekete háttérből, alattuk a helyszín és a pálya neve — a keret pedig a szezon színeiben készül. Messziről grafika, közelről dombormű: a vendégek garantáltan odamennek megnézni.',
      'Bármelyik szezonra legyártjuk, és kérhető kiemeléssel is: a kedvenc pályád vagy a hazai futam színes akcenttel különül el a többitől. MotoGP-s és rally-változat is rendelhető.'
    ],
    specs: [['Anyag', 'PLA, domború pályaívek'], ['Méret', 'kb. 40 × 34 cm'], ['Keret', 'nyomtatott, színe választható'], ['Változatok', 'F1 / MotoGP / rally'], ['Gyártási idő', '7–12 munkanap']] },

  /* ── Egyedi rendelés ── */
  { id: 'egyedi-otlet',        nev: 'Egyedi elképzelés megvalósítása', cat: 'egyedi',    ar: 0, badge: 'Ajánlatkérés',
    kepek: ['assets/termekvilag/hero_slider/layero-asset-0010.png', 'assets/termekvilag/hero_slider/layero-asset-0018.png'],
    leiras: 'Van egy ötleted, ami még nem létezik? Írd le, küldj referenciát, és mi megtervezzük, legyártjuk.',
    hosszu: [
      'A katalógusunk csak a kezdet — a legjobb darabjaink mind egyedi megkeresésből születtek. Működik így: leírod az ötletet (képpel, vázlattal, referenciával, ahogy kényelmes), mi pedig 24–48 órán belül visszajelzünk, hogy mennyiért és mennyi idő alatt tudjuk megvalósítani.',
      'A digitális tervet minden esetben jóváhagyásra megmutatjuk, és csak azután indul a gyártás. Módosítási kör az árban van — addig igazítjuk, amíg pontosan az nem lesz, amit elképzeltél.',
      'Az ár a méret, a komplexitás és az anyag függvénye: egy egyszerűbb egyedi darab jellemzően 100–300 lej, összetettebb projektek egyedi kalkulációval készülnek.'
    ],
    specs: [['Ajánlat', '24–48 órán belül'], ['Terv', 'digitális előnézet jóváhagyásra'], ['Módosítás', 'az árban, a jóváhagyásig'], ['Jellemző ár', '100–300 lej + komplexitás'], ['Gyártási idő', 'terv szerint, jellemzően 7–15 munkanap']] }
];

(function () {
  var cfg = window.LayeroShopStatic || {};
  var base = cfg.assetBase || '';
  function asset(path) {
    if (!path || /^(https?:|data:|\/)/.test(path)) return path;
    if (path.indexOf('assets/') === 0 && base) return base + path.slice(7);
    return path;
  }
  if (Array.isArray(window.SHOP_CATS)) {
    window.SHOP_CATS.forEach(function (cat) { cat.img = asset(cat.img); });
  }
  if (Array.isArray(window.SHOP_PRODUCTS)) {
    window.SHOP_PRODUCTS.forEach(function (product) {
      product.kepek = (product.kepek || []).map(asset);
    });
  }
})();

var SHOP_VARIANSOK = {
  meret: ['Kicsi', 'Közepes', 'Nagy'],
  szin:  ['Natúr', 'Fekete', 'Fehér']
};
