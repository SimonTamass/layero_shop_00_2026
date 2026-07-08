<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Category_Bento extends Base_Widget {
	public function get_name() {
		return 'layero_category_bento';
	}

	public function get_title() {
		return __('Layero kategóriák', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-gallery-grid';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'eyebrow' => 'Kollekció',
			'title' => 'Vásárlás kategória szerint.',
			'button_text' => 'Összes termék',
			'button_url' => array('url' => '/termekek/'),
		));
		$this->add_heading_tag_control();
		$this->add_control('slugs', array(
			'label' => __('Kategória slugok', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'lampak,kulcstartok,dekoraciok,ceges,rajongoi,egyedi',
			'description' => __('Vesszővel elválasztva. Ezek a jelenlegi statikus shop kategóriái.', 'layero-shop-ui'),
		));
		$this->add_control('highlight_first', array(
			'label' => __('Első kategória nagy kártya', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->add_control('show_count', array(
			'label' => __('Termékszám mutatása', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();

		$this->add_section_header_style_controls();

		$this->start_controls_section('grid_style', array(
			'label' => __('Rács', 'layero-shop-ui'),
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
				'{{WRAPPER}} .sh-cats' => 'grid-template-columns: repeat({{VALUE}}, 1fr);',
			),
		));
		$this->add_responsive_control('gap', array(
			'label' => __('Rés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px', 'rem'),
			'range' => array('px' => array('min' => 0, 'max' => 60)),
			'selectors' => array(
				'{{WRAPPER}} .sh-cats' => 'gap: {{SIZE}}{{UNIT}};',
			),
		));
		$this->add_control('card_radius', array(
			'label' => __('Kártya lekerekítés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px'),
			'range' => array('px' => array('min' => 0, 'max' => 30)),
			'selectors' => array(
				'{{WRAPPER}} .sh-bento' => 'border-radius: {{SIZE}}{{UNIT}};',
			),
		));
		$this->add_control('overlay_color', array(
			'label' => __('Overlay szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-bento::after' => 'background: {{VALUE}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$slugs = ! empty($settings['slugs']) ? array_map('sanitize_title', array_map('trim', explode(',', $settings['slugs']))) : array();
		$show_count = 'yes' === ($settings['show_count'] ?? 'yes');
		$args = array(
			'taxonomy' => 'product_cat',
			'hide_empty' => true,
		);

		if (! empty($slugs)) {
			$args['slug'] = $slugs;
		}

		$terms = taxonomy_exists('product_cat') ? get_terms($args) : array();
		$has_terms = ! empty($terms) && ! is_wp_error($terms);

		if ($has_terms && ! empty($slugs)) {
			$slug_order = array_flip($slugs);
			usort($terms, function ($a, $b) use ($slug_order) {
				$pos_a = isset($slug_order[$a->slug]) ? $slug_order[$a->slug] : PHP_INT_MAX;
				$pos_b = isset($slug_order[$b->slug]) ? $slug_order[$b->slug] : PHP_INT_MAX;
				return $pos_a - $pos_b;
			});
		}
		?>
		<section class="sh-band sh-band--tight lyr-categories" id="kategoriak">
			<div class="shop-wrap">
				<?php $this->render_section_header($settings); ?>
				<div class="sh-cats lyr-category-grid">
				<?php if ($has_terms) : ?>
					<?php foreach ($terms as $index => $term) : ?>
						<?php echo Helpers::category_card($term, 0 === $index && 'yes' === ($settings['highlight_first'] ?? 'yes'), $show_count); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php else : ?>
					<?php foreach (Shop_Content::categories() as $index => $category) : ?>
						<?php if (empty($slugs) || in_array($category['id'], $slugs, true)) : ?>
							<?php echo Helpers::demo_category_card($category, 0 === $index && 'yes' === ($settings['highlight_first'] ?? 'yes'), $show_count); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php endif; ?>
					<?php endforeach; ?>
				<?php endif; ?>
				</div>
			</div>
		</section>
		<?php
	}
}
