<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Page_Builder {

	private static $id_counter = 0;

	public static function init() {
		add_action('admin_action_layero_build_pages', array(__CLASS__, 'handle_build'));
		add_action('admin_notices', array(__CLASS__, 'admin_notice'));
		add_action('admin_menu', array(__CLASS__, 'admin_menu'));
	}

	public static function admin_menu() {
		add_submenu_page(
			null,
			'Layero oldalak építése',
			'Layero Build',
			'manage_options',
			'layero-build-pages',
			array(__CLASS__, 'admin_page')
		);
	}

	public static function admin_page() {
		$pages = self::page_definitions();
		?>
		<div class="wrap">
			<h1>Layero Shop — Oldalak építése</h1>
			<p>Ez a művelet felépíti az összes Layero Shop oldalt az Elementor szerkesztőben, a Layero widgetekkel.</p>
			<p><strong>Figyelem:</strong> a meglévő Elementor-tartalom felülíródik!</p>
			<table class="widefat striped" style="max-width:600px;margin:16px 0;">
				<thead><tr><th>Oldal</th><th>Állapot</th></tr></thead>
				<tbody>
				<?php foreach ($pages as $cfg) :
					$post = self::find_page($cfg['title']);
				?>
					<tr>
						<td><?php echo esc_html($cfg['title']); ?></td>
						<td><?php echo $post ? 'Megtalálva (ID: ' . $post->ID . ')' : '<span style="color:red;">Nem található</span>'; ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
			<form method="post" action="<?php echo esc_url(admin_url('admin.php')); ?>">
				<input type="hidden" name="action" value="layero_build_pages">
				<?php wp_nonce_field('layero_build_pages'); ?>
				<p><button type="submit" class="button button-primary button-hero">Oldalak felépítése most</button></p>
			</form>
		</div>
		<?php
	}

	public static function handle_build() {
		if (! current_user_can('manage_options')) {
			wp_die('Nincs jogosultságod.');
		}
		check_admin_referer('layero_build_pages');

		$results = self::build_all();

		set_transient('layero_build_results', $results, 120);
		wp_safe_redirect(admin_url('edit.php?post_type=page&layero_built=1'));
		exit;
	}

	public static function admin_notice() {
		if (empty($_GET['layero_built'])) {
			return;
		}
		$results = get_transient('layero_build_results');
		if (! $results) {
			return;
		}
		delete_transient('layero_build_results');

		echo '<div class="notice notice-success is-dismissible"><p><strong>Layero oldalak felépítve:</strong></p><ul>';
		foreach ($results as $title => $status) {
			echo '<li>' . esc_html($title) . ': ' . esc_html($status) . '</li>';
		}
		echo '</ul></div>';
	}

	public static function build_all() {
		$results = array();

		foreach (self::page_definitions() as $cfg) {
			$post = self::find_page($cfg['title']);
			if (! $post) {
				$results[$cfg['title']] = 'Nem található';
				continue;
			}

			$data = call_user_func(array(__CLASS__, $cfg['method']));
			self::set_elementor_data($post->ID, $data);
			update_post_meta($post->ID, '_wp_page_template', 'elementor_canvas');

			if ('publish' !== $post->post_status) {
				wp_update_post(array('ID' => $post->ID, 'post_status' => 'publish'));
			}

			$results[$cfg['title']] = 'OK (ID: ' . $post->ID . ')';
		}

		if (class_exists('\Elementor\Plugin')) {
			\Elementor\Plugin::$instance->files_manager->clear_cache();
		}

		return $results;
	}

	/* ──────────────────────────────────────────────────────────────
	   Page definitions
	   ────────────────────────────────────────────────────────────── */

	private static function page_definitions() {
		return array(
			array('title' => 'Layero Kezdőlap', 'method' => 'home_data'),
			array('title' => 'Rólunk', 'method' => 'about_data'),
			array('title' => 'Gyakori kérdések', 'method' => 'faq_data'),
			array('title' => 'Kapcsolat', 'method' => 'contact_data'),
			array('title' => 'Ajándékkereső', 'method' => 'quiz_data'),
			array('title' => 'Kedvencek', 'method' => 'favorites_data'),
			array('title' => '404', 'method' => 'error_404_data'),
			array('title' => 'Egyedi rendelés', 'method' => 'custom_order_data'),
			array('title' => 'Kosár', 'method' => 'cart_data'),
			array('title' => 'Pénztár', 'method' => 'checkout_data'),
			array('title' => 'Fiókom', 'method' => 'account_data'),
		);
	}

	/* ──────────────────────────────────────────────────────────────
	   HOME — all 17 Layero widgets
	   ────────────────────────────────────────────────────────────── */

	private static function home_data() {
		$widgets = array(
			'layero_hero_slider',
			'layero_trust_bar',
			'layero_value_marquee',
			'layero_category_bento',
			'layero_process_steps',
			'layero_lab_preview',
			'layero_product_grid',
			'layero_quiz_cta',
			'layero_product_spotlight',
			'layero_product_carousel',
			'layero_why_layero',
			'layero_testimonials',
			'layero_gallery_strip',
			'layero_custom_cta',
			'layero_why_shop',
			'layero_newsletter_banner',
			'layero_footnotes',
		);

		$sections = array();
		foreach ($widgets as $type) {
			$sections[] = self::wrap_in_section(array(self::make_widget($type)));
		}

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   RÓLUNK (About)
	   ────────────────────────────────────────────────────────────── */

	private static function about_data() {
		$asset = self::asset_url();
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<nav class="sh-crumbs" aria-label="Morzsamenü"><a href="/">Shop</a><span aria-hidden="true">/</span><span>Rólunk</span></nav>' .
			'<h1>Rólad szól, rétegről rétegre.</h1>' .
			'<p>A Layero egy szatmárnémeti 3D nyomtató műhely. Olyan ajándékokat és dekorációkat készítünk, amelyek egy konkrét emberről, pillanatról vagy történetről szólnak — nem tömegtermék, hanem személyes darab.</p>' .
			'</div></section>'
		);

		$sections[] = self::html_section(
			'<section class="sh-band sh-band--tight"><div class="shop-wrap sh-about">' .
			'<div class="sh-about__text">' .
			'<h2 class="sh-h2">Hogyan kezdődött?</h2>' .
			'<p>Egyetlen névre szóló lámpával kezdődött, amit ajándékba készítettünk. Annyi kérdés jött rá, hogy hamar kiderült: az embereknek nem még egy tárgy kell, hanem valami, ami tényleg róluk vagy a szeretteikről szól.</p>' .
			'<p>Azóta több száz egyedi darabot terveztünk és gyártottunk — szám-lámpáktól ballagási emlékeken át céges QR-displayekig. A legjobb ötleteink többsége nem a katalógusból, hanem egy-egy vásárló fejéből származik.</p>' .
			'<p>Minden darabot rendelésre készítünk, így nincs raktári túltermelés és felesleges hulladék. A műhelyünk áramát napelemek adják, az alapanyagunk pedig PLA biopolimer — növényi alapú, lebomló anyag.</p>' .
			'</div>' .
			'<figure class="sh-about__img"><img src="' . $asset . 'termekvilag/hero_slider/layero-asset-0009.png" alt="Világító, névre szóló Layero lámpa"></figure>' .
			'</div></section>'
		);

		$sections[] = self::html_section(
			'<section class="sh-band sh-band--tight sh-band--gray"><div class="shop-wrap">' .
			'<div class="sh-stats">' .
			'<div class="sh-stat"><b>500+</b><span>egyedi legyártott darab</span></div>' .
			'<div class="sh-stat"><b>1000+</b><span>elégedett vásárló</span></div>' .
			'<div class="sh-stat"><b>4.9</b><span>átlagos értékelés</span></div>' .
			'<div class="sh-stat"><b>~0</b><span>CO₂ a gyártásban¹</span></div>' .
			'</div></div></section>'
		);

		$sections[] = self::html_section(
			'<section class="sh-band sh-band--tight"><div class="shop-wrap">' .
			'<div class="sh-section-hd"><h2 class="sh-h2">Amiben hiszünk.</h2></div>' .
			'<div class="sh-values">' .
			'<article class="sh-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 7v6c0 5 3.8 8 9 9 5.2-1 9-4 9-9V7l-9-5Z"/><path d="m9 12 2 2 4-4"/></svg><h3>Személyes, nem tömeggyártott</h3><p>Minden darab egy konkrét emberről vagy pillanatról szól. Ami neked számít, azt tesszük a középpontba.</p></article>' .
			'<article class="sh-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg><h3>Fenntartható gyártás</h3><p>Napelemes energia, növényi alapú PLA, rendelésre gyártás — kevesebb hulladék, közel nulla kibocsátás.</p></article>' .
			'<article class="sh-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg><h3>Emberi ügyfélszolgálat</h3><p>Nálunk nem chatbot vár. Végigkísérünk az ötlettől a kész darabig, és minden reklamációt emberi módon kezelünk.</p></article>' .
			'<article class="sh-value"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><h3>Korrekt határidők</h3><p>Reális gyártási időt mondunk, és tartjuk. Ha csúszna valami, időben szólunk — meglepetés nélkül.</p></article>' .
			'</div></div></section>'
		);

		$sections[] = self::html_section(
			'<section class="sh-band sh-band--tight sh-band--gray"><div class="shop-wrap">' .
			'<div class="sh-section-hd"><h2 class="sh-h2">Így dolgozunk.</h2></div>' .
			'<ol class="sh-steps">' .
			'<li><span>1</span><div><b>Ötlet</b>Kiválasztasz egy terméket vagy leírod a saját ötleted — képpel, vázlattal, ahogy kényelmes.</div></li>' .
			'<li><span>2</span><div><b>Terv</b>Digitális előnézetet készítünk, amit jóváhagyásra megmutatunk. Módosítás az árban.</div></li>' .
			'<li><span>3</span><div><b>Gyártás</b>A jóváhagyott terv alapján kinyomtatjuk és összeszereljük a darabot a műhelyünkben.</div></li>' .
			'<li><span>4</span><div><b>Kézbesítés</b>Gondosan becsomagolva, nyomon követhető csomagként küldjük — 1–3 munkanap a gyártás után.</div></li>' .
			'</ol></div></section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_custom_cta', array(
			'title' => 'Van egy ötleted? Legyártjuk neked.',
			'text' => 'Küldj egy leírást vagy referenciaképet — megtervezzük és kinyomtatjuk, ajánlatkéréstől a kész darabig.',
			'button_text' => 'Egyedi rendelést indítok',
			'button_url' => array('url' => '/egyedi-rendeles/'),
			'image' => array('url' => $asset . 'termekvilag/hero_slider/layero-asset-0010.png'),
		))));

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_footnotes', array(
			'items' => array(
				array('text' => 'A műhelyünk áramát napelemek adják, a PLA pedig növényi alapú, lebomló anyag — így a gyártás CO₂-kibocsátása közel nulla.'),
			),
		))));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   GYIK (FAQ)
	   ────────────────────────────────────────────────────────────── */

	private static function faq_data() {
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<nav class="sh-crumbs" aria-label="Morzsamenü"><a href="/">Shop</a><span aria-hidden="true">/</span><span>Gyakori kérdések</span></nav>' .
			'<h1>Gyakori kérdések</h1>' .
			'<p>Összeszedtük a leggyakoribb kérdéseket a rendelésről, a személyre szabásról, a szállításról és a garanciáról. Ha nem találod a választ, <a href="/kapcsolat/">írj nekünk</a> — 24 órán belül válaszolunk.</p>' .
			'</div></section>'
		);

		$sections[] = self::html_section(
			'<nav class="sh-faq-nav shop-wrap" aria-label="GYIK témák">' .
			'<a href="#rendeles">Rendelés &amp; személyre szabás</a>' .
			'<a href="#szallitas">Szállítás &amp; fizetés</a>' .
			'<a href="#visszakuldes">Visszaküldés &amp; garancia</a>' .
			'<a href="#termek">Termék &amp; anyag</a>' .
			'<a href="#ceges">Céges &amp; egyedi</a>' .
			'</nav>'
		);

		$faq_html = '<section class="sh-band sh-band--tight"><div class="shop-wrap sh-faq">';

		$faq_html .= '<div class="sh-faq__group" id="rendeles"><h2 class="sh-h2">Rendelés és személyre szabás</h2><div class="sh-acc">';
		$faq_html .= '<details open><summary>Hogyan tudok személyre szabott terméket rendelni?</summary><div><p>Válaszd ki a terméket, add meg a személyre szabás részleteit (név, felirat, motívum), és tedd a kosárba. A rendelés után e-mailben egyeztetjük a pontos szövegeket és részleteket. Komplexebb daraboknál digitális előnézetet küldünk jóváhagyásra, és csak azután indítjuk a gyártást.</p></div></details>';
		$faq_html .= '<details><summary>Kérhetek digitális előnézetet gyártás előtt?</summary><div><p>Igen. Minden egyedi vagy összetettebb személyre szabásnál digitális előnézetet küldünk, amit jóvá kell hagynod a gyártás megkezdése előtt. A módosítási kör az árban van — addig igazítjuk, amíg pontosan az nem lesz, amit elképzeltél.</p></div></details>';
		$faq_html .= '<details><summary>Módosíthatom vagy lemondhatom a rendelésem?</summary><div><p>Amíg a gyártás nem indult el (jellemzően az előnézet jóváhagyásáig), a rendelés díjmentesen módosítható vagy lemondható. Írj a <a href="mailto:layeroprint@gmail.com">layeroprint@gmail.com</a> címre a rendelésszámoddal.</p></div></details>';
		$faq_html .= '<details><summary>Meddig kell megadnom a személyre szabás adatait?</summary><div><p>A rendelés után kapott visszaigazoló e-mailre válaszolva bármikor elküldheted. Minél előbb megkapjuk, annál hamarabb indul a gyártás — a feltüntetett gyártási idő az adatok véglegesítésétől számít.</p></div></details>';
		$faq_html .= '</div></div>';

		$faq_html .= '<div class="sh-faq__group" id="szallitas"><h2 class="sh-h2">Szállítás és fizetés</h2><div class="sh-acc">';
		$faq_html .= '<details><summary>Mennyibe kerül és meddig tart a szállítás?</summary><div><p>A szállítási díj Románia területén 25 lej, <b>200 lej feletti rendelésnél ingyenes</b>. A gyártási idő terméktől függően 3–15 munkanap; ehhez jön a futár 1–3 munkanapja. A pontos várható dátumot a terméknél és a visszaigazoló e-mailben is jelezzük.</p></div></details>';
		$faq_html .= '<details><summary>Milyen szállítási módok közül választhatok?</summary><div><p>Futárszolgálat házhoz, csomagpont (Easybox / posta) átvétel, valamint személyes átvétel a szatmárnémeti műhelyünkben. A választható lehetőségeket a pénztárnál látod.</p></div></details>';
		$faq_html .= '<details><summary>Hogyan tudok fizetni?</summary><div><p>Bankkártyával (VISA, Mastercard), Apple Pay-jel, Google Pay-jel, utánvéttel (fizetés átvételkor, +5 lej), vagy banki átutalással. Céges vásárlóknak proforma díjbekérőt is tudunk küldeni.</p></div></details>';
		$faq_html .= '<details><summary>Külföldre is szállítotok?</summary><div><p>Alapból Románia területére szállítunk. Nemzetközi kiszállításról egyedi egyeztetés alapján tudunk ajánlatot adni — írj nekünk a szállítási címmel, és visszajelzünk a díjról és a határidőről.</p></div></details>';
		$faq_html .= '<details><summary>Kapok számlát a rendelésről?</summary><div><p>Igen, minden rendeléshez elektronikus számlát küldünk a visszaigazoló e-mailben. Céges számlához add meg a cégadatokat és az adószámot a rendeléskor.</p></div></details>';
		$faq_html .= '</div></div>';

		$faq_html .= '<div class="sh-faq__group" id="visszakuldes"><h2 class="sh-h2">Visszaküldés, garancia és elállás</h2><div class="sh-acc">';
		$faq_html .= '<details><summary>Visszaküldhetem a terméket, ha meggondolom magam?</summary><div><p>A nem egyedi, raktári termékekre a törvényi <b>14 napos elállási jog</b> vonatkozik. Mivel a személyre szabott, egyedileg gyártott darabok kifejezetten a te kérésedre készülnek, ezekre a jogszabály szerint az elállási jog nem terjed ki — de gyártási vagy nyomtatási hiba esetén természetesen cserét vagy visszatérítést adunk.</p></div></details>';
		$faq_html .= '<details><summary>Mi a teendő, ha sérülten vagy hibásan érkezik a termék?</summary><div><p>Küldj egy fotót a sérülésről vagy hibáról a <a href="mailto:layeroprint@gmail.com">layeroprint@gmail.com</a> címre a rendelésszámoddal. Gyártási vagy szállítási hibára cserét vagy teljes visszatérítést adunk, a szállítási költséget mi álljuk.</p></div></details>';
		$faq_html .= '<details><summary>Van garancia a termékekre?</summary><div><p>Igen. Minden termékünkre a törvény által előírt <b>2 éves megfelelőségi jótállás (garanție legală de conformitate)</b> vonatkozik, ami a gyártási, anyag- és nyomtatási hibákra terjed ki. A világító daraboknál az elektronikára (LED, kapcsoló) is érvényes.</p><p>Panasz esetén az <a href="https://anpc.ro" target="_blank" rel="noopener">ANPC</a>-hez (Országos Fogyasztóvédelmi Hatóság) vagy az <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">EU online vitarendezési (SOL) platformjához</a> is fordulhatsz.</p></div></details>';
		$faq_html .= '<details><summary>Hogyan zajlik a visszatérítés?</summary><div><p>Jóváhagyott visszaküldés vagy reklamáció után a visszatérítést az eredeti fizetési módra indítjuk, jellemzően 14 napon belül. Csere esetén az új darab gyártását azonnal ütemezzük.</p></div></details>';
		$faq_html .= '</div></div>';

		$faq_html .= '<div class="sh-faq__group" id="termek"><h2 class="sh-h2">Termék, anyag és használat</h2><div class="sh-acc">';
		$faq_html .= '<details><summary>Milyen anyagból készülnek a termékek?</summary><div><p>Elsősorban PLA biopolimerből nyomtatunk, ami növényi (kukoricakeményítő) alapú, szagtalan, ipari komposztálásban lebomló anyag. A strapabíróbb daraboknál (pl. kulcstartók) PETG-t használunk. A műhelyünk áramát napelemek adják.</p></div></details>';
		$faq_html .= '<details><summary>Biztonságosak a világító lámpák, gyerekszobába is jók?</summary><div><p>Igen. A LED-világítás alacsony hőmérsékletű és USB-ről működik, így nem melegszik fel veszélyesen. A meleg, szűrt fény éjszakai fénynek is ideális a gyerekszobában.</p></div></details>';
		$faq_html .= '<details><summary>Hogyan tisztítsam és ápoljam a terméket?</summary><div><p>Száraz vagy enyhén nedves ruhával törölhető. Kerüld a közvetlen, tartós hőt (pl. radiátor, tűző nap az autóban) és az agresszív tisztítószereket, mivel a PLA hőérzékeny. Így évekig szép marad.</p></div></details>';
		$faq_html .= '<details><summary>Pontosan akkora lesz, amekkorát a fotón látok?</summary><div><p>A termékeknél megadott méretek tájékoztató jellegűek, és a személyre szabástól függően kis mértékben eltérhetnek. Bizonytalanság esetén nézd meg a <b>mérettáblázatot</b> a termékoldalon, vagy kérj egyedi méretet.</p></div></details>';
		$faq_html .= '</div></div>';

		$faq_html .= '<div class="sh-faq__group" id="ceges"><h2 class="sh-h2">Céges és egyedi rendelés</h2><div class="sh-acc">';
		$faq_html .= '<details><summary>Van egy ötletem, ami nincs a katalógusban — meg tudjátok csinálni?</summary><div><p>Nagy eséllyel igen — a legjobb darabjaink mind egyedi megkeresésből születtek. Írd le az ötletet (képpel, vázlattal, referenciával), és 24–48 órán belül visszajelzünk, hogy mennyiért és mennyi idő alatt tudjuk megvalósítani. <a href="/egyedi-rendeles/">Indíts egyedi rendelést ›</a></p></div></details>';
		$faq_html .= '<details><summary>Vállaltok nagyobb, céges mennyiséget?</summary><div><p>Igen, logózott ajándéktárgyakat, QR/NFC displayeket és rendezvényes csomagokat is gyártunk, mennyiségi kedvezménnyel. Nézd meg a <a href="/termekek/?cat=ceges">céges megoldásokat</a>, vagy kérj ajánlatot a darabszámmal.</p></div></details>';
		$faq_html .= '<details><summary>Mennyi egy egyedi darab ára?</summary><div><p>A méret, a komplexitás és az anyag függvénye: egy egyszerűbb egyedi darab jellemzően 100–300 lej, összetettebb projektek egyedi kalkulációval készülnek. Pontos árat az ötlet ismeretében, 24–48 órán belül adunk.</p></div></details>';
		$faq_html .= '</div></div>';

		$faq_html .= '</div></section>';

		$sections[] = self::html_section($faq_html);

		$asset = self::asset_url();
		$sections[] = self::wrap_in_section(array(self::make_widget('layero_custom_cta', array(
			'title' => 'Nem találtad a választ?',
			'text' => 'Írj nekünk, és segítünk — akár termékválasztásban, akár egyedi ötletben.',
			'button_text' => 'Kapcsolatfelvétel',
			'button_url' => array('url' => '/kapcsolat/'),
			'image' => array('url' => $asset . 'termekvilag/hero_slider/layero-asset-0018.png'),
		))));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   KAPCSOLAT (Contact)
	   ────────────────────────────────────────────────────────────── */

	private static function contact_data() {
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-contact shop-wrap">' .
			'<div>' .
			'<h1>Beszéljünk az ötletedről.</h1>' .
			'<p class="sh-contact__lead">Kérdésed van egy termékről, vagy valami teljesen egyedit szeretnél? Írj nekünk — általában 24 órán belül válaszolunk.</p>' .
			'<div class="sh-contact__item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.09 9.63a16 16 0 0 0 6.28 6.28l1.19-1.19a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92Z"/></svg><div><span>Telefon</span><strong>+40 756 642 387</strong></div></div>' .
			'<div class="sh-contact__item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><div><span>E-mail</span><strong>layeroprint@gmail.com</strong></div></div>' .
			'<div class="sh-contact__item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><div><span>Műhely</span><strong>Szatmárnémeti, Románia</strong></div></div>' .
			'</div>' .
			'<form class="sh-form" id="sh-contact-form">' .
			'<div class="sh-form__row">' .
			'<div class="sh-field"><label for="cf-nev">Név</label><input id="cf-nev" type="text" required autocomplete="name"></div>' .
			'<div class="sh-field"><label for="cf-email">E-mail</label><input id="cf-email" type="email" required autocomplete="email"></div>' .
			'</div>' .
			'<div class="sh-field"><label for="cf-tema">Miben segíthetünk?</label>' .
			'<select id="cf-tema"><option>Kérdésem van egy termékről</option><option>Egyedi ötletem van</option><option>Céges megrendelés</option><option>Egyéb</option></select></div>' .
			'<div class="sh-field"><label for="cf-uzenet">Üzenet</label><textarea id="cf-uzenet" required placeholder="Írd le röviden, mire gondoltál…"></textarea></div>' .
			'<button class="sh-btn sh-btn--primary" type="submit">Üzenet küldése</button>' .
			'</form>' .
			'</section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_newsletter_banner')));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   AJÁNDÉKKERESŐ (Quiz)
	   ────────────────────────────────────────────────────────────── */

	private static function quiz_data() {
		return array(
			self::html_section('<div id="sh-quiz-mount"></div>'),
		);
	}

	/* ──────────────────────────────────────────────────────────────
	   KEDVENCEK (Favorites / Wishlist)
	   ────────────────────────────────────────────────────────────── */

	private static function favorites_data() {
		return array(
			self::html_section('<div id="sh-wish-mount"></div>'),
		);
	}

	/* ──────────────────────────────────────────────────────────────
	   404
	   ────────────────────────────────────────────────────────────── */

	private static function error_404_data() {
		return array(
			self::html_section(
				'<section class="sh-404 shop-wrap">' .
				'<span class="sh-404__code">404</span>' .
				'<h1>Ezt az oldalt nem találtuk.</h1>' .
				'<p>Lehet, hogy elavult a link, vagy elgépeltünk valamit. De ne aggódj — innen könnyen továbbjutsz.</p>' .
				'<div class="sh-404__actions">' .
				'<a class="sh-btn sh-btn--primary" href="/">Vissza a főoldalra</a>' .
				'<a class="sh-btn sh-btn--ghost" href="/termekek/">Összes termék</a>' .
				'<a class="sh-btn sh-btn--ghost" href="/ajandekkereso/">Ajándékkereső</a>' .
				'</div>' .
				'<div class="sh-404__cats" id="sh-404-cats"></div>' .
				'</section>'
			),
		);
	}

	/* ──────────────────────────────────────────────────────────────
	   EGYEDI RENDELÉS (Custom Order)
	   ────────────────────────────────────────────────────────────── */

	private static function custom_order_data() {
		$asset = self::asset_url();
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<nav class="sh-crumbs" aria-label="Morzsamenü"><a href="/">Shop</a><span aria-hidden="true">/</span><span>Egyedi rendelés</span></nav>' .
			'<h1>Van egy ötleted? Legyártjuk neked.</h1>' .
			'<p>Küldj egy leírást, referenciaképet vagy vázlatot — megtervezzük és kinyomtatjuk. 24–48 órán belül visszajelzünk az árról és a határidőről.</p>' .
			'</div></section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_process_steps')));

		$sections[] = self::html_section(
			'<section class="sh-contact shop-wrap">' .
			'<div>' .
			'<h2 class="sh-h2">Mesélj az ötletedről</h2>' .
			'<p class="sh-contact__lead">Minél részletesebben leírod, annál pontosabb árajánlatot tudunk adni. Ha van fényképed, referenciaképed vagy vázlatod, azt is csatold!</p>' .
			'</div>' .
			'<form class="sh-form" id="sh-contact-form">' .
			'<div class="sh-form__row">' .
			'<div class="sh-field"><label for="cf-nev">Név</label><input id="cf-nev" type="text" required autocomplete="name"></div>' .
			'<div class="sh-field"><label for="cf-email">E-mail</label><input id="cf-email" type="email" required autocomplete="email"></div>' .
			'</div>' .
			'<div class="sh-field"><label for="cf-uzenet">Leírás</label><textarea id="cf-uzenet" required placeholder="Milyen tárgyat szeretnél? Kinek szánod? Van-e referenciakép vagy méretigényed?"></textarea></div>' .
			'<button class="sh-btn sh-btn--primary" type="submit">Ajánlatot kérek</button>' .
			'</form>' .
			'</section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_trust_bar')));
		$sections[] = self::wrap_in_section(array(self::make_widget('layero_testimonials')));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   KOSÁR (Cart)
	   ────────────────────────────────────────────────────────────── */

	private static function cart_data() {
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<h1>Kosár</h1>' .
			'</div></section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('shortcode', array(
			'shortcode' => '[woocommerce_cart]',
		))));

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_trust_bar')));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   PÉNZTÁR (Checkout)
	   ────────────────────────────────────────────────────────────── */

	private static function checkout_data() {
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<h1>Pénztár</h1>' .
			'</div></section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('shortcode', array(
			'shortcode' => '[woocommerce_checkout]',
		))));

		$sections[] = self::wrap_in_section(array(self::make_widget('layero_trust_bar')));

		return $sections;
	}

	/* ──────────────────────────────────────────────────────────────
	   FIÓKOM (My Account)
	   ────────────────────────────────────────────────────────────── */

	private static function account_data() {
		$sections = array();

		$sections[] = self::html_section(
			'<section class="sh-page-hd"><div class="shop-wrap">' .
			'<h1>Fiókom</h1>' .
			'</div></section>'
		);

		$sections[] = self::wrap_in_section(array(self::make_widget('shortcode', array(
			'shortcode' => '[woocommerce_my_account]',
		))));

		return $sections;
	}

	/* ══════════════════════════════════════════════════════════════
	   Helpers
	   ══════════════════════════════════════════════════════════════ */

	private static function find_page($title) {
		$query = new \WP_Query(array(
			'post_type'      => 'page',
			'title'          => $title,
			'post_status'    => array('publish', 'draft', 'pending', 'private'),
			'posts_per_page' => 1,
			'no_found_rows'  => true,
		));

		return $query->have_posts() ? $query->posts[0] : null;
	}

	private static function set_elementor_data($post_id, $data) {
		update_post_meta($post_id, '_elementor_data', wp_slash(wp_json_encode($data)));
		update_post_meta($post_id, '_elementor_edit_mode', 'builder');
		update_post_meta($post_id, '_elementor_template_type', 'wp-page');
		update_post_meta($post_id, '_elementor_version', '3.24.0');
	}

	private static function asset_url() {
		return LAYERO_SHOP_UI_URL . 'assets/demo/';
	}

	private static function make_id() {
		self::$id_counter++;
		return substr(md5('layero_build_' . self::$id_counter . '_' . wp_rand()), 0, 7);
	}

	private static function make_widget($type, $settings = array()) {
		return array(
			'id'         => self::make_id(),
			'elType'     => 'widget',
			'widgetType' => $type,
			'settings'   => (object) $settings,
		);
	}

	private static function wrap_in_section($widgets, $section_settings = array()) {
		$defaults = array(
			'layout' => 'full_width',
			'gap'    => 'no',
		);

		return array(
			'id'       => self::make_id(),
			'elType'   => 'section',
			'settings' => array_merge($defaults, $section_settings),
			'elements' => array(
				array(
					'id'       => self::make_id(),
					'elType'   => 'column',
					'settings' => array('_column_size' => 100),
					'elements' => $widgets,
				),
			),
		);
	}

	private static function html_section($html) {
		return self::wrap_in_section(array(
			self::make_widget('html', array('html' => $html)),
		));
	}
}
