<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Product_Grid extends Base_Widget {
	public function get_name() {
		return 'layero_product_grid';
	}

	public function get_title() {
		return __('Layero termékrács', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-products';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Szekció', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'eyebrow' => 'Bestsellerek',
			'title' => 'Népszerű termékek. <span>Amit a legtöbben visznek.</span>',
			'button_text' => 'Mind',
			'button_url' => array('url' => '/termekek/'),
		));
		$this->add_heading_tag_control();
		$this->end_controls_section();

		$this->start_controls_section('query_section', array('label' => __('Termékek', 'layero-shop-ui')));
		$this->add_control('category', array(
			'label' => __('Kategória slug', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'description' => __('Üresen hagyva minden kategóriából válogat. Shop slugok: lampak, kulcstartok, dekoraciok, ceges, rajongoi, egyedi.', 'layero-shop-ui'),
		));
		$this->add_control('collection', array(
			'label' => __('Fallback válogatás', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'popular',
			'options' => array(
				'popular' => __('Népszerű', 'layero-shop-ui'),
				'new' => __('Újdonságok', 'layero-shop-ui'),
				'sale' => __('Akciós', 'layero-shop-ui'),
				'all' => __('Alap sorrend', 'layero-shop-ui'),
			),
		));
		$this->add_control('limit', array(
			'label' => __('Darabszám', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'default' => 8,
			'min' => 1,
			'max' => 24,
		));
		$this->add_responsive_control('columns', array(
			'label' => __('Oszlopok', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => '4',
			'tablet_default' => '2',
			'mobile_default' => '1',
			'options' => array('1' => '1', '2' => '2', '3' => '3', '4' => '4'),
			'selectors' => array(
				'{{WRAPPER}} .sh-prod-grid' => 'grid-template-columns: repeat({{VALUE}}, 1fr);',
			),
		));
		$this->add_control('featured', array(
			'label' => __('Csak kiemelt WooCommerce termékek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->add_control('on_sale', array(
			'label' => __('Csak akciós WooCommerce termékek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->add_control('show_excerpt', array(
			'label' => __('Leírás mutatása', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();

		$this->add_section_header_style_controls();

		$this->start_controls_section('grid_style', array(
			'label' => __('Rács', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_responsive_control('gap', array(
			'label' => __('Rés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px', 'rem'),
			'range' => array('px' => array('min' => 0, 'max' => 60)),
			'selectors' => array(
				'{{WRAPPER}} .sh-prod-grid' => 'gap: {{SIZE}}{{UNIT}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$limit = isset($settings['limit']) ? absint($settings['limit']) : 8;
		$collection = $settings['collection'] ?? 'popular';
		$is_listing = $this->is_page_context(array('termekek', 'shop'));
		$is_favorites = $this->is_page_context(array('kedvencek'));
		$active_category = sanitize_title($settings['category'] ?? '');
		$search = '';
		$sort = 'recommended';

		if ($is_listing) {
			$active_category = isset($_GET['cat']) ? sanitize_title(wp_unslash($_GET['cat'])) : $active_category;
			$search = isset($_GET['q']) ? sanitize_text_field(wp_unslash($_GET['q'])) : '';
			$sort = isset($_GET['sort']) ? sanitize_key(wp_unslash($_GET['sort'])) : 'recommended';
			$collection = 'all';
			$limit = max(24, $limit);
		}

		if ($is_favorites) {
			$collection = 'all';
			$limit = max(24, $limit);
		}

		$woo_sort = $this->woo_sort_args($sort, $collection);
		$products = Helpers::query_products(array(
			'limit' => $limit,
			'category' => $active_category,
			'featured' => 'yes' === ($settings['featured'] ?? ''),
			'on_sale' => 'yes' === ($settings['on_sale'] ?? ''),
			'orderby' => $woo_sort['orderby'],
			'order' => $woo_sort['order'],
			'search' => $search,
		));
		$use_demo = ! Helpers::is_woo_active() || empty($products);
		$columns = in_array(($settings['columns'] ?? '4'), array('2', '3', '4'), true) ? $settings['columns'] : '4';
		$card_args = array('show_excerpt' => 'yes' === ($settings['show_excerpt'] ?? 'yes'));
		$demo_products = $use_demo ? $this->demo_products($limit, $active_category, $collection, $search, $sort) : array();
		$grid_attrs = $is_favorites ? ' data-layero-favorites-grid' : '';
		$section_classes = 'sh-band sh-band--tight lyr-products';
		$section_classes .= (! $is_listing && ! $is_favorites) ? ' sh-band--gray' : '';
		$section_classes .= $is_listing ? ' lyr-products--listing' : '';
		$section_classes .= $is_favorites ? ' lyr-products--favorites' : '';
		?>
		<section class="<?php echo esc_attr($section_classes); ?>">
			<div class="shop-wrap">
			<?php $this->render_section_header($settings); ?>
			<?php if ($is_listing) : ?>
				<?php $this->render_listing_toolbar($active_category, $search, $sort); ?>
			<?php endif; ?>
			<?php if ($is_favorites) : ?>
				<div class="lyr-products-empty" data-layero-favorites-empty hidden>
					<h3><?php esc_html_e('Még nincs kedvenc terméked.', 'layero-shop-ui'); ?></h3>
					<p><?php esc_html_e('A termékkártyák szív ikonjával tudsz ide menteni termékeket.', 'layero-shop-ui'); ?></p>
					<a class="lyr-btn lyr-btn--primary" href="<?php echo esc_url(Helpers::products_url()); ?>"><?php esc_html_e('Termékek böngészése', 'layero-shop-ui'); ?></a>
				</div>
			<?php endif; ?>
			<div class="sh-prod-grid lyr-product-grid lyr-product-grid--cols-<?php echo esc_attr($columns); ?>"<?php echo $grid_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<?php if ($use_demo) : ?>
					<?php foreach ($demo_products as $product) : ?>
						<?php echo Helpers::demo_product_card($product, $card_args); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php else : ?>
					<?php foreach ($products as $product) : ?>
						<?php echo Helpers::product_card($product, $card_args); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<?php if (($use_demo && empty($demo_products)) || (! $use_demo && empty($products))) : ?>
				<div class="lyr-products-empty">
					<h3><?php esc_html_e('Nincs találat.', 'layero-shop-ui'); ?></h3>
					<p><?php esc_html_e('Próbálj más kategóriát vagy keresési kifejezést.', 'layero-shop-ui'); ?></p>
					<a class="lyr-btn lyr-btn--primary" href="<?php echo esc_url(Helpers::products_url()); ?>"><?php esc_html_e('Összes termék', 'layero-shop-ui'); ?></a>
				</div>
			<?php endif; ?>
			</div>
		</section>
		<?php
	}

	private function is_page_context($slugs) {
		if (function_exists('is_page') && is_page($slugs)) {
			return true;
		}

		if (! function_exists('get_queried_object_id') || ! function_exists('get_post_field')) {
			return false;
		}

		$slug = (string) get_post_field('post_name', get_queried_object_id());

		return in_array($slug, (array) $slugs, true);
	}

	private function woo_sort_args($sort, $collection) {
		switch ($sort) {
			case 'price_asc':
				return array('orderby' => 'price', 'order' => 'ASC');
			case 'price_desc':
				return array('orderby' => 'price', 'order' => 'DESC');
			case 'name':
				return array('orderby' => 'title', 'order' => 'ASC');
			case 'new':
				return array('orderby' => 'date', 'order' => 'DESC');
			default:
				return array('orderby' => 'new' === $collection ? 'date' : 'menu_order', 'order' => 'DESC');
		}
	}

	private function demo_products($limit, $category, $collection, $search, $sort) {
		$products = Shop_Content::demo_products($limit, $category, $collection);

		if ('' !== $search) {
			$needle = function_exists('mb_strtolower') ? mb_strtolower($search) : strtolower($search);
			$products = array_values(
				array_filter(
					$products,
					function ($product) use ($needle) {
						$haystack = $product['name'] . ' ' . $product['description'] . ' ' . $product['category'];
						$haystack = function_exists('mb_strtolower') ? mb_strtolower($haystack) : strtolower($haystack);

						return false !== strpos($haystack, $needle);
					}
				)
			);
		}

		usort(
			$products,
			function ($a, $b) use ($sort) {
				switch ($sort) {
					case 'price_asc':
						return (int) $a['price'] <=> (int) $b['price'];
					case 'price_desc':
						return (int) $b['price'] <=> (int) $a['price'];
					case 'name':
						return strcasecmp($a['name'], $b['name']);
					case 'new':
						return strcmp($b['id'], $a['id']);
					default:
						return 0;
				}
			}
		);

		return $products;
	}

	private function render_listing_toolbar($active_category, $search, $sort) {
		$base_args = array();
		if ('' !== $search) {
			$base_args['q'] = $search;
		}
		if ('recommended' !== $sort) {
			$base_args['sort'] = $sort;
		}
		?>
		<div class="lyr-product-tools">
			<form class="lyr-product-search" action="<?php echo esc_url(Helpers::products_url()); ?>" method="get" role="search">
				<?php if ('' !== $active_category) : ?>
					<input type="hidden" name="cat" value="<?php echo esc_attr($active_category); ?>">
				<?php endif; ?>
				<input type="search" name="q" value="<?php echo esc_attr($search); ?>" placeholder="<?php esc_attr_e('Keresés a termékek között', 'layero-shop-ui'); ?>">
				<button class="lyr-btn lyr-btn--dark" type="submit"><?php esc_html_e('Keresés', 'layero-shop-ui'); ?></button>
			</form>
			<div class="lyr-product-pills" aria-label="<?php esc_attr_e('Kategóriák', 'layero-shop-ui'); ?>">
				<a class="<?php echo '' === $active_category ? 'is-active' : ''; ?>" href="<?php echo esc_url(Helpers::products_url('', $base_args)); ?>"><?php esc_html_e('Összes', 'layero-shop-ui'); ?></a>
				<?php foreach (Shop_Content::categories() as $category) : ?>
					<a class="<?php echo $active_category === $category['id'] ? 'is-active' : ''; ?>" href="<?php echo esc_url(Helpers::products_url($category['id'], $base_args)); ?>"><?php echo esc_html($category['name']); ?></a>
				<?php endforeach; ?>
			</div>
			<form class="lyr-product-sort" action="<?php echo esc_url(Helpers::products_url()); ?>" method="get">
				<?php if ('' !== $active_category) : ?>
					<input type="hidden" name="cat" value="<?php echo esc_attr($active_category); ?>">
				<?php endif; ?>
				<?php if ('' !== $search) : ?>
					<input type="hidden" name="q" value="<?php echo esc_attr($search); ?>">
				<?php endif; ?>
				<select name="sort" aria-label="<?php esc_attr_e('Rendezés', 'layero-shop-ui'); ?>" onchange="this.form.submit()">
					<option value="recommended" <?php selected($sort, 'recommended'); ?>><?php esc_html_e('Ajánlott sorrend', 'layero-shop-ui'); ?></option>
					<option value="price_asc" <?php selected($sort, 'price_asc'); ?>><?php esc_html_e('Ár szerint növekvő', 'layero-shop-ui'); ?></option>
					<option value="price_desc" <?php selected($sort, 'price_desc'); ?>><?php esc_html_e('Ár szerint csökkenő', 'layero-shop-ui'); ?></option>
					<option value="new" <?php selected($sort, 'new'); ?>><?php esc_html_e('Újdonságok', 'layero-shop-ui'); ?></option>
					<option value="name" <?php selected($sort, 'name'); ?>><?php esc_html_e('Név szerint', 'layero-shop-ui'); ?></option>
				</select>
			</form>
		</div>
		<?php
	}
}
