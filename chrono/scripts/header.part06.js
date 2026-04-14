'use strict';

Object.assign(AppRouter, {
bindEvents: function () {
          var self = this;

          window.addEventListener('hashchange', function () {
            self.requestRoute(window.location.hash, false);
          });

          if (profileViewButton) {
            profileViewButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.navigate('perfil/' + getCurrentHandle());
            });
          }

          if (profileEditButton) {
            profileEditButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.navigate('configuracoes/conta');
            });
          }

          if (profileStatsButton) {
            profileStatsButton.addEventListener('click', function (event) {
              event.preventDefault();
              AppState.profileTab = 'posts';
              self.navigate('perfil/' + getCurrentHandle());
            });
          }

          if (languageSettingsButton) {
            languageSettingsButton.addEventListener('click', function (event) {
              event.preventDefault();
              self.navigate('configuracoes/aparencia');
            });
          }

          if (profileEditCta) {
            profileEditCta.addEventListener('click', function () {
              self.navigate('edit-profile');
            });
          }

          if (profileBackToFeedCta) {
            profileBackToFeedCta.addEventListener('click', function () {
              self.navigate('feed');
            });
          }

          if (createThreadBtn) {
            createThreadBtn.addEventListener('click', function () {
              CordaoModal.open();
            });
          }

          if (notifViewAllButton) {
            notifViewAllButton.addEventListener('click', function () {
              self.navigate('stats');
            });
          }

          if (profileFollowersBtn) {
            profileFollowersBtn.addEventListener('click', function () {
              openMiniModal('Seguidores', AppState.followers.length ? AppState.followers : ['Nenhum seguidor ainda.']);
            });
          }

          if (profileFollowingBtn) {
            profileFollowingBtn.addEventListener('click', function () {
              openMiniModal('Seguindo', AppState.following.length ? AppState.following : ['Voce ainda nao segue ninguem.']);
            });
          }

          if (profileTabs) {
            profileTabs.addEventListener('click', function (event) {
              var tab = event.target.closest('.profile-tab');
              if (!tab) {
                return;
              }

              AppState.profileTab = tab.getAttribute('data-profile-tab') || 'posts';
              renderProfileView();
            });
          }

          if (profileTabPanels) {
            profileTabPanels.addEventListener('click', function (event) {
              var profilePostCard = event.target.closest('[data-profile-post-id]');
              if (profilePostCard) {
                ThreadModal.open(profilePostCard.getAttribute('data-profile-post-id'));
                return;
              }

              var temporalGo = event.target.closest('#profileTemporalGo');
              if (temporalGo) {
                runTemporalSearch();
                return;
              }

              var bioLink = event.target.closest('[data-bio-handle]');
              if (bioLink) {
                event.preventDefault();
                openProfileRouteFromHandle(bioLink.getAttribute('data-bio-handle') || '@Chrono');
              }
            });

            profileTabPanels.addEventListener('keydown', function (event) {
              if (event.key !== 'Enter') {
                return;
              }

              var temporalInput = event.target.closest('#profileTemporalDate');
              if (!temporalInput) {
                return;
              }

              event.preventDefault();
              runTemporalSearch();
            });
          }

          if (editProfileForm) {
            editProfileForm.addEventListener('submit', commitProfileEdit);
          }

          if (editCancelButton) {
            editCancelButton.addEventListener('click', function () {
              self.navigate('profile');
            });
          }

          if (editBioInput) {
            editBioInput.addEventListener('input', updateEditBioCounter);
          }

          if (editUsernameInput) {
            editUsernameInput.addEventListener('input', validateEditUsername);
          }

          if (editAvatarButton && editAvatarInput) {
            editAvatarButton.addEventListener('click', function () {
              editAvatarInput.click();
            });

            editAvatarInput.addEventListener('change', function () {
              var file = editAvatarInput.files && editAvatarInput.files[0];
              readFileAsDataUrl(file, function (dataUrl) {
                editMediaDraft.avatar = dataUrl;
                if (editAvatarPreview) {
                  editAvatarPreview.src = dataUrl;
                }
              });
            });
          }

          if (editCoverButton && editCoverInput) {
            editCoverButton.addEventListener('click', function () {
              editCoverInput.click();
            });

            editCoverInput.addEventListener('change', function () {
              var file = editCoverInput.files && editCoverInput.files[0];
              readFileAsDataUrl(file, function (dataUrl) {
                editMediaDraft.cover = dataUrl;
                if (editCoverPreview) {
                  editCoverPreview.src = dataUrl;
                }
              });
            });
          }

          if (statsPeriodTabs) {
            statsPeriodTabs.addEventListener('click', function (event) {
              var button = event.target.closest('.stats-tab');
              if (!button) {
                return;
              }

              AppState.statsPeriod = button.getAttribute('data-stats-period') || '7d';
              renderStatsView();
            });
          }

          if (statsTopPosts) {
            statsTopPosts.addEventListener('click', function (event) {
              var card = event.target.closest('[data-stats-post-id]');
              if (!card) {
                return;
              }

              ThreadModal.open(card.getAttribute('data-stats-post-id'));
            });
          }

          if (themeModeChoices) {
            themeModeChoices.addEventListener('click', function (event) {
              var card = event.target.closest('.choice-card');
              if (!card) {
                return;
              }

              AppState.settings.theme = card.getAttribute('data-theme-mode') || 'dark';
              renderThemeView();
            });
          }

          if (densityChoices) {
            densityChoices.addEventListener('click', function (event) {
              var card = event.target.closest('.choice-card');
              if (!card) {
                return;
              }

              AppState.settings.density = card.getAttribute('data-density') || 'default';
              renderThemeView();
            });
          }

          if (toggleReducedMotion) {
            toggleReducedMotion.addEventListener('click', function () {
              AppState.settings.reducedMotion = !AppState.settings.reducedMotion;
              renderThemeView();
            });
          }

          if (toggleParticles) {
            toggleParticles.addEventListener('click', function () {
              AppState.settings.particles = !AppState.settings.particles;
              renderThemeView();
            });
          }

          if (toggleCordaoHighlight) {
            toggleCordaoHighlight.addEventListener('click', function () {
              AppState.settings.cordaoHighlight = !AppState.settings.cordaoHighlight;
              renderThemeView();
            });
          }

          if (applyThemeSettingsButton) {
            applyThemeSettingsButton.addEventListener('click', function () {
              applyThemeSettings();
              showAppToast('Configuracoes de aparencia aplicadas.');
            });
          }

          if (languageList) {
            languageList.addEventListener('click', function (event) {
              var card = event.target.closest('.language-card');
              if (!card) {
                return;
              }

              AppState.language = card.getAttribute('data-language') || 'pt';
              applyLanguagePack();
              showAppToast('Idioma atualizado.');
            });
          }

          if (signInAgainButton) {
            signInAgainButton.addEventListener('click', function () {
              self.restoreSession();
            });
          }

          if (miniModalCloseButton) {
            miniModalCloseButton.addEventListener('click', closeMiniModal);
          }

          if (miniModalOverlay) {
            miniModalOverlay.addEventListener('click', function (event) {
              if (event.target === miniModalOverlay) {
                closeMiniModal();
              }
            });
          }

          if (unsavedCancelButton) {
            unsavedCancelButton.addEventListener('click', function () {
              self.closeUnsavedPrompt();
            });
          }

          if (unsavedDiscardButton) {
            unsavedDiscardButton.addEventListener('click', function () {
              self.confirmUnsavedDiscard();
            });
          }

          if (unsavedOverlay) {
            unsavedOverlay.addEventListener('click', function (event) {
              if (event.target === unsavedOverlay) {
                self.closeUnsavedPrompt();
              }
            });
          }

          document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') {
              return;
            }

            if (miniModalOverlay && miniModalOverlay.classList.contains('is-open')) {
              closeMiniModal();
            }

            if (unsavedOverlay && unsavedOverlay.classList.contains('is-open')) {
              self.closeUnsavedPrompt();
            }
          });
        }
});
