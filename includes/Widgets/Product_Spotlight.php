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
			'label' => __('WooCommerce termék ID', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'description' => __('Ha üres, az első kiemelt WooCommerce terméket használja.', 'layero-shop-ui'),
		));
		$this->add_control('demo_product_id', array(
			'label' => __('Fallback demó termék', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'karacsonyi-lampa',
			'options' => wp_list_pluck(Shop_Content::products(), 'name', 'id'),
		));
		$this->add_control('eyebrow', array(
			'label' => __('Kis felirat', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'A hónap terméke',
		));
		$this->add_control('button_text', array(
			'label' => __('Gomb szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Megnézem a terméket',
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('layout', array(
			'label' => __('Kép helye', 'layero-shop-ui'),
			'type' => Controls_Manager::CHOOSE,
			'default' => 'left',
			'options' => array(
				'left' => array('title' => __('Balra', 'layero-shop-ui'), 'icon' => 'eicon-h-align-left'),
				'right' => array('title' => __('Jobbra', 'layero-shop-ui'), 'icon' => 'eicon-h-align-right'),
			),
			'toggle' => false,
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-spotlight' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-spotlight' => 'color: {{VALUE}};',
			),
		));
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			array(
				'name' => 'title_typography',
				'label' => __('Cím tipográfia', 'layero-shop-ui'),
				'selector' => '{{WRAPPER}} .lyr-spotlight h2',
			)
		);
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
		<?php $layout_class = 'right' === ($settings['layout'] ?? 'left') ? ' lyr-spotlight--reverse' : ''; ?>
		<section class="lyr-spotlight<?php echo esc_attr($layout_class); ?>">
			<?php if ($product) : ?>
				<figure><?php echo Helpers::product_image($product, 'large'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></figure>
				<div class="lyr-spotlight__copy">
					<span><?php echo esc_html($settings['eyebrow'] ?? 'A hónap terméke'); ?></span>
					<h2><?php echo esc_html($product->get_name()); ?></h2>
					<p><?php echo esc_html(wp_trim_words(wp_strip_all_tags($product->get_short_description() ?: $product->get_description()), 34)); ?></p>
					<div class="lyr-spotlight__price"><?php echo wp_kses_post($product->get_price_html()); ?></div>
					<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url(get_permalink($product->get_id())); ?>"><?php echo esc_html($settings['button_text'] ?? __('Megnézem a terméket', 'layero-shop-ui')); ?></a>
				</div>
			<?php else : ?>
				<?php $demo = Shop_Content::spotlight_product($settings['demo_product_id'] ?? ''); ?>
				<figure><img src="<?php echo esc_url(Shop_Content::asset_url($demo['image'])); ?>" alt="<?php echo esc_attr($demo['name']); ?>" loading="lazy"></figure>
				<div class="lyr-spotlight__copy">
					<span><?php echo esc_html($settings['eyebrow'] ?? 'A hónap terméke'); ?></span>
					<h2><?php echo esc_html($demo['name']); ?></h2>
					<p><?php echo esc_html($demo['description']); ?></p>
					<div class="lyr-spotlight__price">
						<?php echo $demo['price'] ? esc_html(number_format_i18n($demo['price'], 0) . ' RON') : esc_html__('Ajánlatkérés', 'layero-shop-ui'); ?>
						<small><?php echo esc_html__('-tól, egyedi gyártással', 'layero-shop-ui'); ?></small>
					</div>
					<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url(home_url('/product/' . $demo['id'] . '/')); ?>"><?php echo esc_html($settings['button_text'] ?? __('Megnézem a terméket', 'layero-shop-ui')); ?></a>
				</div>
			<?php endif; ?>
		</section>
		<?php
	}
}
