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
			<label for="layero_personalization_text"><?php echo esc_html__('Felirat / név', 'layero-shop-ui'); ?></label>
			<input id="layero_personalization_text" name="layero_personalization_text" type="text" maxlength="40" placeholder="<?php echo esc_attr__('pl. Olivér', 'layero-shop-ui'); ?>">
			<div class="lyr-personalization__row">
				<label for="layero_personalization_size"><?php echo esc_html__('Méret', 'layero-shop-ui'); ?></label>
				<select id="layero_personalization_size" name="layero_personalization_size">
					<option value="Közepes"><?php echo esc_html__('Közepes', 'layero-shop-ui'); ?></option>
					<option value="Kicsi"><?php echo esc_html__('Kicsi', 'layero-shop-ui'); ?></option>
					<option value="Nagy"><?php echo esc_html__('Nagy', 'layero-shop-ui'); ?></option>
				</select>
				<label for="layero_personalization_color"><?php echo esc_html__('Szín', 'layero-shop-ui'); ?></label>
				<select id="layero_personalization_color" name="layero_personalization_color">
					<option value="Natúr"><?php echo esc_html__('Natúr', 'layero-shop-ui'); ?></option>
					<option value="Fekete"><?php echo esc_html__('Fekete', 'layero-shop-ui'); ?></option>
					<option value="Fehér"><?php echo esc_html__('Fehér', 'layero-shop-ui'); ?></option>
				</select>
			</div>
			<label for="layero_personalization_note"><?php echo esc_html__('Egyedi megjegyzés', 'layero-shop-ui'); ?></label>
			<textarea id="layero_personalization_note" name="layero_personalization_note" rows="3" placeholder="<?php echo esc_attr__('Színek, alkalom, referencia vagy extra kérés...', 'layero-shop-ui'); ?>"></textarea>
			<p><?php echo esc_html__('Ez csak illusztráció - a pontos elhelyezést a tervezéskor egyeztetjük.', 'layero-shop-ui'); ?></p>
		</div>
		<?php
	}

	public function add_cart_item_data($cart_item_data, $product_id, $variation_id) {
		$text = isset($_POST['layero_personalization_text']) ? sanitize_text_field(wp_unslash($_POST['layero_personalization_text'])) : '';
		$size = isset($_POST['layero_personalization_size']) ? sanitize_text_field(wp_unslash($_POST['layero_personalization_size'])) : '';
		$color = isset($_POST['layero_personalization_color']) ? sanitize_text_field(wp_unslash($_POST['layero_personalization_color'])) : '';
		$note = isset($_POST['layero_personalization_note']) ? sanitize_textarea_field(wp_unslash($_POST['layero_personalization_note'])) : '';

		if ($text || $size || $color || $note) {
			$cart_item_data['layero_personalization'] = array(
				'text' => $text,
				'size' => $size,
				'color' => $color,
				'note' => $note,
			);
			$cart_item_data['layero_unique_key'] = md5($product_id . '|' . $variation_id . '|' . $text . '|' . $size . '|' . $color . '|' . $note);
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
				'name' => __('Felirat / név', 'layero-shop-ui'),
				'value' => esc_html($data['text']),
			);
		}
		if (! empty($data['size'])) {
			$item_data[] = array(
				'name' => __('Méret', 'layero-shop-ui'),
				'value' => esc_html($data['size']),
			);
		}
		if (! empty($data['color'])) {
			$item_data[] = array(
				'name' => __('Szín', 'layero-shop-ui'),
				'value' => esc_html($data['color']),
			);
		}
		if (! empty($data['note'])) {
			$item_data[] = array(
				'name' => __('Egyedi megjegyzés', 'layero-shop-ui'),
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
			$item->add_meta_data(__('Felirat / név', 'layero-shop-ui'), $data['text'], true);
		}
		if (! empty($data['size'])) {
			$item->add_meta_data(__('Méret', 'layero-shop-ui'), $data['size'], true);
		}
		if (! empty($data['color'])) {
			$item->add_meta_data(__('Szín', 'layero-shop-ui'), $data['color'], true);
		}
		if (! empty($data['note'])) {
			$item->add_meta_data(__('Egyedi megjegyzés', 'layero-shop-ui'), $data['note'], true);
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
				<span><?php echo esc_html__('Kosár', 'layero-shop-ui'); ?></span>
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
