<?php
/**
 * Plugin Name: Layero Shop UI for Elementor + WooCommerce
 * Description: Elementor widgetek és WooCommerce integráció a Layero shop aktuális frontendjének újraépítéséhez.
 * Version: 0.5.1
 * Author: Layero
 * Text Domain: layero-shop-ui
 * Domain Path: /languages
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * WC requires at least: 7.8
 */

if (! defined('ABSPATH')) {
	exit;
}

define('LAYERO_SHOP_UI_VERSION', '0.5.1');
define('LAYERO_SHOP_UI_FILE', __FILE__);
define('LAYERO_SHOP_UI_PATH', plugin_dir_path(__FILE__));
define('LAYERO_SHOP_UI_URL', plugin_dir_url(__FILE__));

require_once LAYERO_SHOP_UI_PATH . 'includes/Plugin.php';

LayeroShop\Plugin::instance();
