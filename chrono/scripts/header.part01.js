'use strict';

var HeaderModule = {};

Object.assign(HeaderModule, {
notifCount: 1,
dmCount: 0,
activePanel: null,
bookmarkTab: 'todos',
themeMode: 'dark',
bookmarkItems: [
          {
            id: 'bm-cuberta',
            user: '@cuberta_dobrada',
            avatar: 'https://picsum.photos/seed/book-cuberta/56/56',
            text: 'Nunca vi a rua principal tao vazia e tao bonita ao mesmo tempo...',
            type: 'posts'
          },
          {
            id: 'bm-susbacon',
            user: '@Sus_Bacon',
            avatar: 'https://picsum.photos/seed/book-susbacon/56/56',
            text: 'A ponte de aco no fim da avenida acendeu sozinha de novo...',
            type: 'midia'
          },
          {
            id: 'bm-padaria',
            user: '@padaria_quantica',
            avatar: 'https://picsum.photos/seed/book-padaria/56/56',
            text: 'os logs do servidor antigo ainda estao la intactos',
            type: 'enquetes'
          }
        ],
init: function () {
          this.cacheElements();

          if (!this.headerRight) {
            return;
          }

          this.setupTooltips();
          this.setupSendButton();
          this.setupBookmarkButton();
          this.setupBellButton();
          this.setupSettingsButton();
          this.setupProfileButton();
          this.setupLogoutButton();
          this.setupOutsideClickClose();
          this.renderBookmarks();
          this.syncBadges(false);
          this.syncThemeRow();
          this.setupFloatingDropdownPositioning();

          if (window.location.hash === '#settings') {
            this.openSettingsOverlay();
          }
        },
cacheElements: function () {
          this.headerRight = document.getElementById('headerRight');
          this.dmButton = document.getElementById('dmButton');
          this.bookmarkButton = document.getElementById('bookmarkButton');
          this.notifButton = document.getElementById('notifButton');
          this.settingsButton = document.getElementById('settingsButton');
          this.profileButton = document.getElementById('profileButton');
          this.logoutButton = document.getElementById('logoutButton');

          this.dmBadge = document.getElementById('dmBadge');
          this.notifBadge = document.getElementById('notifBadge');

          this.headerOverlay = document.getElementById('headerOverlay');
          this.dmDrawer = document.getElementById('dmDrawer');
          this.bookmarkDrawer = document.getElementById('bookmarkDrawer');
          this.closeDmDrawer = document.getElementById('closeDmDrawer');
          this.closeBookmarkDrawer = document.getElementById('closeBookmarkDrawer');

          this.bookmarkTabs = document.getElementById('bookmarkTabs');
          this.bookmarkList = document.getElementById('bookmarkList');

          this.notifDropdown = document.getElementById('notifDropdown');
          this.markReadButton = document.getElementById('markReadButton');

          this.profileDropdown = document.getElementById('profileDropdown');
          this.themeToggleButton = document.getElementById('themeToggleButton');
          this.themeToggleIcon = document.getElementById('themeToggleIcon');
          this.themeToggleLabel = document.getElementById('themeToggleLabel');
          this.profileLogoutButton = document.getElementById('profileLogoutButton');

          this.settingsOverlay = document.getElementById('settingsOverlay');
          this.settingsBackButton = document.getElementById('settingsBackButton');

          this.logoutOverlay = document.getElementById('logoutOverlay');
          this.logoutCancelButton = document.getElementById('logoutCancelButton');
          this.logoutConfirmButton = document.getElementById('logoutConfirmButton');

          if (this.notifDropdown) {
            this.notifDropdown.setAttribute('data-open', 'false');
          }

          if (this.profileDropdown) {
            this.profileDropdown.setAttribute('data-open', 'false');
          }
        },
positionFloatingDropdown: function (triggerBtn, dropdown, preferredWidth) {
          if (!triggerBtn || !dropdown) {
            return;
          }

          var rect = triggerBtn.getBoundingClientRect();
          var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
          var dropdownWidth = Number(preferredWidth) || dropdown.offsetWidth || 320;
          var maxWidth = Math.max(0, viewportWidth - 32);

          if (maxWidth > 0) {
            dropdownWidth = Math.min(dropdownWidth, maxWidth);
          }

          var left = rect.right - dropdownWidth;
          if (left < 16) {
            left = 16;
          }

          if (left + dropdownWidth > viewportWidth - 16) {
            left = viewportWidth - dropdownWidth - 16;
          }

          if (left < 16) {
            left = 16;
          }

          dropdown.style.position = 'fixed';
          dropdown.style.top = (rect.bottom + 8) + 'px';
          dropdown.style.left = Math.round(left) + 'px';
          dropdown.style.right = 'auto';
          dropdown.style.width = Math.round(dropdownWidth) + 'px';
        },
repositionOpenDropdowns: function () {
          if (this.notifDropdown && this.notifDropdown.getAttribute('data-open') === 'true') {
            this.positionFloatingDropdown(this.notifButton, this.notifDropdown, 320);
          }

          if (this.profileDropdown && this.profileDropdown.getAttribute('data-open') === 'true') {
            this.positionFloatingDropdown(this.profileButton, this.profileDropdown, 200);
          }
        },
setupFloatingDropdownPositioning: function () {
          var self = this;

          window.addEventListener('resize', function () {
            self.repositionOpenDropdowns();
          });
        }
});
