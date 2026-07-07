<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Quiz_CTA extends Base_Widget {
	public function get_name() {
		return 'layero_quiz_cta';
	}

	public function get_title() {
		return __('Layero ajándékkereső CTA', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-help-o';
	}

	protected function register_controls() {
		$defaults = Shop_Content::quiz_cta();
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('eyebrow', array('label' => __('Kis felirat', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['eyebrow']));
		$this->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['title']));
		$this->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['text']));
		$this->add_control('button_text', array('label' => __('Gomb szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['button_text']));
		$this->add_control('button_url', array('label' => __('Link', 'layero-shop-ui'), 'type' => Controls_Manager::URL, 'default' => $defaults['button_url']));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
		<a class="lyr-quiz-cta" href="<?php echo esc_url($this->get_link_url($settings['button_url'] ?? array(), '/kviz/')); ?>">
			<span class="lyr-quiz-cta__icon"><?php echo Helpers::icon('question'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			<span class="lyr-quiz-cta__copy">
				<span><?php echo esc_html($settings['eyebrow'] ?? ''); ?></span>
				<strong><?php echo esc_html($settings['title'] ?? ''); ?></strong>
				<small><?php echo esc_html($settings['text'] ?? ''); ?></small>
			</span>
			<b><?php echo esc_html($settings['button_text'] ?? __('Kitöltöm', 'layero-shop-ui')); ?> &rsaquo;</b>
		</a>
		<?php
	}
}
