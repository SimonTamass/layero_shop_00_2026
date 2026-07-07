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
			'title' => 'Népszerű termékek. <span>Amit a legtöbben visznek.</span>',
			'button_text' => 'Mind',
			'button_url' => array('url' => '/shop/'),
		));
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
		$this->add_control('columns', array(
			'label' => __('Oszlopok desktopon', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => '4',
			'options' => array('2' => '2', '3' => '3', '4' => '4'),
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
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$limit = isset($settings['limit']) ? absint($settings['limit']) : 8;
		$collection = $settings['collection'] ?? 'popular';
		$products = Helpers::query_products(array(
			'limit' => $limit,
			'category' => $settings['category'] ?? '',
			'featured' => 'yes' === ($settings['featured'] ?? ''),
			'on_sale' => 'yes' === ($settings['on_sale'] ?? ''),
			'orderby' => 'new' === $collection ? 'date' : 'menu_order',
			'order' => 'DESC',
		));
		$use_demo = ! Helpers::is_woo_active() || empty($products);
		$columns = in_array(($settings['columns'] ?? '4'), array('2', '3', '4'), true) ? $settings['columns'] : '4';
		$card_args = array('show_excerpt' => 'yes' === ($settings['show_excerpt'] ?? 'yes'));
		?>
		<section class="lyr-section lyr-products">
			<?php $this->render_section_header($settings); ?>
			<div class="lyr-product-grid lyr-product-grid--cols-<?php echo esc_attr($columns); ?>">
				<?php if ($use_demo) : ?>
					<?php foreach (Shop_Content::demo_products($limit, $settings['category'] ?? '', $collection) as $product) : ?>
						<?php echo Helpers::demo_product_card($product, $card_args); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php else : ?>
					<?php foreach ($products as $product) : ?>
						<?php echo Helpers::product_card($product, $card_args); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}
}
