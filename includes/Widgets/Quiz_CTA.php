<?php

namespace LayeroShop\Widgets;

use Elementor\Controls_Manager;
use LayeroShop\Helpers;
use LayeroShop\Shop_Content;

if (! defined('ABSPATH')) {
	exit;
}

class Quiz_CTA extends Base_Widget {
	public function get_name() {
		return 'layero_quiz_cta';
	}

	public function get_title() {
		return __('Layero ajándékkereső CTA', 'layero-shop-ui');
	}

	public function get_icon() {
		return 'eicon-help-o';
	}

	protected function register_controls() {
		$defaults = Shop_Content::quiz_cta();
		$this->start_controls_section('content_section', array('label' => __('Tartalom', 'layero-shop-ui')));
		$this->add_control('eyebrow', array('label' => __('Kis felirat', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['eyebrow']));
		$this->add_control('title', array('label' => __('Cím', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['title']));
		$this->add_control('text', array('label' => __('Szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXTAREA, 'default' => $defaults['text']));
		$this->add_control('button_text', array('label' => __('Gomb szöveg', 'layero-shop-ui'), 'type' => Controls_Manager::TEXT, 'default' => $defaults['button_text']));
		$this->add_control('button_url', array('label' => __('Link', 'layero-shop-ui'), 'type' => Controls_Manager::URL, 'default' => $defaults['button_url']));
		$this->end_controls_section();

		$this->start_controls_section('style_section', array(
			'label' => __('Megjelenés', 'layero-shop-ui'),
			'tab' => Controls_Manager::TAB_STYLE,
		));
		$this->add_control('bg_color', array(
			'label' => __('Háttérszín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-quizcta' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('text_color', array(
			'label' => __('Szöveg szín', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-quizcta' => 'color: {{VALUE}};',
			),
		));
		$this->add_control('hover_bg', array(
			'label' => __('Hover háttér', 'layero-shop-ui'),
			'type' => Controls_Manager::COLOR,
			'selectors' => array(
				'{{WRAPPER}} .sh-quizcta:hover' => 'background-color: {{VALUE}};',
			),
		));
		$this->add_control('border_radius', array(
			'label' => __('Lekerekítés', 'layero-shop-ui'),
			'type' => Controls_Manager::SLIDER,
			'size_units' => array('px'),
			'range' => array('px' => array('min' => 0, 'max' => 30)),
			'selectors' => array(
				'{{WRAPPER}} .sh-quizcta' => 'border-radius: {{SIZE}}{{UNIT}};',
			),
		));
		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		if ($this->is_quiz_page()) {
			$this->render_quiz($settings);
			return;
		}
		?>
		<section class="sh-band sh-band--tight">
			<div class="shop-wrap">
				<a class="sh-quizcta lyr-quiz-cta" href="<?php echo esc_url($this->get_link_url($settings['button_url'] ?? array(), '/kviz/')); ?>">
					<span class="sh-quizcta__ico lyr-quiz-cta__icon"><?php echo Helpers::icon('question'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
					<span class="sh-quizcta__copy lyr-quiz-cta__copy">
						<span class="sh-quizcta__eyebrow"><?php echo esc_html($settings['eyebrow'] ?? ''); ?></span>
						<h2><?php echo esc_html($settings['title'] ?? ''); ?></h2>
						<p><?php echo esc_html($settings['text'] ?? ''); ?></p>
					</span>
					<span class="sh-quizcta__btn"><?php echo esc_html($settings['button_text'] ?? __('Kitöltöm', 'layero-shop-ui')); ?> &rsaquo;</span>
				</a>
			</div>
		</section>
		<?php
	}

	private function is_quiz_page() {
		if (function_exists('is_page') && is_page(array('kviz', 'ajandekkereso'))) {
			return true;
		}

		if (! function_exists('get_queried_object_id') || ! function_exists('get_post_field')) {
			return false;
		}

		return 'kviz' === (string) get_post_field('post_name', get_queried_object_id());
	}

	private function render_quiz($settings) {
		?>
		<section class="lyr-quiz" data-layero-quiz>
			<div class="lyr-quiz__head">
				<span class="lyr-eyebrow"><?php echo esc_html($settings['eyebrow'] ?? __('Ajándékkereső', 'layero-shop-ui')); ?></span>
				<div class="lyr-quiz__progress"><i data-layero-quiz-progress style="width:25%"></i></div>
				<span class="lyr-quiz__count" data-layero-quiz-count>1 / 4</span>
			</div>
			<h2 data-layero-quiz-title><?php echo esc_html($settings['title'] ?? ''); ?></h2>
			<p class="lyr-quiz__lead" data-layero-quiz-lead><?php echo esc_html($settings['text'] ?? ''); ?></p>
			<div class="lyr-quiz__options" data-layero-quiz-options></div>
			<button class="lyr-quiz__back" type="button" data-layero-quiz-back hidden><?php esc_html_e('Vissza', 'layero-shop-ui'); ?></button>
			<div class="lyr-quiz__result" data-layero-quiz-result hidden>
				<span class="lyr-eyebrow"><?php esc_html_e('Kész is', 'layero-shop-ui'); ?></span>
				<h2><?php esc_html_e('Ezek illenek hozzá a legjobban.', 'layero-shop-ui'); ?></h2>
				<p><?php esc_html_e('A válaszaid alapján válogattuk össze. Mindegyik személyre szabható, a pontos részleteket rendelés után egyeztetjük.', 'layero-shop-ui'); ?></p>
				<div class="lyr-product-grid lyr-product-grid--cols-4" data-layero-quiz-products></div>
				<div class="lyr-quiz__actions">
					<button class="lyr-btn lyr-btn--dark" type="button" data-layero-quiz-restart><?php esc_html_e('Újrakezdem', 'layero-shop-ui'); ?></button>
					<a class="lyr-btn lyr-btn--primary" href="<?php echo esc_url(Helpers::products_url()); ?>"><?php esc_html_e('Összes termék', 'layero-shop-ui'); ?></a>
				</div>
			</div>
			<script type="application/json" data-layero-quiz-data><?php echo wp_json_encode($this->quiz_payload()); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></script>
		</section>
		<?php
	}

	private function quiz_payload() {
		$products = array();
		foreach (Shop_Content::products() as $product) {
			$products[] = array(
				'id' => $product['id'],
				'name' => $product['name'],
				'category' => $product['category'],
				'price' => (int) $product['price'],
				'regular_price' => (int) $product['regular_price'],
				'badge' => $product['badge'],
				'description' => $product['description'],
				'image' => Shop_Content::asset_url($product['image']),
				'url' => Helpers::product_url($product['id']),
			);
		}

		return array(
			'questions' => array(
				array(
					'title' => __('Kinek keresel ajándékot?', 'layero-shop-ui'),
					'options' => array(
						array('label' => __('Gyereknek vagy fiatalnak', 'layero-shop-ui'), 'tags' => array('lampak', 'rajongoi')),
						array('label' => __('Páromnak vagy családtagnak', 'layero-shop-ui'), 'tags' => array('lampak', 'dekoraciok')),
						array('label' => __('Ügyfélnek vagy csapatnak', 'layero-shop-ui'), 'tags' => array('ceges', 'kulcstartok')),
						array('label' => __('Valami teljesen egyedi kell', 'layero-shop-ui'), 'tags' => array('egyedi')),
					),
				),
				array(
					'title' => __('Milyen alkalomra készül?', 'layero-shop-ui'),
					'options' => array(
						array('label' => __('Születésnap vagy névnap', 'layero-shop-ui'), 'tags' => array('lampak', 'rajongoi')),
						array('label' => __('Karácsony vagy ünnepi meglepetés', 'layero-shop-ui'), 'tags' => array('lampak', 'dekoraciok')),
						array('label' => __('Céges ajándék vagy rendezvény', 'layero-shop-ui'), 'tags' => array('ceges', 'kulcstartok')),
						array('label' => __('Csak szeretnék valami különlegeset', 'layero-shop-ui'), 'tags' => array('egyedi', 'dekoraciok')),
					),
				),
				array(
					'title' => __('Milyen típusú ajándék illene hozzá?', 'layero-shop-ui'),
					'options' => array(
						array('label' => __('Világító, látványos darab', 'layero-shop-ui'), 'tags' => array('lampak')),
						array('label' => __('Praktikus, hordható apróság', 'layero-shop-ui'), 'tags' => array('kulcstartok', 'ceges')),
						array('label' => __('Lakásdekoráció vagy emléktárgy', 'layero-shop-ui'), 'tags' => array('dekoraciok', 'rajongoi')),
						array('label' => __('Egy ötletből indulnánk ki', 'layero-shop-ui'), 'tags' => array('egyedi')),
					),
				),
				array(
					'title' => __('Milyen keretben gondolkodsz?', 'layero-shop-ui'),
					'options' => array(
						array('label' => __('50-150 RON', 'layero-shop-ui'), 'tags' => array('kulcstartok', 'dekoraciok')),
						array('label' => __('150-250 RON', 'layero-shop-ui'), 'tags' => array('lampak', 'dekoraciok')),
						array('label' => __('250 RON felett', 'layero-shop-ui'), 'tags' => array('ceges', 'rajongoi')),
						array('label' => __('Ajánlat alapján is jó', 'layero-shop-ui'), 'tags' => array('egyedi')),
					),
				),
			),
			'products' => $products,
		);
	}
}
