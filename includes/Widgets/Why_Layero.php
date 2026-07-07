<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Why_Layero extends Base_Widget {
	public function get_name() {
		return 'layero_why_layero';
	}

	public function get_title() {
		return __('Layero összehasonlító blokk', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-table';
	}

	protected function register_controls() {
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_section_header_controls(array(
			'title' => 'Miért a Layero? <span>Nem egy újabb tárgy a polcról.</span>',
		));
		$this->add_control('lead', array(
			'label' => __('Bevezető', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXTAREA,
			'default' => 'Egy Layero ajándék névre szól, a te ötletedből születik, és pontosan olyan lesz, amilyennek elképzelted.',
		));
		$repeater = new Repeater();
		$repeater->add_control('feature', array('label' => __('Szempont', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$repeater->add_control('layero', array('label' => __('Layero érték', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => 'Igen'));
		$repeater->add_control('classic', array('label' => __('Hagyományos ajándék', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT));
		$this->add_control('rows', array(
			'type' => Controls_Manager::REPEATER,
			'fields' => $repeater->get_controls(),
			'title_field' => '{{{ feature }}}',
			'default' => Shop_Content::why_layero_rows(),
		));
		$this->add_control('footer_text', array('label' => __('Alsó szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => 'Nem tudod, melyik illik hozzá a legjobban?'));
		$this->add_control('footer_button_text', array('label' => __('Alsó gomb', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => 'Ajándékkereső kvíz'));
		$this->add_control('footer_button_url', array('label' => __('Alsó gomb link', 'layero-shop-ui'), 'type' => Controls_Manager::URL, 'default' => array('url' => '/kviz/')));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$rows = ! empty($settings['rows']) ? $settings['rows'] : Shop_Content::why_layero_rows();
		?>
		<section class="lyr-section lyr-why">
			<?php $this->render_section_header($settings); ?>
			<?php if (! empty($settings['lead'])) : ?>
				<p class="lyr-why__lead"><?php echo wp_kses($settings['lead'], array('b' => array(), 'strong' => array(), 'em' => array())); ?></p>
			<?php endif; ?>
			<div class="lyr-why__table">
				<div class="lyr-why__row lyr-why__row--head">
					<span></span><b><?php esc_html_e('Layero ajándék', 'layero-shop-ui'); ?></b><b><?php esc_html_e('Hagyományos ajándék', 'layero-shop-ui'); ?></b>
				</div>
				<?php foreach ($rows as $row) : ?>
					<div class="lyr-why__row">
						<span><?php echo esc_html($row['feature'] ?? ''); ?></span>
						<b class="is-good"><?php echo Helpers::icon('check'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php echo esc_html($row['layero'] ?? ''); ?></b>
						<b class="is-muted"><?php echo esc_html($row['classic'] ?? ''); ?></b>
					</div>
				<?php endforeach; ?>
			</div>
			<?php if (! empty($settings['footer_text']) || ! empty($settings['footer_button_text'])) : ?>
				<div class="lyr-why__foot">
					<span><?php echo esc_html($settings['footer_text'] ?? ''); ?></span>
					<?php if (! empty($settings['footer_button_text'])) : ?>
						<a class="lyr-btn lyr-btn--primary" href="<?php echo esc_url($this->get_link_url($settings['footer_button_url'] ?? array(), '/kviz/')); ?>"><?php echo esc_html($settings['footer_button_text']); ?> &rsaquo;</a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</section>
		<?php
	}
}
