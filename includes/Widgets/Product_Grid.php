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
		$this->start_controls_section('query_section', array('label' => __('WooCommerce lekérdezés', 'layero-shop-ui')));
		$this->add_control('title', array(
			'label' => __('Szekció cím', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Népszerű termékek. Amit a legtöbben visznek.',
		));
		$this->add_control('category', array(
			'label' => __('Kategória slug', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'description' => __('Üresen hagyva minden kategóriából válogat. Shop slugok: lampak, kulcstartok, dekoraciok, ceges, rajongoi, egyedi.', 'layero-shop-ui'),
		));
		$this->add_control('limit', array(
			'label' => __('Darabszám', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'default' => 8,
			'min' => 1,
			'max' => 24,
		));
		$this->add_control('featured', array(
			'label' => __('Csak kiemelt termékek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->add_control('on_sale', array(
			'label' => __('Csak akciós termékek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$products = Helpers::query_products(array(
			'limit' => $settings['limit'] ?? 8,
			'category' => $settings['category'] ?? '',
			'featured' => 'yes' === ($settings['featured'] ?? ''),
			'on_sale' => 'yes' === ($settings['on_sale'] ?? ''),
			'orderby' => 'menu_order',
			'order' => 'ASC',
		));
		$use_demo = ! Helpers::is_woo_active() || empty($products);
		?>
		<section class="lyr-section lyr-products">
			<?php if (! empty($settings['title'])) : ?>
				<div class="lyr-section__head"><h2><?php echo esc_html($settings['title']); ?></h2></div>
			<?php endif; ?>
			<div class="lyr-product-grid">
				<?php if ($use_demo) : ?>
					<?php foreach (Shop_Content::demo_products($settings['limit'] ?? 8, $settings['category'] ?? '') as $product) : ?>
						<?php echo Helpers::demo_product_card($product); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php else : ?>
					<?php foreach ($products as $product) : ?>
						<?php echo Helpers::product_card($product); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}
}
