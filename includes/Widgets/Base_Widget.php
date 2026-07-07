<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;

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
		return array('layero', 'shop', 'woocommerce', 'ajándék', '3d nyomtatás', 'webshop');
	}

	protected function add_section_header_controls($defaults = array()) {
		$defaults = wp_parse_args(
			$defaults,
			array(
				'eyebrow' => '',
				'title' => '',
				'text' => '',
				'button_text' => '',
				'button_url' => array('url' => ''),
			)
		);

		$this->add_control(
			'eyebrow',
			array(
				'label' => __('Kis felirat', 'layero-shop-ui'),
				'type' => Controls_Manager::TEXT,
				'default' => $defaults['eyebrow'],
			)
		);

		$this->add_control(
			'title',
			array(
				'label' => __('Cím', 'layero-shop-ui'),
				'type' => Controls_Manager::TEXT,
				'default' => $defaults['title'],
			)
		);

		$this->add_control(
			'text',
			array(
				'label' => __('Leírás', 'layero-shop-ui'),
				'type' => Controls_Manager::TEXTAREA,
				'default' => $defaults['text'],
			)
		);

		$this->add_control(
			'button_text',
			array(
				'label' => __('Link szöveg', 'layero-shop-ui'),
				'type' => Controls_Manager::TEXT,
				'default' => $defaults['button_text'],
			)
		);

		$this->add_control(
			'button_url',
			array(
				'label' => __('Link URL', 'layero-shop-ui'),
				'type' => Controls_Manager::URL,
				'default' => $defaults['button_url'],
			)
		);
	}

	protected function get_link_url($link, $fallback = '#') {
		if (is_array($link) && ! empty($link['url'])) {
			return $link['url'];
		}

		return $fallback;
	}

	protected function render_section_header($settings, $class = '') {
		if (empty($settings['eyebrow']) && empty($settings['title']) && empty($settings['text']) && empty($settings['button_text'])) {
			return;
		}
		?>
		<div class="lyr-section__head <?php echo esc_attr($class); ?>">
			<div>
				<?php if (! empty($settings['eyebrow'])) : ?>
					<span class="lyr-eyebrow"><?php echo esc_html($settings['eyebrow']); ?></span>
				<?php endif; ?>
				<?php if (! empty($settings['title'])) : ?>
					<h2><?php echo wp_kses($settings['title'], array('em' => array(), 'span' => array(), 'br' => array())); ?></h2>
				<?php endif; ?>
				<?php if (! empty($settings['text'])) : ?>
					<p><?php echo esc_html($settings['text']); ?></p>
				<?php endif; ?>
			</div>
			<?php if (! empty($settings['button_text'])) : ?>
				<a class="lyr-link" href="<?php echo esc_url($this->get_link_url($settings['button_url'] ?? array())); ?>">
					<?php echo esc_html($settings['button_text']); ?> &rsaquo;
				</a>
			<?php endif; ?>
		</div>
		<?php
	}
}
