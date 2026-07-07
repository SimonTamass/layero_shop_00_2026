<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Footnotes extends Base_Widget {
	public function get_name() {
		return 'layero_footnotes';
	}

	public function get_title() {
		return __('Layero lábjegyzetek', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-editor-list-ol';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Lábjegyzetek', 'layero-shop-ui')));
		$repeater = new Repeater();
		$repeater->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ text }}}',
			'default' => Shop_Content::footnotes(),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::footnotes();
		?>
		<div class="lyr-footnotes">
			<?php foreach ($items as $index => $item) : ?>
				<p><sup><?php echo esc_html($index + 1); ?></sup> <?php echo esc_html($item['text'] ?? ''); ?></p>
			<?php endforeach; ?>
		</div>
		<?php
	}
}
