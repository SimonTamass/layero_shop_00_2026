<?php

namespace LayeroShop\Widgets;

if (! defined('ABSPATH')) {
	exit;
}

abstract class Base_Widget extends \Elementor\Widget_Base {
	public function get_categories() {
		return array('layero-shop');
	}

	public function get_style_depends() {
		return array('layero-shop-ui');
	}

	public function get_script_depends() {
		return array('layero-shop-ui');
	}

	public function get_keywords() {
		return array('layero', 'shop', 'woocommerce', 'ajándék', '3d nyomtatás');
	}
}
