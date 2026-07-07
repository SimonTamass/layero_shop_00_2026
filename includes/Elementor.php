<?php

namespace LayeroShop;

if (! defined('ABSPATH')) {
	exit;
}

final class Elementor {
	private static $instance = null;

	public static function instance() {
		if (null === self::$instance) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action('elementor/elements/categories_registered', array($this, 'register_category'));
		add_action('elementor/widgets/register', array($this, 'register_widgets'));
	}

	public function register_category($elements_manager) {
		$elements_manager->add_category(
			'layero-shop',
			array(
				'title' => __('Layero Shop', 'layero-shop-ui'),
				'icon' => 'fa fa-shopping-bag',
			)
		);
	}

	public function register_widgets($widgets_manager) {
		if (! did_action('elementor/loaded')) {
			return;
		}

		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Base_Widget.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Hero_Slider.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Product_Grid.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Category_Bento.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Product_Spotlight.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Trust_Bar.php';
		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Lab_Preview.php';

		$widgets_manager->register(new Widgets\Hero_Slider());
		$widgets_manager->register(new Widgets\Product_Grid());
		$widgets_manager->register(new Widgets\Category_Bento());
		$widgets_manager->register(new Widgets\Product_Spotlight());
		$widgets_manager->register(new Widgets\Trust_Bar());
		$widgets_manager->register(new Widgets\Lab_Preview());
	}
}

