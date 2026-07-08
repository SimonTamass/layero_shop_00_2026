<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Newsletter_Banner extends Base_Widget {
	public function get_name() {
		return 'layero_newsletter_banner';
	}

	public function get_title() {
		return __('Layero hírlevél banner', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-mail';
	}

	protected function register_controls() {
		$defaults = Shop_Content::newsletter();
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['title']));
		$this->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['text']));
		$this->add_control('placeholder', array('label' => __('Placeholder', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['placeholder']));
		$this->add_control('button_text', array('label' => __('Gomb szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['button_text']));
		$this->add_control('note', array('label' => __('Apróbetű', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['note']));
		$this->add_control('discount_value', array(
			'label' => __('Kedvezmény szám', 'layero-shop-ui'),
			'type' => Controls_Manager::TEXT,
			'default' => '-10',
			'separator' => 'before',
		));
		$this->add_control('show_ticket', array(
			'label' => __('Kedvezmény jelvény mutatása', 'layero-shop-ui'),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
		));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-nlbanner' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-nlbanner' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('btn_bg_color', array(
			'label' => __('Gomb háttér', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-nlbanner .sh-btn' => 'background-color: {{VALUE}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$title = $this->normalize_title($settings['title'] ?? '');
		$note = $this->normalize_note($settings['note'] ?? '');
		?>
		<section class="sh-band sh-band--tight">
			<div class="shop-wrap">
			<div class="sh-nlbanner lyr-newsletter">
			<div class="sh-nlbanner__copy lyr-newsletter__copy">
				<h2><?php echo esc_html($title); ?></h2>
				<p><?php echo esc_html($settings['text'] ?? ''); ?></p>
				<form id="sh-newsletter-form">
					<input type="email" required placeholder="<?php echo esc_attr($settings['placeholder'] ?? __('E-mail címed', 'layero-shop-ui')); ?>" aria-label="<?php echo esc_attr__('E-mail cím', 'layero-shop-ui'); ?>">
					<button class="sh-btn sh-btn--dark lyr-btn lyr-btn--dark" type="submit"><?php echo esc_html($settings['button_text'] ?? __('Feliratkozom', 'layero-shop-ui')); ?></button>
				</form>
				<small class="sh-nlbanner__note" data-layero-newsletter-note><?php echo wp_kses($note, array('a' => array('href' => array()))); ?></small>
			</div>
			<?php if ('yes' === ($settings['show_ticket'] ?? 'yes')) : ?>
				<figure class="sh-nlbanner__art lyr-newsletter__art" aria-hidden="true">
					<svg viewBox="0 0 440 320" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="lyr-nl-cyan" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0" stop-color="#26d4ef"/>
								<stop offset="1" stop-color="#0a7c92"/>
							</linearGradient>
							<linearGradient id="lyr-nl-gold" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0" stop-color="#f6d29a"/>
								<stop offset="1" stop-color="#d99a2b"/>
							</linearGradient>
							<filter id="lyr-nl-shadow" x="-40%" y="-40%" width="180%" height="180%">
								<feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0a1e2e" flood-opacity="0.22"/>
							</filter>
						</defs>
						<circle cx="52" cy="58" r="7" fill="#26d4ef" opacity="0.45"/>
						<circle cx="396" cy="84" r="5" fill="#d99a2b" opacity="0.5"/>
						<circle cx="368" cy="262" r="8" fill="#26d4ef" opacity="0.3"/>
						<circle cx="76" cy="248" r="4" fill="#d99a2b" opacity="0.45"/>
						<path d="M330 34c6 2 8 8 4 13" stroke="#0a7c92" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.35"/>
						<path d="M96 128c-6 3-12 0-13-6" stroke="#d99a2b" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.4"/>
						<g transform="rotate(-10 210 170)" filter="url(#lyr-nl-shadow)">
							<rect x="140" y="60" width="150" height="212" rx="18" fill="url(#lyr-nl-cyan)"/>
							<circle cx="215" cy="60" r="11" fill="var(--lyr-surface, #f5f5f7)"/>
							<circle cx="215" cy="272" r="11" fill="var(--lyr-surface, #f5f5f7)"/>
							<line x1="158" y1="166" x2="272" y2="166" stroke="#fff" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.75"/>
							<text x="215" y="140" text-anchor="middle" font-family="Sora, Inter, sans-serif" font-weight="800" font-size="64" fill="#fff">%</text>
							<text x="215" y="234" text-anchor="middle" font-family="Sora, Inter, sans-serif" font-weight="700" font-size="34" fill="#fff" opacity="0.92"><?php echo esc_html($this->normalize_discount($settings['discount_value'] ?? '-10')); ?></text>
						</g>
						<g transform="rotate(12 118 218)" filter="url(#lyr-nl-shadow)">
							<rect x="62" y="158" width="104" height="130" rx="14" fill="url(#lyr-nl-gold)"/>
							<circle cx="114" cy="158" r="8" fill="var(--lyr-surface, #f5f5f7)"/>
							<circle cx="114" cy="288" r="8" fill="var(--lyr-surface, #f5f5f7)"/>
							<text x="114" y="238" text-anchor="middle" font-family="Sora, Inter, sans-serif" font-weight="800" font-size="46" fill="#fff">%</text>
						</g>
					</svg>
				</figure>
			<?php endif; ?>
			</div>
			</div>
		</section>
		<?php
	}

	private function normalize_title($title) {
		return preg_replace('/^-10%/', '–10%', (string) $title);
	}

	private function normalize_discount($value) {
		return preg_replace('/^-/', '–', (string) $value);
	}

	private function normalize_note($note) {
		$note = (string) $note;
		if (false !== stripos($note, 'adatvedelem') || false !== stripos($note, 'adatvéd')) {
			return $note;
		}

		$note = preg_replace('/\s*Demo.*$/u', '', $note);

		return trim($note) . ' Részletek az <a href="../adatvedelem.html">adatvédelmi tájékoztatóban</a>. (Demo űrlap.)';
	}
}
