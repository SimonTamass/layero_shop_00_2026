<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;

if (! defined('ABSPATH')) {
	exit;
}

class Static_Page extends Base_Widget {
	public function get_name() {
		return 'layero_static_page';
	}

	public function get_title() {
		return __('Layero statikus oldal', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-document-file';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Oldal', 'layero-shop-ui')));

		$this->add_control(
			'page',
			array(
				'label' => __('Lokális oldal tükre', 'layero-shop-ui'),
				'type' => Controls_Manager::SELECT,
				'default' => 'home',
				'options' => array(
					'home' => __('Főoldal', 'layero-shop-ui'),
					'kategoria' => __('Termékek / kategória', 'layero-shop-ui'),
					'termek' => __('Termék részletező', 'layero-shop-ui'),
					'rolunk' => __('Rólunk', 'layero-shop-ui'),
					'gyik' => __('GYIK', 'layero-shop-ui'),
					'kapcsolat' => __('Kapcsolat', 'layero-shop-ui'),
					'kviz' => __('Ajándékkereső', 'layero-shop-ui'),
					'kosar' => __('Kosár', 'layero-shop-ui'),
					'penztar' => __('Pénztár', 'layero-shop-ui'),
					'fiok' => __('Fiókom', 'layero-shop-ui'),
					'kedvencek' => __('Kedvencek', 'layero-shop-ui'),
					'404' => __('404', 'layero-shop-ui'),
				),
			)
		);

		$this->end_controls_section();
	}

	public function get_style_depends() {
		return array('layero-static-shop');
	}

	public function get_script_depends() {
		return array('layero-static-shop');
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$page = sanitize_key($settings['page'] ?? 'home');
		$html = $this->get_static_body($page);

		echo '<div class="layero-static-page" data-layero-page="' . esc_attr($page) . '">';
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}

	private function get_static_body($page) {
		$files = array(
			'home' => 'index.html',
			'kategoria' => 'kategoria.html',
			'termek' => 'termek.html',
			'rolunk' => 'rolunk.html',
			'gyik' => 'gyik.html',
			'kapcsolat' => 'kapcsolat.html',
			'kviz' => 'kviz.html',
			'kosar' => 'kosar.html',
			'penztar' => 'penztar.html',
			'fiok' => 'fiok.html',
			'kedvencek' => 'kedvencek.html',
			'404' => '404.html',
		);

		$file = $files[$page] ?? $files['home'];
		$path = LAYERO_SHOP_UI_PATH . 'assets/static/' . $file;

		if (! is_readable($path)) {
			return '<section class="sh-band"><div class="shop-wrap"><p>' . esc_html__('A statikus Layero oldal nem található.', 'layero-shop-ui') . '</p></div></section>';
		}

		$contents = file_get_contents($path); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if (! preg_match('/<body[^>]*>(.*)<\/body>/is', $contents, $matches)) {
			$body = $contents;
		} else {
			$body = $matches[1];
		}

		$body = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $body);
		$body = $this->rewrite_static_urls($body);

		return $body;
	}

	private function rewrite_static_urls($html) {
		$asset_base = trailingslashit(LAYERO_SHOP_UI_URL . 'assets/demo');

		$html = preg_replace(
			'/((?:src|href|srcset|poster|data-src)\s*=\s*["\'])assets\//i',
			'${1}' . $asset_base,
			$html
		);

		$page_map = array(
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
		);

		foreach ($page_map as $file => $url) {
			$html = preg_replace(
				'/(href\s*=\s*["\'])' . preg_quote($file, '/') . '/i',
				'${1}' . esc_url($url),
				$html
			);
		}

		return $html;
	}
}
