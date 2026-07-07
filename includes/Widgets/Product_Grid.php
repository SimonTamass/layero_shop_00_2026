<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;

if (! defined('ABSPATH')) {
	exit;
}

class Product_Grid extends Base_Widget {
	public function get_name() {
		return 'layero_product_grid';
	}

	public function get_title() {
		return __('Layero termekracs', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-products';
	}

	protected function register_controls() {
		$this->start_controls_section('query_section', array('label' => __('WooCommerce lekerdezes', 'layero-shop-ui')));
		$this->add_control('title', array(
			'label' => __('Szekcio cim', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Nepszeru termekek',
		));
		$this->add_control('category', array(
			'label' => __('Kategoria slug', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'description' => __('Uresen hagyva minden kategoriabol valogat.', 'layero-shop-ui'),
		));
		$this->add_control('limit', array(
			'label' => __('Darabszam', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'default' => 8,
			'min' => 1,
			'max' => 24,
		));
		$this->add_control('featured', array(
			'label' => __('Csak kiemelt termekek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->add_control('on_sale', array(
			'label' => __('Csak akcios termekek', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$products = Helpers::query_products(array(
			'limit' => $settings['limit'],
			'category' => $settings['category'],
			'featured' => 'yes' === $settings['featured'],
			'on_sale' => 'yes' === $settings['on_sale'],
		));
		?>
		<section class="lyr-section lyr-products">
			<?php if (! empty($settings['title'])) : ?>
				<div class="lyr-section__head"><h2><?php echo esc_html($settings['title']); ?></h2></div>
			<?php endif; ?>
			<?php if (! Helpers::is_woo_active()) : ?>
				<p class="lyr-notice"><?php echo esc_html__('A WooCommerce nem aktiv, ez a widget eles termekadatot onnan olvasna.', 'layero-shop-ui'); ?></p>
			<?php else : ?>
				<div class="lyr-product-grid">
					<?php foreach ($products as $product) : ?>
						<?php echo Helpers::product_card($product); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</section>
		<?php
	}
}

