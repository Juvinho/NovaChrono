'use strict';

var STATS_SERIES = {
        '7d': {
          bars: [34, 52, 61, 48, 75, 58, 63],
          kpi: { views: 12480, boosts: 438, ecos: 119, replies: 92 },
          trend: { views: 18, boosts: 12, ecos: 7, replies: 15 }
        },
        '30d': {
          bars: [28, 36, 45, 38, 56, 62, 74],
          kpi: { views: 48320, boosts: 1320, ecos: 442, replies: 314 },
          trend: { views: 26, boosts: 17, ecos: 11, replies: 20 }
        },
        '90d': {
          bars: [18, 24, 30, 36, 44, 52, 69],
          kpi: { views: 129400, boosts: 3720, ecos: 1315, replies: 926 },
          trend: { views: 41, boosts: 29, ecos: 22, replies: 33 }
        }
      };

var AppState = {
        user: {
          username: 'Juvinho',
          displayName: 'Juvinho Silva',
          accentColor: 'purple'
        },
        theme: 'dark',
        currentView: 'feed',
        profile: {
          displayName: 'Juvinho Silva',
          username: 'Juvinho',
          bio: 'Narrando a cidade em tempo real. Viciado em sinais, trens e fios soltos.',
          location: 'Sao Paulo, Brasil',
          website: 'https://chrono.local/@juvinho',
          favoriteCordao: 'artedistopica',
          avatar: 'https://picsum.photos/seed/juvinho/160/160',
          cover: 'https://picsum.photos/seed/juvinho-cover/1200/320'
        },
        followers: [
          '@cuberta_dobrada',
          '@Sus_Bacon',
          '@orbital_zero',
          '@nebula_core',
          '@pixel_ghost',
          '@satelite_urbano'
        ],
        following: [
          '@cuberta_dobrada',
          '@Sus_Bacon',
          '@orbital_zero',
          '@linha_13',
          '@padaria_quantica'
        ],
        profileTab: 'posts',
        statsPeriod: '7d',
        language: 'pt',
        settings: {
          theme: 'dark',
          density: 'default',
          reducedMotion: false,
          particles: true,
          cordaoHighlight: true
        },
        signedOut: false,
        editSnapshot: ''
      };

var I18N_PACKS = {
        pt: {
          menuProfile: 'Ver perfil',
          menuEditProfile: 'Editar perfil',
          menuStats: 'Meus posts',
          menuLogout: 'Sair',
          languageMenu: 'Idioma: Portugues',
          tabAll: 'Todos',
          tabFollowing: 'Seguindo',
          tabMedia: 'Midia',
          tabPolls: 'Enquetes',
          createThread: 'Criar Cordao',
          notifViewAll: 'Ver todas as notificacoes ->',
          editTitle: 'Editar Perfil',
          editSubtitle: 'As alteracoes sao aplicadas apenas nesta sessao.',
          statsTitle: 'Estatisticas',
          statsSubtitle: 'Resumo dos seus posts e alcance no periodo.',
          themeTitle: 'Tema e Aparencia',
          themeSubtitle: 'Ajuste visual, densidade e motion para sua leitura.',
          languageTitle: 'Idioma',
          languageSubtitle: 'Escolha o idioma da interface desta sessao.',
          logoutTitle: 'Deseja sair da Chrono?',
          logoutSubtitle: 'Sua sessao atual sera encerrada.',
          signedOutTitle: 'Sessao encerrada',
          signedOutText: 'Voce saiu da Chrono. Seu estado local desta pagina foi preservado em memoria.',
          signInAgain: 'Entrar novamente'
        },
        en: {
          menuProfile: 'View profile',
          menuEditProfile: 'Edit profile',
          menuStats: 'My posts',
          menuLogout: 'Log out',
          languageMenu: 'Language: English',
          tabAll: 'All',
          tabFollowing: 'Following',
          tabMedia: 'Media',
          tabPolls: 'Polls',
          createThread: 'Create Thread',
          notifViewAll: 'View all notifications ->',
          editTitle: 'Edit Profile',
          editSubtitle: 'Changes are stored only in this in-memory session.',
          statsTitle: 'Statistics',
          statsSubtitle: 'A quick summary of your performance by period.',
          themeTitle: 'Theme and Appearance',
          themeSubtitle: 'Tune visuals, density, and motion preferences.',
          languageTitle: 'Language',
          languageSubtitle: 'Choose the interface language for this session.',
          logoutTitle: 'Leave Chrono now?',
          logoutSubtitle: 'Your current session will be closed.',
          signedOutTitle: 'Session closed',
          signedOutText: 'You are signed out. Local in-memory state is still available in this page.',
          signInAgain: 'Sign in again'
        },
        es: {
          menuProfile: 'Ver perfil',
          menuEditProfile: 'Editar perfil',
          menuStats: 'Mis publicaciones',
          menuLogout: 'Salir',
          languageMenu: 'Idioma: Espanol',
          tabAll: 'Todos',
          tabFollowing: 'Siguiendo',
          tabMedia: 'Media',
          tabPolls: 'Encuestas',
          createThread: 'Crear Hilo',
          notifViewAll: 'Ver todas las notificaciones ->',
          editTitle: 'Editar Perfil',
          editSubtitle: 'Los cambios se aplican solo en esta sesion en memoria.',
          statsTitle: 'Estadisticas',
          statsSubtitle: 'Resumen de rendimiento por periodo.',
          themeTitle: 'Tema y Apariencia',
          themeSubtitle: 'Ajusta visual, densidad y movimiento.',
          languageTitle: 'Idioma',
          languageSubtitle: 'Elige el idioma de la interfaz para esta sesion.',
          logoutTitle: 'Deseas salir de Chrono?',
          logoutSubtitle: 'Tu sesion actual sera cerrada.',
          signedOutTitle: 'Sesion cerrada',
          signedOutText: 'Has salido de Chrono. El estado local en memoria se mantiene en esta pagina.',
          signInAgain: 'Entrar de nuevo'
        }
      };

var editMediaDraft = {
        avatar: '',
        cover: ''
      };

function setNodeText(node, value) {
        if (node) {
          node.textContent = String(value || '');
        }
      }

function formatSignedPercent(value) {
        var safe = Number(value) || 0;
        return (safe >= 0 ? '+' : '') + safe + '%';
      }

function showAppToast(message) {
        if (!appToastHost) {
          return;
        }

        var toast = document.createElement('div');
        toast.className = 'app-toast';
        toast.textContent = String(message || 'Atualizado com sucesso.');
        appToastHost.appendChild(toast);

        setTimeout(function () {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-8px)';
          setTimeout(function () {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 180);
        }, 2400);
      }

function getProfileHandleValue() {
        return '@' + String(AppState.profile.username || '').replace(/^@/, '');
      }

function syncHeaderIdentity() {
        var handle = getProfileHandleValue();
        var displayName = AppState.profile.displayName || 'Perfil';
        var avatar = AppState.profile.avatar;
        var cover = AppState.profile.cover || avatar;

        setNodeText(profileNameLabel, handle);
        setNodeText(profileMenuHandle, handle);
        setNodeText(profileHandleEl, handle);
        setNodeText(profileMenuDisplayName, displayName);
        setNodeText(profileDisplayNameEl, displayName);

        if (profileButtonAvatar) {
          profileButtonAvatar.src = avatar;
          profileButtonAvatar.alt = 'Avatar ' + handle;
        }

        if (profileDropdownAvatar) {
          profileDropdownAvatar.src = avatar;
          profileDropdownAvatar.alt = 'Avatar ' + handle;
        }

        if (composerAvatar) {
          composerAvatar.src = avatar;
          composerAvatar.alt = 'Avatar ' + handle;
        }

        if (profileAvatarLarge) {
          profileAvatarLarge.src = avatar;
          profileAvatarLarge.alt = 'Avatar ' + handle;
        }

        if (editAvatarPreview) {
          editAvatarPreview.src = avatar;
        }

        if (profileCoverEl) {
          profileCoverEl.style.backgroundImage = 'url("' + cover + '")';
          profileCoverEl.style.backgroundSize = 'cover';
          profileCoverEl.style.backgroundPosition = 'center';
        }
      }

function getOwnPosts() {
        var normalized = normalizeAuthorHandle(AppState.profile.username);
        return postStore.filter(function (post) {
          return normalizeAuthorHandle(post.user) === normalized;
        });
      }

function sanitizeProfileRouteHandle(value) {
        var raw = String(value || '').replace(/^#/, '');
        raw = raw.replace(/^perfil\//i, '').replace(/^@/, '');
        raw = raw.split('?')[0].split('&')[0].split('/')[0];
        return raw.trim();
      }

function getViewedProfileHandle() {
        var routeHandle = '';
        var hash = (typeof window !== 'undefined' && window.location)
          ? String(window.location.hash || '').replace(/^#/, '').toLowerCase()
          : '';

        if (hash.indexOf('perfil/') === 0) {
          routeHandle = sanitizeProfileRouteHandle(hash);
        }

        if (!routeHandle && typeof window !== 'undefined' && window.__chronoLastProfileHandle) {
          routeHandle = sanitizeProfileRouteHandle(window.__chronoLastProfileHandle);
        }

        if (!routeHandle && typeof getCurrentHandle === 'function') {
          routeHandle = getCurrentHandle();
        }

        if (!routeHandle) {
          routeHandle = String(AppState.profile.username || 'juvinho').replace(/^@/, '');
        }

        return '@' + normalizeAuthorHandle(routeHandle || 'juvinho');
      }

function buildEcoPost(post, viewedHandle) {
        if (!post) {
          return null;
        }

        if (post.repostInfo) {
          return post;
        }

        var clone = Object.assign({}, post);
        clone.repostInfo = '↺ ' + viewedHandle + ' ecoou';
        return clone;
      }

function dedupePostsById(posts) {
        var seen = {};
        return (posts || []).filter(function (post) {
          var key = String(post && post.id || '');
          if (!key || seen[key]) {
            return false;
          }

          seen[key] = true;
          return true;
        });
      }

function getProfilePostsForTab(tab) {
        var normalizedTab = String(tab || 'posts').toLowerCase();
        var viewedHandle = getViewedProfileHandle();
        var viewedNormalized = normalizeAuthorHandle(viewedHandle);
        var ownNormalized = normalizeAuthorHandle(typeof getCurrentHandle === 'function' ? getCurrentHandle() : AppState.profile.username);
        var authoredPosts = postStore.filter(function (post) {
          return normalizeAuthorHandle(post.user) === viewedNormalized;
        });

        if (normalizedTab === 'midia') {
          normalizedTab = 'media';
        }

        if (normalizedTab === 'curtidos') {
          normalizedTab = 'likes';
        }

        if (normalizedTab === 'media') {
          return authoredPosts.filter(function (post) {
            return !!post.image || !!(post.repost && post.repost.image);
          });
        }

        if (normalizedTab === 'likes') {
          if (viewedNormalized !== ownNormalized || typeof VoteSystem === 'undefined' || !VoteSystem || typeof VoteSystem.getState !== 'function') {
            return [];
          }

          return postStore.filter(function (post) {
            var state = VoteSystem.getState(post.id, post);
            return !!state && state.userVote === 'up';
          });
        }

        if (normalizedTab === 'ecos') {
          var ecos = authoredPosts.filter(function (post) {
            return !!post.repostInfo || !!post.repost;
          }).map(function (post) {
            return buildEcoPost(post, viewedHandle);
          });

          if (viewedNormalized === ownNormalized) {
            postStore.forEach(function (post) {
              if (post && post.state && post.state.repost) {
                ecos.push(buildEcoPost(post, viewedHandle));
              }
            });
          }

          return dedupePostsById(ecos);
        }

        if (normalizedTab === 'responses') {
          return authoredPosts.slice().sort(function (a, b) {
            return (Number(b.metrics && b.metrics.comments) || 0) - (Number(a.metrics && a.metrics.comments) || 0);
          });
        }

        return authoredPosts;
      }

function renderProfilePosts() {
        if (!profilePostsList) {
          return;
        }

        var posts = getProfilePostsForTab(AppState.profileTab).slice(0, 12);

        if (!posts.length) {
          profilePostsList.innerHTML = '<p class="settings-card-subtitle">Nenhum post para este filtro ainda.</p>';
          return;
        }

        profilePostsList.innerHTML = '<div class="feed-list profile-post-stream">' + posts.map(function (post, index) {
          return renderPost(post, index, { source: 'profile' });
        }).join('') + '</div>';

        safeIconRefresh();

        if (typeof animatePollBars === 'function') {
          animatePollBars();
        }

        if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.syncAllCards === 'function') {
          VoteSystem.syncAllCards();
        }
      }
