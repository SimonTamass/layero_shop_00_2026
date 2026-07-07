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
				'truck' => 'Szállítás',
				'tag' => 'Minimum rendelés',
				'bolt' => 'Gyors gyártás',
				'shield' => 'Garancia',
				'leaf' => 'Eco',
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
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::trust_items();
		?>
		<div class="lyr-trust-bar">
			<?php foreach ($items as $item) : ?>
				<article>
					<?php echo Helpers::icon($item['icon']); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<div><strong><?php echo esc_html($item['title']); ?></strong><span><?php echo esc_html($item['text']); ?></span></div>
				</article>
			<?php endforeach; ?>
		</div>
		<?php
	}
}
