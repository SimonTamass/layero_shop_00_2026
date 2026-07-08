<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Process_Steps extends Base_Widget {
	public function get_name() {
		return 'layero_process_steps';
	}

	public function get_title() {
		return __('Layero folyamat lépések', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-number-field';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'eyebrow' => 'Folyamat',
			'title' => 'Így készül a te darabod. <span>Az ötlettől a csomagig.</span>',
			'button_text' => 'Hogyan működik?',
			'button_url' => array('url' => '/gyik/'),
		));
		$this->add_heading_tag_control();

		$repeater = new Repeater();
		$repeater->add_control('number', array('label' => __('Sorszám', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => '1'));
		$repeater->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA));
		$this->add_control('steps', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ number }}} - {{{ title }}}',
			'default' => Shop_Content::process_steps(),
		));
		$this->end_controls_section();

		$this->add_section_header_style_controls();

		$this->start_controls_section('steps_style', array(
			'label' => __('Lépések', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_responsive_control('columns', array(
			'label' => __('Oszlopok', 'layero-shop-ui'),
			'type' => Controls_Manager::SELECT,
			'default' => '4',
			'tablet_default' => '2',
			'mobile_default' => '1',
			'options' => array('1' => '1', '2' => '2', '3' => '3', '4' => '4'),
			'selectors' => array(
				'{{WRAPPER}} .sh-flow' => 'grid-template-columns: repeat({{VALUE}}, 1fr);',
			),
		));
		$this->add_control('accent_color', array(
			'label' => __('Sorszám szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-flow__num' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('ghost_color', array(
			'label' => __('Háttérszám szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-flow__ghost' => 'color: {{VALUE}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$steps = ! empty($settings['steps']) ? $settings['steps'] : Shop_Content::process_steps();
		?>
		<section class="sh-band sh-band--tight lyr-process">
			<div class="shop-wrap">
				<?php $this->render_section_header($settings); ?>
				<div class="sh-flow lyr-process__grid">
				<?php foreach ($steps as $step) : ?>
					<article class="sh-reveal lyr-process__step">
						<span class="sh-flow__num lyr-process__num"><?php echo esc_html($step['number'] ?? ''); ?></span>
						<h3><?php echo esc_html($step['title'] ?? ''); ?></h3>
						<p><?php echo esc_html($step['text'] ?? ''); ?></p>
						<span class="sh-flow__ghost lyr-process__ghost" aria-hidden="true"><?php echo esc_html($step['number'] ?? ''); ?></span>
					</article>
				<?php endforeach; ?>
				</div>
			</div>
		</section>
		<?php
	}
}
