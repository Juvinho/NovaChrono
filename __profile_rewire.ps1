Set-Location "c:/Users/Jnews/Downloads/Nova Chrono"

$path = "chrono-feed.html"
$content = [System.IO.File]::ReadAllText($path)

$profileBlockPattern = '(?s)        profile: \{\s*displayName: ''Juvinho Silva'',\s*username: ''Juvinho'',\s*bio: ''[^'']*'',\s*location: ''[^'']*'',\s*website: ''[^'']*'',\s*favoriteCordao: ''[^'']*'',\s*avatar: ''https://picsum\.photos/seed/juvinho/160/160'',\s*cover: ''https://picsum\.photos/seed/juvinho-cover/1200/320''\s*\},'
$profileBlockReplacement = @'
        profile: {
          displayName: 'Juvinho Silva',
          username: 'Juvinho',
          bio: 'Cara que gosta de coxinhas bem GORDINHAS e dono da @Chrono.',
          pronouns: 'Ele/Dele',
          location: 'Franca, Brasil',
          website: 'https://qxyonmarketing.com',
          favoriteCordao: 'artedistopica',
          birthDate: '27/09/2004',
          joinedLabel: 'fevereiro de 2026',
          verified: true,
          avatar: 'https://picsum.photos/seed/juvinho/160/160',
          cover: 'https://picsum.photos/seed/juvinho-cover/1200/320'
        },
'@
$content = [regex]::Replace($content, $profileBlockPattern, $profileBlockReplacement, 1)

if ($content -notmatch "profileTemporalQuery") {
  $content = $content -replace "        profileTab: 'posts',", "        profileTab: 'posts',`n        profileTemporalQuery: '',"
}

$content = $content -replace "        AppState\.profile = next;", "        AppState.profile = Object.assign({}, AppState.profile, next);"
$content = $content -replace "document\.body\.classList\.toggle\('layout-hide-timeline', viewName === 'signed-out'\);", "document.body.classList.toggle('layout-hide-timeline', viewName === 'signed-out' || viewName === 'profile');"

$profileFunctionsPattern = '(?s)      function getOwnPosts\(\) \{.*?      function renderProfileView\(\) \{.*?      \}\r?\n\r?\n      function openMiniModal'
$profileFunctionsReplacement = @'
      var PROFILE_MONTH_ALIASES = {
        jan: 0,
        janeiro: 0,
        fev: 1,
        fevereiro: 1,
        mar: 2,
        marco: 2,
        abr: 3,
        abril: 3,
        mai: 4,
        maio: 4,
        jun: 5,
        junho: 5,
        jul: 6,
        julho: 6,
        ago: 7,
        agosto: 7,
        set: 8,
        setembro: 8,
        out: 9,
        outubro: 9,
        nov: 10,
        novembro: 10,
        dez: 11,
        dezembro: 11,
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11
      };

      function syncProfilePostsIdentity() {
        if (!Array.isArray(PROFILE_POSTS)) {
          return;
        }

        var handle = getProfileHandleValue();
        var avatar = AppState.profile.avatar;

        PROFILE_POSTS.forEach(function (post, index) {
          if (!post) {
            return;
          }

          post.user = handle;
          post.avatar = avatar;
          post.verified = !!AppState.profile.verified;
          applyPostMetadata(post, 'profile', index);
        });
      }

      function getProfilePostsForTab(tab) {
        var posts = Array.isArray(PROFILE_POSTS) ? PROFILE_POSTS.slice() : [];

        posts.sort(function (a, b) {
          return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
        });

        if (tab === 'media') {
          return posts.filter(function (post) {
            return !!post.image || !!(post.repost && post.repost.image);
          });
        }

        if (tab === 'temporal') {
          return resolveTemporalQueryPosts(AppState.profileTemporalQuery);
        }

        return posts;
      }

      function formatProfileDateLabel(value) {
        var timestamp = Number(value);
        if (!Number.isFinite(timestamp)) {
          return '--';
        }

        try {
          return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch (_error) {
          return '--';
        }
      }

      function resolveTemporalQueryPosts(query) {
        var normalizedQuery = normalize(String(query || '').trim());
        if (!normalizedQuery) {
          return [];
        }

        var posts = Array.isArray(PROFILE_POSTS) ? PROFILE_POSTS.slice() : [];
        var monthYearMatch = normalizedQuery.match(/^(\d{1,2})\s*[\/\-]\s*(\d{4})$/);
        var yearMatch = normalizedQuery.match(/^(\d{4})$/);
        var tokenMonth = null;
        var tokenYear = null;

        if (!monthYearMatch && !yearMatch) {
          normalizedQuery.split(/\s+/).forEach(function (token) {
            if (!token) {
              return;
            }

            if (Object.prototype.hasOwnProperty.call(PROFILE_MONTH_ALIASES, token)) {
              tokenMonth = PROFILE_MONTH_ALIASES[token];
              return;
            }

            if (/^\d{4}$/.test(token)) {
              tokenYear = Number(token);
            }
          });
        }

        return posts.filter(function (post) {
          var createdAt = Number(post && post.createdAt);
          if (!Number.isFinite(createdAt)) {
            return false;
          }

          var date = new Date(createdAt);
          var month = date.getMonth();
          var year = date.getFullYear();

          if (monthYearMatch) {
            var queryMonth = Number(monthYearMatch[1]) - 1;
            var queryYear = Number(monthYearMatch[2]);
            return month === queryMonth && year === queryYear;
          }

          if (yearMatch) {
            return year === Number(yearMatch[1]);
          }

          if (tokenMonth !== null) {
            if (month !== tokenMonth) {
              return false;
            }

            if (tokenYear !== null && year !== tokenYear) {
              return false;
            }

            return true;
          }

          return getSearchTextForPost(post).indexOf(normalizedQuery) !== -1;
        }).sort(function (a, b) {
          return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
        });
      }

      function renderProfileEmptyState(message, icon) {
        return (
          '<div class="profile-empty-state">' +
            '<i data-lucide="' + escapeHtml(icon || 'inbox') + '"></i>' +
            '<p>' + escapeHtml(message || 'Nada para mostrar ainda.') + '</p>' +
          '</div>'
        );
      }

      function renderProfilePostStream(posts) {
        if (!posts.length) {
          return renderProfileEmptyState('Nenhum post publicado nesta secao ainda.', 'messages-square');
        }

        return (
          '<div class="profile-post-stream">' +
            posts.map(function (post, index) {
              return renderPost(post, index, { source: 'profile' });
            }).join('') +
          '</div>'
        );
      }

      function renderProfileMediaGrid(posts) {
        if (!posts.length) {
          return renderProfileEmptyState('Sem midias no momento. Quando houver imagens, elas aparecem aqui.', 'image');
        }

        return (
          '<div class="profile-media-grid">' +
            posts.map(function (post) {
              var thumb = post.image || (post.repost && post.repost.image) || '';
              var snippet = post.text || (post.repost && post.repost.text) || '';

              return (
                '<article class="profile-media-item" data-profile-post-id="' + escapeHtml(post.id) + '">' +
                  '<img class="profile-media-thumb" src="' + escapeHtml(thumb) + '" alt="Midia do post" loading="lazy">' +
                  '<div class="profile-media-body">' +
                    '<p>' + escapeHtml(snippet) + '</p>' +
                    '<span class="profile-media-meta">' +
                      escapeHtml(formatProfileDateLabel(post.createdAt)) +
                      ' • 💬 ' + (post.metrics.comments || 0) +
                    '</span>' +
                  '</div>' +
                '</article>'
              );
            }).join('') +
          '</div>'
        );
      }

      function renderProfileTemporalPanel() {
        var query = String(AppState.profileTemporalQuery || '');
        var results = getProfilePostsForTab('temporal').slice(0, 8);
        var recentPosts = getProfilePostsForTab('posts');
        var latestDateLabel = recentPosts.length ? formatProfileDateLabel(recentPosts[0].createdAt) : '--';
        var resultMarkup = '';

        if (!query.trim()) {
          resultMarkup = renderProfileEmptyState('Digite algo como "fev 2026", "11/2025" ou uma palavra-chave.', 'search');
        } else if (!results.length) {
          resultMarkup = renderProfileEmptyState('Nenhum post encontrado para este recorte temporal.', 'calendar-search');
        } else {
          resultMarkup = renderProfilePostStream(results);
        }

        return (
          '<section class="profile-tab-panel">' +
            '<div class="profile-temporal-card">' +
              '<h3 class="profile-temporal-title">Filtre por data ou contexto</h3>' +
              '<form id="profileTemporalForm" class="profile-temporal-row">' +
                '<input id="profileTemporalInput" class="profile-temporal-input" type="text" maxlength="42" placeholder="Ex.: fev 2026, 2025, neon" value="' + escapeHtml(query) + '">' +
                '<button id="profileTemporalGo" class="profile-temporal-go" type="submit">Buscar</button>' +
              '</form>' +
              '<ol class="profile-milestones">' +
                '<li>Entrou na Chrono em ' + escapeHtml(AppState.profile.joinedLabel || '2026') + '</li>' +
                '<li>Ultima atividade publicada em ' + escapeHtml(latestDateLabel) + '</li>' +
                '<li>Total indexado: ' + String((Array.isArray(PROFILE_POSTS) && PROFILE_POSTS.length) || 0) + ' posts</li>' +
              '</ol>' +
            '</div>' +
            '<div class="profile-temporal-results">' + resultMarkup + '</div>' +
          '</section>'
        );
      }

      function renderProfileTabPanel() {
        if (!profileTabPanels) {
          return;
        }

        var tab = AppState.profileTab || 'posts';
        var html = '';

        if (tab === 'media') {
          html = (
            '<section class="profile-tab-panel">' +
              renderProfileMediaGrid(getProfilePostsForTab('media').slice(0, 8)) +
            '</section>'
          );
        } else if (tab === 'temporal') {
          html = renderProfileTemporalPanel();
        } else {
          html = (
            '<section class="profile-tab-panel">' +
              renderProfilePostStream(getProfilePostsForTab('posts').slice(0, 8)) +
            '</section>'
          );
        }

        profileTabPanels.classList.add('is-switching');
        profileTabPanels.innerHTML = html;
        requestAnimationFrame(function () {
          profileTabPanels.classList.remove('is-switching');
        });

        safeIconRefresh();
      }

      function renderProfileView() {
        syncProfilePostsIdentity();

        setNodeText(profileBioEl, AppState.profile.bio || 'Sem bio por enquanto.');
        setNodeText(profilePronounsEl, AppState.profile.pronouns || '');
        setNodeText(profileMetaBirthEl, 'Aniversario: ' + (AppState.profile.birthDate || '--'));
        setNodeText(profileMetaJoinedEl, 'Entrou em ' + (AppState.profile.joinedLabel || '--'));
        setNodeText(profileMetaLocationEl, AppState.profile.location || 'Localizacao nao informada');

        if (profileMetaWebsiteEl) {
          var website = String(AppState.profile.website || '').trim();
          var websiteLabel = website.replace(/^https?:\/\//, '').replace(/\/$/, '');

          if (website) {
            profileMetaWebsiteEl.href = website;
            profileMetaWebsiteEl.textContent = websiteLabel || website;
          } else {
            profileMetaWebsiteEl.removeAttribute('href');
            profileMetaWebsiteEl.textContent = 'Sem website';
          }
        }

        if (profileFollowersCount) {
          profileFollowersCount.textContent = String(AppState.followers.length);
        }

        if (profileFollowingCount) {
          profileFollowingCount.textContent = String(AppState.following.length);
        }

        if (profilePostsCount) {
          profilePostsCount.textContent = String((Array.isArray(PROFILE_POSTS) && PROFILE_POSTS.length) || 0);
        }

        if (profileVerifiedBadgeEl) {
          profileVerifiedBadgeEl.style.display = AppState.profile.verified ? 'inline-flex' : 'none';
        }

        Array.prototype.slice.call(profileTabs ? profileTabs.querySelectorAll('.profile-tab') : []).forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-profile-tab') === AppState.profileTab);
        });

        renderProfileTabPanel();
      }

      function openMiniModal
'@
$content = [regex]::Replace($content, $profileFunctionsPattern, $profileFunctionsReplacement, 1)

$profileEventsPattern = '(?s)          if \(profileTabs\) \{.*?          if \(editProfileForm\) \{'
$profileEventsReplacement = @'
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
            profileTabPanels.addEventListener('submit', function (event) {
              var form = event.target.closest('#profileTemporalForm');
              if (!form) {
                return;
              }

              event.preventDefault();
              var queryInput = form.querySelector('#profileTemporalInput');
              AppState.profileTemporalQuery = String((queryInput && queryInput.value) || '').trim();
              renderProfileView();
            });

            profileTabPanels.addEventListener('click', function (event) {
              var mediaCard = event.target.closest('[data-profile-post-id]');
              if (mediaCard) {
                ThreadModal.open(mediaCard.getAttribute('data-profile-post-id'));
                return;
              }

              var postCard = event.target.closest('.post-card[data-post-id]');
              if (!postCard) {
                return;
              }

              if (event.target.closest('a, button')) {
                return;
              }

              ThreadModal.open(postCard.getAttribute('data-post-id'));
            });
          }

          if (profileBackToFeedCta) {
            profileBackToFeedCta.addEventListener('click', function () {
              self.navigate('feed');
            });
          }

          if (editProfileForm) {
'@
$content = [regex]::Replace($content, $profileEventsPattern, $profileEventsReplacement, 1)

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Output "profile_rewire_done"
