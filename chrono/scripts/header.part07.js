'use strict';

Object.assign(AppRouter, {
init: function () {
          syncHeaderIdentity();
          renderProfileView();
          seedEditFormFromState();
          renderStatsView();
          renderThemeView();
          applyThemeSettings();
          applyLanguagePack();
          this.bindEvents();
          this.requestRoute(window.location.hash, true);
        }
});

var HeaderActions = {
  init: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.init === 'function') {
      HeaderModule.init();
    }
  },
  bindAll: function () {}
};

var SearchController = {
  init: function () {},
  filter: function (query) {
    if (searchInput) {
      searchInput.value = String(query || '');
      state.query = normalize(searchInput.value.trim());
      if (typeof FeedFilters !== 'undefined' && FeedFilters && FeedFilters.isInitialized) {
        FeedFilters.applyFilter(FeedFilters.current, false);
      } else if (typeof renderFeed === 'function') {
        renderFeed();
      }
    }
  },
  clear: function () {
    this.filter('');
  }
};
