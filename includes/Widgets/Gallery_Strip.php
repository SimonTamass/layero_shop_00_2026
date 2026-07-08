<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Gallery_Strip extends Base_Widget {
	public function get_name() {
		return 'layero_gallery_strip';
	}

	public function get_title() {
		return __('Layero galéria csík', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-gallery-justified';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Képek', 'layero-shop-ui')));
		$repeater = new Repeater();
		$repeater->add_control('image', array('label' => __('Kép', 'layero-shop-ui'), 'type' => Controls_Manager::MEDIA));
		$repeater->add_control('alt', array('label' => __('Alt szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('url', array('label' => __('Link', 'layero-shop-ui'), 'type' => Controls_Manager::URL));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ alt }}}',
			'default' => Shop_Content::gallery_items(),
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_responsive_control('image_height', array(
			'label' => __('Kép magasság', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px', 'vh'),
			'range' => array(
				'px' => array('min' => 100, 'max' => 600),
				'vh' => array('min' => 10, 'max' => 60),
			),
			'selectors' => array(
				'{{WRAPPER}} .lyr-gallery-strip img' => 'height: {{SIZE}}{{UNIT}};',
			),
		));
		$this->add_control('image_gap', array(
			'label' => __('Rés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px'),
			'range' => array('px' => array('min' => 0, 'max' => 24)),
			'selectors' => array(
				'{{WRAPPER}} .lyr-gallery-strip' => 'gap: {{SIZE}}{{UNIT}};',
			),
		));
		$this->add_control('hover_zoom', array(
			'label' => __('Hover nagyítás', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::gallery_items();
		$hover_class = 'yes' === ($settings['hover_zoom'] ?? 'yes') ? ' lyr-gallery-strip--hover' : '';
		?>
		<section class="lyr-gallery-strip<?php echo esc_attr($hover_class); ?>" aria-label="<?php esc_attr_e('Válogatás a munkáinkból', 'layero-shop-ui'); ?>">
			<?php foreach ($items as $item) : ?>
				<?php $image = $item['image']['url'] ?? ''; ?>
				<?php if ($image) : ?>
					<a href="<?php echo esc_url($this->get_link_url($item['url'] ?? array())); ?>">
						<img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($item['alt'] ?? ''); ?>" loading="lazy">
					</a>
				<?php endif; ?>
			<?php endforeach; ?>
		</section>
		<?php
	}
}
