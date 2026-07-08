<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Testimonials extends Base_Widget {
	public function get_name() {
		return 'layero_testimonials';
	}

	public function get_title() {
		return __('Layero vélemények', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-testimonial';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'title' => 'Vásárlóink mondták. <span>1000+ elégedett vásárló.</span>',
		));
		$this->add_heading_tag_control();
		$repeater = new Repeater();
		$repeater->add_control('stars', array('label' => __('Csillag', 'layero-shop-ui'), 'type' => Controls_Manager::NUMBER, 'default' => 5, 'min' => 1, 'max' => 5));
		$repeater->add_control('quote', array('label' => __('Vélemény', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA));
		$repeater->add_control('name', array('label' => __('Név', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('meta', array('label' => __('Termék / meta', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('items', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ name }}}',
			'default' => Shop_Content::testimonials(),
		));
		$this->end_controls_section();

		$this->add_section_header_style_controls();

		$this->start_controls_section('cards_style', array(
			'label' => __('Kártyák', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_responsive_control('columns', array(
			'label' => __('Oszlopok', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => '3',
			'tablet_default' => '2',
			'mobile_default' => '1',
			'options' => array('1' => '1', '2' => '2', '3' => '3', '4' => '4'),
			'selectors' => array(
				'{{WRAPPER}} .sh-reviews' => 'grid-template-columns: repeat({{VALUE}}, 1fr);',
			),
		));
		$this->add_control('star_color', array(
			'label' => __('Csillag szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-review__stars' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('card_bg', array(
			'label' => __('Kártya háttér', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-review' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('card_radius', array(
			'label' => __('Kártya lekerekítés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px'),
			'range' => array('px' => array('min' => 0, 'max' => 30)),
			'selectors' => array(
				'{{WRAPPER}} .sh-review' => 'border-radius: {{SIZE}}{{UNIT}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::testimonials();
		?>
		<section class="sh-band sh-band--tight sh-band--gray lyr-testimonials">
			<div class="shop-wrap">
			<?php $this->render_section_header($settings); ?>
			<div class="sh-reviews lyr-testimonials__grid">
				<?php foreach ($items as $item) : ?>
					<article class="sh-review sh-reveal lyr-testimonial">
						<div class="sh-review__stars lyr-testimonial__stars" aria-label="<?php echo esc_attr(absint($item['stars'] ?? 5) . ' csillag'); ?>"><?php echo esc_html(Helpers::star_rating($item['stars'] ?? 5)); ?></div>
						<p><?php echo esc_html($item['quote'] ?? ''); ?></p>
						<footer><strong><?php echo esc_html($item['name'] ?? ''); ?></strong><span><?php echo esc_html($item['meta'] ?? ''); ?></span></footer>
					</article>
				<?php endforeach; ?>
			</div>
			</div>
		</section>
		<?php
	}
}
