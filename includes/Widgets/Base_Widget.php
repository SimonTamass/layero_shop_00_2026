<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;

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

	protected function add_heading_tag_control($id = 'title_tag', $default = 'h2') {
		$this->add_control($id, array(
			'label' => __('Cím HTML tag', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => $default,
			'options' => array(
				'h1' => 'H1',
				'h2' => 'H2',
				'h3' => 'H3',
				'h4' => 'H4',
				'h5' => 'H5',
				'h6' => 'H6',
			),
			'separator' => 'before',
		));
	}

	protected function add_section_header_style_controls() {
		$this->start_controls_section('section_header_style', array(
			'label' => __('Szekció fejléc', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));

		$this->add_control('eyebrow_color', array(
			'label' => __('Kis felirat szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-eyebrow' => 'color: {{VALUE}};',
			),
		));

		$this->add_control('title_color', array(
			'label' => __('Cím szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-section__head h1, {{WRAPPER}} .lyr-section__head h2, {{WRAPPER}} .lyr-section__head h3, {{WRAPPER}} .lyr-section__head h4, {{WRAPPER}} .lyr-section__head h5, {{WRAPPER}} .lyr-section__head h6' => 'color: {{VALUE}};',
			),
		));

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			array(
				'name' => 'title_typography',
				'label' => __('Cím tipográfia', 'layero-shop-ui'),
				'selector' => '{{WRAPPER}} .lyr-section__head h1, {{WRAPPER}} .lyr-section__head h2, {{WRAPPER}} .lyr-section__head h3, {{WRAPPER}} .lyr-section__head h4, {{WRAPPER}} .lyr-section__head h5, {{WRAPPER}} .lyr-section__head h6',
			)
		);

		$this->add_control('desc_color', array(
			'label' => __('Leírás szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .lyr-section__head p' => 'color: {{VALUE}};',
			),
		));

		$this->end_controls_section();
	}

	protected function get_link_url($link, $fallback = '#') {
		if (is_array($link) && ! empty($link['url'])) {
			return Helpers::normalize_shop_url($link['url']);
		}

		return Helpers::normalize_shop_url($fallback);
	}

	protected function render_section_header($settings, $class = '') {
		if (empty($settings['eyebrow']) && empty($settings['title']) && empty($settings['text']) && empty($settings['button_text'])) {
			return;
		}

		$tag = $settings['title_tag'] ?? 'h2';
		$allowed_tags = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
		if (! in_array($tag, $allowed_tags, true)) {
			$tag = 'h2';
		}
		?>
		<div class="lyr-section__head sh-section-hd <?php echo esc_attr($class); ?>">
			<div>
				<?php if (! empty($settings['eyebrow'])) : ?>
					<span class="lyr-eyebrow sh-label sh-kicker"><?php echo esc_html($settings['eyebrow']); ?></span>
				<?php endif; ?>
				<?php if (! empty($settings['title'])) : ?>
					<<?php echo esc_html($tag); ?> class="sh-h2"><?php echo wp_kses($settings['title'], array('em' => array(), 'span' => array(), 'br' => array())); ?></<?php echo esc_html($tag); ?>>
				<?php endif; ?>
				<?php if (! empty($settings['text'])) : ?>
					<p><?php echo esc_html($settings['text']); ?></p>
				<?php endif; ?>
			</div>
			<?php if (! empty($settings['button_text'])) : ?>
				<a class="lyr-link sh-link" href="<?php echo esc_url($this->get_link_url($settings['button_url'] ?? array())); ?>">
					<?php echo esc_html($settings['button_text']); ?> &rsaquo;
				</a>
			<?php endif; ?>
		</div>
		<?php
	}
}
