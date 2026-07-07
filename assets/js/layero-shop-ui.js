(function ($) {
	'use strict';

	function initSlider(root) {
		var slides = Array.prototype.slice.call(root.querySelectorAll('.lyr-hero__slide'));
		var dotsWrap = root.querySelector('.lyr-hero__dots');
		if (!slides.length || !dotsWrap) return;

		var current = 0;
		dotsWrap.innerHTML = slides.map(function (_, index) {
			return '<button type="button" aria-label="' + (index + 1) + '. slide"></button>';
		}).join('');
		var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('button'));

		function go(index) {
			current = (index + slides.length) % slides.length;
			slides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === current); });
			dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === current); });
		}

		root.querySelector('.lyr-hero__nav--prev').addEventListener('click', function () { go(current - 1); });
		root.querySelector('.lyr-hero__nav--next').addEventListener('click', function () { go(current + 1); });
		dots.forEach(function (dot, i) { dot.addEventListener('click', function () { go(i); }); });

		var pointerId = null;
		var startX = 0;
		var startY = 0;
		root.addEventListener('pointerdown', function (event) {
			if (event.target.closest('a,button,input')) return;
			pointerId = event.pointerId;
			startX = event.clientX;
			startY = event.clientY;
		});
		root.addEventListener('pointerup', function (event) {
			if (pointerId !== event.pointerId) return;
			var dx = event.clientX - startX;
			var dy = event.clientY - startY;
			if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
			pointerId = null;
		});

		go(0);
	}

	function initLab(root) {
		var input = root.querySelector('input');
		var name = root.querySelector('[data-layero-lab-name]');
		var link = root.querySelector('[data-layero-lab-link]');
		if (!input || !name) return;
		input.addEventListener('input', function () {
			var value = input.value.trim() || 'Layero';
			name.textContent = value;
			if (link) {
				var href = link.getAttribute('href').split('?')[0];
				link.setAttribute('href', href + '?layero_nev=' + encodeURIComponent(value));
			}
		});
		root.querySelector('form').addEventListener('submit', function (event) {
			event.preventDefault();
			if (link) window.location.href = link.getAttribute('href');
		});
	}

	function initMiniCart(root) {
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

