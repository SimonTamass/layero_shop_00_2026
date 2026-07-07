<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;

if (! defined('ABSPATH')) {
	exit;
}

class Hero_Slider extends Base_Widget {
	public function get_name() {
		return 'layero_hero_slider';
	}

	public function get_title() {
		return __('Layero hero slider', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-slider-full-screen';
	}

	protected function register_controls() {
		$this->start_controls_section('slides_section', array('label' => __('Slide-ok', 'layero-shop-ui')));

		$repeater = new Repeater();
		$repeater->add_control('eyebrow', array(
			'label' => __('Felirat', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Layero Shop',
		));
		$repeater->add_control('title', array(
			'label' => __('Cim', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Ajandek, ami rolad szol.',
		));
		$repeater->add_control('text', array(
			'label' => __('Leiras', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXTAREA,
			'default' => 'Vilagito lampak, kulcstartok es dekoraciok egyedi 3D gyartasban.',
		));
		$repeater->add_control('image', array(
			'label' => __('Kep', 'layero-shop-ui'),
			'type' => Controls_Manager::MEDIA,
		));
		$repeater->add_control('button_text', array(
			'label' => __('Gomb szoveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Vasarlas most',
		));
		$repeater->add_control('button_url', array(
			'label' => __('Gomb link', 'layero-shop-ui'),
			'type' => Controls_Manager::URL,
		));

		$this->add_control('slides', array(
			'label' => __('Slide lista', 'layero-shop-ui'),
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ title }}}',
			'default' => array(
				array('eyebrow' => 'Layero Shop', 'title' => 'Ajandek, ami rolad szol.', 'text' => 'WooCommerce motorral, Layero designnal.'),
			),
		));

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$slides = ! empty($settings['slides']) ? $settings['slides'] : array();
		?>
		<section class="lyr-hero" data-layero-slider>
			<div class="lyr-hero__slides">
				<?php foreach ($slides as $index => $slide) : ?>
					<article class="lyr-hero__slide <?php echo 0 === $index ? 'is-active' : ''; ?>">
						<?php if (! empty($slide['image']['url'])) : ?>
							<img src="<?php echo esc_url($slide['image']['url']); ?>" alt="">
						<?php endif; ?>
						<div class="lyr-hero__copy">
							<?php if (! empty($slide['eyebrow'])) : ?><span><?php echo esc_html($slide['eyebrow']); ?></span><?php endif; ?>
							<h1><?php echo esc_html($slide['title']); ?></h1>
							<p><?php echo esc_html($slide['text']); ?></p>
							<?php if (! empty($slide['button_text'])) : ?>
								<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url($slide['button_url']['url'] ?? '#'); ?>"><?php echo esc_html($slide['button_text']); ?></a>
							<?php endif; ?>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
			<button class="lyr-hero__nav lyr-hero__nav--prev" type="button" aria-label="<?php esc_attr_e('Elozo', 'layero-shop-ui'); ?>">‹</button>
			<button class="lyr-hero__nav lyr-hero__nav--next" type="button" aria-label="<?php esc_attr_e('Kovetkezo', 'layero-shop-ui'); ?>">›</button>
			<div class="lyr-hero__dots"></div>
		</section>
		<?php
	}
}

