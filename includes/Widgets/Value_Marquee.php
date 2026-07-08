<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Value_Marquee extends Base_Widget {
	public function get_name() {
		return 'layero_value_marquee';
	}

	public function get_title() {
		return __('Layero érték-marquee', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-animation-text';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Szövegek', 'layero-shop-ui')));
		$repeater = new Repeater();
		$repeater->add_control('text', array(
			'label' => __('Szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Névre szóló',
		));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ text }}}',
			'default' => Shop_Content::marquee_items(),
		));
		$this->add_control('speed', array(
			'label' => __('Sebesség (másodperc)', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'default' => 34,
			'min' => 12,
			'max' => 90,
		));
		$this->add_control('separator', array(
			'label' => __('Elválasztó karakter', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => '✦',
		));
		$this->add_control('pause_on_hover', array(
			'label' => __('Megállítás hover-re', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-marquee' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-marquee' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_responsive_control('font_size', array(
			'label' => __('Betűméret', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px', 'rem'),
			'range' => array(
				'px' => array('min' => 10, 'max' => 48),
				'rem' => array('min' => 0.5, 'max' => 3),
			),
			'selectors' => array(
				'{{WRAPPER}} .sh-marquee' => 'font-size: {{SIZE}}{{UNIT}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::marquee_items();
		$speed = isset($settings['speed']) ? absint($settings['speed']) : 34;
		$separator = $settings['separator'] ?? '✦';
		$pause = 'yes' === ($settings['pause_on_hover'] ?? 'yes');
		$classes = 'sh-marquee';
		if ($pause) {
			$classes .= ' lyr-marquee--pause';
		}
		?>
		<div class="<?php echo esc_attr($classes); ?>" style="<?php echo esc_attr('--lyr-marquee-speed:' . $speed . 's'); ?>">
			<?php for ($copy = 0; $copy < 2; $copy++) : ?>
				<div class="sh-marquee__track" <?php echo $copy ? 'aria-hidden="true"' : ''; ?>>
					<?php foreach ($items as $item) : ?>
						<span><?php echo esc_html($item['text'] ?? ''); ?></span><i aria-hidden="true"><?php echo esc_html($separator); ?></i>
					<?php endforeach; ?>
				</div>
			<?php endfor; ?>
		</div>
		<?php
	}
}
