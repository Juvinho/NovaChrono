'use strict';

var SearchOverlay = {
  root: null,
  panel: null,
  input: null,
  clearButton: null,
  closeButton: null,
  queryStateLabel: null,
  tabs: [],
  resultBodies: {
    users: null,
    cordoes: null,
    posts: null
  },
  countBadges: {
    users: null,
    cordoes: null,
    posts: null
  },
  isReady: false,
  isOpenState: false,
  activeMobileTab: 'users',
  latestQuery: '',
  debounceHandle: null,

  init: function () {
    if (this.isReady) {
      return;
    }

    this.build();
    this.cacheElements();

    if (!this.root || !this.input) {
      return;
    }

    this.bindEvents();
    this.setMobileTab(this.activeMobileTab);
    this.syncWithController(searchInput ? searchInput.value : '');

    this.isReady = true;
  },

  isOpen: function () {
    return this.isOpenState;
  },

  build: function () {
    var existing = document.getElementById('searchOverlay');
    if (existing) {
      this.root = existing;
      return;
    }

    var wrapper = document.createElement('section');
    wrapper.id = 'searchOverlay';
    wrapper.className = 'search-overlay';
    wrapper.setAttribute('aria-hidden', 'true');

    wrapper.innerHTML = (
      '<div class="search-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="searchOverlayHeading">' +
        '<header class="search-overlay-head">' +
          '<div class="search-overlay-title-wrap">' +
            '<p class="search-overlay-kicker">Busca Chrono</p>' +
            '<h2 id="searchOverlayHeading" class="search-overlay-title">Descubra pessoas, cordoes e conversas</h2>' +
          '</div>' +
          '<button type="button" class="search-overlay-close-btn" data-search-role="close" aria-label="Fechar busca">Fechar</button>' +
        '</header>' +
        '<div class="search-overlay-input-row">' +
          '<div class="search-overlay-input-wrap">' +
            '<span class="search-overlay-search-glyph" aria-hidden="true">⌕</span>' +
            '<input id="searchOverlayInput" class="search-overlay-input" type="text" autocomplete="off" placeholder="Buscar em toda a Chrono" aria-label="Buscar em toda a Chrono">' +
            '<button type="button" class="search-overlay-clear-btn" data-search-role="clear" aria-label="Limpar busca">Limpar</button>' +
          '</div>' +
          '<p id="searchOverlayState" class="search-overlay-query-state">Em alta agora</p>' +
        '</div>' +
        '<nav class="search-overlay-tabs" aria-label="Secoes da busca">' +
          '<button type="button" class="search-overlay-tab is-active" data-search-tab="users">Pessoas</button>' +
          '<button type="button" class="search-overlay-tab" data-search-tab="cordoes">Cordoes</button>' +
          '<button type="button" class="search-overlay-tab" data-search-tab="posts">Posts</button>' +
        '</nav>' +
        '<div class="search-overlay-grid">' +
          '<article class="search-overlay-column" data-column="users">' +
            '<header class="search-overlay-column-head">' +
              '<h3>Pessoas</h3>' +
              '<span id="searchOverlayUsersCount" class="search-overlay-count">0</span>' +
            '</header>' +
            '<div id="searchOverlayUsersBody" class="search-overlay-column-body"></div>' +
          '</article>' +
          '<article class="search-overlay-column" data-column="cordoes">' +
            '<header class="search-overlay-column-head">' +
              '<h3>Cordoes</h3>' +
              '<span id="searchOverlayCordoesCount" class="search-overlay-count">0</span>' +
            '</header>' +
            '<div id="searchOverlayCordoesBody" class="search-overlay-column-body"></div>' +
          '</article>' +
          '<article class="search-overlay-column" data-column="posts">' +
            '<header class="search-overlay-column-head">' +
              '<h3>Posts</h3>' +
              '<span id="searchOverlayPostsCount" class="search-overlay-count">0</span>' +
            '</header>' +
            '<div id="searchOverlayPostsBody" class="search-overlay-column-body"></div>' +
          '</article>' +
        '</div>' +
      '</div>'
    );

    document.body.appendChild(wrapper);
    this.root = wrapper;
  },

  cacheElements: function () {
    this.panel = this.root ? this.root.querySelector('.search-overlay-panel') : null;
    this.input = this.root ? this.root.querySelector('#searchOverlayInput') : null;
    this.clearButton = this.root ? this.root.querySelector('[data-search-role="clear"]') : null;
    this.closeButton = this.root ? this.root.querySelector('[data-search-role="close"]') : null;
    this.queryStateLabel = this.root ? this.root.querySelector('#searchOverlayState') : null;
    this.tabs = this.root
      ? Array.prototype.slice.call(this.root.querySelectorAll('.search-overlay-tab'))
      : [];

    this.resultBodies.users = this.root ? this.root.querySelector('#searchOverlayUsersBody') : null;
    this.resultBodies.cordoes = this.root ? this.root.querySelector('#searchOverlayCordoesBody') : null;
    this.resultBodies.posts = this.root ? this.root.querySelector('#searchOverlayPostsBody') : null;

    this.countBadges.users = this.root ? this.root.querySelector('#searchOverlayUsersCount') : null;
    this.countBadges.cordoes = this.root ? this.root.querySelector('#searchOverlayCordoesCount') : null;
    this.countBadges.posts = this.root ? this.root.querySelector('#searchOverlayPostsCount') : null;
  },

  bindEvents: function () {
    var self = this;

    this.root.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-search-tab]');
      if (tab) {
        self.setMobileTab(tab.getAttribute('data-search-tab'));
        return;
      }

      var roleButton = event.target.closest('[data-search-role]');
      if (roleButton) {
        var role = roleButton.getAttribute('data-search-role');

        if (role === 'close') {
          self.close();
          return;
        }

        if (role === 'clear') {
          if (String(self.latestQuery || '').trim()) {
            self.query('', { immediate: true });
            if (self.input) {
              self.input.focus();
            }
          } else {
            self.close();
          }
          return;
        }
      }

      var resultButton = event.target.closest('[data-result-type]');
      if (resultButton) {
        self.handleResultClick(resultButton);
        return;
      }

      if (event.target === self.root) {
        self.close();
      }
    });

    this.input.addEventListener('input', function () {
      self.query(self.input.value);
    });

    this.input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        if (String(self.latestQuery || '').trim()) {
          self.query('', { immediate: true });
          return;
        }

        self.close();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        self.openFirstResult();
      }
    });

    window.addEventListener('hashchange', function () {
      if (self.isOpenState) {
        self.close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!self.isOpenState || event.key !== 'Escape') {
        return;
      }

      if (document.activeElement !== self.input) {
        self.close();
      }
    });
  },

  open: function (options) {
    if (!this.isReady) {
      this.init();
    }

    if (!this.root) {
      return;
    }

    var openQuery = options && Object.prototype.hasOwnProperty.call(options, 'query')
      ? String(options.query || '')
      : (searchInput ? String(searchInput.value || '') : this.latestQuery);

    this.isOpenState = true;
    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-overlay-open');

    this.syncWithController(openQuery);

    if (this.input) {
      this.input.focus();
      this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }
  },

  close: function () {
    if (!this.root || !this.isOpenState) {
      return;
    }

    this.isOpenState = false;
    this.root.classList.remove('is-open');
    this.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-overlay-open');

    if (this.input) {
      this.input.blur();
    }
  },

  query: function (rawQuery, options) {
    var nextQuery = String(rawQuery || '');
    var opts = options || {};

    this.latestQuery = nextQuery;

    if (this.input && this.input.value !== nextQuery) {
      this.input.value = nextQuery;
    }

    this.updateClearButtonState();
    this.updateQueryState();

    if (!opts.skipController) {
      if (typeof SearchController !== 'undefined' && SearchController && typeof SearchController.filter === 'function') {
        SearchController.filter(nextQuery, { fromOverlay: true });
      } else if (searchInput) {
        searchInput.value = nextQuery;
        state.query = normalize(searchInput.value.trim());

        if (typeof FeedFilters !== 'undefined' && FeedFilters && FeedFilters.isInitialized) {
          FeedFilters.applyFilter(FeedFilters.current, false);
        } else if (typeof renderFeed === 'function') {
          renderFeed();
        }
      }
    }

    this.scheduleRender(opts.immediate === true);
  },

  syncWithController: function (rawQuery) {
    this.latestQuery = String(rawQuery || '');

    if (this.input && this.input.value !== this.latestQuery) {
      this.input.value = this.latestQuery;
    }

    this.updateClearButtonState();
    this.updateQueryState();
    this.scheduleRender(true);
  },

  scheduleRender: function (immediate) {
    var self = this;
    clearTimeout(this.debounceHandle);

    if (immediate) {
      this.renderResults();
      return;
    }

    this.debounceHandle = setTimeout(function () {
      self.renderResults();
    }, 200);
  },

  renderResults: function () {
    var rawQuery = String(this.latestQuery || '').trim();
    var normalizedQuery = soNormalize(rawQuery);
    var searchToken = soStripSearchPrefix(normalizedQuery);
    var mode = soGetSearchMode(rawQuery);

    if (window.matchMedia && window.matchMedia('(max-width: 600px)').matches) {
      if (mode === 'users') {
        this.setMobileTab('users');
      } else if (mode === 'cordoes') {
        this.setMobileTab('cordoes');
      }
    }

    var userResults = this.getUserResults(searchToken);
    var cordaoResults = this.getCordaoResults(searchToken);
    var postResults = this.getPostResults(searchToken);

    this.renderUsers(userResults, searchToken);
    this.renderCordoes(cordaoResults, searchToken);
    this.renderPosts(postResults, searchToken);

    this.updateCount('users', userResults.length);
    this.updateCount('cordoes', cordaoResults.length);
    this.updateCount('posts', postResults.length);
  },

  getUserResults: function (token) {
    var users = soSafeArray(typeof MOCK_USERS !== 'undefined' ? MOCK_USERS : []);

    if (!token) {
      return users.sort(function (a, b) {
        return (Number(b.followers) || 0) - (Number(a.followers) || 0);
      }).slice(0, 7);
    }

    return users.filter(function (user) {
      var handle = soNormalize(user.username);
      var display = soNormalize(user.display);
      return handle.indexOf(token) !== -1 || display.indexOf(token) !== -1;
    }).sort(function (a, b) {
      var aHandle = soNormalize(a.username);
      var bHandle = soNormalize(b.username);
      var aDisplay = soNormalize(a.display);
      var bDisplay = soNormalize(b.display);

      var aStarts = (aHandle.indexOf(token) === 0 || aDisplay.indexOf(token) === 0) ? 0 : 1;
      var bStarts = (bHandle.indexOf(token) === 0 || bDisplay.indexOf(token) === 0) ? 0 : 1;

      if (aStarts !== bStarts) {
        return aStarts - bStarts;
      }

      return (Number(b.followers) || 0) - (Number(a.followers) || 0);
    }).slice(0, 7);
  },

  getCordaoResults: function (token) {
    var cordoes = soSafeArray(typeof MOCK_CORDOES !== 'undefined' ? MOCK_CORDOES : []);

    if (!token) {
      return cordoes.sort(function (a, b) {
        var trendDiff = (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        if (trendDiff !== 0) {
          return trendDiff;
        }

        return (Number(b.posts) || 0) - (Number(a.posts) || 0);
      }).slice(0, 8);
    }

    return cordoes.filter(function (cordao) {
      return soNormalize(cordao.name).indexOf(token) !== -1;
    }).sort(function (a, b) {
      var aStarts = soNormalize(a.name).indexOf(token) === 0 ? 0 : 1;
      var bStarts = soNormalize(b.name).indexOf(token) === 0 ? 0 : 1;

      if (aStarts !== bStarts) {
        return aStarts - bStarts;
      }

      var trendDiff = (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      if (trendDiff !== 0) {
        return trendDiff;
      }

      return (Number(b.posts) || 0) - (Number(a.posts) || 0);
    }).slice(0, 8);
  },

  getPostResults: function (token) {
    var posts = soSafeArray(typeof postStore !== 'undefined' ? postStore : []);

    if (!token) {
      return posts.sort(function (a, b) {
        var bMomentum = soPostMomentum(b);
        var aMomentum = soPostMomentum(a);

        if (bMomentum !== aMomentum) {
          return bMomentum - aMomentum;
        }

        return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
      }).slice(0, 8);
    }

    return posts.filter(function (post) {
      var haystack = soNormalize([
        post.user,
        post.text,
        post.threadNote,
        post.repost && post.repost.text
      ].join(' '));

      return haystack.indexOf(token) !== -1;
    }).sort(function (a, b) {
      var aRank = soPostRank(a, token);
      var bRank = soPostRank(b, token);

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      return soPostMomentum(b) - soPostMomentum(a);
    }).slice(0, 8);
  },

  renderUsers: function (results, token) {
    if (!this.resultBodies.users) {
      return;
    }

    if (!results.length) {
      this.resultBodies.users.innerHTML = this.buildEmptyMarkup('Nenhuma pessoa encontrada', 'Tente outro termo ou procure por @usuario.');
      return;
    }

    this.resultBodies.users.innerHTML = results.map(function (user) {
      var handle = '@' + soNormalize(user.username).replace(/\s+/g, '');
      var display = String(user.display || handleToDisplayName(handle) || handle);
      var followers = soFormatCompactCount(Number(user.followers) || 0) + ' seguidores';
      var verifiedBadge = user.verified
        ? '<span class="search-overlay-chip is-verified">verificado</span>'
        : '';

      return (
        '<button type="button" class="search-overlay-item search-overlay-item--user" data-result-type="user" data-result-value="' + soEscapeHtml(user.username) + '">' +
          '<img class="search-overlay-avatar" src="' + soEscapeHtml(user.avatar || 'https://picsum.photos/seed/search-user/64/64') + '" alt="Avatar @' + soEscapeHtml(user.username) + '">' +
          '<div class="search-overlay-item-main">' +
            '<div class="search-overlay-item-title-row">' +
              '<strong>' + soHighlight(handle, token) + '</strong>' +
              verifiedBadge +
            '</div>' +
            '<span class="search-overlay-subtitle">' + soHighlight(display, token) + '</span>' +
          '</div>' +
          '<span class="search-overlay-chip">' + soEscapeHtml(followers) + '</span>' +
        '</button>'
      );
    }).join('');
  },

  renderCordoes: function (results, token) {
    if (!this.resultBodies.cordoes) {
      return;
    }

    if (!results.length) {
      this.resultBodies.cordoes.innerHTML = this.buildEmptyMarkup('Nenhum cordao encontrado', 'Experimente usar o prefixo $ para buscar por tema.');
      return;
    }

    var maxPosts = results.reduce(function (acc, item) {
      return Math.max(acc, Number(item.posts) || 0);
    }, 1);

    this.resultBodies.cordoes.innerHTML = results.map(function (cordao) {
      var posts = Number(cordao.posts) || 0;
      var width = Math.max(14, Math.round((posts / maxPosts) * 100));
      var statusChip = cordao.trending
        ? '<span class="search-overlay-chip is-trending">em alta</span>'
        : '<span class="search-overlay-chip">ativo</span>';

      return (
        '<button type="button" class="search-overlay-item search-overlay-item--cordao" data-result-type="cordao" data-result-value="' + soEscapeHtml(cordao.name) + '">' +
          '<div class="search-overlay-item-main">' +
            '<div class="search-overlay-item-title-row">' +
              '<strong>' + soHighlight('$' + cordao.name, token) + '</strong>' +
              statusChip +
            '</div>' +
            '<span class="search-overlay-subtitle">' + soEscapeHtml(soFormatCompactCount(posts) + ' posts') + '</span>' +
          '</div>' +
          '<div class="search-overlay-spark" aria-hidden="true">' +
            '<span class="search-overlay-spark-fill" style="width:' + width + '%"></span>' +
          '</div>' +
        '</button>'
      );
    }).join('');
  },

  renderPosts: function (results, token) {
    if (!this.resultBodies.posts) {
      return;
    }

    if (!results.length) {
      this.resultBodies.posts.innerHTML = this.buildEmptyMarkup('Nenhum post encontrado', 'A busca ao vivo filtra por autor, texto e reposts.');
      return;
    }

    this.resultBodies.posts.innerHTML = results.map(function (post) {
      var postText = soTruncate(String(post.text || ''), 140);
      var tag = soExtractFirstTag(post.text);
      var momentum = soPostMomentum(post);
      var tagPill = tag
        ? '<span class="search-overlay-pill">$' + soEscapeHtml(tag) + '</span>'
        : '';

      return (
        '<button type="button" class="search-overlay-item search-overlay-item--post" data-result-type="post" data-result-value="' + soEscapeHtml(post.id) + '">' +
          '<div class="search-overlay-item-main">' +
            '<div class="search-overlay-item-title-row">' +
              '<strong>' + soHighlight(String(post.user || '@desconhecido'), token) + '</strong>' +
              '<span class="search-overlay-time">' + soEscapeHtml(String(post.time || 'agora')) + '</span>' +
            '</div>' +
            '<p class="search-overlay-post-snippet">' + soHighlight(postText, token) + '</p>' +
            '<div class="search-overlay-post-meta">' +
              '<span>' + soEscapeHtml(String(momentum) + ' pontos') + '</span>' +
              tagPill +
            '</div>' +
          '</div>' +
        '</button>'
      );
    }).join('');
  },

  openFirstResult: function () {
    if (!this.root) {
      return;
    }

    var scoped = this.root.querySelector('[data-column="' + this.activeMobileTab + '"] [data-result-type]');
    var fallback = this.root.querySelector('[data-result-type]');
    var firstResult = scoped || fallback;

    if (firstResult) {
      this.handleResultClick(firstResult);
    }
  },

  handleResultClick: function (element) {
    if (!element) {
      return;
    }

    var type = element.getAttribute('data-result-type');
    var value = String(element.getAttribute('data-result-value') || '');

    if (!type || !value) {
      return;
    }

    if (type === 'user') {
      this.openUserResult(value);
      this.close();
      return;
    }

    if (type === 'cordao') {
      this.openCordaoResult(value);
      this.close();
      return;
    }

    if (type === 'post') {
      this.openPostResult(value);
      this.close();
    }
  },

  openUserResult: function (username) {
    var cleanUser = String(username || '').replace(/^@/, '').trim();
    if (!cleanUser) {
      return;
    }

    var handle = '@' + cleanUser;

    if (typeof openProfileRouteFromHandle === 'function') {
      openProfileRouteFromHandle(handle);
      return;
    }

    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('perfil/' + cleanUser.toLowerCase());
    }
  },

  openCordaoResult: function (tag) {
    var cleanTag = String(tag || '').replace(/^[#$]/, '').trim().toLowerCase();
    if (!cleanTag) {
      return;
    }

    if (typeof openHashtagFeed === 'function') {
      openHashtagFeed('$' + cleanTag);
      return;
    }

    if (typeof SearchController !== 'undefined' && SearchController && typeof SearchController.filter === 'function') {
      SearchController.filter('$' + cleanTag, { fromOverlay: true });
    }

    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('feed');
    }
  },

  openPostResult: function (postId) {
    var cleanId = String(postId || '').trim();
    if (!cleanId) {
      return;
    }

    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('feed');
    }

    if (typeof ThreadModal !== 'undefined' && ThreadModal && typeof ThreadModal.open === 'function') {
      ThreadModal.open(cleanId);
      return;
    }

    var post = soFindPostById(cleanId);
    if (post && typeof SearchController !== 'undefined' && SearchController && typeof SearchController.filter === 'function') {
      SearchController.filter(String(post.text || post.user || ''), { fromOverlay: true });
    }
  },

  setMobileTab: function (tabName) {
    var safeTab = soAllowedMobileTab(tabName);
    this.activeMobileTab = safeTab;

    if (!this.root) {
      return;
    }

    this.root.setAttribute('data-mobile-tab', safeTab);

    this.tabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-search-tab') === safeTab;
      tab.classList.toggle('is-active', isActive);
    });
  },

  updateCount: function (column, total) {
    var badge = this.countBadges[column];
    if (!badge) {
      return;
    }

    badge.textContent = String(Number(total) || 0);
  },

  updateQueryState: function () {
    if (!this.queryStateLabel) {
      return;
    }

    var rawQuery = String(this.latestQuery || '').trim();
    var mode = soGetSearchMode(rawQuery);
    var token = soStripSearchPrefix(rawQuery);
    var stateMessage = 'Em alta agora';

    if (!rawQuery) {
      this.queryStateLabel.textContent = stateMessage;
      return;
    }

    if (mode === 'users') {
      stateMessage = token
        ? 'Buscando pessoas por "' + token + '"'
        : 'Buscando pessoas';
    } else if (mode === 'cordoes') {
      stateMessage = token
        ? 'Buscando cordoes por "' + token + '"'
        : 'Buscando cordoes';
    } else {
      stateMessage = 'Resultados em tempo real para "' + rawQuery + '"';
    }

    this.queryStateLabel.textContent = stateMessage;
  },

  updateClearButtonState: function () {
    if (!this.clearButton) {
      return;
    }

    var hasQuery = !!String(this.latestQuery || '').trim();

    this.clearButton.textContent = hasQuery ? 'Limpar' : 'Fechar';
    this.clearButton.classList.toggle('is-empty', !hasQuery);
  },

  buildEmptyMarkup: function (title, text) {
    return (
      '<div class="search-overlay-empty">' +
        '<strong>' + soEscapeHtml(title) + '</strong>' +
        '<span>' + soEscapeHtml(text) + '</span>' +
      '</div>'
    );
  }
};

function soSafeArray(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function soNormalize(value) {
  return String(value || '').toLowerCase();
}

function soStripSearchPrefix(value) {
  return String(value || '').replace(/^[@#$]/, '').trim().toLowerCase();
}

function soGetSearchMode(value) {
  var trimmed = String(value || '').trim();

  if (trimmed.indexOf('@') === 0) {
    return 'users';
  }

  if (trimmed.indexOf('$') === 0 || trimmed.indexOf('#') === 0) {
    return 'cordoes';
  }

  return 'all';
}

function soAllowedMobileTab(value) {
  var tab = String(value || '').toLowerCase();
  if (tab === 'users' || tab === 'cordoes' || tab === 'posts') {
    return tab;
  }

  return 'users';
}

function soEscapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function soEscapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function soHighlight(text, token) {
  var safeText = soEscapeHtml(text);
  var safeToken = String(token || '').trim();

  if (!safeToken) {
    return safeText;
  }

  var matcher = new RegExp('(' + soEscapeRegExp(safeToken) + ')', 'ig');
  return safeText.replace(matcher, '<mark>$1</mark>');
}

function soFormatCompactCount(value) {
  if (typeof formatCompactCount === 'function') {
    return formatCompactCount(value);
  }

  var safe = Number(value) || 0;
  if (safe >= 1000) {
    return (safe / 1000).toFixed(1).replace('.0', '') + 'k';
  }

  return String(safe);
}

function soPostMomentum(post) {
  if (!post || !post.metrics) {
    return 0;
  }

  var comments = Number(post.metrics.comments) || 0;
  var reposts = Number(post.metrics.reposts) || 0;
  var likes = Number(post.metrics.likes) || 0;

  return likes + (reposts * 2) + comments;
}

function soPostRank(post, token) {
  var query = String(token || '').trim();

  if (!query) {
    return Number.MAX_SAFE_INTEGER;
  }

  var user = soNormalize(post && post.user);
  var text = soNormalize(post && post.text);
  var repost = soNormalize(post && post.repost && post.repost.text);

  var userIndex = user.indexOf(query);
  var textIndex = text.indexOf(query);
  var repostIndex = repost.indexOf(query);

  var rank = Number.MAX_SAFE_INTEGER;

  if (userIndex !== -1) {
    rank = Math.min(rank, userIndex);
  }

  if (textIndex !== -1) {
    rank = Math.min(rank, textIndex + 4);
  }

  if (repostIndex !== -1) {
    rank = Math.min(rank, repostIndex + 8);
  }

  return rank;
}

function soExtractFirstTag(text) {
  var match = String(text || '').match(/\$([a-z0-9_]+)/i);
  return match ? match[1] : '';
}

function soTruncate(text, maxChars) {
  var content = String(text || '');
  var limit = Number(maxChars) || 140;

  if (content.length <= limit) {
    return content;
  }

  return content.slice(0, Math.max(0, limit - 1)).trimEnd() + '…';
}

function soFindPostById(postId) {
  if (typeof getPostById === 'function') {
    return getPostById(postId);
  }

  var list = Array.isArray(postStore) ? postStore : [];

  return list.find(function (item) {
    return item && item.id === postId;
  }) || null;
}
