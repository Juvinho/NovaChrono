'use strict';

var TimelineController = {
	onDateSelect: function (dateString) {
		if (typeof FeedRenderer !== 'undefined' && FeedRenderer && typeof FeedRenderer.applyDateFilter === 'function') {
			FeedRenderer.applyDateFilter(dateString, true);
		}
	},

	onDateClear: function () {
		if (typeof FeedRenderer !== 'undefined' && FeedRenderer && typeof FeedRenderer.clearDateFilter === 'function') {
			FeedRenderer.clearDateFilter(true);
		}
	},

	init: function () {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.init === 'function') {
			ChronoTimeline.init();
		}
	},

	buildDates: function (centerDate) {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.generateDaysData === 'function') {
			return ChronoTimeline.generateDaysData(centerDate || new Date(), {
				beforeDays: ChronoTimeline.defaultRangeDays || 10,
				afterDays: ChronoTimeline.defaultRangeDays || 10
			});
		}

		return [];
	},

	selectDate: function (dateString, options) {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.selectDate === 'function') {
			return ChronoTimeline.selectDate(dateString, options || {});
		}

		return false;
	},

	clearDate: function (options) {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.clearDate === 'function') {
			ChronoTimeline.clearDate(options || {});
		}
	},

	scrollToDate: function (dateString, options) {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.scrollToDate === 'function') {
			return ChronoTimeline.scrollToDate(dateString, options || {});
		}

		return false;
	},

	scrollToToday: function (smooth, withPulse) {
		if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.scrollToToday === 'function') {
			ChronoTimeline.scrollToToday(smooth, withPulse);
		}
	}
};
