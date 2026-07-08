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

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-quiz-cta' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-quiz-cta' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('hover_bg', array(
			'label' => __('Hover háttér', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-quiz-cta:hover' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('border_radius', array(
			'label' => __('Lekerekítés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px'),
			'range' => array('px' => array('min' => 0, 'max' => 30)),
			'selectors' => array(
				'{{WRAPPER}} .lyr-quiz-cta' => 'border-radius: {{SIZE}}{{UNIT}};',
			),
		));
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
