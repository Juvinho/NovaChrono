'use strict';

Object.assign(HeaderModule, {
setupLogoutButton: function () {
          var self = this;

          if (this.logoutButton) {
            this.logoutButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.logoutButton.classList.remove('is-leaving');
              void self.logoutButton.offsetWidth;
              self.logoutButton.classList.add('is-leaving');
              setTimeout(function () {
                self.logoutButton.classList.remove('is-leaving');
              }, 220);
              self.showLogoutOverlay();
            });
          }

          if (this.logoutCancelButton) {
            this.logoutCancelButton.addEventListener('click', function () {
              self.hideLogoutOverlay();
            });
          }

          if (this.logoutConfirmButton) {
            this.logoutConfirmButton.addEventListener('click', function () {
              self.hideLogoutOverlay();
              if (AppRouter && typeof AppRouter.performLogout === 'function') {
                AppRouter.performLogout();
              }
            });
          }
        },
setupOutsideClickClose: function () {
          var self = this;

          if (this.headerOverlay) {
            this.headerOverlay.addEventListener('click', function () {
              self.closePanel();
            });
          }

          document.addEventListener('click', function (event) {
            var target = event.target;

            if (self.activePanel === 'notifs') {
              if (!target.closest('#notifButton') && !target.closest('#notifDropdown')) {
                self.closePanel();
              }
            }

            if (self.activePanel === 'profile') {
              if (!target.closest('#profileButton') && !target.closest('#profileDropdown')) {
                self.closePanel();
              }
            }

            if (self.settingsOverlay && self.settingsOverlay.classList.contains('is-open') && target === self.settingsOverlay) {
              self.closeSettingsOverlay();
            }

            if (self.logoutOverlay && self.logoutOverlay.classList.contains('is-open') && target === self.logoutOverlay) {
              self.hideLogoutOverlay();
            }
          });

          document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') {
              return;
            }

            if (self.settingsOverlay && self.settingsOverlay.classList.contains('is-open')) {
              self.closeSettingsOverlay();
              return;
            }

            if (self.logoutOverlay && self.logoutOverlay.classList.contains('is-open')) {
              self.hideLogoutOverlay();
              return;
            }

            self.closePanel();
          });
        },
openPanel: function (name) {
          if (this.activePanel === name) {
            this.closePanel();
            return;
          }

          this.closePanel();

          if (name === 'dms') {
            this.openDrawer(this.dmDrawer);
            this.activePanel = 'dms';
            return;
          }

          if (name === 'bookmarks') {
            this.openDrawer(this.bookmarkDrawer);
            this.activePanel = 'bookmarks';
            return;
          }

          if (name === 'notifs' && this.notifDropdown) {
            this.positionFloatingDropdown(this.notifButton, this.notifDropdown, 320);
            this.notifDropdown.classList.add('is-open');
            this.notifDropdown.setAttribute('data-open', 'true');
            this.activePanel = 'notifs';
            return;
          }

          if (name === 'profile' && this.profileDropdown) {
            this.positionFloatingDropdown(this.profileButton, this.profileDropdown, 200);
            this.profileDropdown.classList.add('is-open');
            this.profileDropdown.setAttribute('data-open', 'true');
            if (this.profileButton) {
              this.profileButton.classList.add('is-open');
            }
            this.activePanel = 'profile';
          }
        },
closePanel: function () {
          if (this.activePanel === 'dms') {
            this.closeDrawer(this.dmDrawer);
          }

          if (this.activePanel === 'bookmarks') {
            this.closeDrawer(this.bookmarkDrawer);
          }

          if (this.activePanel === 'notifs' && this.notifDropdown) {
            this.notifDropdown.classList.remove('is-open');
            this.notifDropdown.setAttribute('data-open', 'false');
          }

          if (this.activePanel === 'profile') {
            if (this.profileDropdown) {
              this.profileDropdown.classList.remove('is-open');
              this.profileDropdown.setAttribute('data-open', 'false');
            }

            if (this.profileButton) {
              this.profileButton.classList.remove('is-open');
            }
          }

          if (this.headerOverlay && this.activePanel !== 'dms' && this.activePanel !== 'bookmarks') {
            this.headerOverlay.classList.remove('is-visible');
          }

          this.activePanel = null;
        },
openDrawer: function (drawer) {
          if (!drawer) {
            return;
          }

          if (this.headerOverlay) {
            this.headerOverlay.classList.add('is-visible');
          }

          drawer.classList.remove('is-closing');

          requestAnimationFrame(function () {
            drawer.classList.add('is-open');
          });
        }
});
