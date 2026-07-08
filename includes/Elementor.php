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
		$widgets = array(
			'Hero_Slider',
			'Trust_Bar',
			'Value_Marquee',
			'Category_Bento',
			'Process_Steps',
			'Product_Grid',
			'Quiz_CTA',
			'Product_Spotlight',
			'Product_Carousel',
			'Why_Layero',
			'Testimonials',
			'Gallery_Strip',
			'Custom_CTA',
			'Why_Shop',
			'Newsletter_Banner',
			'Footnotes',
			'Static_Page',
		);

		require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/Base_Widget.php';

		foreach ($widgets as $widget) {
			require_once LAYERO_SHOP_UI_PATH . 'includes/Widgets/' . $widget . '.php';

			$class = __NAMESPACE__ . '\\Widgets\\' . $widget;
			if (class_exists($class)) {
				$widgets_manager->register(new $class());
			}
		}
	}
}
