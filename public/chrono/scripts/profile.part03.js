'use strict';

function applyThemeSettings() {
        var theme = AppState.settings.theme;
        var resolvedTheme = theme;

        if (theme === 'system') {
          resolvedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (resolvedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }

        if (AppState.settings.density === 'default') {
          document.body.removeAttribute('data-density');
        } else {
          document.body.setAttribute('data-density', AppState.settings.density);
        }

        document.body.classList.toggle('reduced-motion', !!AppState.settings.reducedMotion);
        document.body.classList.toggle('no-cordao-highlight', !AppState.settings.cordaoHighlight);

        var particles = document.querySelector('.bg-particles');
        if (particles) {
          particles.classList.toggle('is-hidden', !AppState.settings.particles);
        }

        if (typeof ThemeController !== 'undefined' && ThemeController && typeof ThemeController.syncFromState === 'function') {
          ThemeController.syncFromState();
        }

        if (HeaderModule) {
          HeaderModule.themeMode = AppState.settings.theme;
          HeaderModule.syncThemeRow();
        }
      }

function renderLanguageSelection() {
        Array.prototype.slice.call(languageList ? languageList.querySelectorAll('.language-card') : []).forEach(function (card) {
          card.classList.toggle('active', card.getAttribute('data-language') === AppState.language);
        });
      }

function applyLanguagePack() {
        var pack = I18N_PACKS[AppState.language] || I18N_PACKS.pt;

        setNodeText(document.getElementById('menuProfileLabel'), pack.menuProfile);
        setNodeText(document.getElementById('menuEditProfileLabel'), pack.menuEditProfile);
        setNodeText(document.getElementById('menuStatsLabel'), pack.menuStats);
        setNodeText(document.getElementById('menuLogoutLabel'), pack.menuLogout);
        setNodeText(languageMenuLabel, pack.languageMenu);

        setNodeText(feedTabAll, pack.tabAll);
        setNodeText(feedTabFollowing, pack.tabFollowing);
        setNodeText(feedTabMedia, pack.tabMedia);
        setNodeText(feedTabPolls, pack.tabPolls);

        setNodeText(createThreadBtn, pack.createThread);
        setNodeText(notifViewAllButton, pack.notifViewAll);

        setNodeText(editViewTitle, pack.editTitle);
        setNodeText(editViewSubtitle, pack.editSubtitle);
        setNodeText(statsViewTitle, pack.statsTitle);
        setNodeText(statsViewSubtitle, pack.statsSubtitle);
        setNodeText(themeViewTitle, pack.themeTitle);
        setNodeText(themeViewSubtitle, pack.themeSubtitle);
        setNodeText(languageViewTitle, pack.languageTitle);
        setNodeText(languageViewSubtitle, pack.languageSubtitle);

        setNodeText(logoutTitleEl, pack.logoutTitle);
        setNodeText(logoutSubtitleEl, pack.logoutSubtitle);
        setNodeText(signedOutTitle, pack.signedOutTitle);
        setNodeText(signedOutText, pack.signedOutText);
        setNodeText(signInAgainButton, pack.signInAgain);

        renderLanguageSelection();
      }

var CHRONO_LOGO_FALLBACK_DATA_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">' +
          '<rect width="256" height="256" fill="#000"/>' +
          '<path d="M123 57c-37 0-66 31-66 71 0 39 29 71 66 71 22 0 42-10 55-27l-18-26c-9 11-22 17-37 17-22 0-39-19-39-41 0-23 17-41 39-41 15 0 28 7 37 18l18-26c-13-17-33-26-55-26z" fill="#fff"/>' +
          '<circle cx="187" cy="178" r="17" fill="#fff"/>' +
        '</svg>'
      );

var ProfileMenu = {
  init: function () {},
  open: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.openPanel === 'function') {
      HeaderModule.openPanel('profile');
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

    if (HeaderModule.activePanel === 'profile') {
      HeaderModule.closePanel();
    } else {
      HeaderModule.openPanel('profile');
    }
  }
};

if (typeof LogoutDialog === 'undefined') {
var LogoutDialog = {
  open: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.showLogoutOverlay === 'function') {
      HeaderModule.showLogoutOverlay();
    }
  },
  close: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.hideLogoutOverlay === 'function') {
      HeaderModule.hideLogoutOverlay();
    }
  },
  confirm: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.performLogout === 'function') {
      AppRouter.performLogout();
    }
  }
};
}
