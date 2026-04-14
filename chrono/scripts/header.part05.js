'use strict';

Object.assign(AppRouter, {
currentView: 'feed',
pendingRoute: '',
normalizeRoute: function (route) {
          var normalized = String(route || '').replace(/^#/, '').replace(/^\/+/, '').trim().toLowerCase();
          return normalized || 'feed';
        },
routeToView: function (route) {
          var normalized = this.normalizeRoute(route);

          if (normalized === 'cordao' || normalized.indexOf('cordao/') === 0) {
            return 'cordao';
          }

          if (normalized === 'profile') {
            return 'profile';
          }

          if (normalized === 'edit-profile') {
            return 'edit-profile';
          }

          if (normalized === 'stats') {
            return 'stats';
          }

          if (normalized === 'settings/theme') {
            return 'theme';
          }

          if (normalized === 'settings/language') {
            return 'language';
          }

          if (normalized === 'signed-out') {
            return 'signed-out';
          }

          return 'feed';
        },
navigate: function (route, options) {
          var target = this.normalizeRoute(route);
          var targetHash = '#' + target;

          if (options && options.replace && window.history && typeof window.history.replaceState === 'function') {
            window.history.replaceState(null, '', targetHash);
            this.requestRoute(target, true);
            return;
          }

          if (window.location.hash === targetHash) {
            this.requestRoute(target, true);
            return;
          }

          window.location.hash = target;
        },
setActiveView: function (viewName) {
          if (!appViewContainer) {
            return;
          }

          var current = appViewContainer.querySelector('.app-view.is-active');
          var next = appViewContainer.querySelector('[data-view="' + viewName + '"]');

          if (!next) {
            return;
          }

          if (current && current !== next) {
            current.classList.remove('is-entering');
            current.classList.add('is-leaving');
            setTimeout(function () {
              current.classList.remove('is-active', 'is-leaving');
            }, 140);
          }

          next.classList.add('is-active');
          next.classList.remove('is-leaving');
          next.classList.add('is-entering');
          setTimeout(function () {
            next.classList.remove('is-entering');
          }, 180);
        },
applyLayout: function (viewName) {
          var isInternal = viewName !== 'feed';
          document.body.classList.toggle('layout-internal', isInternal);
          document.body.classList.toggle('layout-hide-timeline', viewName === 'signed-out');
        },
closeUnsavedPrompt: function () {
          if (!unsavedOverlay) {
            return;
          }

          unsavedOverlay.classList.remove('is-open');
          unsavedOverlay.setAttribute('aria-hidden', 'true');
          this.pendingRoute = '';
        },
promptUnsaved: function (route) {
          if (!unsavedOverlay) {
            return false;
          }

          this.pendingRoute = route;
          unsavedOverlay.classList.add('is-open');
          unsavedOverlay.setAttribute('aria-hidden', 'false');
          return true;
        },
confirmUnsavedDiscard: function () {
          var target = this.pendingRoute || 'profile';
          this.closeUnsavedPrompt();
          seedEditFormFromState();
          this.navigate(target, { replace: true });
        }
});

Object.assign(AppRouter, {
requestRoute: function (route, force) {
          var normalized = this.normalizeRoute(route);
          var nextView = this.routeToView(normalized);

          if (AppState.signedOut && nextView !== 'signed-out') {
            this.navigate('signed-out', { replace: true });
            return;
          }

          if (this.currentView === 'edit-profile' && nextView !== 'edit-profile' && hasEditUnsavedChanges()) {
            if (force) {
              seedEditFormFromState();
            } else if (this.promptUnsaved(normalized)) {
              return;
            }
          }

          this.currentView = nextView;
          this.setActiveView(nextView);
          this.applyLayout(nextView);

          if (nextView === 'cordao') {
            var activeCordaoSlug = CordaoRouter.syncFromRoute(normalized);
            CordaoView.render(activeCordaoSlug);
          } else {
            SidebarCordoes.setActiveSlug('');
          }

          if (nextView === 'profile') {
            renderProfileView();
          }

          if (nextView === 'edit-profile') {
            seedEditFormFromState();
          }

          if (nextView === 'stats') {
            renderStatsView();
          }

          if (nextView === 'theme') {
            renderThemeView();
          }

          if (nextView === 'language') {
            renderLanguageSelection();
          }
          if (HeaderModule) {
            HeaderModule.closePanel();
          }

          if (typeof HeaderLogoController !== 'undefined' && HeaderLogoController && typeof HeaderLogoController.syncWithRoute === 'function') {
            HeaderLogoController.syncWithRoute(nextView);
          }

          if (typeof ChronoLogoFX !== 'undefined' && ChronoLogoFX && typeof ChronoLogoFX.syncWithRoute === 'function') {
            ChronoLogoFX.syncWithRoute(nextView);
          }

          safeIconRefresh();
        },
performLogout: function () {
          var self = this;
          AppState.signedOut = true;
          document.body.classList.add('logout-fade');

          setTimeout(function () {
            document.body.classList.remove('logout-fade');
            self.navigate('signed-out', { replace: true });
            showAppToast('Sessao encerrada.');
          }, 220);
        },
restoreSession: function () {
          AppState.signedOut = false;
          this.navigate('feed', { replace: true });
          showAppToast('Sessao restaurada.');
        }
});
