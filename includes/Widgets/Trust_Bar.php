<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Helpers;

if (! defined('ABSPATH')) {
	exit;
}

class Trust_Bar extends Base_Widget {
	public function get_name() {
		return 'layero_trust_bar';
	}

	public function get_title() {
		return __('Layero bizalmi sav', 'layero-shop-ui');
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
				'truck' => 'Szallitas',
				'bolt' => 'Gyors',
				'shield' => 'Garancia',
				'leaf' => 'Eco',
			),
		));
		$repeater->add_control('title', array('label' => __('Cim', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('text', array('label' => __('Szoveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ title }}}',
			'default' => array(
				array('icon' => 'truck', 'title' => 'Ingyenes szallitas', 'text' => '200 lej feletti rendelesre'),
				array('icon' => 'bolt', 'title' => 'Gyors gyartas', 'text' => '5-10 munkanap alatt'),
				array('icon' => 'shield', 'title' => '2 ev jotallas', 'text' => 'minden termekre'),
				array('icon' => 'leaf', 'title' => 'PLA + napenergia', 'text' => 'tudatos gyartas'),
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
		<div class="lyr-trust-bar">
			<?php foreach ($settings['items'] as $item) : ?>
				<article>
					<?php echo Helpers::icon($item['icon']); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<div><strong><?php echo esc_html($item['title']); ?></strong><span><?php echo esc_html($item['text']); ?></span></div>
				</article>
			<?php endforeach; ?>
		</div>
		<?php
	}
}

