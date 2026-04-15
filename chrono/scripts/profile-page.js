'use strict';

var profileTabPanels = document.getElementById('profileTabPanels');
var profileBackToFeedCta = document.getElementById('profileBackToFeedCta');
var profileTopPostsPeriod = 'seven'; // 'seven', 'thirty', 'all'

var PROFILE_TAB_DEFS = [
  { key: 'posts', label: 'Posts' },
  { key: 'ecos', label: 'Ecos' },
  { key: 'media', label: 'Midia' },
  { key: 'likes', label: 'Curtidos' }
];

// Top Posts mock data by period
var TOP_POSTS_DATA = {
  seven: [
    { rank: 1, votes: 94, text: 'A chuva neon refletindo no asfalto parecia frame de...', comments: 12, reposts: 5, date: 'há 2 dias' },
    { rank: 2, votes: 87, text: 'O que eu faria sem meu café da manhã, sério?', comments: 8, reposts: 3, date: 'há 3 dias' },
    { rank: 3, votes: 52, text: '$artedistopica é absoluto. Simplesmente arte pura.', comments: 5, reposts: 2, date: 'há 4 dias' },
    { rank: 4, votes: 43, text: 'Alguém mais ouve vozes estranhas à noite?', comments: 21, reposts: 7, date: 'há 5 dias' },
    { rank: 5, votes: 38, text: 'Cronologia invertida dos eventos de ontem...', comments: 3, reposts: 1, date: 'há 6 dias' }
  ],
  thirty: [
    { rank: 1, votes: 234, text: 'Post mais popular do mês completo aqui', comments: 45, reposts: 23, date: 'há 15 dias' },
    { rank: 2, votes: 198, text: 'Segundo post mais votado do mês', comments: 31, reposts: 18, date: 'há 12 dias' },
    { rank: 3, votes: 167, text: 'Terceiro maior engajamento em 30 dias', comments: 28, reposts: 12, date: 'há 10 dias' },
    { rank: 4, votes: 145, text: 'Continuando com o quarto post mais popular', comments: 22, reposts: 10, date: 'há 8 dias' },
    { rank: 5, votes: 123, text: 'Quinto lugar em atividade do mês', comments: 19, reposts: 8, date: 'há 5 dias' }
  ],
  all: [
    { rank: 1, votes: 567, text: 'O maior hit de todos os tempos no perfil', comments: 112, reposts: 54, date: 'há 6 meses' },
    { rank: 2, votes: 498, text: 'Segundo post mais votado de todos os tempos', comments: 95, reposts: 45, date: 'há 5 meses' },
    { rank: 3, votes: 445, text: 'Um clássico que sempre resurge', comments: 87, reposts: 38, date: 'há 4 meses' },
    { rank: 4, votes: 398, text: 'Post viral que não morre nunca', comments: 78, reposts: 32, date: 'há 3 meses' },
    { rank: 5, votes: 356, text: 'Top 5 historicamente neste perfil', comments: 62, reposts: 28, date: 'há 2 meses' }
  ]
};

// Popular cordoes mock data
var POPULAR_CORDOES_DATA = [
  { name: 'artedistopica', posts: 47 },
  { name: 'chrono', posts: 31 },
  { name: 'devbr', posts: 28 },
  { name: 'ossodemais', posts: 19 },
  { name: 'techbr', posts: 12 },
  { name: 'filosofia', posts: 7 }
];

function getProfileTabsElement() {
  if (typeof profileTabs !== 'undefined' && profileTabs) {
    return profileTabs;
  }

  return document.getElementById('profileTabs');
}

function normalizeProfileTab(tab) {
  var value = String(tab || 'posts').toLowerCase();

  if (value === 'midia') {
    return 'media';
  }

  if (value === 'curtidos') {
    return 'likes';
  }

  if (!PROFILE_TAB_DEFS.some(function (item) { return item.key === value; })) {
    return 'posts';
  }

  return value;
}

function ensureProfileTabsMarkup() {
  var tabsEl = getProfileTabsElement();

  if (!tabsEl) {
    return;
  }

  var desired = PROFILE_TAB_DEFS.map(function (tab) {
    var active = (typeof AppState !== 'undefined' && AppState && AppState.profileTab)
      ? normalizeProfileTab(AppState.profileTab) === tab.key
      : tab.key === 'posts';

    return '<button type="button" class="profile-tab' + (active ? ' active' : '') + '" data-profile-tab="' + tab.key + '">' + tab.label + '</button>';
  }).join('');

  if (tabsEl.innerHTML !== desired) {
    tabsEl.innerHTML = desired;
  }
}

function renderTopPosts() {
  var data = TOP_POSTS_DATA[profileTopPostsPeriod] || TOP_POSTS_DATA.seven;

  if (!data || !data.length) {
    return '<div class="top-posts-empty"><i data-lucide="inbox" class="top-posts-empty-icon"></i><p class="top-posts-empty-text">Nenhum post neste período</p></div>';
  }

  return data.map(function (post) {
    return '<article class="top-posts-item" data-post-rank="' + post.rank + '">' +
      '<div class="top-posts-rank">#' + post.rank + '</div>' +
      '<div class="top-posts-content">' +
        '<div class="top-posts-score">▲ ' + post.votes + '</div>' +
        '<p class="top-posts-text">' + post.text + '</p>' +
        '<div class="top-posts-meta">💬 ' + post.comments + '  🔁 ' + post.reposts + '  · ' + post.date + '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

function renderPopularCordoes() {
  var maxPosts = Math.max.apply(null, POPULAR_CORDOES_DATA.map(function(c) { return c.posts; }));

  var html = POPULAR_CORDOES_DATA.map(function(cordao, index) {
    var percent = Math.round((cordao.posts / maxPosts) * 100);
    var staggerDelay = index * 60;
    return '<div class="cordao-item" data-cordao="' + cordao.name + '" style="--stagger-delay:' + staggerDelay + 'ms">' +
      '<div class="cordao-name-row">' +
        '<span class="cordao-name"><span class="cordao-dollar">$</span>' + cordao.name + '</span>' +
        '<span class="cordao-count">' + cordao.posts + ' posts</span>' +
      '</div>' +
      '<div class="cordao-activity-bar">' +
        '<div class="cordao-activity-fill" data-width="' + percent + '%" style="width:0%"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  // Trigger animation after render
  setTimeout(function() {
    var fills = document.querySelectorAll('.cordao-activity-fill');
    fills.forEach(function(fill) {
      var targetWidth = fill.getAttribute('data-width');
      var delay = parseInt(fill.closest('.cordao-item').style.getPropertyValue('--stagger-delay')) || 0;
      setTimeout(function() {
        fill.style.width = targetWidth;
      }, delay);
    });
  }, 50);

  return html;
}

function renderProfilePostCards(posts) {
  var safePosts = Array.isArray(posts) ? posts : [];

  if (!safePosts.length) {
    var emptyStates = {
      posts: { icon: 'file-text', title: 'Ainda sem posts', subtitle: 'Quando publicar algo, aparecerá aqui.' },
      ecos: { icon: 'repeat-2', title: 'Nenhum eco ainda', subtitle: 'Posts repostados aparecerão aqui.' },
      media: { icon: 'image', title: 'Sem mídia', subtitle: 'Fotos e vídeos publicados aparecerão aqui.' },
      likes: { icon: 'heart', title: 'Nenhuma curtida', subtitle: 'Posts curtidos aparecerão aqui.' }
    };

    var activeTab = normalizeProfileTab((typeof AppState !== 'undefined' && AppState && AppState.profileTab) || 'posts');
    var emptyState = emptyStates[activeTab] || emptyStates.posts;

    return '<div class="profile-empty-state">' +
      '<i data-lucide="' + emptyState.icon + '" class="profile-empty-icon"></i>' +
      '<h3 class="profile-empty-title">' + emptyState.title + '</h3>' +
      '<p class="profile-empty-subtitle">' + emptyState.subtitle + '</p>' +
    '</div>';
  }

  return '<div class="profile-post-stream">' + safePosts.slice(0, 12).map(function (post, index) {
    return renderPost(post, index, { source: 'profile' });
  }).join('') + '</div>';
}

function refreshProfileRenderedCards() {
  safeIconRefresh();

  if (typeof animatePollBars === 'function') {
    animatePollBars();
  }

  if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.syncAllCards === 'function') {
    VoteSystem.syncAllCards();
  }
}

function runTemporalSearch() {
  if (!profileTabPanels) {
    return;
  }

  var input = document.getElementById('profileTemporalDate');
  var results = document.getElementById('profileTemporalResults');
  if (!input || !results) {
    return;
  }

  var raw = String(input.value || '').trim();
  if (!raw) {
    results.innerHTML = '<p class="profile-empty-state">Informe uma data para buscar.</p>';
    return;
  }

  var queryTime = Date.parse(raw);
  if (!Number.isFinite(queryTime)) {
    results.innerHTML = '<div class="profile-empty-state"><p>Data inválida. Use o formato do campo.</p></div>';
    return;
  }

  var start = new Date(queryTime);
  start.setHours(0, 0, 0, 0);
  var end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);

  var posts = (typeof postStore !== 'undefined' && Array.isArray(postStore))
    ? postStore.filter(function (post) {
      var createdAt = Number(post && post.createdAt);
      return Number.isFinite(createdAt) && createdAt >= start.getTime() && createdAt < end.getTime();
    })
    : [];

  if (!posts.length) {
    results.innerHTML = '<div class="profile-empty-state"><p>Nenhum post encontrado para esta data.</p></div>';
    return;
  }

  results.innerHTML = renderProfilePostCards(posts);
  refreshProfileRenderedCards();
}

function renderProfilePosts() {
  if (!profileTabPanels || typeof AppState === 'undefined' || !AppState) {
    return;
  }

  var activeTab = normalizeProfileTab(AppState.profileTab || 'posts');
  AppState.profileTab = activeTab;
  ensureProfileTabsMarkup();
  var posts = (typeof getProfilePostsForTab === 'function')
    ? getProfilePostsForTab(activeTab)
    : [];

  profileTabPanels.innerHTML = renderProfilePostCards(posts);
  refreshProfileRenderedCards();
}

function handleTopPostsPeriodChange(period) {
  profileTopPostsPeriod = period;
  var listEl = document.querySelector('.top-posts-list');
  if (listEl) {
    listEl.style.opacity = '0';
    setTimeout(function() {
      listEl.innerHTML = renderTopPosts();
      listEl.style.opacity = '1';
      safeIconRefresh();
    }, 100);
  }

  // Update pill states
  var pills = document.querySelectorAll('.top-posts-pill');
  pills.forEach(function(pill) {
    pill.classList.remove('active');
    if (pill.getAttribute('data-period') === period) {
      pill.classList.add('active');
    }
  });
}

var ProfileTabController = {
  setTab: function (tab) {
    if (typeof AppState === 'undefined' || !AppState) {
      return;
    }

    AppState.profileTab = normalizeProfileTab(tab || 'posts');
    if (typeof renderProfileView === 'function') {
      renderProfileView();
    }
  },

  init: function () {}
};

var EditProfileModal = {
  open: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('edit-profile');
    }
  },

  close: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('perfil/' + (typeof getCurrentHandle === 'function' ? getCurrentHandle() : 'juvinho'));
    }
  }
};

var ProfilePage = {
  init: function () {
    profileTabPanels = document.getElementById('profileTabPanels');
    profileBackToFeedCta = document.getElementById('profileBackToFeedCta');
    ensureProfileTabsMarkup();
    this.renderTopPosts();
    this.renderPopularCordoes();
    this.attachEventListeners();
  },

  renderTopPosts: function() {
    var container = document.querySelector('.top-posts-list');
    if (container) {
      container.innerHTML = renderTopPosts();
      safeIconRefresh();
    }
  },

  renderPopularCordoes: function() {
    var container = document.querySelector('.popular-cordoes-list');
    if (container) {
      container.innerHTML = renderPopularCordoes();
      safeIconRefresh();
    }
  },

  attachEventListeners: function() {
    // Top posts period filter
    var pills = document.querySelectorAll('.top-posts-pill');
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        var period = this.getAttribute('data-period');
        handleTopPostsPeriodChange(period);
      });
    });

    // Popular cordoes click
    var cordoes = document.querySelectorAll('.cordao-item');
    cordoes.forEach(function(item) {
      item.addEventListener('click', function() {
        var cordaoName = this.getAttribute('data-cordao');
        if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
          AppRouter.navigate('cordao/' + cordaoName);
        }
      });
    });
  },

  render: function () {
    renderProfilePosts();
  }
};
