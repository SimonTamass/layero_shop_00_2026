<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Product_Spotlight extends Base_Widget {
	public function get_name() {
		return 'layero_product_spotlight';
	}

	public function get_title() {
		return __('Layero kiemelt termék', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-product-info';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Termék', 'layero-shop-ui')));
		$this->add_control('product_id', array(
			'label' => __('Termék ID', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'description' => __('Ha üres, az első kiemelt WooCommerce terméket használja. Fallback: Karácsonyi kedvenc-lámpa.', 'layero-shop-ui'),
		));
		$this->add_control('eyebrow', array(
			'label' => __('Kis felirat', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'A hónap terméke',
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$product = null;

		if (Helpers::is_woo_active() && ! empty($settings['product_id'])) {
			$product = wc_get_product(absint($settings['product_id']));
		}
		if (! $product) {
			$products = Helpers::query_products(array('featured' => true, 'limit' => 1));
			$product = ! empty($products) ? $products[0] : null;
		}
		?>
		<section class="lyr-spotlight">
			<?php if ($product) : ?>
				<figure><?php echo Helpers::product_image($product, 'large'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></figure>
				<div class="lyr-spotlight__copy">
					<span><?php echo esc_html($settings['eyebrow'] ?? 'A hónap terméke'); ?></span>
					<h2><?php echo esc_html($product->get_name()); ?></h2>
					<p><?php echo esc_html(wp_strip_all_tags($product->get_short_description() ?: $product->get_description())); ?></p>
					<div class="lyr-spotlight__price"><?php echo wp_kses_post($product->get_price_html()); ?></div>
					<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url(get_permalink($product->get_id())); ?>"><?php echo esc_html__('Megnézem a terméket', 'layero-shop-ui'); ?></a>
				</div>
			<?php else : ?>
				<?php $demo = Shop_Content::spotlight_product(); ?>
				<figure><img src="<?php echo esc_url(Shop_Content::asset_url($demo['image'])); ?>" alt="<?php echo esc_attr($demo['name']); ?>" loading="lazy"></figure>
				<div class="lyr-spotlight__copy">
					<span><?php echo esc_html($settings['eyebrow'] ?? 'A hónap terméke'); ?></span>
					<h2><?php echo esc_html($demo['name']); ?></h2>
					<p><?php echo esc_html($demo['description']); ?></p>
					<div class="lyr-spotlight__price"><?php echo esc_html(number_format_i18n($demo['price'], 0)); ?> RON <small><?php echo esc_html__('-tól, egyedi gyártással', 'layero-shop-ui'); ?></small></div>
					<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url(home_url('/product/' . $demo['id'] . '/')); ?>"><?php echo esc_html__('Megnézem a terméket', 'layero-shop-ui'); ?></a>
				</div>
			<?php endif; ?>
		</section>
		<?php
	}
}
