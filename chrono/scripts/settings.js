'use strict';

var SettingsPanel = {
  init: function () {},
  open: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('settings/theme');
    }
  },
  close: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.closeSettingsOverlay === 'function') {
      HeaderModule.closeSettingsOverlay();
    }
  },
  toggle: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && HeaderModule.settingsOverlay && HeaderModule.settingsOverlay.classList.contains('is-open')) {
      HeaderModule.closeSettingsOverlay();
      return;
    }
    this.open();
  },
  renderSection: function () {}
};
