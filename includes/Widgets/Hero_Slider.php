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
			'label' => __('Fő gomb szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Vásárlás most',
		));
		$repeater->add_control('button_url', array(
			'label' => __('Fő gomb link', 'layero-shop-ui'),
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

		$this->start_controls_section('settings_section', array('label' => __('Működés', 'layero-shop-ui')));
		$this->add_control('show_arrows', array(
			'label' => __('Nyilak megjelenítése', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->add_control('show_dots', array(
			'label' => __('Pont navigáció', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->add_control('autoplay_speed', array(
			'label' => __('Automatikus váltás (ms)', 'layero-shop-ui'),
			'type' => Controls_Manager::NUMBER,
			'default' => 6500,
			'min' => 0,
			'step' => 500,
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_responsive_control('min_height', array(
			'label' => __('Minimum magasság', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px', 'vh'),
			'range' => array(
				'px' => array('min' => 200, 'max' => 1000),
				'vh' => array('min' => 20, 'max' => 100),
			),
			'selectors' => array(
				'{{WRAPPER}} .lyr-hero' => 'min-height: {{SIZE}}{{UNIT}};',
			),
		));
		$this->add_control('overlay_color', array(
			'label' => __('Overlay szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-hero__slide::after' => 'background: {{VALUE}};',
			),
		));
		$this->add_responsive_control('content_align', array(
			'label' => __('Tartalom igazítás', 'layero-shop-ui'),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'left' => array('title' => __('Balra', 'layero-shop-ui'), 'icon' => 'eicon-text-align-left'),
				'center' => array('title' => __('Középre', 'layero-shop-ui'), 'icon' => 'eicon-text-align-center'),
				'right' => array('title' => __('Jobbra', 'layero-shop-ui'), 'icon' => 'eicon-text-align-right'),
			),
			'selectors' => array(
				'{{WRAPPER}} .lyr-hero__copy' => 'text-align: {{VALUE}};',
			),
		));
		$this->add_control('title_tag', array(
			'label' => __('Cím HTML tag', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => 'h2',
			'options' => array('h1' => 'H1', 'h2' => 'H2', 'h3' => 'H3'),
			'separator' => 'before',
		));
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			array(
				'name' => 'title_typography',
				'label' => __('Cím tipográfia', 'layero-shop-ui'),
				'selector' => '{{WRAPPER}} .lyr-hero__copy h1, {{WRAPPER}} .lyr-hero__copy h2, {{WRAPPER}} .lyr-hero__copy h3',
			)
		);
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$slides = ! empty($settings['slides']) ? $settings['slides'] : Shop_Content::hero_slides();
		$speed = isset($settings['autoplay_speed']) ? absint($settings['autoplay_speed']) : 6500;
		$title_tag = $settings['title_tag'] ?? 'h2';
		if (! in_array($title_tag, array('h1', 'h2', 'h3'), true)) {
			$title_tag = 'h2';
		}
		?>
		<section class="sh-slider" id="sh-slider" aria-label="<?php esc_attr_e('Kiemelt ajánlatok', 'layero-shop-ui'); ?>">
				<?php foreach ($slides as $index => $slide) : ?>
					<?php $image_url = $slide['image']['url'] ?? ''; ?>
					<article class="sh-slide <?php echo 0 === $index ? 'is-on' : ''; ?>">
						<?php if ($image_url) : ?>
							<div class="sh-slide__media"><img src="<?php echo esc_url($image_url); ?>" alt="" loading="<?php echo 0 === $index ? 'eager' : 'lazy'; ?>"></div>
						<?php endif; ?>
						<div class="sh-slide__copy">
							<?php if (! empty($slide['eyebrow'])) : ?>
								<span class="sh-slide__eyebrow"><?php echo esc_html($slide['eyebrow']); ?></span>
							<?php endif; ?>
							<<?php echo esc_html($title_tag); ?>><?php echo wp_kses($slide['title'] ?? '', array('em' => array(), 'br' => array())); ?></<?php echo esc_html($title_tag); ?>>
							<?php if (! empty($slide['text'])) : ?>
								<p><?php echo esc_html($slide['text']); ?></p>
							<?php endif; ?>
							<div class="sh-slide__cta">
								<?php if (! empty($slide['button_text'])) : ?>
									<a class="sh-btn sh-btn--white" href="<?php echo esc_url($this->get_link_url($slide['button_url'] ?? array())); ?>"><?php echo esc_html($slide['button_text']); ?></a>
								<?php endif; ?>
								<?php if (! empty($slide['secondary_text'])) : ?>
									<a class="sh-link--light" href="<?php echo esc_url($this->get_link_url($slide['secondary_url'] ?? array())); ?>"><?php echo esc_html($slide['secondary_text']); ?> &rsaquo;</a>
								<?php endif; ?>
							</div>
						</div>
					</article>
				<?php endforeach; ?>
			<?php if ('yes' === ($settings['show_arrows'] ?? 'yes') && count($slides) > 1) : ?>
				<button class="sh-slider__nav sh-slider__nav--prev" type="button" data-slide-prev aria-label="<?php esc_attr_e('Előző', 'layero-shop-ui'); ?>">&lsaquo;</button>
				<button class="sh-slider__nav sh-slider__nav--next" type="button" data-slide-next aria-label="<?php esc_attr_e('Következő', 'layero-shop-ui'); ?>">&rsaquo;</button>
			<?php endif; ?>
			<?php if ('yes' === ($settings['show_dots'] ?? 'yes') && count($slides) > 1) : ?>
				<div class="sh-slider__dots" id="sh-slider-dots" role="tablist" aria-label="<?php esc_attr_e('Slide választó', 'layero-shop-ui'); ?>"></div>
			<?php endif; ?>
		</section>
		<?php
	}
}
