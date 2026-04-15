'use strict';

function boot() {
        safeIconRefresh();

        if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.init === 'function') {
          VoteSystem.init();
        }

        if (typeof VoteModal !== 'undefined' && VoteModal && typeof VoteModal.init === 'function') {
          VoteModal.init();
        }

        if (typeof HeaderLogoController !== 'undefined' && HeaderLogoController && typeof HeaderLogoController.init === 'function') {
          HeaderLogoController.init();
        }

        if (typeof ChronoLogoFX !== 'undefined' && ChronoLogoFX && typeof ChronoLogoFX.init === 'function') {
          ChronoLogoFX.init();
        }

        if (typeof CordaoStore !== 'undefined' && CordaoStore && typeof CordaoStore.init === 'function') {
          CordaoStore.init();
        }

        if (typeof SidebarCordoes !== 'undefined' && SidebarCordoes && typeof SidebarCordoes.init === 'function') {
          SidebarCordoes.init();
        }

        if (typeof CordaoView !== 'undefined' && CordaoView && typeof CordaoView.init === 'function') {
          CordaoView.init();
        }

        if (typeof CordaoModal !== 'undefined' && CordaoModal && typeof CordaoModal.init === 'function') {
          CordaoModal.init();
        }

        if (typeof DMPage !== 'undefined' && DMPage && typeof DMPage.init === 'function') {
          DMPage.init();
        }

        if (typeof ProfilePage !== 'undefined' && ProfilePage && typeof ProfilePage.init === 'function') {
          ProfilePage.init();
        }

        if (typeof SettingsPage !== 'undefined' && SettingsPage && typeof SettingsPage.init === 'function') {
          SettingsPage.init();
        }

        if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.init === 'function') {
          AppRouter.init();
        }

        if (typeof ThemeController !== 'undefined' && ThemeController && typeof ThemeController.applyAccentColor === 'function') {
          var savedColor = (typeof ThemeController.getSavedAccentColor === 'function')
            ? ThemeController.getSavedAccentColor()
            : ((typeof AppState !== 'undefined' && AppState && AppState.user && AppState.user.accentColor)
              ? AppState.user.accentColor
              : 'purple');

          ThemeController.applyAccentColor(savedColor, false, {
            persist: false,
            pulse: false,
            forceCurrent: true
          });
        }

        if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.init === 'function') {
          HeaderModule.init();
        }

        if (typeof HeaderActions !== 'undefined' && HeaderActions && typeof HeaderActions.bindAll === 'function') {
          HeaderActions.bindAll();
        }

        if (typeof SearchController !== 'undefined' && SearchController && typeof SearchController.init === 'function') {
          SearchController.init();
        }

        if (typeof TimelineController !== 'undefined' && TimelineController && typeof TimelineController.init === 'function') {
          TimelineController.init();
        } else if (typeof ChronoTimeline !== 'undefined' && ChronoTimeline && typeof ChronoTimeline.init === 'function') {
          ChronoTimeline.init();
        }

        if (typeof ThreadModal !== 'undefined' && ThreadModal && typeof ThreadModal.init === 'function') {
          ThreadModal.init();
        }

        if (typeof attachEvents === 'function') {
          attachEvents();
        }

        if (typeof AutocompleteSystem !== 'undefined' && AutocompleteSystem && typeof AutocompleteSystem.init === 'function') {
          AutocompleteSystem.init();
        }

        if (typeof autoExpandComposer === 'function') {
          autoExpandComposer();
        }

        if (typeof updatePublishState === 'function') {
          updatePublishState();
        }

        if (typeof window.lucide !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }

        setTimeout(function () {
          if (feedSkeleton) {
            feedSkeleton.style.display = 'none';
          }

          if (feedList) {
            feedList.classList.remove('hidden');
          }

          if (typeof renderFeed === 'function') {
            renderFeed({ withStagger: true });
          }

          if (typeof FeedFilters !== 'undefined' && FeedFilters && typeof FeedFilters.init === 'function') {
            FeedFilters.init();
          }
        }, 800);
      }

      document.addEventListener('DOMContentLoaded', function () {
        boot();
      });
