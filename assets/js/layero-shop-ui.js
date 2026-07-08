(function ($) {
	'use strict';

	var WISH_KEY = 'sh_wishlist';

	function initSlider(root) {
		if (root.dataset.layeroSliderReady === '1') return;
		root.dataset.layeroSliderReady = '1';

		var slides = Array.prototype.slice.call(root.querySelectorAll('.lyr-hero__slide'));
		var dotsWrap = root.querySelector('.lyr-hero__dots');
		var prev = root.querySelector('.lyr-hero__nav--prev');
		var next = root.querySelector('.lyr-hero__nav--next');
		if (!slides.length) return;

		var current = 0;
		var timer = null;
		var pointerId = null;
		var startX = 0;
		var startY = 0;
		var dragged = false;
		var speed = parseInt(root.getAttribute('data-layero-speed'), 10);
		speed = Number.isFinite(speed) ? speed : 6500;

		var dots = [];
		if (dotsWrap) {
			dotsWrap.innerHTML = slides.map(function (_, index) {
				return '<button type="button" role="tab" aria-label="' + (index + 1) + '. slide"></button>';
			}).join('');
			dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('button'));
		}

		function go(index) {
			current = (index + slides.length) % slides.length;
			slides.forEach(function (slide, i) {
				var active = i === current;
				slide.classList.toggle('is-active', active);
				slide.setAttribute('aria-hidden', active ? 'false' : 'true');
			});
			dots.forEach(function (dot, i) {
				var active = i === current;
				dot.classList.toggle('is-active', active);
				dot.setAttribute('aria-selected', active ? 'true' : 'false');
			});
		}

		function stop() {
			if (timer) window.clearInterval(timer);
			timer = null;
		}

		function start() {
			stop();
			if (speed > 0 && slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				timer = window.setInterval(function () { go(current + 1); }, speed);
			}
		}

		if (prev) prev.addEventListener('click', function () { stop(); go(current - 1); start(); });
		if (next) next.addEventListener('click', function () { stop(); go(current + 1); start(); });
		dots.forEach(function (dot, i) {
			dot.addEventListener('click', function () { stop(); go(i); start(); });
		});

		root.addEventListener('mouseenter', stop);
		root.addEventListener('mouseleave', start);
		root.addEventListener('focusin', stop);
		root.addEventListener('focusout', start);

		root.addEventListener('pointerdown', function (event) {
			if (event.target.closest('a,button,input,textarea,select')) return;
			pointerId = event.pointerId;
			startX = event.clientX;
			startY = event.clientY;
			dragged = false;
			stop();
			if (typeof root.setPointerCapture === 'function') {
				try { root.setPointerCapture(pointerId); } catch (error) {}
			}
		});

		root.addEventListener('pointermove', function (event) {
			if (pointerId !== event.pointerId) return;
			if (Math.abs(event.clientX - startX) > 8) {
				dragged = true;
				root.classList.add('is-dragging');
			}
		});

		function finishPointer(event) {
			if (pointerId !== event.pointerId) return;
			var dx = event.clientX - startX;
			var dy = event.clientY - startY;
			if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
			pointerId = null;
			window.setTimeout(function () {
				dragged = false;
				root.classList.remove('is-dragging');
			}, 0);
			start();
		}

		root.addEventListener('pointerup', finishPointer);
		root.addEventListener('pointercancel', function () {
			pointerId = null;
			dragged = false;
			root.classList.remove('is-dragging');
			start();
		});
		root.addEventListener('click', function (event) {
			if (dragged) event.preventDefault();
		});

		go(0);
		start();
	}

	function initLab(root) {
		if (root.dataset.layeroLabReady === '1') return;
		root.dataset.layeroLabReady = '1';

		var input = root.querySelector('input');
		var name = root.querySelector('[data-layero-lab-name]');
		var link = root.querySelector('[data-layero-lab-link]');
		var form = root.querySelector('form');
		var result = root.querySelector('[data-layero-lab-result]');
		var stats = root.querySelector('[data-layero-lab-stats]');
		if (!input || !name || !form) return;

		function sync() {
			var value = input.value.trim() || 'Layero';
			name.textContent = value;
			if (stats) {
				stats.textContent = value.length + ' karakter, kb. ' + Math.max(9, value.length * 2) + ' nyomtatott réteg';
			}
			if (link) {
				try {
					var url = new URL(link.getAttribute('href') || window.location.href, window.location.origin);
					url.searchParams.set('layero_nev', value);
					link.setAttribute('href', url.pathname + url.search + url.hash);
				} catch (error) {
					var href = (link.getAttribute('href') || '').split('#')[0];
					link.setAttribute('href', href + (href.indexOf('?') === -1 ? '?' : '&') + 'layero_nev=' + encodeURIComponent(value));
				}
			}
		}

		input.addEventListener('input', sync);
		form.addEventListener('submit', function (event) {
			event.preventDefault();
			sync();
			if (result) result.hidden = false;
		});
		sync();
	}

	function wishGet() {
		try {
			var items = JSON.parse(window.localStorage.getItem(WISH_KEY) || '[]');
			return Array.isArray(items) ? items.map(String) : [];
		} catch (error) {
			return [];
		}
	}

	function wishSet(items) {
		try {
			window.localStorage.setItem(WISH_KEY, JSON.stringify(items));
		} catch (error) {}
	}

	function refreshWishButtons(context) {
		var items = wishGet();
		(context || document).querySelectorAll('[data-layero-wish-toggle]').forEach(function (button) {
			var id = String(button.getAttribute('data-layero-product-id') || '');
			var active = id && items.indexOf(id) !== -1;
			button.classList.toggle('is-active', active);
			button.setAttribute('aria-pressed', active ? 'true' : 'false');
		});
	}

	function refreshFavoritesGrid(context) {
		(context || document).querySelectorAll('[data-layero-favorites-grid]').forEach(function (grid) {
			var items = wishGet();
			var visible = 0;
			grid.querySelectorAll('[data-layero-product-card]').forEach(function (card) {
				var id = String(card.getAttribute('data-layero-product-id') || '');
				var show = id && items.indexOf(id) !== -1;
				card.hidden = !show;
				if (show) visible++;
			});
			var empty = grid.parentElement ? grid.parentElement.querySelector('[data-layero-favorites-empty]') : null;
			if (empty) empty.hidden = visible > 0;
		});
	}

	function initWishlist(context) {
		(context || document).querySelectorAll('[data-layero-wish-toggle]').forEach(function (button) {
			if (button.dataset.layeroWishReady === '1') return;
			button.dataset.layeroWishReady = '1';
			button.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				var id = String(button.getAttribute('data-layero-product-id') || '');
				if (!id) return;
				var items = wishGet();
				var index = items.indexOf(id);
				if (index === -1) items.push(id);
				else items.splice(index, 1);
				wishSet(items);
				refreshWishButtons(document);
				refreshFavoritesGrid(document);
			});
		});
		refreshWishButtons(context || document);
		refreshFavoritesGrid(context || document);
	}

	function escapeHtml(value) {
		return String(value || '').replace(/[&<>"']/g, function (char) {
			return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
		});
	}

	function initQuiz(root) {
		if (root.dataset.layeroQuizReady === '1') return;
		root.dataset.layeroQuizReady = '1';

		var dataNode = root.querySelector('[data-layero-quiz-data]');
		var title = root.querySelector('[data-layero-quiz-title]');
		var lead = root.querySelector('[data-layero-quiz-lead]');
		var options = root.querySelector('[data-layero-quiz-options]');
		var back = root.querySelector('[data-layero-quiz-back]');
		var result = root.querySelector('[data-layero-quiz-result]');
		var productsRoot = root.querySelector('[data-layero-quiz-products]');
		var progress = root.querySelector('[data-layero-quiz-progress]');
		var count = root.querySelector('[data-layero-quiz-count]');
		var restart = root.querySelector('[data-layero-quiz-restart]');
		if (!dataNode || !title || !options || !result || !productsRoot) return;

		var payload;
		try {
			payload = JSON.parse(dataNode.textContent || '{}');
		} catch (error) {
			return;
		}
		var questions = payload.questions || [];
		var products = payload.products || [];
		var step = 0;
		var answers = [];
		var heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-9.3-9.2A5.2 5.2 0 0 1 12 6.1a5.2 5.2 0 0 1 9.3 4.7C19 15.4 12 20 12 20Z"/></svg>';
		var cart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1.3 10.5a1.5 1.5 0 0 1-1.5 1.7H6.2a1.5 1.5 0 0 1-1.5-1.7L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>';

		function renderQuestion() {
			var question = questions[step];
			if (!question) return;
			result.hidden = true;
			options.hidden = false;
			if (lead) lead.hidden = false;
			title.hidden = false;
			title.textContent = question.title || '';
			options.innerHTML = (question.options || []).map(function (option, index) {
				return '<button class="lyr-quiz__option" type="button" data-index="' + index + '">' + escapeHtml(option.label) + '</button>';
			}).join('');
			if (progress) progress.style.width = (((step + 1) / Math.max(questions.length, 1)) * 100) + '%';
			if (count) count.textContent = (step + 1) + ' / ' + questions.length;
			if (back) back.hidden = step === 0;
		}

		function productScore(product, scores) {
			var score = scores[product.category] || 0;
			if (product.badge) score += 0.25;
			return score;
		}

		function card(product) {
			var price = product.price > 0 ? product.price + ' RON' : 'Ajánlatkérés';
			var was = product.regular_price && product.regular_price > product.price ? '<del>' + escapeHtml(product.regular_price + ' RON') + '</del>' : '';
			var badge = product.badge ? '<span class="lyr-badge">' + escapeHtml(product.badge) + '</span>' : '';
			return '<article class="lyr-product-card lyr-product-card--demo" data-layero-product-card data-layero-product-id="' + escapeHtml(product.id) + '">' +
				'<a class="lyr-product-card__media" href="' + escapeHtml(product.url) + '">' + badge + '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy"></a>' +
				'<button class="lyr-product-card__wish" type="button" data-layero-wish-toggle data-layero-product-id="' + escapeHtml(product.id) + '" aria-label="Kedvencekhez adás">' + heart + '</button>' +
				'<div class="lyr-product-card__body"><div class="lyr-product-card__cat">' + escapeHtml(product.category) + '</div>' +
				'<h3><a href="' + escapeHtml(product.url) + '">' + escapeHtml(product.name) + '</a></h3>' +
				'<p>' + escapeHtml(product.description) + '</p>' +
				'<div class="lyr-product-card__price">' + was + escapeHtml(price) + '</div>' +
				'<a class="lyr-btn lyr-btn--primary lyr-product-card__add" href="' + escapeHtml(product.url) + '">' + cart + '<span>Megnézem</span></a></div></article>';
		}

		function renderResult() {
			var scores = {};
			answers.forEach(function (tags) {
				(tags || []).forEach(function (tag) {
					scores[tag] = (scores[tag] || 0) + 1;
				});
			});
			var ranked = products.slice().map(function (product) {
				product._score = productScore(product, scores);
				return product;
			}).sort(function (a, b) {
				return b._score - a._score || b.price - a.price;
			});
			var hits = ranked.filter(function (product) { return product._score > 0; }).slice(0, 4);
			if (!hits.length) hits = ranked.slice(0, 4);
			productsRoot.innerHTML = hits.map(card).join('');
			options.hidden = true;
			if (lead) lead.hidden = true;
			title.hidden = true;
			if (back) back.hidden = true;
			result.hidden = false;
			initWishlist(root);
		}

		options.addEventListener('click', function (event) {
			var button = event.target.closest('[data-index]');
			if (!button) return;
			var question = questions[step];
			var option = question && question.options ? question.options[parseInt(button.getAttribute('data-index'), 10)] : null;
			answers[step] = option ? option.tags || [] : [];
			step++;
			if (step >= questions.length) renderResult();
			else renderQuestion();
		});

		if (back) {
			back.addEventListener('click', function () {
				if (step === 0) return;
				answers.pop();
				step--;
				renderQuestion();
			});
		}

		if (restart) {
			restart.addEventListener('click', function () {
				step = 0;
				answers = [];
				renderQuestion();
			});
		}

		renderQuestion();
	}

	function initCarousel(track) {
		if (track.dataset.layeroCarouselReady === '1') return;
		track.dataset.layeroCarouselReady = '1';

		var root = track.closest('.lyr-product-carousel') || track.parentElement;
		var prev = root ? root.querySelector('[data-layero-carousel-prev]') : null;
		var next = root ? root.querySelector('[data-layero-carousel-next]') : null;

		function move(direction) {
			track.scrollBy({
				left: direction * Math.max(280, Math.round(track.clientWidth * 0.78)),
				behavior: 'smooth'
			});
		}

		if (prev) prev.addEventListener('click', function () { move(-1); });
		if (next) next.addEventListener('click', function () { move(1); });
	}

	function initNewsletter(form) {
		if (form.dataset.layeroNewsletterReady === '1') return;
		form.dataset.layeroNewsletterReady = '1';

		form.addEventListener('submit', function (event) {
			event.preventDefault();
			var root = form.closest('.lyr-newsletter');
			var note = root ? root.querySelector('[data-layero-newsletter-note]') : null;
			form.classList.add('is-done');
			if (note) {
				note.textContent = (window.LayeroShopUI && LayeroShopUI.i18n && LayeroShopUI.i18n.subscribed) ? LayeroShopUI.i18n.subscribed : 'Köszönjük, feliratkoztál.';
			}
		});
	}

	function initMiniCart(root) {
		if (root.dataset.layeroCartReady === '1') return;
		root.dataset.layeroCartReady = '1';

		var toggle = root.querySelector('[data-layero-cart-toggle]');
		var panel = root.querySelector('[data-layero-cart-panel]');
		if (!toggle || !panel) return;
		toggle.addEventListener('click', function () {
			var open = panel.hasAttribute('hidden');
			panel.toggleAttribute('hidden', !open);
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
	}

	function boot(context) {
		(context || document).querySelectorAll('[data-layero-slider]').forEach(initSlider);
		(context || document).querySelectorAll('[data-layero-lab]').forEach(initLab);
		(context || document).querySelectorAll('[data-layero-quiz]').forEach(initQuiz);
		(context || document).querySelectorAll('[data-layero-carousel]').forEach(initCarousel);
		(context || document).querySelectorAll('[data-layero-newsletter]').forEach(initNewsletter);
		(context || document).querySelectorAll('.lyr-mini-cart').forEach(initMiniCart);
		initWishlist(context || document);
	}

	document.addEventListener('DOMContentLoaded', function () { boot(document); });
	$(window).on('elementor/frontend/init', function () {
		if (!window.elementorFrontend) return;
		window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
			boot($scope[0]);
		});
	});
})(jQuery);
