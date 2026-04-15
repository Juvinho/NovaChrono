'use strict';

if (typeof HeaderActions === 'undefined') {
	var HeaderActions = {
		init: function () {},
		bindAll: function () {}
	};
}

if (typeof SearchController === 'undefined') {
	var SearchController = {
		init: function () {},
		filter: function () {},
		clear: function () {}
	};
}

var __headerDelegationBound = false;

HeaderActions.bindAll = function () {
	if (__headerDelegationBound) {
		return;
	}

	var headerRoot = document.getElementById('headerRight');
	if (!headerRoot) {
		return;
	}

	__headerDelegationBound = true;

	headerRoot.addEventListener('click', function (event) {
		if (event.defaultPrevented) {
			return;
		}

		var target = event.target.closest('[data-action]');
		if (!target) {
			return;
		}

		var action = String(target.getAttribute('data-action') || '').trim();
		if (!action) {
			return;
		}

		if (action === 'dm' && AppRouter && typeof AppRouter.navigate === 'function') {
			AppRouter.navigate('mensagens');
			return;
		}

		if (action === 'settings' && AppRouter && typeof AppRouter.navigate === 'function') {
			AppRouter.navigate('configuracoes');
			return;
		}

		if (action === 'notifications' && HeaderModule && typeof HeaderModule.openPanel === 'function') {
			HeaderModule.openPanel('notifs');
			return;
		}

		if (action === 'bookmarks' && HeaderModule && typeof HeaderModule.openPanel === 'function') {
			HeaderModule.openPanel('bookmarks');
			return;
		}
	});
};

SearchController.init = function () {
	if (typeof SearchOverlay !== 'undefined' && SearchOverlay && typeof SearchOverlay.init === 'function') {
		SearchOverlay.init();
		SearchOverlay.syncWithController(searchInput ? searchInput.value : '');
	}

	if (!searchInput || searchInput.getAttribute('data-search-ready') === 'true') {
		return;
	}

	searchInput.setAttribute('data-search-ready', 'true');
	searchInput.addEventListener('focus', function () {
		if (typeof SearchOverlay !== 'undefined' && SearchOverlay && typeof SearchOverlay.open === 'function') {
			SearchOverlay.open({ query: searchInput.value });
		}
	});

	searchInput.addEventListener('keydown', function (event) {
		if (event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		if (typeof SearchOverlay !== 'undefined' && SearchOverlay && typeof SearchOverlay.isOpen === 'function' && SearchOverlay.isOpen()) {
			SearchOverlay.close();
			return;
		}

		SearchController.clear();
	});

	// Bind search icon button to focus the input
	var searchIconBtn = document.querySelector('.search-icon-btn');
	if (searchIconBtn) {
		searchIconBtn.addEventListener('click', function (event) {
			event.preventDefault();
			searchInput.focus();
		});
	}
};
