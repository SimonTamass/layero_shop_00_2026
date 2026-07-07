<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Shop_Content {
	public static function asset_url($path) {
		return LAYERO_SHOP_UI_URL . 'assets/demo/' . ltrim($path, '/');
	}

	public static function hero_slides() {
		return array(
			array(
				'eyebrow' => 'Layero Shop',
				'title' => 'Ajándék, ami rólad szól.',
				'text' => 'Világító lámpák, kulcstartók és dekorációk - névvel, logóval, egyedi 3D gyártásban.',
				'image' => array('url' => self::asset_url('termekvilag/hero_slider/layero-asset-0009.png')),
				'button_text' => 'Vásárlás most',
				'button_url' => array('url' => '/shop/'),
				'secondary_text' => 'Kategóriák',
				'secondary_url' => array('url' => '#kategoriak'),
			),
			array(
				'eyebrow' => 'Tematikus lámpák',
				'title' => 'Névre szóló fény.',
				'text' => 'Kedvenc film, játék, sport vagy hobbi - LED-világítással, saját névvel.',
				'image' => array('url' => self::asset_url('termekvilag/hero_slider/layero-asset-0013.png')),
				'button_text' => 'Lámpák megnézése',
				'button_url' => array('url' => '/product-category/lampak/'),
				'secondary_text' => '',
				'secondary_url' => array('url' => ''),
			),
			array(
				'eyebrow' => 'Egyedi rendelés',
				'title' => 'Van egy ötleted? Legyártjuk.',
				'text' => 'Küldj egy leírást vagy referenciaképet - megtervezzük és kinyomtatjuk.',
				'image' => array('url' => self::asset_url('termekvilag/hero_slider/layero-asset-0010.png')),
				'button_text' => 'Ajánlatot kérek',
				'button_url' => array('url' => '/product/egyedi-otlet/'),
				'secondary_text' => '',
				'secondary_url' => array('url' => ''),
			),
		);
	}

	public static function trust_items() {
		return array(
			array('icon' => 'truck', 'title' => 'Ingyenes szállítás', 'text' => '200 lej feletti rendelésre'),
			array('icon' => 'tag', 'title' => 'Már 50 lejtől', 'text' => 'alacsony minimális rendelés'),
			array('icon' => 'bolt', 'title' => 'Gyors gyártás', 'text' => '5-10 munkanap alatt'),
			array('icon' => 'leaf', 'title' => 'Környezetbarát', 'text' => 'PLA + napelemes gyártás'),
		);
	}

	public static function categories() {
		return array(
			array('id' => 'lampak', 'name' => 'Tematikus lámpák', 'description' => 'Névre szóló, világító ajándékok', 'image' => 'images/categories/layero-asset-0227-1100.webp', 'count' => 6),
			array('id' => 'kulcstartok', 'name' => 'Kulcstartók', 'description' => 'Apró, mégis személyes darabok', 'image' => 'images/categories/layero-asset-0226-1100.webp', 'count' => 2),
			array('id' => 'dekoraciok', 'name' => 'Dekorációk', 'description' => 'Vázák, kaspók, lakásdíszek', 'image' => 'images/categories/layero-asset-0223-1100.webp', 'count' => 4),
			array('id' => 'ceges', 'name' => 'Céges megoldások', 'description' => 'Logós ajándék, QR + NFC display', 'image' => 'images/categories/layero-asset-0222-1100.webp', 'count' => 2),
			array('id' => 'rajongoi', 'name' => 'Gyűjtői / rajongói', 'description' => 'Film, játék, sport, hobbi', 'image' => 'images/categories/layero-asset-0225-1100.webp', 'count' => 5),
			array('id' => 'egyedi', 'name' => 'Egyedi rendelés', 'description' => 'A te ötleted, mi megvalósítjuk', 'image' => 'images/categories/layero-asset-0224-1100.webp', 'count' => 1),
		);
	}

	public static function category_by_slug($slug) {
		foreach (self::categories() as $category) {
			if ($category['id'] === $slug) {
				return $category;
			}
		}

		return null;
	}

	public static function popular_product_ids() {
		return array('szam-lampa-nevvel', 'logos-kulcstarto', 'qr-nfc-display', 'tulipan-vaza', 'jurassic-lampa', 'bagoly-figura', 'holdfeny-lampa', 'camino-szobor');
	}

	public static function products() {
		return array(
			array('id' => 'szam-lampa-nevvel', 'name' => 'Névre szóló szám-lámpa', 'category' => 'lampak', 'price' => 189, 'regular_price' => 239, 'badge' => 'Bestseller', 'image' => 'termekvilag/hero_slider/layero-asset-0009.png', 'description' => 'Kedvenc játékos, mezszám és név egyben - LED háttérfénnyel világító, egyedi gyártású asztali lámpa.'),
			array('id' => 'programozo-lampa', 'name' => 'Programozó kör-lámpa', 'category' => 'lampak', 'price' => 219, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0018.png', 'description' => 'Egyedi névvel és üzenettel gravírozott, áramkör-mintás világító dekoráció a jövő informatikusának.'),
			array('id' => 'jurassic-lampa', 'name' => 'Dínós henger-lámpa névvel', 'category' => 'lampak', 'price' => 199, 'regular_price' => 249, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0011.png', 'description' => 'Kőmintás felületű, névre szóló henger-lámpa dinós motívummal - a gyerekszoba kedvence.'),
			array('id' => 'hullam-gomblampa', 'name' => 'Hullám asztali lámpa', 'category' => 'lampak', 'price' => 249, 'regular_price' => 299, 'badge' => 'Új', 'image' => 'termekvilag/hero_slider/layero-asset-0016.png', 'description' => 'Organikus, csavart bordázatú lámpabúra fa lábakon, meleg fényű LED-del - skandináv hangulat bármelyik szobába.'),
			array('id' => 'karacsonyi-lampa', 'name' => 'Karácsonyi kedvenc-lámpa', 'category' => 'lampak', 'price' => 229, 'regular_price' => 0, 'badge' => 'Szezonális', 'image' => 'termekvilag/hero_slider/layero-asset-0017.png', 'description' => 'Világító ünnepi jelenet a te kutyusaiddal - fotó alapján készül, hogy a család minden tagja ott legyen a fa alatt.'),
			array('id' => 'holdfeny-lampa', 'name' => 'Holdfény erdei lámpa', 'category' => 'lampak', 'price' => 159, 'regular_price' => 199, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0019.png', 'description' => 'Szarvasos, hegyvidéki sziluett kör-lámpa rejtett világítással - nappal dísz, este hangulatfény.'),
			array('id' => 'logos-kulcstarto', 'name' => 'Logós kulcstartó', 'category' => 'kulcstartok', 'price' => 39, 'regular_price' => 0, 'badge' => 'Bestseller', 'image' => 'termekvilag/hero_slider/layero-asset-0027.png', 'description' => 'Egyedi logóval, kétszínű nyomtatással készült, strapabíró kulcstartó - darabonként vagy céges csomagban.'),
			array('id' => 'csapat-kulcstarto', 'name' => 'Csapat-kulcstartó szett', 'category' => 'kulcstartok', 'price' => 149, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0027.png', 'description' => '6 darabos szett kluboknak, baráti társaságoknak - egységes design, egyedi nevekkel minden darabon.'),
			array('id' => 'tulipan-vaza', 'name' => 'Tulipán üvegcső-váza', 'category' => 'dekoraciok', 'price' => 119, 'regular_price' => 149, 'badge' => 'Új', 'image' => 'termekvilag/hero_slider/layero-asset-0020.png', 'description' => 'Minimál fa-hatású keret üvegcsővel és nyomtatott tulipánnal - örök virág, ami sosem hervad el.'),
			array('id' => 'leveles-kaspo', 'name' => 'Leveles kaspó', 'category' => 'dekoraciok', 'price' => 99, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0025.png', 'description' => 'Botanikus formavilágú, rétegzett levelekből épülő kaspó réz-hatású belsővel - élő növénynek vagy szárazvirágnak.'),
			array('id' => 'szarvas-bortarto', 'name' => 'Szarvas bortartó szobor', 'category' => 'dekoraciok', 'price' => 149, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0021.png', 'description' => 'Kőhatású, fekvő szarvas formájú palacktartó - elegáns ajándék borkedvelőknek, bárpultra és nappaliba.'),
			array('id' => 'eletfa-mecses-szett', 'name' => 'Életfa mécses-szett (1-10)', 'category' => 'dekoraciok', 'price' => 179, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0014.png', 'description' => 'Tíz mécsestartó, amin egy fa nő évről évre - évfordulóra, születésnapokra vagy adventi visszaszámláláshoz.'),
			array('id' => 'qr-nfc-display', 'name' => 'QR + NFC asztali display', 'category' => 'ceges', 'price' => 179, 'regular_price' => 219, 'badge' => 'B2B kedvenc', 'image' => 'termekvilag/hero_slider/layero-asset-0022.png', 'description' => 'Étlap, Google-értékelés vagy weboldal egy érintésre: asztali display beépített NFC chippel és QR kóddal - a te logóddal.'),
			array('id' => 'ceges-ajandekcsomag', 'name' => 'Céges ajándékcsomag', 'category' => 'ceges', 'price' => 449, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0027.png', 'description' => 'Logózott ajándéktárgyak díszdobozban - partnereknek, munkatársaknak, rendezvényekre.'),
			array('id' => 'bagoly-figura', 'name' => 'Diplomás bagoly figura', 'category' => 'rajongoi', 'price' => 139, 'regular_price' => 179, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0023.png', 'description' => 'Ballagási emlék talapzattal, névvel, gratulációval és évszámmal - a tudás szimbóluma, ami a polcon marad.'),
			array('id' => 'camino-szobor', 'name' => 'El Camino emlék-szobor', 'category' => 'rajongoi', 'price' => 189, 'regular_price' => 0, 'badge' => 'Egyedi', 'image' => 'termekvilag/hero_slider/layero-asset-0010.png', 'description' => 'Személyre szabott zarándok-figura névvel, megtett távval és évszámmal - egy nagy út méltó lezárása.'),
			array('id' => 'fan-art-lampa', 'name' => 'Fan-art világító logó', 'category' => 'rajongoi', 'price' => 209, 'regular_price' => 0, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0012.png', 'description' => 'Kedvenc játékod vagy filmed címere világító kivitelben - gyűjtői darab, egyedi gyártásban.'),
			array('id' => 'sorozat-lampa', 'name' => 'Sorozat kör-lámpa névvel', 'category' => 'rajongoi', 'price' => 219, 'regular_price' => 0, 'badge' => 'Új', 'image' => 'termekvilag/hero_slider/layero-asset-0013.png', 'description' => 'Kétvilágú, kétszínű LED-es kör-lámpa a kedvenc sorozatod hangulatával - és a te neveddel a fényben.'),
			array('id' => 'f1-palyaterkep', 'name' => 'F1 pálya-falikép', 'category' => 'rajongoi', 'price' => 259, 'regular_price' => 319, 'badge' => '', 'image' => 'termekvilag/hero_slider/layero-asset-0015.png', 'description' => 'A teljes szezon összes versenypályája egy keretben, domború nyomtatással - a Forma-1 rajongók falidísze.'),
			array('id' => 'egyedi-otlet', 'name' => 'Egyedi elképzelés megvalósítása', 'category' => 'egyedi', 'price' => 0, 'regular_price' => 0, 'badge' => 'Ajánlatkérés', 'image' => 'termekvilag/hero_slider/layero-asset-0010.png', 'description' => 'Van egy ötleted, ami még nem létezik? Írd le, küldj referenciát, és mi megtervezzük, legyártjuk.'),
		);
	}

	public static function demo_products($limit = 8, $category = '') {
		$products = self::products();

		if ($category) {
			$products = array_values(array_filter($products, function ($product) use ($category) {
				return $product['category'] === $category;
			}));
		}

		$popular_ids = self::popular_product_ids();
		usort($products, function ($a, $b) use ($popular_ids) {
			$ai = array_search($a['id'], $popular_ids, true);
			$bi = array_search($b['id'], $popular_ids, true);
			$ai = false === $ai ? 999 : $ai;
			$bi = false === $bi ? 999 : $bi;
			return $ai <=> $bi;
		});

		return array_slice($products, 0, max(1, absint($limit)));
	}

	public static function spotlight_product() {
		foreach (self::products() as $product) {
			if ('karacsonyi-lampa' === $product['id']) {
				return $product;
			}
		}

		return self::products()[0];
	}
}
