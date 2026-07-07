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
		return __('Layero Lab előnézet', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-preview-medium';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'eyebrow' => 'Layero Lab',
			'title' => 'Próbáld ki. <em>Most azonnal.</em>',
			'text' => 'Írd be a neved, és nézd meg, ahogy rétegről rétegre fénybe nyomtatjuk - pontosan így születik minden Layero darab.',
		));
		$this->add_control('input_placeholder', array(
			'label' => __('Input placeholder', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'pl. Dominik',
		));
		$this->add_control('submit_text', array(
			'label' => __('Gomb szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Nyomtasd ki!',
		));
		$this->add_control('product_url', array(
			'label' => __('CTA link', 'layero-shop-ui'),
			'type' => Controls_Manager::URL,
			'default' => array('url' => '/product/szam-lampa-nevvel/'),
		));
		$this->add_control('result_text', array(
			'label' => __('Eredmény szöveg', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => 'Kérem lámpaként',
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
		<section class="lyr-lab" data-layero-lab>
			<div class="lyr-lab__copy">
				<?php if (! empty($settings['eyebrow'])) : ?>
					<span><?php echo esc_html($settings['eyebrow']); ?></span>
				<?php endif; ?>
				<h2><?php echo wp_kses($settings['title'] ?? '', array('em' => array(), 'br' => array())); ?></h2>
				<p><?php echo esc_html($settings['text'] ?? ''); ?></p>
				<form>
					<input type="text" maxlength="14" placeholder="<?php echo esc_attr($settings['input_placeholder'] ?? __('pl. Dominik', 'layero-shop-ui')); ?>" aria-label="<?php echo esc_attr__('Név a nyomtatáshoz', 'layero-shop-ui'); ?>" autocomplete="off">
					<button class="lyr-btn lyr-btn--primary" type="submit"><?php echo esc_html($settings['submit_text'] ?? __('Nyomtasd ki!', 'layero-shop-ui')); ?></button>
				</form>
				<div class="lyr-lab__result" data-layero-lab-result hidden>
					<span data-layero-lab-stats></span>
					<a class="lyr-link--light" href="<?php echo esc_url($this->get_link_url($settings['product_url'] ?? array())); ?>" data-layero-lab-link><?php echo esc_html($settings['result_text'] ?? __('Kérem lámpaként', 'layero-shop-ui')); ?> &rsaquo;</a>
				</div>
			</div>
			<div class="lyr-lab__preview">
				<div class="lyr-lab__lamp"><b data-layero-lab-name>Layero</b></div>
				<span><?php echo esc_html__('Rétegről rétegre épülő előnézet', 'layero-shop-ui'); ?></span>
			</div>
		</section>
		<?php
	}
}
