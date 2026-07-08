<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Newsletter_Banner extends Base_Widget {
	public function get_name() {
		return 'layero_newsletter_banner';
	}

	public function get_title() {
		return __('Layero hírlevél banner', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-mail';
	}

	protected function register_controls() {
		$defaults = Shop_Content::newsletter();
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['title']));
		$this->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['text']));
		$this->add_control('placeholder', array('label' => __('Placeholder', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['placeholder']));
		$this->add_control('button_text', array('label' => __('Gomb szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['button_text']));
		$this->add_control('note', array('label' => __('Apróbetű', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['note']));
		$this->add_control('discount_value', array(
			'label' => __('Kedvezmény szám', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => '-10',
			'separator' => 'before',
		));
		$this->add_control('show_ticket', array(
			'label' => __('Kedvezmény jelvény mutatása', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-newsletter' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-newsletter' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('btn_bg_color', array(
			'label' => __('Gomb háttér', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-newsletter .lyr-btn' => 'background-color: {{VALUE}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
		<section class="lyr-newsletter">
			<div class="lyr-newsletter__copy">
				<span class="lyr-newsletter__icon"><?php echo Helpers::icon('mail'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<h2><?php echo esc_html($settings['title'] ?? ''); ?></h2>
				<p><?php echo esc_html($settings['text'] ?? ''); ?></p>
				<form data-layero-newsletter>
					<input type="email" required placeholder="<?php echo esc_attr($settings['placeholder'] ?? __('E-mail címed', 'layero-shop-ui')); ?>" aria-label="<?php echo esc_attr__('E-mail cím', 'layero-shop-ui'); ?>">
					<button class="lyr-btn lyr-btn--dark" type="submit"><?php echo esc_html($settings['button_text'] ?? __('Feliratkozom', 'layero-shop-ui')); ?></button>
				</form>
				<small data-layero-newsletter-note><?php echo esc_html($settings['note'] ?? ''); ?></small>
			</div>
			<?php if ('yes' === ($settings['show_ticket'] ?? 'yes')) : ?>
				<div class="lyr-newsletter__ticket" aria-hidden="true"><b>%</b><span><?php echo esc_html($settings['discount_value'] ?? '-10'); ?></span></div>
			<?php endif; ?>
		</section>
		<?php
	}
}
