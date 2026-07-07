<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;

if (! defined('ABSPATH')) {
	exit;
}

class Lab_Preview extends Base_Widget {
	public function get_name() {
		return 'layero_lab_preview';
	}

	public function get_title() {
		return __('Layero Lab elo-nezet', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-preview-medium';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('title', array(
			'label' => __('Cim', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Probald ki a neveddel.',
		));
		$this->add_control('text', array(
			'label' => __('Leiras', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXTAREA,
			'default' => 'Ird be a nevet, es nezd meg Layero stilusban.',
		));
		$this->add_control('product_url', array(
			'label' => __('CTA link', 'layero-shop-ui'),
			'type' => Controls_Manager::URL,
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
		<section class="lyr-lab" data-layero-lab>
			<div class="lyr-lab__copy">
				<span>Layero Lab</span>
				<h2><?php echo esc_html($settings['title']); ?></h2>
				<p><?php echo esc_html($settings['text']); ?></p>
				<form>
					<input type="text" maxlength="18" placeholder="<?php echo esc_attr__('pl. Dominik', 'layero-shop-ui'); ?>" aria-label="<?php echo esc_attr__('Nev', 'layero-shop-ui'); ?>">
					<a class="lyr-btn lyr-btn--primary" href="<?php echo esc_url($settings['product_url']['url'] ?? '#'); ?>" data-layero-lab-link><?php echo esc_html__('Kerem termekkent', 'layero-shop-ui'); ?></a>
				</form>
			</div>
			<div class="lyr-lab__preview">
				<div class="lyr-lab__lamp"><b data-layero-lab-name>Layero</b></div>
			</div>
		</section>
		<?php
	}
}

