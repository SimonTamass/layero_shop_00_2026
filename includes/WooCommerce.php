<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class WooCommerce {
	private static $instance = null;

	public static function instance() {
		if (null === self::$instance) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action('woocommerce_before_add_to_cart_button', array($this, 'render_personalization_fields'));
		add_filter('woocommerce_add_cart_item_data', array($this, 'add_cart_item_data'), 10, 3);
		add_filter('woocommerce_get_item_data', array($this, 'display_cart_item_data'), 10, 2);
		add_action('woocommerce_checkout_create_order_line_item', array($this, 'add_order_item_meta'), 10, 4);
		add_shortcode('layero_mini_cart', array($this, 'mini_cart_shortcode'));
	}

	public function render_personalization_fields() {
		if (! apply_filters('layero_shop_ui_show_personalization_fields', true, get_the_ID())) {
			return;
		}
		?>
		<div class="lyr-personalization" data-layero-personalization>
			<label for="layero_personalization_text"><?php echo esc_html__('Felirat / nev', 'layero-shop-ui'); ?></label>
			<input id="layero_personalization_text" name="layero_personalization_text" type="text" maxlength="40" placeholder="<?php echo esc_attr__('pl. Oliver', 'layero-shop-ui'); ?>">
			<label for="layero_personalization_note"><?php echo esc_html__('Egyedi megjegyzes', 'layero-shop-ui'); ?></label>
			<textarea id="layero_personalization_note" name="layero_personalization_note" rows="3" placeholder="<?php echo esc_attr__('Szinek, alkalom, referencia vagy extra keres...', 'layero-shop-ui'); ?>"></textarea>
			<p><?php echo esc_html__('A pontos elhelyezest gyartas elott egyeztetjuk.', 'layero-shop-ui'); ?></p>
		</div>
		<?php
	}

	public function add_cart_item_data($cart_item_data, $product_id, $variation_id) {
		$text = isset($_POST['layero_personalization_text']) ? sanitize_text_field(wp_unslash($_POST['layero_personalization_text'])) : '';
		$note = isset($_POST['layero_personalization_note']) ? sanitize_textarea_field(wp_unslash($_POST['layero_personalization_note'])) : '';

		if ($text || $note) {
			$cart_item_data['layero_personalization'] = array(
				'text' => $text,
				'note' => $note,
			);
			$cart_item_data['layero_unique_key'] = md5($product_id . '|' . $variation_id . '|' . $text . '|' . $note . '|' . microtime());
		}

		return $cart_item_data;
	}

	public function display_cart_item_data($item_data, $cart_item) {
		if (empty($cart_item['layero_personalization'])) {
			return $item_data;
		}

		$data = $cart_item['layero_personalization'];
		if (! empty($data['text'])) {
			$item_data[] = array(
				'name' => __('Felirat / nev', 'layero-shop-ui'),
				'value' => esc_html($data['text']),
			);
		}
		if (! empty($data['note'])) {
			$item_data[] = array(
				'name' => __('Egyedi megjegyzes', 'layero-shop-ui'),
				'value' => esc_html($data['note']),
			);
		}

		return $item_data;
	}

	public function add_order_item_meta($item, $cart_item_key, $values, $order) {
		if (empty($values['layero_personalization'])) {
			return;
		}

		$data = $values['layero_personalization'];
		if (! empty($data['text'])) {
			$item->add_meta_data(__('Felirat / nev', 'layero-shop-ui'), $data['text'], true);
		}
		if (! empty($data['note'])) {
			$item->add_meta_data(__('Egyedi megjegyzes', 'layero-shop-ui'), $data['note'], true);
		}
	}

	public function mini_cart_shortcode() {
		if (! function_exists('woocommerce_mini_cart')) {
			return '';
		}

		ob_start();
		?>
		<div class="lyr-mini-cart">
			<button class="lyr-mini-cart__toggle" type="button" data-layero-cart-toggle>
				<?php echo Helpers::icon('cart'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span><?php echo esc_html__('Kosar', 'layero-shop-ui'); ?></span>
				<b><?php echo esc_html(WC()->cart ? WC()->cart->get_cart_contents_count() : 0); ?></b>
			</button>
			<div class="lyr-mini-cart__panel" data-layero-cart-panel hidden>
				<?php woocommerce_mini_cart(); ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}

