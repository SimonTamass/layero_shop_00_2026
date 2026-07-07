(function ($) {
	'use strict';

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
				var href = link.getAttribute('href').split('?')[0];
				link.setAttribute('href', href + '?layero_nev=' + encodeURIComponent(value));
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
		(context || document).querySelectorAll('[data-layero-carousel]').forEach(initCarousel);
		(context || document).querySelectorAll('[data-layero-newsletter]').forEach(initNewsletter);
		(context || document).querySelectorAll('.lyr-mini-cart').forEach(initMiniCart);
	}

	document.addEventListener('DOMContentLoaded', function () { boot(document); });
	$(window).on('elementor/frontend/init', function () {
		if (!window.elementorFrontend) return;
		window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
			boot($scope[0]);
		});
	});
})(jQuery);
