<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Custom_CTA extends Base_Widget {
	public function get_name() {
		return 'layero_custom_cta';
	}

	public function get_title() {
		return __('Layero egyedi rendelés CTA', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-call-to-action';
	}

	protected function register_controls() {
		$defaults = Shop_Content::custom_cta();
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('image', array('label' => __('Kép', 'layero-shop-ui'), 'type' => Controls_Manager::MEDIA, 'default' => $defaults['image']));
		$this->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['title']));
		$this->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['text']));
		$this->add_control('button_text', array('label' => __('Gomb szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['button_text']));
		$this->add_control('button_url', array('label' => __('Gomb link', 'layero-shop-ui'), 'type' => Controls_Manager::URL, 'default' => $defaults['button_url']));
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
				'{{WRAPPER}} .lyr-custom-cta' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-custom-cta' => 'color: {{VALUE}};',
			),
		));
		$this->add_responsive_control('section_padding', array(
			'label' => __('Belső margó', 'layero-shop-ui'),
			'type' => Controls_Manager::DIMENSIONS,
			'size_units' => array('px', 'rem', '%'),
			'selectors' => array(
				'{{WRAPPER}} .lyr-custom-cta' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$image = $settings['image']['url'] ?? '';
		?>
		<?php $cta_layout = 'right' === ($settings['layout'] ?? 'left') ? ' lyr-custom-cta--reverse' : ''; ?>
		<section class="lyr-custom-cta<?php echo esc_attr($cta_layout); ?>">
			<?php if ($image) : ?>
				<img src="<?php echo esc_url($image); ?>" alt="" loading="lazy">
			<?php endif; ?>
			<div class="lyr-custom-cta__copy">
				<h2><?php echo esc_html($settings['title'] ?? ''); ?></h2>
				<p><?php echo esc_html($settings['text'] ?? ''); ?></p>
				<?php if (! empty($settings['button_text'])) : ?>
					<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url($this->get_link_url($settings['button_url'] ?? array())); ?>"><?php echo esc_html($settings['button_text']); ?></a>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}
}
