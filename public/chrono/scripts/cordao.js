'use strict';

if (typeof CordaoStore === 'undefined') {
	var CordaoStore = {
		init: function () {}
	};
}

if (typeof CordaoModal === 'undefined') {
	var CordaoModal = {
		init: function () {},
		open: function () {},
		close: function () {}
	};
}

if (typeof CordaoView === 'undefined') {
	var CordaoView = {
		init: function () {},
		render: function () {}
	};
}

if (typeof CordaoRouter === 'undefined') {
	var CordaoRouter = {
		activeSlug: '',
		navigateToSlug: function () {},
		syncFromRoute: function () { return ''; }
	};
}
