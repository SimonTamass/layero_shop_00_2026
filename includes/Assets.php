<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Assets {
	private static $instance = null;

	public static function instance() {
		if (null === self::$instance) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action('init', array($this, 'register'));
		add_action('wp_head', array($this, 'print_importmap'), 1);
		add_action('wp_enqueue_scripts', array($this, 'enqueue'));
		add_action('elementor/frontend/after_register_styles', array($this, 'register'));
		add_action('elementor/frontend/after_register_scripts', array($this, 'register'));
		add_filter('script_loader_tag', array($this, 'module_script_tag'), 10, 3);
	}

	public function register() {
		wp_register_style(
			'layero-shop-ui',
			LAYERO_SHOP_UI_URL . 'assets/css/layero-shop-ui.css',
			array(),
			LAYERO_SHOP_UI_VERSION
		);

		wp_register_style(
			'layero-static-shop',
			LAYERO_SHOP_UI_URL . 'assets/css/layero-static-shop.css',
			array(),
			LAYERO_SHOP_UI_VERSION
		);

		wp_register_script(
			'layero-shop-ui',
			LAYERO_SHOP_UI_URL . 'assets/js/layero-shop-ui.js',
			array('jquery'),
			LAYERO_SHOP_UI_VERSION,
			true
		);

		wp_register_script(
			'layero-static-data',
			LAYERO_SHOP_UI_URL . 'assets/js/layero-static-data.js',
			array(),
			LAYERO_SHOP_UI_VERSION,
			true
		);

		wp_register_script(
			'layero-static-shop',
			LAYERO_SHOP_UI_URL . 'assets/js/layero-static-shop.js',
			array('layero-static-data'),
			LAYERO_SHOP_UI_VERSION,
			true
		);

		wp_register_script(
			'layero-lab-3d',
			LAYERO_SHOP_UI_URL . 'assets/js/lab-3d.js',
			array(),
			LAYERO_SHOP_UI_VERSION,
			true
		);
	}

	public function enqueue() {
		wp_enqueue_style('layero-shop-ui');
		wp_enqueue_style('layero-static-shop');
		wp_enqueue_script('layero-shop-ui');
		wp_enqueue_script('layero-static-data');
		wp_enqueue_script('layero-static-shop');
		wp_enqueue_script('layero-lab-3d');

		wp_add_inline_script(
			'layero-static-data',
			'window.LayeroShopStatic = window.LayeroShopStatic || ' . wp_json_encode(
				array(
					'assetBase' => trailingslashit(LAYERO_SHOP_UI_URL . 'assets/demo'),
					'homeUrl' => home_url('/'),
					'urls' => array(
						'index.html' => home_url('/'),
						'kategoria.html' => home_url('/termekek/'),
						'rolunk.html' => home_url('/rolunk/'),
						'gyik.html' => home_url('/gyik/'),
						'kapcsolat.html' => home_url('/kapcsolat/'),
						'kviz.html' => home_url('/kviz/'),
						'kosar.html' => home_url('/kosar/'),
						'penztar.html' => home_url('/penztar/'),
						'fiok.html' => home_url('/fiok/'),
						'kedvencek.html' => home_url('/kedvencek/'),
						'termek.html' => home_url('/termek/'),
					),
				)
			) . ';',
			'before'
		);

		wp_localize_script(
			'layero-shop-ui',
			'LayeroShopUI',
			array(
				'ajaxUrl' => admin_url('admin-ajax.php'),
				'cartUrl' => function_exists('wc_get_cart_url') ? wc_get_cart_url() : '',
				'checkoutUrl' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : '',
				'i18n' => array(
					'added' => __('Kosárba téve', 'layero-shop-ui'),
					'subscribed' => __('Köszönjük, a kuponkódot e-mailben küldjük.', 'layero-shop-ui'),
				),
			)
		);
	}

	public function print_importmap() {
		if (is_admin()) {
			return;
		}
		?>
		<script type="importmap">
			{
				"imports": {
					"three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
					"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
				}
			}
		</script>
		<?php
	}

	public function module_script_tag($tag, $handle, $src) {
		if ('layero-lab-3d' !== $handle) {
			return $tag;
		}

		return '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>' . "\n";
	}
}
