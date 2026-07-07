<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Product_Carousel extends Base_Widget {
	public function get_name() {
		return 'layero_product_carousel';
	}

	public function get_title() {
		return __('Layero termék-körhinta', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-slider-device';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Szekció', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'title' => 'Újdonságok. <span>Frissen a nyomtatóból.</span>',
		));
		$this->end_controls_section();

		$this->start_controls_section('query_section', array('label' => __('Termékek', 'layero-shop-ui')));
		$this->add_control('category', array('label' => __('Kategória slug', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('collection', array(
			'label' => __('Fallback válogatás', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'new',
			'options' => array(
				'new' => __('Újdonságok', 'layero-shop-ui'),
				'popular' => __('Népszerű', 'layero-shop-ui'),
				'sale' => __('Akciós', 'layero-shop-ui'),
				'all' => __('Alap sorrend', 'layero-shop-ui'),
			),
		));
		$this->add_control('limit', array('label' => __('Darabszám', 'layero-shop-ui'), 'type' => Controls_Manager::NUMBER, 'default' => 8, 'min' => 3, 'max' => 24));
		$this->add_control('featured', array('label' => __('Csak kiemelt Woo termékek', 'layero-shop-ui'), 'type' => Controls_Manager::SWITCHER));
		$this->add_control('on_sale', array('label' => __('Csak akciós Woo termékek', 'layero-shop-ui'), 'type' => Controls_Manager::SWITCHER));
		$this->add_control('show_excerpt', array('label' => __('Leírás mutatása', 'layero-shop-ui'), 'type' => Controls_Manager::SWITCHER));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$limit = isset($settings['limit']) ? absint($settings['limit']) : 8;
		$collection = $settings['collection'] ?? 'new';
		$products = Helpers::query_products(array(
			'limit' => $limit,
			'category' => $settings['category'] ?? '',
			'featured' => 'yes' === ($settings['featured'] ?? ''),
			'on_sale' => 'yes' === ($settings['on_sale'] ?? ''),
			'orderby' => 'date',
			'order' => 'DESC',
		));
		$use_demo = ! Helpers::is_woo_active() || empty($products);
		$card_args = array('show_excerpt' => 'yes' === ($settings['show_excerpt'] ?? ''));
		?>
		<section class="lyr-section lyr-product-carousel">
			<div class="lyr-section__head lyr-section__head--with-nav">
				<div>
					<?php if (! empty($settings['eyebrow'])) : ?><span class="lyr-eyebrow"><?php echo esc_html($settings['eyebrow']); ?></span><?php endif; ?>
					<?php if (! empty($settings['title'])) : ?><h2><?php echo wp_kses($settings['title'], array('span' => array(), 'em' => array())); ?></h2><?php endif; ?>
					<?php if (! empty($settings['text'])) : ?><p><?php echo esc_html($settings['text']); ?></p><?php endif; ?>
				</div>
				<div class="lyr-carousel-nav">
					<button type="button" data-layero-carousel-prev aria-label="<?php esc_attr_e('Balra', 'layero-shop-ui'); ?>">&lsaquo;</button>
					<button type="button" data-layero-carousel-next aria-label="<?php esc_attr_e('Jobbra', 'layero-shop-ui'); ?>">&rsaquo;</button>
				</div>
			</div>
			<div class="lyr-carousel" data-layero-carousel>
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
