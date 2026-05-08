'use strict';

Object.assign(HeaderModule, {
closeDrawer: function (drawer) {
          if (!drawer) {
            return;
          }

          drawer.classList.remove('is-open');
          drawer.classList.add('is-closing');

          if (this.headerOverlay) {
            this.headerOverlay.classList.remove('is-visible');
          }

          setTimeout(function () {
            drawer.classList.remove('is-closing');
          }, 220);
        },
syncBadges: function (animate) {
          this.updateBadge(this.notifBadge, this.notifCount, animate);
          this.updateBadge(this.dmBadge, this.dmCount, animate);
        },
updateBadge: function (badgeElement, count, animate) {
          if (!badgeElement) {
            return;
          }

          if (count <= 0) {
            badgeElement.classList.remove('is-pop');
            badgeElement.classList.add('is-hiding');

            setTimeout(function () {
              badgeElement.classList.remove('is-hiding');
              badgeElement.classList.add('is-hidden');
              badgeElement.textContent = '0';
            }, 170);
            return;
          }

          badgeElement.textContent = count > 99 ? '99+' : String(count);
          badgeElement.classList.remove('is-hidden', 'is-hiding');

          if (animate) {
            badgeElement.classList.remove('is-pop');
            void badgeElement.offsetWidth;
            badgeElement.classList.add('is-pop');
            setTimeout(function () {
              badgeElement.classList.remove('is-pop');
            }, 320);
          }
        },
incrementNotif: function () {
          this.notifCount += 1;
          this.updateBadge(this.notifBadge, this.notifCount, true);
        },
incrementDM: function () {
          this.dmCount += 1;
          this.updateBadge(this.dmBadge, this.dmCount, true);
        },
sendButtonFlyAnimation: function () {
          var icon = this.dmButton ? this.dmButton.querySelector('.send-icon') : null;
          if (!icon) {
            return;
          }

          icon.classList.remove('is-reappear', 'is-nudge', 'is-flying');
          void icon.offsetWidth;
          icon.classList.add('is-flying');

          setTimeout(function () {
            icon.classList.remove('is-flying');
            icon.classList.add('is-reappear');

            setTimeout(function () {
              icon.classList.remove('is-reappear');
            }, 210);
          }, 250);
        },
sendButtonNudge: function () {
          var icon = this.dmButton ? this.dmButton.querySelector('.send-icon') : null;
          if (!icon) {
            return;
          }

          icon.classList.remove('is-nudge');
          void icon.offsetWidth;
          icon.classList.add('is-nudge');

          setTimeout(function () {
            icon.classList.remove('is-nudge');
          }, 230);
        },
bookmarkClickAnimation: function () {
          var icon = this.bookmarkButton ? this.bookmarkButton.querySelector('.bookmark-icon') : null;
          if (!icon) {
            return;
          }

          icon.classList.remove('is-burst');
          void icon.offsetWidth;
          icon.classList.add('is-burst');

          setTimeout(function () {
            icon.classList.remove('is-burst');
          }, 340);
        },
bellShakeAnimation: function (isStrong) {
          var icon = this.notifButton ? this.notifButton.querySelector('.bell-icon') : null;
          if (!icon) {
            return;
          }

          icon.classList.remove('is-shake-soft', 'is-shake-strong');
          void icon.offsetWidth;
          icon.classList.add(isStrong ? 'is-shake-strong' : 'is-shake-soft');

          setTimeout(function () {
            icon.classList.remove('is-shake-soft', 'is-shake-strong');
          }, 460);
        },
settingsRotateAnimation: function () {
          var icon = this.settingsButton ? this.settingsButton.querySelector('.settings-icon') : null;
          if (!icon) {
            return;
          }

          icon.classList.remove('is-spin-click');
          void icon.offsetWidth;
          icon.classList.add('is-spin-click');

          setTimeout(function () {
            icon.classList.remove('is-spin-click');
          }, 320);
        },
openSettingsOverlay: function () {
          this.closePanel();

          if (AppRouter && typeof AppRouter.navigate === 'function') {
            AppRouter.navigate('configuracoes');
            return;
          }

          if (this.settingsOverlay) {
            this.settingsOverlay.classList.add('is-open');
            this.settingsOverlay.setAttribute('aria-hidden', 'false');
          }
        },
closeSettingsOverlay: function () {
          if (!this.settingsOverlay) {
            return;
          }

          this.settingsOverlay.classList.remove('is-open');
          this.settingsOverlay.setAttribute('aria-hidden', 'true');

          if (String(window.location.hash || '').indexOf('#configuracoes') === 0) {
            if (window.history && typeof window.history.replaceState === 'function') {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } else {
              window.location.hash = '';
            }
          }
        }
});

Object.assign(HeaderModule, {
showLogoutOverlay: function () {
          this.closePanel();

          if (!this.logoutOverlay) {
            return;
          }

          this.logoutOverlay.classList.add('is-open');
          this.logoutOverlay.setAttribute('aria-hidden', 'false');
        },
hideLogoutOverlay: function () {
          if (!this.logoutOverlay) {
            return;
          }

          this.logoutOverlay.classList.remove('is-open');
          this.logoutOverlay.setAttribute('aria-hidden', 'true');
        },
syncThemeRow: function () {
          if (!this.themeToggleLabel || !this.themeToggleIcon) {
            return;
          }

          if (this.themeMode === 'dark') {
            this.themeToggleLabel.textContent = 'Tema: escuro';
            this.themeToggleIcon.setAttribute('data-lucide', 'moon');
          } else if (this.themeMode === 'light') {
            this.themeToggleLabel.textContent = 'Tema: claro';
            this.themeToggleIcon.setAttribute('data-lucide', 'sun');
          } else {
            this.themeToggleLabel.textContent = 'Tema: sistema';
            this.themeToggleIcon.setAttribute('data-lucide', 'monitor');
          }

          if (this.themeMode === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
          safeIconRefresh();
        },
getFilteredBookmarks: function () {
          var tab = this.bookmarkTab;

          if (tab === 'todos') {
            return this.bookmarkItems.slice();
          }

          return this.bookmarkItems.filter(function (item) {
            return item.type === tab;
          });
        },
renderBookmarks: function () {
          if (!this.bookmarkList) {
            return;
          }

          var filtered = this.getFilteredBookmarks();

          if (!filtered.length) {
            this.bookmarkList.innerHTML = (
              '<li class="bookmark-empty">' +
                '<i data-lucide="bookmark"></i>' +
                '<span class="bookmark-empty-title">Nenhuma marcacao ainda</span>' +
                '<span>Salve posts tocando no icone ­ƒöû</span>' +
              '</li>'
            );
            safeIconRefresh();
            return;
          }

          this.bookmarkList.innerHTML = filtered.map(function (item) {
            return (
              '<li class="bookmark-item">' +
                '<img class="bookmark-avatar" src="' + item.avatar + '" alt="Avatar ' + item.user + '">' +
                '<div class="bookmark-content">' +
                  '<strong class="bookmark-user">' + item.user + '</strong>' +
                  '<p class="bookmark-text">' + item.text + '</p>' +
                '</div>' +
                '<button type="button" class="bookmark-remove-btn" data-bookmark-id="' + item.id + '" aria-label="Remover marcacao">' +
                  '<i data-lucide="x"></i>' +
                '</button>' +
              '</li>'
            );
          }).join('');

          safeIconRefresh();
        },
handleNewPost: function () {
          var chance = Math.random();

          if (chance < 0.7) {
            this.incrementNotif();
            this.bellShakeAnimation(false);
            return;
          }

          if (chance < 0.9) {
            this.incrementDM();
            this.sendButtonNudge();
            return;
          }

          this.incrementNotif();
        }
});

var AppRouter = {};
