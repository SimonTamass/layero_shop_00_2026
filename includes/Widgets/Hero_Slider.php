<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Hero_Slider extends Base_Widget {
	public function get_name() {
		return 'layero_hero_slider';
	}

	public function get_title() {
		return __('Layero főoldali slider', 'layero-shop-ui');
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
			'label' => __('Cím', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Ajándék, ami <em>rólad</em> szól.',
		));
		$repeater->add_control('text', array(
			'label' => __('Leírás', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXTAREA,
			'default' => 'Világító lámpák, kulcstartók és dekorációk - névvel, logóval, egyedi 3D gyártásban.',
		));
		$repeater->add_control('image', array(
			'label' => __('Kép', 'layero-shop-ui'),
			'type' => Controls_Manager::MEDIA,
		));
		$repeater->add_control('button_text', array(
			'label' => __('Gomb szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Vásárlás most',
		));
		$repeater->add_control('button_url', array(
			'label' => __('Gomb link', 'layero-shop-ui'),
			'type' => Controls_Manager::URL,
		));
		$repeater->add_control('secondary_text', array(
			'label' => __('Másodlagos link szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
		));
		$repeater->add_control('secondary_url', array(
			'label' => __('Másodlagos link', 'layero-shop-ui'),
			'type' => Controls_Manager::URL,
		));

		$this->add_control('slides', array(
			'label' => __('Slide lista', 'layero-shop-ui'),
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ title }}}',
			'default' => Shop_Content::hero_slides(),
		));

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$slides = ! empty($settings['slides']) ? $settings['slides'] : Shop_Content::hero_slides();
		?>
		<section class="lyr-hero" data-layero-slider>
			<div class="lyr-hero__slides">
				<?php foreach ($slides as $index => $slide) : ?>
					<?php $image_url = $slide['image']['url'] ?? ''; ?>
					<article class="lyr-hero__slide <?php echo 0 === $index ? 'is-active' : ''; ?>">
						<?php if ($image_url) : ?>
							<img src="<?php echo esc_url($image_url); ?>" alt="">
						<?php endif; ?>
						<div class="lyr-hero__copy">
							<?php if (! empty($slide['eyebrow'])) : ?>
								<span><?php echo esc_html($slide['eyebrow']); ?></span>
							<?php endif; ?>
							<h1><?php echo wp_kses($slide['title'] ?? '', array('em' => array())); ?></h1>
							<p><?php echo esc_html($slide['text'] ?? ''); ?></p>
							<div class="lyr-hero__cta">
								<?php if (! empty($slide['button_text'])) : ?>
									<a class="lyr-btn lyr-btn--white" href="<?php echo esc_url($slide['button_url']['url'] ?? '#'); ?>"><?php echo esc_html($slide['button_text']); ?></a>
								<?php endif; ?>
								<?php if (! empty($slide['secondary_text'])) : ?>
									<a class="lyr-link--light" href="<?php echo esc_url($slide['secondary_url']['url'] ?? '#'); ?>"><?php echo esc_html($slide['secondary_text']); ?> &rsaquo;</a>
								<?php endif; ?>
							</div>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
			<button class="lyr-hero__nav lyr-hero__nav--prev" type="button" aria-label="<?php esc_attr_e('Előző', 'layero-shop-ui'); ?>">&lsaquo;</button>
			<button class="lyr-hero__nav lyr-hero__nav--next" type="button" aria-label="<?php esc_attr_e('Következő', 'layero-shop-ui'); ?>">&rsaquo;</button>
			<div class="lyr-hero__dots"></div>
		</section>
		<?php
	}
}
