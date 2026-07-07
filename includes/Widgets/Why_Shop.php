<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Why_Shop extends Base_Widget {
	public function get_name() {
		return 'layero_why_shop';
	}

	public function get_title() {
		return __('Layero Shop bizalom ikonok', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-info-circle';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array('title' => 'Miért a Layero Shopban vásárolj?'));
		$repeater = new Repeater();
		$repeater->add_control('icon', array(
			'label' => __('Ikon', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'crown',
			'options' => array(
				'crown' => __('Korona', 'layero-shop-ui'),
				'shield' => __('Pajzs', 'layero-shop-ui'),
				'clock' => __('Óra', 'layero-shop-ui'),
				'headset' => __('Ügyfélszolgálat', 'layero-shop-ui'),
				'bolt' => __('Villám', 'layero-shop-ui'),
			),
		));
		$repeater->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ title }}}',
			'default' => Shop_Content::why_shop_items(),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::why_shop_items();
		?>
		<section class="lyr-section lyr-why-shop">
			<?php $this->render_section_header($settings); ?>
			<div class="lyr-why-shop__grid">
				<?php foreach ($items as $item) : ?>
					<article>
						<?php echo Helpers::icon($item['icon'] ?? 'check'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<p><b><?php echo esc_html($item['title'] ?? ''); ?></b> <?php echo esc_html($item['text'] ?? ''); ?></p>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}
}
