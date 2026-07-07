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
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::marquee_items();
		$speed = isset($settings['speed']) ? absint($settings['speed']) : 34;
		?>
		<div class="lyr-marquee" style="<?php echo esc_attr('--lyr-marquee-speed:' . $speed . 's'); ?>">
			<?php for ($copy = 0; $copy < 2; $copy++) : ?>
				<div class="lyr-marquee__track" <?php echo $copy ? 'aria-hidden="true"' : ''; ?>>
					<?php foreach ($items as $item) : ?>
						<span><?php echo esc_html($item['text'] ?? ''); ?></span><i aria-hidden="true">✦</i>
					<?php endforeach; ?>
				</div>
			<?php endfor; ?>
		</div>
		<?php
	}
}
