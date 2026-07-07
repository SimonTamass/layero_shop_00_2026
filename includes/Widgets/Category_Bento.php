<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;

if (! defined('ABSPATH')) {
	exit;
}

class Category_Bento extends Base_Widget {
	public function get_name() {
		return 'layero_category_bento';
	}

	public function get_title() {
		return __('Layero kategoriak', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-gallery-grid';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('title', array(
			'label' => __('Cim', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Vasarlas kategoria szerint',
		));
		$this->add_control('slugs', array(
			'label' => __('Kategoria slugok', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'description' => __('Vesszovel elvalasztva. Uresen: osszes termekkategoria.', 'layero-shop-ui'),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$args = array(
			'taxonomy' => 'product_cat',
			'hide_empty' => true,
		);
		if (! empty($settings['slugs'])) {
			$args['slug'] = array_map('sanitize_title', array_map('trim', explode(',', $settings['slugs'])));
		}
		$terms = taxonomy_exists('product_cat') ? get_terms($args) : array();
		?>
		<section class="lyr-section lyr-categories">
			<?php if (! empty($settings['title'])) : ?>
				<div class="lyr-section__head"><h2><?php echo esc_html($settings['title']); ?></h2></div>
			<?php endif; ?>
			<div class="lyr-category-grid">
				<?php foreach ($terms as $term) : ?>
					<?php echo Helpers::category_card($term); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}
}

