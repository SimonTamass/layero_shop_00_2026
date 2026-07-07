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
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$steps = ! empty($settings['steps']) ? $settings['steps'] : Shop_Content::process_steps();
		?>
		<section class="lyr-section lyr-process">
			<?php $this->render_section_header($settings); ?>
			<div class="lyr-process__grid">
				<?php foreach ($steps as $step) : ?>
					<article class="lyr-process__step">
						<span class="lyr-process__num"><?php echo esc_html($step['number'] ?? ''); ?></span>
						<h3><?php echo esc_html($step['title'] ?? ''); ?></h3>
						<p><?php echo esc_html($step['text'] ?? ''); ?></p>
						<span class="lyr-process__ghost" aria-hidden="true"><?php echo esc_html($step['number'] ?? ''); ?></span>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}
}
