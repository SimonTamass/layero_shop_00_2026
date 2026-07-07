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
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = ! empty($settings['items']) ? $settings['items'] : Shop_Content::testimonials();
		?>
		<section class="lyr-section lyr-testimonials">
			<?php $this->render_section_header($settings); ?>
			<div class="lyr-testimonials__grid">
				<?php foreach ($items as $item) : ?>
					<article class="lyr-testimonial">
						<div class="lyr-testimonial__stars" aria-label="<?php echo esc_attr(absint($item['stars'] ?? 5) . ' csillag'); ?>"><?php echo esc_html(Helpers::star_rating($item['stars'] ?? 5)); ?></div>
						<p><?php echo esc_html($item['quote'] ?? ''); ?></p>
						<footer><strong><?php echo esc_html($item['name'] ?? ''); ?></strong><span><?php echo esc_html($item['meta'] ?? ''); ?></span></footer>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}
}
