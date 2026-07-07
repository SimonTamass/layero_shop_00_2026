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
			<div class="lyr-newsletter__ticket" aria-hidden="true"><b>%</b><span>-10</span></div>
		</section>
		<?php
	}
}
