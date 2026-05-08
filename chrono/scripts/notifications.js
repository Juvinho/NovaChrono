'use strict';

var NotificationsPanel = {
  init: function () {},
  open: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.openPanel === 'function') {
      HeaderModule.openPanel('notifs');
    }
  },
  close: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.closePanel === 'function') {
      HeaderModule.closePanel();
    }
  },
  toggle: function () {
    if (typeof HeaderModule === 'undefined' || !HeaderModule || typeof HeaderModule.openPanel !== 'function') {
      return;
    }

    if (HeaderModule.activePanel === 'notifs') {
      HeaderModule.closePanel();
    } else {
      HeaderModule.openPanel('notifs');
    }
  },
  clearBadge: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule) {
      HeaderModule.notifCount = 0;
      if (typeof HeaderModule.updateBadge === 'function') {
        HeaderModule.updateBadge(HeaderModule.notifBadge, HeaderModule.notifCount, false);
      }
    }
  }
};
