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
		add_action('wp_enqueue_scripts', array($this, 'enqueue'));
		add_action('elementor/frontend/after_register_styles', array($this, 'register'));
		add_action('elementor/frontend/after_register_scripts', array($this, 'register'));
	}

	public function register() {
		wp_register_style(
			'layero-shop-ui',
			LAYERO_SHOP_UI_URL . 'assets/css/layero-shop-ui.css',
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
	}

	public function enqueue() {
		wp_enqueue_style('layero-shop-ui');
		wp_enqueue_script('layero-shop-ui');

		wp_localize_script(
			'layero-shop-ui',
			'LayeroShopUI',
			array(
				'ajaxUrl' => admin_url('admin-ajax.php'),
				'cartUrl' => function_exists('wc_get_cart_url') ? wc_get_cart_url() : '',
				'checkoutUrl' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : '',
				'i18n' => array(
					'added' => __('Kosarba teve', 'layero-shop-ui'),
				),
			)
		);
	}
}

