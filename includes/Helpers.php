<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Helpers {
	public static function is_woo_active() {
		return class_exists('WooCommerce') && function_exists('wc_get_products');
	}

	public static function icon($name) {
		$icons = array(
			'cart' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1.3 10.5a1.5 1.5 0 0 1-1.5 1.7H6.2a1.5 1.5 0 0 1-1.5-1.7L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
			'truck' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h8A1.5 1.5 0 0 1 14 6.5V16H3V6.5Z"/><path d="M14 9h3.6a1.5 1.5 0 0 1 1.3.8L21 13.5V16h-7V9Z"/><circle cx="6.5" cy="18" r="1.9"/><circle cx="17.5" cy="18" r="1.9"/></svg>',
			'shield' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
			'bolt' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
			'leaf' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20.5A7.5 7.5 0 0 1 3.5 13C3.5 7.5 8 3.5 20.5 3.5c0 8.5-4.5 12.5-9.5 12.5Z"/><path d="M3.5 20.5c3-4.5 6.5-7 11-8"/></svg>',
			'tag' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.6 12.4 11 5a1.8 1.8 0 0 1 1.3-.5H18a1.5 1.5 0 0 1 1.5 1.5v5.7a1.8 1.8 0 0 1-.5 1.3l-7.4 7.4a1.8 1.8 0 0 1-2.5 0l-5-5a1.8 1.8 0 0 1 0-2.5Z"/><circle cx="15.3" cy="8.7" r="1.15" fill="currentColor" stroke="none"/></svg>',
			'question' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9.5"/></svg>',
			'crown' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5 7 11l5-6 5 6 3.5-2.5-1.6 9a1.5 1.5 0 0 1-1.48 1.24H6.58A1.5 1.5 0 0 1 5.1 17.5L3.5 8.5Z"/><path d="m9.5 14.5 1.8 1.8 3.2-3.6"/></svg>',
			'clock' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.2-8.3L3 7"/><path d="M12 8.5V12l2.5 2"/></svg>',
			'headset' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v3.5A1.5 1.5 0 0 0 5.5 18H7v-6H5.5A1.5 1.5 0 0 0 4 13.5"/><path d="M20 13v3.5a1.5 1.5 0 0 1-1.5 1.5H17v-6h1.5a1.5 1.5 0 0 1 1.5 1.5"/><path d="M18 18v1a2 2 0 0 1-2 2h-3"/></svg>',
			'check' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
			'mail' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5h15v11h-15z"/><path d="m5 7 7 6 7-6"/></svg>',
			'spark' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="M19 15l.8 2.8L22.5 19l-2.7.8L19 22.5l-.8-2.7-2.7-.8 2.7-.8L19 15Z"/></svg>',
		);

		return isset($icons[$name]) ? $icons[$name] : $icons['spark'];
	}

	public static function query_products($settings = array()) {
		if (! self::is_woo_active()) {
			return array();
		}

		$limit = isset($settings['limit']) ? absint($settings['limit']) : 8;
		$args = array(
			'limit' => $limit ? $limit : 8,
			'status' => 'publish',
			'orderby' => isset($settings['orderby']) ? sanitize_key($settings['orderby']) : 'date',
			'order' => isset($settings['order']) ? sanitize_key($settings['order']) : 'DESC',
		);

		if (! empty($settings['category'])) {
			$args['category'] = array(sanitize_title($settings['category']));
		}

		if (! empty($settings['featured'])) {
			$args['featured'] = true;
		}

		if (! empty($settings['product_ids'])) {
			$ids = self::normalize_ids($settings['product_ids']);
			if (! empty($ids)) {
				$args['include'] = $ids;
				$args['orderby'] = 'include';
			}
		}

		if (! empty($settings['on_sale'])) {
			$sale_ids = wc_get_product_ids_on_sale();
			if (empty($sale_ids)) {
				return array();
			}

			$args['include'] = ! empty($args['include']) ? array_values(array_intersect($args['include'], $sale_ids)) : $sale_ids;
			if (empty($args['include'])) {
				return array();
			}
		}

		return wc_get_products($args);
	}

	public static function product_image($product, $size = 'woocommerce_thumbnail') {
		if (! $product) {
			return '';
		}

		$image_id = $product->get_image_id();
		if ($image_id) {
			return wp_get_attachment_image($image_id, $size, false, array('loading' => 'lazy'));
		}

		return function_exists('wc_placeholder_img') ? wc_placeholder_img($size) : '';
	}

	public static function product_card($product, $args = array()) {
		if (! $product) {
			return '';
		}

		$args = wp_parse_args(
			$args,
			array(
				'show_excerpt' => false,
				'button_text' => '',
				'image_size' => 'woocommerce_thumbnail',
			)
		);

		$link = get_permalink($product->get_id());
		$cat_names = function_exists('wc_get_product_category_list') ? wc_get_product_category_list($product->get_id(), ', ') : '';
		$classes = implode(' ', array_map('sanitize_html_class', wc_get_product_class('lyr-product-card', $product)));
		$is_simple_ajax = $product->supports('ajax_add_to_cart') && $product->is_purchasable() && $product->is_in_stock();
		$button_text = $args['button_text'] ? $args['button_text'] : $product->add_to_cart_text();
		$excerpt = wp_trim_words(wp_strip_all_tags($product->get_short_description() ?: $product->get_description()), 18);

		ob_start();
		?>
		<article class="<?php echo esc_attr($classes); ?>">
			<a class="lyr-product-card__media" href="<?php echo esc_url($link); ?>">
				<?php if ($product->is_on_sale()) : ?>
					<span class="lyr-badge lyr-badge--sale"><?php echo esc_html__('Akció', 'layero-shop-ui'); ?></span>
				<?php elseif ($product->is_featured()) : ?>
					<span class="lyr-badge"><?php echo esc_html__('Kiemelt', 'layero-shop-ui'); ?></span>
				<?php endif; ?>
				<?php echo self::product_image($product, $args['image_size']); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<div class="lyr-product-card__body">
				<?php if ($cat_names) : ?>
					<div class="lyr-product-card__cat"><?php echo wp_kses_post($cat_names); ?></div>
				<?php endif; ?>
				<h3><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($product->get_name()); ?></a></h3>
				<?php if ($args['show_excerpt'] && $excerpt) : ?>
					<p><?php echo esc_html($excerpt); ?></p>
				<?php endif; ?>
				<?php if (function_exists('wc_get_rating_html')) : ?>
					<div class="lyr-product-card__rating"><?php echo wc_get_rating_html($product->get_average_rating()); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
				<?php endif; ?>
				<div class="lyr-product-card__price"><?php echo wp_kses_post($product->get_price_html()); ?></div>
				<a
					href="<?php echo esc_url($product->add_to_cart_url()); ?>"
					data-quantity="1"
					data-product_id="<?php echo esc_attr($product->get_id()); ?>"
					data-product_sku="<?php echo esc_attr($product->get_sku()); ?>"
					class="lyr-btn lyr-btn--primary lyr-product-card__add <?php echo $is_simple_ajax ? 'ajax_add_to_cart add_to_cart_button' : ''; ?>"
					aria-label="<?php echo esc_attr($product->add_to_cart_description()); ?>"
					rel="nofollow"
				><?php echo self::icon('cart'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php echo esc_html($button_text); ?></span></a>
			</div>
		</article>
		<?php
		return ob_get_clean();
	}

	public static function demo_product_card($product, $args = array()) {
		if (empty($product)) {
			return '';
		}

		$args = wp_parse_args(
			$args,
			array(
				'show_excerpt' => true,
				'button_text' => __('Megnézem', 'layero-shop-ui'),
			)
		);

		$category = Shop_Content::category_by_slug($product['category']);
		$link = home_url('/product/' . $product['id'] . '/');
		$category_link = home_url('/product-category/' . $product['category'] . '/');
		$price = ! empty($product['price']) ? number_format_i18n($product['price'], 0) . ' RON' : __('Ajánlatkérés', 'layero-shop-ui');

		ob_start();
		?>
		<article class="lyr-product-card lyr-product-card--demo">
			<a class="lyr-product-card__media" href="<?php echo esc_url($link); ?>">
				<?php if (! empty($product['badge'])) : ?>
					<span class="lyr-badge"><?php echo esc_html($product['badge']); ?></span>
				<?php endif; ?>
				<img src="<?php echo esc_url(Shop_Content::asset_url($product['image'])); ?>" alt="<?php echo esc_attr($product['name']); ?>" loading="lazy">
			</a>
			<div class="lyr-product-card__body">
				<?php if ($category) : ?>
					<div class="lyr-product-card__cat"><a href="<?php echo esc_url($category_link); ?>"><?php echo esc_html($category['name']); ?></a></div>
				<?php endif; ?>
				<h3><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($product['name']); ?></a></h3>
				<?php if ($args['show_excerpt']) : ?>
					<p><?php echo esc_html($product['description']); ?></p>
				<?php endif; ?>
				<div class="lyr-product-card__price">
					<?php if (! empty($product['regular_price']) && $product['regular_price'] > $product['price']) : ?>
						<del><?php echo esc_html(number_format_i18n($product['regular_price'], 0) . ' RON'); ?></del>
					<?php endif; ?>
					<?php echo esc_html($price); ?>
				</div>
				<a class="lyr-btn lyr-btn--primary lyr-product-card__add" href="<?php echo esc_url($link); ?>">
					<?php echo self::icon('cart'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span><?php echo esc_html($args['button_text']); ?></span>
				</a>
			</div>
		</article>
		<?php
		return ob_get_clean();
	}

	public static function category_card($term, $large = false, $show_count = true) {
		if (! $term || is_wp_error($term)) {
			return '';
		}

		$thumbnail_id = get_term_meta($term->term_id, 'thumbnail_id', true);
		$image = $thumbnail_id ? wp_get_attachment_image($thumbnail_id, 'large', false, array('loading' => 'lazy')) : '';
		$fallback = Shop_Content::category_by_slug($term->slug);
		$link = get_term_link($term);
		$link = is_wp_error($link) ? '#' : $link;
		$description = $term->description ? $term->description : ($fallback ? $fallback['description'] : '');

		ob_start();
		?>
		<a class="lyr-category-card <?php echo $large ? 'lyr-category-card--hero' : ''; ?>" href="<?php echo esc_url($link); ?>">
			<figure>
				<?php if ($image) : ?>
					<?php echo $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php elseif ($fallback) : ?>
					<img src="<?php echo esc_url(Shop_Content::asset_url($fallback['image'])); ?>" alt="<?php echo esc_attr($term->name); ?>" loading="lazy">
				<?php elseif (function_exists('wc_placeholder_img')) : ?>
					<?php echo wc_placeholder_img('large'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endif; ?>
			</figure>
			<span>
				<?php echo esc_html($description); ?>
				<?php if ($show_count) : ?>
					<?php echo $description ? ' · ' : ''; ?><?php echo esc_html($term->count); ?> <?php echo esc_html__('termék', 'layero-shop-ui'); ?>
				<?php endif; ?>
			</span>
			<strong><?php echo esc_html($term->name); ?></strong>
		</a>
		<?php
		return ob_get_clean();
	}

	public static function demo_category_card($category, $large = false, $show_count = true) {
		$link = home_url('/product-category/' . $category['id'] . '/');

		ob_start();
		?>
		<a class="lyr-category-card <?php echo $large ? 'lyr-category-card--hero' : ''; ?>" href="<?php echo esc_url($link); ?>">
			<figure>
				<img src="<?php echo esc_url(Shop_Content::asset_url($category['image'])); ?>" alt="<?php echo esc_attr($category['name']); ?>" loading="lazy">
			</figure>
			<span>
				<?php echo esc_html($category['description']); ?>
				<?php if ($show_count) : ?>
					· <?php echo esc_html($category['count']); ?> <?php echo esc_html__('termék', 'layero-shop-ui'); ?>
				<?php endif; ?>
			</span>
			<strong><?php echo esc_html($category['name']); ?></strong>
		</a>
		<?php
		return ob_get_clean();
	}

	public static function star_rating($stars) {
		$stars = max(1, min(5, absint($stars)));

		return str_repeat('★', $stars) . str_repeat('☆', 5 - $stars);
	}

	private static function normalize_ids($value) {
		if (is_string($value)) {
			$value = explode(',', $value);
		}

		return array_values(
			array_filter(
				array_map(
					'absint',
					(array) $value
				)
			)
		);
	}
}
