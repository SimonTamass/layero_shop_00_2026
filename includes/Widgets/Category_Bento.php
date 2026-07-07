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
		$this->add_control('title', array(
			'label' => __('Cím', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Vásárlás kategória szerint.',
		));
		$this->add_control('slugs', array(
			'label' => __('Kategória slugok', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'lampak,kulcstartok,dekoraciok,ceges,rajongoi,egyedi',
			'description' => __('Vesszővel elválasztva. Ezek a jelenlegi statikus shop kategóriái.', 'layero-shop-ui'),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$slugs = ! empty($settings['slugs']) ? array_map('sanitize_title', array_map('trim', explode(',', $settings['slugs']))) : array();
		$args = array(
			'taxonomy' => 'product_cat',
			'hide_empty' => true,
		);

		if (! empty($slugs)) {
			$args['slug'] = $slugs;
		}

		$terms = taxonomy_exists('product_cat') ? get_terms($args) : array();
		$has_terms = ! empty($terms) && ! is_wp_error($terms);
		?>
		<section class="lyr-section lyr-categories" id="kategoriak">
			<?php if (! empty($settings['title'])) : ?>
				<div class="lyr-section__head"><h2><?php echo esc_html($settings['title']); ?></h2></div>
			<?php endif; ?>
			<div class="lyr-category-grid">
				<?php if ($has_terms) : ?>
					<?php foreach ($terms as $term) : ?>
						<?php echo Helpers::category_card($term); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php else : ?>
					<?php foreach (Shop_Content::categories() as $index => $category) : ?>
						<?php if (empty($slugs) || in_array($category['id'], $slugs, true)) : ?>
							<?php echo Helpers::demo_category_card($category, 0 === $index); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?php endif; ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}
}
