'use strict';

if (typeof ThreadModal === 'undefined') {
	var ThreadModal = {
		open: function () {},
		close: function () {}
	};
}

if (typeof ThreadModal.renderReplies !== 'function') {
	ThreadModal.renderReplies = function () {
		if (typeof ThreadModal.renderResponsesList === 'function') {
			ThreadModal.renderResponsesList();
		}
	};
}
