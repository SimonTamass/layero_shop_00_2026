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
		);

		return isset($icons[$name]) ? $icons[$name] : $icons['bolt'];
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

		if (! empty($settings['on_sale'])) {
			$args['include'] = wc_get_product_ids_on_sale();
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

		return wc_placeholder_img($size);
	}

	public static function product_card($product) {
		if (! $product) {
			return '';
		}

		$link = get_permalink($product->get_id());
		$cat_names = wc_get_product_category_list($product->get_id(), ', ');
		$classes = implode(' ', array_map('sanitize_html_class', wc_get_product_class('lyr-product-card', $product)));
		$is_simple_ajax = $product->supports('ajax_add_to_cart') && $product->is_purchasable() && $product->is_in_stock();

		ob_start();
		?>
		<article class="<?php echo esc_attr($classes); ?>">
			<a class="lyr-product-card__media" href="<?php echo esc_url($link); ?>">
				<?php if ($product->is_on_sale()) : ?>
					<span class="lyr-badge lyr-badge--sale"><?php echo esc_html__('Akcio', 'layero-shop-ui'); ?></span>
				<?php endif; ?>
				<?php echo self::product_image($product); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<div class="lyr-product-card__body">
				<?php if ($cat_names) : ?>
					<div class="lyr-product-card__cat"><?php echo wp_kses_post($cat_names); ?></div>
				<?php endif; ?>
				<h3><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($product->get_name()); ?></a></h3>
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
				><?php echo self::icon('cart'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php echo esc_html($product->add_to_cart_text()); ?></span></a>
			</div>
		</article>
		<?php
		return ob_get_clean();
	}

	public static function demo_product_card($product) {
		if (empty($product)) {
			return '';
		}

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
				<p><?php echo esc_html($product['description']); ?></p>
				<div class="lyr-product-card__price">
					<?php if (! empty($product['regular_price']) && $product['regular_price'] > $product['price']) : ?>
						<del><?php echo esc_html(number_format_i18n($product['regular_price'], 0) . ' RON'); ?></del>
					<?php endif; ?>
					<?php echo esc_html($price); ?>
				</div>
				<a class="lyr-btn lyr-btn--primary lyr-product-card__add" href="<?php echo esc_url($link); ?>">
					<?php echo self::icon('cart'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span><?php echo esc_html__('Megnézem', 'layero-shop-ui'); ?></span>
				</a>
			</div>
		</article>
		<?php
		return ob_get_clean();
	}

	public static function category_card($term) {
		if (! $term || is_wp_error($term)) {
			return '';
		}

		$thumbnail_id = get_term_meta($term->term_id, 'thumbnail_id', true);
		$image = $thumbnail_id ? wp_get_attachment_image($thumbnail_id, 'large', false, array('loading' => 'lazy')) : '';
		$fallback = Shop_Content::category_by_slug($term->slug);
		$link = get_term_link($term);

		ob_start();
		?>
		<a class="lyr-category-card" href="<?php echo esc_url($link); ?>">
			<figure>
				<?php if ($image) : ?>
					<?php echo $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php elseif ($fallback) : ?>
					<img src="<?php echo esc_url(Shop_Content::asset_url($fallback['image'])); ?>" alt="<?php echo esc_attr($term->name); ?>" loading="lazy">
				<?php else : ?>
					<?php echo wc_placeholder_img('large'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endif; ?>
			</figure>
			<span><?php echo esc_html($term->count); ?> <?php echo esc_html__('termék', 'layero-shop-ui'); ?></span>
			<strong><?php echo esc_html($term->name); ?></strong>
		</a>
		<?php
		return ob_get_clean();
	}

	public static function demo_category_card($category, $large = false) {
		$link = home_url('/product-category/' . $category['id'] . '/');

		ob_start();
		?>
		<a class="lyr-category-card <?php echo $large ? 'lyr-category-card--hero' : ''; ?>" href="<?php echo esc_url($link); ?>">
			<figure>
				<img src="<?php echo esc_url(Shop_Content::asset_url($category['image'])); ?>" alt="<?php echo esc_attr($category['name']); ?>" loading="lazy">
			</figure>
			<span><?php echo esc_html($category['description']); ?> · <?php echo esc_html($category['count']); ?> <?php echo esc_html__('termék', 'layero-shop-ui'); ?></span>
			<strong><?php echo esc_html($category['name']); ?></strong>
		</a>
		<?php
		return ob_get_clean();
	}
}
