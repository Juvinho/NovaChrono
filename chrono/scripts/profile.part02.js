'use strict';

function renderProfileView() {
        setNodeText(profileBioEl, AppState.profile.bio || 'Sem bio por enquanto.');
        setNodeText(profileMetaLocationEl, AppState.profile.location || 'Localizacao nao informada');
        setNodeText(profileMetaCordaoEl, 'Cordao favorito: $' + String(AppState.profile.favoriteCordao || 'chrono').replace(/^\$/, ''));

        if (profileFollowersCount) {
          profileFollowersCount.textContent = String(AppState.followers.length);
        }

        if (profileFollowingCount) {
          profileFollowingCount.textContent = String(AppState.following.length);
        }

        if (profilePostsCount) {
          profilePostsCount.textContent = String(getOwnPosts().length || 0);
        }

        Array.prototype.slice.call(profileTabs ? profileTabs.querySelectorAll('.profile-tab') : []).forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-profile-tab') === AppState.profileTab);
        });

        renderProfilePosts();
      }

function openMiniModal(title, items) {
        if (!miniModalOverlay || !miniModalTitle || !miniModalList) {
          return;
        }

        miniModalTitle.textContent = title;
        miniModalList.innerHTML = (items || []).map(function (entry) {
          return '<li>' + escapeHtml(entry) + '</li>';
        }).join('');

        miniModalOverlay.classList.add('is-open');
        miniModalOverlay.setAttribute('aria-hidden', 'false');
      }

function closeMiniModal() {
        if (!miniModalOverlay) {
          return;
        }

        miniModalOverlay.classList.remove('is-open');
        miniModalOverlay.setAttribute('aria-hidden', 'true');
      }

function readFileAsDataUrl(file, callback) {
        if (!file || typeof FileReader === 'undefined') {
          return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          callback(String((event.target && event.target.result) || ''));
        };
        reader.readAsDataURL(file);
      }

function updateEditBioCounter() {
        if (!editBioInput || !editBioCounter) {
          return;
        }

        var current = editBioInput.value.length;
        editBioCounter.textContent = current + '/160';
        editBioCounter.classList.remove('warn', 'danger');

        if (current >= 130 && current < 150) {
          editBioCounter.classList.add('warn');
        }

        if (current >= 150) {
          editBioCounter.classList.add('danger');
        }
      }

function normalizeUsernameInput(value) {
        return String(value || '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      }

function validateEditUsername() {
        if (!editUsernameInput || !editUsernameError) {
          return true;
        }

        var username = normalizeUsernameInput(editUsernameInput.value);
        editUsernameInput.value = username;

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
          editUsernameError.textContent = 'Use 3-20 caracteres: letras, numeros ou _';
          return false;
        }

        editUsernameError.textContent = '';
        return true;
      }

function getEditDraft() {
        return {
          displayName: String((editDisplayNameInput && editDisplayNameInput.value) || '').trim(),
          username: normalizeUsernameInput((editUsernameInput && editUsernameInput.value) || ''),
          bio: String((editBioInput && editBioInput.value) || '').slice(0, 160),
          location: String((editLocationInput && editLocationInput.value) || '').trim(),
          website: String((editWebsiteInput && editWebsiteInput.value) || '').trim(),
          favoriteCordao: String((editFavoriteCordaoInput && editFavoriteCordaoInput.value) || '').replace(/^\$/, '').trim(),
          avatar: editMediaDraft.avatar || AppState.profile.avatar,
          cover: editMediaDraft.cover || AppState.profile.cover
        };
      }

function seedEditFormFromState() {
        if (!editProfileForm) {
          return;
        }

        editMediaDraft.avatar = '';
        editMediaDraft.cover = '';

        if (editDisplayNameInput) {
          editDisplayNameInput.value = AppState.profile.displayName || '';
        }
        if (editUsernameInput) {
          editUsernameInput.value = normalizeUsernameInput(AppState.profile.username || '');
        }
        if (editBioInput) {
          editBioInput.value = AppState.profile.bio || '';
        }
        if (editLocationInput) {
          editLocationInput.value = AppState.profile.location || '';
        }
        if (editWebsiteInput) {
          editWebsiteInput.value = AppState.profile.website || '';
        }
        if (editFavoriteCordaoInput) {
          editFavoriteCordaoInput.value = String(AppState.profile.favoriteCordao || '').replace(/^\$/, '');
        }
        if (editAvatarPreview) {
          editAvatarPreview.src = AppState.profile.avatar;
        }
        if (editCoverPreview) {
          editCoverPreview.src = AppState.profile.cover;
        }

        updateEditBioCounter();
        validateEditUsername();
        AppState.editSnapshot = JSON.stringify(getEditDraft());
      }

function hasEditUnsavedChanges() {
        if (!editProfileForm || !AppState.editSnapshot) {
          return false;
        }

        return JSON.stringify(getEditDraft()) !== AppState.editSnapshot;
      }

function commitProfileEdit(event) {
        if (event) {
          event.preventDefault();
        }

        if (!validateEditUsername()) {
          return;
        }

        var next = getEditDraft();
        if (!next.displayName) {
          next.displayName = 'Chrono User';
        }
        if (!next.username) {
          next.username = 'chrono_user';
        }
        if (!next.favoriteCordao) {
          next.favoriteCordao = 'chrono';
        }

        AppState.profile = next;

        syncHeaderIdentity();
        renderProfileView();
        seedEditFormFromState();
        showAppToast('Perfil atualizado.');

        if (AppRouter && typeof AppRouter.navigate === 'function') {
          AppRouter.navigate('profile');
        }
      }

function renderStatsBars(series) {
        if (!statsBars) {
          return;
        }

        var labels = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
        statsBars.innerHTML = (series || []).map(function (value, index) {
          var height = Math.max(8, Math.min(100, Number(value) || 0));
          return (
            '<div class="stats-bar-col">' +
              '<span class="stats-bar" style="height:' + height + '%"></span>' +
              '<span class="stats-bar-label">' + labels[index] + '</span>' +
            '</div>'
          );
        }).join('');
      }

function getTopPosts(limit) {
        return postStore.slice().sort(function (a, b) {
          var scoreA = (a.metrics.likes || 0) + (a.metrics.reposts || 0) + (a.metrics.comments || 0);
          var scoreB = (b.metrics.likes || 0) + (b.metrics.reposts || 0) + (b.metrics.comments || 0);
          return scoreB - scoreA;
        }).slice(0, limit || 3);
      }

function renderStatsTopPosts() {
        if (!statsTopPosts) {
          return;
        }

        statsTopPosts.innerHTML = getTopPosts(3).map(function (post) {
          return (
            '<article class="top-post-item" data-stats-post-id="' + escapeHtml(post.id) + '">' +
              '<p>' + escapeHtml(post.text || '') + '</p>' +
              '<div class="top-post-metrics">' +
                '<span>Views ~ ' + formatCompactCount((post.metrics.likes + post.metrics.reposts + post.metrics.comments + 1) * 42) + '</span>' +
                '<span>Boosts ' + (post.metrics.likes || 0) + '</span>' +
                '<span>Ecos ' + (post.metrics.reposts || 0) + '</span>' +
              '</div>' +
            '</article>'
          );
        }).join('');
      }

function renderStatsView() {
        var current = STATS_SERIES[AppState.statsPeriod] || STATS_SERIES['7d'];

        setNodeText(kpiViews, formatCompactCount(current.kpi.views));
        setNodeText(kpiBoosts, formatCompactCount(current.kpi.boosts));
        setNodeText(kpiEcos, formatCompactCount(current.kpi.ecos));
        setNodeText(kpiReplies, formatCompactCount(current.kpi.replies));

        setNodeText(kpiViewsTrend, formatSignedPercent(current.trend.views));
        setNodeText(kpiBoostsTrend, formatSignedPercent(current.trend.boosts));
        setNodeText(kpiEcosTrend, formatSignedPercent(current.trend.ecos));
        setNodeText(kpiRepliesTrend, formatSignedPercent(current.trend.replies));

        Array.prototype.slice.call(statsPeriodTabs ? statsPeriodTabs.querySelectorAll('.stats-tab') : []).forEach(function (tab) {
          tab.classList.toggle('active', tab.getAttribute('data-stats-period') === AppState.statsPeriod);
        });

        renderStatsBars(current.bars);
        renderStatsTopPosts();
      }

function setSwitchState(button, active) {
        if (!button) {
          return;
        }

        button.classList.toggle('active', !!active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      }

function renderThemeView() {
        Array.prototype.slice.call(themeModeChoices ? themeModeChoices.querySelectorAll('.choice-card') : []).forEach(function (card) {
          card.classList.toggle('active', card.getAttribute('data-theme-mode') === AppState.settings.theme);
        });

        Array.prototype.slice.call(densityChoices ? densityChoices.querySelectorAll('.choice-card') : []).forEach(function (card) {
          card.classList.toggle('active', card.getAttribute('data-density') === AppState.settings.density);
        });

        setSwitchState(toggleReducedMotion, AppState.settings.reducedMotion);
        setSwitchState(toggleParticles, AppState.settings.particles);
        setSwitchState(toggleCordaoHighlight, AppState.settings.cordaoHighlight);
      }
