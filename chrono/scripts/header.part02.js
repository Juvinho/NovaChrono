'use strict';

Object.assign(HeaderModule, {
setupTooltips: function () {
          if (!this.headerRight) {
            return;
          }

          var tooltipTargets = Array.prototype.slice.call(this.headerRight.querySelectorAll('[data-tooltip]'));

          tooltipTargets.forEach(function (target) {
            var tooltip = target.querySelector('.header-tooltip');
            if (!tooltip) {
              return;
            }

            function clearTooltip() {
              clearTimeout(target._tooltipTimer);
              tooltip.classList.remove('is-visible');
            }

            function showTooltip() {
              clearTimeout(target._tooltipTimer);
              target._tooltipTimer = setTimeout(function () {
                tooltip.classList.add('is-visible');
              }, 400);
            }

            target.addEventListener('mouseenter', showTooltip);
            target.addEventListener('mouseleave', clearTooltip);
            target.addEventListener('focus', showTooltip);
            target.addEventListener('blur', clearTooltip);
          });
        },
setupSendButton: function () {
          var self = this;

          if (this.dmButton) {
            this.dmButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.sendButtonFlyAnimation();
              self.closePanel();

              if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
                AppRouter.navigate('mensagens');
              }
            });
          }

          if (this.closeDmDrawer) {
            this.closeDmDrawer.addEventListener('click', function () {
              self.closePanel();
            });
          }
        },
setupBookmarkButton: function () {
          var self = this;

          if (this.bookmarkButton) {
            this.bookmarkButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.bookmarkClickAnimation();
              self.openPanel('bookmarks');
            });
          }

          if (this.closeBookmarkDrawer) {
            this.closeBookmarkDrawer.addEventListener('click', function () {
              self.closePanel();
            });
          }

          if (this.bookmarkTabs) {
            this.bookmarkTabs.addEventListener('click', function (event) {
              var tabButton = event.target.closest('.bookmark-tab');
              if (!tabButton) {
                return;
              }

              self.bookmarkTab = tabButton.getAttribute('data-bookmark-tab') || 'todos';

              Array.prototype.slice.call(self.bookmarkTabs.querySelectorAll('.bookmark-tab')).forEach(function (btn) {
                btn.classList.toggle('active', btn === tabButton);
              });

              self.renderBookmarks();
            });
          }

          if (this.bookmarkList) {
            this.bookmarkList.addEventListener('click', function (event) {
              var removeButton = event.target.closest('.bookmark-remove-btn');
              if (!removeButton) {
                return;
              }

              var bookmarkId = removeButton.getAttribute('data-bookmark-id');
              self.bookmarkItems = self.bookmarkItems.filter(function (item) {
                return item.id !== bookmarkId;
              });

              self.renderBookmarks();
            });
          }
        },
setupBellButton: function () {
          var self = this;

          if (this.notifButton) {
            this.notifButton.addEventListener('mouseenter', function () {
              self.bellShakeAnimation(false);
            });

            this.notifButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.bellShakeAnimation(true);
              self.openPanel('notifs');

              if (self.notifCount > 0) {
                self.notifCount = 0;
                self.updateBadge(self.notifBadge, self.notifCount, false);
              }
            });
          }

          if (this.markReadButton) {
            this.markReadButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.notifCount = 0;
              self.updateBadge(self.notifBadge, self.notifCount, false);
            });
          }
        },
setupSettingsButton: function () {
          var self = this;

          if (this.settingsButton) {
            this.settingsButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.settingsRotateAnimation();
              self.closePanel();
              if (AppRouter && typeof AppRouter.navigate === 'function') {
                AppRouter.navigate('configuracoes');
              }
            });
          }

          if (this.settingsBackButton) {
            this.settingsBackButton.addEventListener('click', function () {
              self.closeSettingsOverlay();
            });
          }
        },
setupProfileButton: function () {
          var self = this;

          if (this.profileButton) {
            this.profileButton.addEventListener('click', function (event) {
              event.preventDefault();

              if (self.activePanel === 'profile') {
                self.closePanel();
                return;
              }

              self.openPanel('profile');

              if (typeof bindClickOutside === 'function' && self.profileDropdown) {
                if (typeof self._unbindProfileOutside === 'function') {
                  self._unbindProfileOutside();
                }

                self._unbindProfileOutside = bindClickOutside(self.profileDropdown, function () {
                  if (self.activePanel === 'profile') {
                    self.closePanel();
                  }
                }, {
                  ignoreSelectors: ['#profileButton']
                });
              }
            });
          }

          if (this.themeToggleButton) {
            this.themeToggleButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.closePanel();
              if (AppRouter && typeof AppRouter.navigate === 'function') {
                AppRouter.navigate('configuracoes/aparencia');
              }
            });
          }

          if (this.profileLogoutButton) {
            this.profileLogoutButton.addEventListener('click', function (event) {
              event.preventDefault();

              if (typeof LogoutDialog !== 'undefined' && LogoutDialog && typeof LogoutDialog.open === 'function') {
                LogoutDialog.open({ keepDropdown: true });
                return;
              }

              self.showLogoutOverlay();
            });
          }
        }
});
