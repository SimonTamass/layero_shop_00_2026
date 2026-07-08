<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Trust_Bar extends Base_Widget {
	public function get_name() {
		return 'layero_trust_bar';
	}

	public function get_title() {
		return __('Layero bizalmi sáv', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-check-circle';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Pontok', 'layero-shop-ui')));
		$repeater = new Repeater();
		$repeater->add_control('icon', array(
			'label' => __('Ikon', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'truck',
			'options' => array(
				'truck' => __('Szállítás', 'layero-shop-ui'),
				'tag' => __('Minimum rendelés', 'layero-shop-ui'),
				'bolt' => __('Gyors gyártás', 'layero-shop-ui'),
				'shield' => __('Garancia', 'layero-shop-ui'),
				'leaf' => __('Eco', 'layero-shop-ui'),
			),
		));
		$repeater->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ title }}}',
			'default' => Shop_Content::trust_items(),
		));
		$this->add_control('style', array(
			'label' => __('Stílus', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'light',
			'options' => array(
				'light' => __('Világos', 'layero-shop-ui'),
				'dark' => __('Sötét', 'layero-shop-ui'),
			),
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
				'{{WRAPPER}} .sh-infobar' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-infobar' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('icon_color', array(
			'label' => __('Ikon szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-infobar svg' => 'color: {{VALUE}};',
			),
		));
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			array(
				'name' => 'title_typography',
				'label' => __('Cím tipográfia', 'layero-shop-ui'),
				'selector' => '{{WRAPPER}} .sh-infobar strong',
			)
		);
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::trust_items();
		?>
		<div class="sh-infobar">
			<?php foreach ($items as $item) : ?>
				<article>
					<?php echo Helpers::icon($item['icon'] ?? 'check'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<div><strong><?php echo esc_html($item['title'] ?? ''); ?></strong><span><?php echo esc_html($item['text'] ?? ''); ?></span></div>
				</article>
			<?php endforeach; ?>
		</div>
		<?php
	}
}
