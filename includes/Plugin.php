<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Plugin {
	private static $instance = null;

	public static function instance() {
		if (null === self::$instance) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		$this->includes();

		add_action('plugins_loaded', array($this, 'load_textdomain'));
		add_action('plugins_loaded', array($this, 'boot'));
	}

	private function includes() {
		require_once LAYERO_SHOP_UI_PATH . 'includes/Shop_Content.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Helpers.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Assets.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/WooCommerce.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Elementor.php';
	}

	public function load_textdomain() {
		load_plugin_textdomain('layero-shop-ui', false, dirname(plugin_basename(LAYERO_SHOP_UI_FILE)) . '/languages');
	}

	public function boot() {
		Assets::instance();
		WooCommerce::instance();
		Elementor::instance();
	}
}
