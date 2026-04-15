'use strict';

var FeedRenderer = {
	pendingDateFilterKey: '',

	renderPost: function (post, index, options) {
		if (typeof window.renderPost === 'function') {
			return window.renderPost(post, index, options);
		}
		return '';
	},

	render: function (options) {
		if (typeof window.renderFeed === 'function') {
			window.renderFeed(options || {});
		}
	},

	applyDateFilter: function (dateString, animated) {
		var key = String(dateString || '').trim();
		this.pendingDateFilterKey = key;

		if (typeof FeedFilters !== 'undefined' && FeedFilters && typeof FeedFilters.setDateFilter === 'function') {
			FeedFilters.setDateFilter(key, animated !== false);
		}
	},

	clearDateFilter: function (animated) {
		this.pendingDateFilterKey = '';

		if (typeof FeedFilters !== 'undefined' && FeedFilters && typeof FeedFilters.clearDateFilter === 'function') {
			FeedFilters.clearDateFilter(animated !== false);
		}
	},

	flushPendingDateFilter: function () {
		if (typeof FeedFilters === 'undefined' || !FeedFilters || !FeedFilters.isInitialized || typeof FeedFilters.setDateFilter !== 'function') {
			return;
		}

		if (this.pendingDateFilterKey) {
			FeedFilters.setDateFilter(this.pendingDateFilterKey, false);
		}
	}
};

var TabController = {
	init: function () {
		if (typeof FeedFilters !== 'undefined' && FeedFilters && typeof FeedFilters.init === 'function') {
			FeedFilters.init();
		}
	}
};

document.addEventListener('DOMContentLoaded', function () {
	if (typeof TimelineController === 'undefined' || !TimelineController) {
		return;
	}

	TimelineController.onDateSelect = function (date) {
		FeedRenderer.applyDateFilter(date, true);
	};

	TimelineController.onDateClear = function () {
		FeedRenderer.clearDateFilter(true);
	};
});
