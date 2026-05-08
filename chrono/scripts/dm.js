'use strict';

function dmEscapeHtml(value) {
  if (typeof escapeHtml === 'function') {
    return escapeHtml(value);
  }

  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dmNormalizeHandle(value) {
  return String(value || '')
    .replace(/^@+/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

function dmAtHandle(value) {
  var normalized = dmNormalizeHandle(value);
  return normalized ? '@' + normalized : '@usuario';
}

function dmDisplayFromHandle(value) {
  if (typeof handleToDisplayName === 'function') {
    return handleToDisplayName(dmAtHandle(value));
  }

  var plain = dmNormalizeHandle(value).replace(/_/g, ' ');
  if (!plain) {
    return 'Usuario';
  }

  return plain.replace(/\b[a-z]/g, function (letter) {
    return letter.toUpperCase();
  });
}

function dmNow() {
  return Date.now();
}

function dmBuildId(prefix) {
  return String(prefix || 'dm') + '-' + dmNow().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function dmFormatClock(timestamp) {
  var date = new Date(Number(timestamp) || dmNow());
  var hours = String(date.getHours()).padStart(2, '0');
  var minutes = String(date.getMinutes()).padStart(2, '0');
  return hours + ':' + minutes;
}

function dmFormatRelative(timestamp) {
  var value = Number(timestamp) || dmNow();
  var diff = Math.max(0, dmNow() - value);
  var minute = 60 * 1000;
  var hour = 60 * minute;
  var day = 24 * hour;

  if (diff < minute) {
    return 'agora';
  }

  if (diff < hour) {
    return Math.max(1, Math.floor(diff / minute)) + ' min';
  }

  if (diff < day) {
    return Math.max(1, Math.floor(diff / hour)) + ' h';
  }

  var date = new Date(value);
  var dayValue = String(date.getDate()).padStart(2, '0');
  var monthValue = String(date.getMonth() + 1).padStart(2, '0');
  return dayValue + '/' + monthValue;
}

function dmAvatarFor(handle, size) {
  var normalized = dmNormalizeHandle(handle) || 'chrono';
  var imageSize = Number(size) || 72;
  return 'https://picsum.photos/seed/dm-' + normalized + '/' + imageSize + '/' + imageSize;
}

var DMStore = {
  listeners: [],

  ensureState: function () {
    var root = (typeof AppState !== 'undefined' && AppState && typeof AppState === 'object') ? AppState : this;

    if (!root.dm || typeof root.dm !== 'object') {
      root.dm = {
        seeded: false,
        activeConversation: '',
        searchQuery: '',
        conversations: {},
        userDirectory: {}
      };
    }

    if (typeof root.dm.seeded !== 'boolean') {
      root.dm.seeded = false;
    }

    if (typeof root.dm.activeConversation !== 'string') {
      root.dm.activeConversation = '';
    }

    if (typeof root.dm.searchQuery !== 'string') {
      root.dm.searchQuery = '';
    }

    if (!root.dm.conversations || typeof root.dm.conversations !== 'object') {
      root.dm.conversations = {};
    }

    if (!root.dm.userDirectory || typeof root.dm.userDirectory !== 'object') {
      root.dm.userDirectory = {};
    }

    return root.dm;
  },

  init: function () {
    this.ensureState();
    this.syncDirectoryFromApp();
    this.seedIfNeeded();
    this.syncHeaderBadge(false);
  },

  subscribe: function (listener) {
    if (typeof listener !== 'function') {
      return function () {};
    }

    this.listeners.push(listener);

    var self = this;
    return function () {
      self.listeners = self.listeners.filter(function (entry) {
        return entry !== listener;
      });
    };
  },

  notify: function (animateBadge) {
    var snapshot = this.ensureState();
    this.syncHeaderBadge(!!animateBadge);

    this.listeners.slice().forEach(function (listener) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('[DMStore] listener failed', error);
      }
    });
  },

  getOwnHandle: function () {
    if (typeof getProfileHandleValue === 'function') {
      return dmNormalizeHandle(getProfileHandleValue());
    }

    if (typeof AppState !== 'undefined' && AppState && AppState.profile && AppState.profile.username) {
      return dmNormalizeHandle(AppState.profile.username);
    }

    return 'juvinho';
  },

  registerUser: function (rawUser) {
    var dmState = this.ensureState();
    var user = rawUser || {};
    var normalized = dmNormalizeHandle(user.username || user.handle || user.user);

    if (!normalized) {
      return null;
    }

    var existing = dmState.userDirectory[normalized] || {};

    dmState.userDirectory[normalized] = {
      username: normalized,
      handle: dmAtHandle(normalized),
      displayName: String(user.displayName || user.display || existing.displayName || dmDisplayFromHandle(normalized)),
      avatar: String(user.avatar || existing.avatar || dmAvatarFor(normalized, 72)),
      verified: !!(user.verified || existing.verified),
      followers: Number(user.followers || existing.followers || 0)
    };

    return dmState.userDirectory[normalized];
  },

  syncDirectoryFromApp: function () {
    var self = this;

    if (typeof MOCK_USERS !== 'undefined' && Array.isArray(MOCK_USERS)) {
      MOCK_USERS.forEach(function (user) {
        self.registerUser({
          username: user.username,
          displayName: user.display,
          avatar: user.avatar,
          verified: user.verified,
          followers: user.followers
        });
      });
    }

    if (typeof AppState !== 'undefined' && AppState && AppState.profile) {
      this.registerUser({
        username: AppState.profile.username,
        displayName: AppState.profile.displayName,
        avatar: AppState.profile.avatar,
        verified: true,
        followers: (AppState.followers && AppState.followers.length) || 0
      });
    }

    if (typeof AppState !== 'undefined' && AppState && Array.isArray(AppState.followers)) {
      AppState.followers.forEach(function (handle) {
        self.registerUser({ username: handle, displayName: dmDisplayFromHandle(handle) });
      });
    }

    if (typeof AppState !== 'undefined' && AppState && Array.isArray(AppState.following)) {
      AppState.following.forEach(function (handle) {
        self.registerUser({ username: handle, displayName: dmDisplayFromHandle(handle) });
      });
    }

    if (typeof postStore !== 'undefined' && Array.isArray(postStore)) {
      postStore.forEach(function (post) {
        if (!post) {
          return;
        }

        self.registerUser({
          username: post.user,
          displayName: dmDisplayFromHandle(post.user),
          avatar: post.avatar,
          followers: 0
        });
      });
    }
  },

  seedIfNeeded: function () {
    var dmState = this.ensureState();
    var self = this;

    if (dmState.seeded) {
      return;
    }

    var now = dmNow();

    [
      {
        handle: '@nebula_core',
        displayName: 'Nebula Core',
        avatar: 'https://picsum.photos/seed/dm-nebula/72/72',
        online: true,
        unread: 2,
        messages: [
          { author: '@nebula_core', text: 'voce viu o post da torre central?', createdAt: now - (42 * 60000) },
          { author: dmAtHandle(self.getOwnHandle()), text: 'vi sim, achei estranho demais.', createdAt: now - (39 * 60000) },
          { author: '@nebula_core', text: 'vamos monitorar isso hoje a noite.', createdAt: now - (18 * 60000) }
        ]
      },
      {
        handle: '@Sus_Bacon',
        displayName: 'Sus Bacon',
        avatar: 'https://picsum.photos/seed/dm-susbacon/72/72',
        online: false,
        unread: 1,
        messages: [
          { author: '@Sus_Bacon', text: 'to indo para o hub agora.', createdAt: now - (95 * 60000) },
          { author: dmAtHandle(self.getOwnHandle()), text: 'boa, depois me atualiza.', createdAt: now - (88 * 60000) },
          { author: '@Sus_Bacon', text: 'fechado, te mando os logs.', createdAt: now - (65 * 60000) }
        ]
      },
      {
        handle: '@orbital_zero',
        displayName: 'Orbital Zero',
        avatar: 'https://picsum.photos/seed/dm-orbital/72/72',
        online: false,
        unread: 0,
        messages: [
          { author: '@orbital_zero', text: 'o feed de agora ta bem limpo.', createdAt: now - (8 * 3600000) },
          { author: dmAtHandle(self.getOwnHandle()), text: 'sim, ficou muito melhor.', createdAt: now - (7.6 * 3600000) }
        ]
      },
      {
        handle: '@pixel_ghost',
        displayName: 'Pixel Ghost',
        avatar: 'https://picsum.photos/seed/dm-pixel/72/72',
        online: true,
        unread: 0,
        messages: [
          { author: '@pixel_ghost', text: 'subi novas imagens para o album.', createdAt: now - (26 * 3600000) }
        ]
      }
    ].forEach(function (seedConversation) {
      var conversation = self.ensureConversation(seedConversation.handle, {
        displayName: seedConversation.displayName,
        avatar: seedConversation.avatar,
        online: seedConversation.online,
        unread: seedConversation.unread
      });

      if (!conversation.messages.length) {
        seedConversation.messages.forEach(function (message) {
          self.appendMessage(conversation.username, {
            id: dmBuildId('seed'),
            author: message.author,
            text: message.text,
            createdAt: message.createdAt,
            reactions: {},
            silent: true,
            incrementUnread: false
          });
        });
      }

      if (typeof seedConversation.unread === 'number') {
        conversation.unread = Math.max(0, seedConversation.unread);
      }

      conversation.updatedAt = conversation.messages.length
        ? Number(conversation.messages[conversation.messages.length - 1].createdAt) || dmNow()
        : dmNow();
    });

    dmState.seeded = true;
  },

  ensureConversation: function (handleValue, options) {
    var dmState = this.ensureState();
    var normalized = dmNormalizeHandle(handleValue);

    if (!normalized) {
      return null;
    }

    var userInfo = this.registerUser(Object.assign({}, options || {}, { username: normalized })) || {};
    var existing = dmState.conversations[normalized];

    if (!existing) {
      existing = {
        username: normalized,
        handle: dmAtHandle(normalized),
        displayName: userInfo.displayName || dmDisplayFromHandle(normalized),
        avatar: userInfo.avatar || dmAvatarFor(normalized, 72),
        online: !!(options && options.online),
        unread: Number(options && options.unread) || 0,
        updatedAt: dmNow(),
        messages: []
      };
      dmState.conversations[normalized] = existing;
    }

    if (options && typeof options.online === 'boolean') {
      existing.online = options.online;
    }

    if (options && typeof options.unread === 'number') {
      existing.unread = Math.max(0, options.unread);
    }

    if (userInfo.displayName) {
      existing.displayName = userInfo.displayName;
    }

    if (userInfo.avatar) {
      existing.avatar = userInfo.avatar;
    }

    return existing;
  },

  appendMessage: function (handleValue, payload) {
    var normalized = dmNormalizeHandle(handleValue);
    var options = payload || {};
    var conversation = this.ensureConversation(normalized, options);

    if (!conversation) {
      return null;
    }

    var message = {
      id: String(options.id || dmBuildId('msg')),
      author: dmAtHandle(options.author || normalized),
      text: String(options.text || '').slice(0, 1000),
      createdAt: Number(options.createdAt) || dmNow(),
      reactions: {}
    };

    if (options.reactions && typeof options.reactions === 'object') {
      Object.keys(options.reactions).forEach(function (reactionKey) {
        var list = options.reactions[reactionKey];
        if (!Array.isArray(list)) {
          return;
        }

        message.reactions[reactionKey] = list.map(function (entry) {
          return dmAtHandle(entry);
        });
      });
    }

    conversation.messages.push(message);

    if (conversation.messages.length > 240) {
      conversation.messages.splice(0, conversation.messages.length - 240);
    }

    conversation.updatedAt = Number(message.createdAt) || dmNow();

    if (options.incrementUnread) {
      conversation.unread += 1;
    }

    if (!options.silent) {
      this.notify(!!options.incrementUnread);
    }

    return message;
  },

  markConversationRead: function (handleValue, silent) {
    var conversation = this.ensureConversation(handleValue);

    if (!conversation) {
      return;
    }

    if (conversation.unread <= 0) {
      return;
    }

    conversation.unread = 0;

    if (!silent) {
      this.notify(false);
    }
  },

  setActiveConversation: function (handleValue, options) {
    var dmState = this.ensureState();
    var normalized = dmNormalizeHandle(handleValue);

    if (!normalized) {
      dmState.activeConversation = '';
      this.notify(false);
      return;
    }

    this.ensureConversation(normalized);
    dmState.activeConversation = normalized;

    if (!(options && options.keepUnread)) {
      this.markConversationRead(normalized, true);
    }

    this.notify(false);
  },

  getActiveConversation: function () {
    var dmState = this.ensureState();
    var key = dmNormalizeHandle(dmState.activeConversation);

    if (!key) {
      return null;
    }

    return dmState.conversations[key] || null;
  },

  getConversation: function (handleValue) {
    var key = dmNormalizeHandle(handleValue);
    var dmState = this.ensureState();

    if (!key) {
      return null;
    }

    return dmState.conversations[key] || null;
  },

  getConversationList: function () {
    var dmState = this.ensureState();
    var list = Object.keys(dmState.conversations).map(function (key) {
      return dmState.conversations[key];
    });

    list.sort(function (a, b) {
      var unreadA = a.unread > 0 ? 1 : 0;
      var unreadB = b.unread > 0 ? 1 : 0;

      if (unreadA !== unreadB) {
        return unreadB - unreadA;
      }

      return (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0);
    });

    return list;
  },

  getSearchQuery: function () {
    return this.ensureState().searchQuery;
  },

  setSearchQuery: function (query) {
    this.ensureState().searchQuery = String(query || '').trim();
    this.notify(false);
  },

  searchConversations: function (query) {
    var needle = String(query || this.getSearchQuery() || '').trim().toLowerCase();
    var list = this.getConversationList();

    if (!needle) {
      return list;
    }

    return list.filter(function (conversation) {
      var lastMessage = conversation.messages.length
        ? conversation.messages[conversation.messages.length - 1].text
        : '';

      return (
        conversation.handle.toLowerCase().indexOf(needle) !== -1 ||
        String(conversation.displayName || '').toLowerCase().indexOf(needle) !== -1 ||
        String(lastMessage || '').toLowerCase().indexOf(needle) !== -1
      );
    });
  },

  searchUsers: function (query) {
    var dmState = this.ensureState();
    var needle = String(query || '').trim().toLowerCase();
    var own = this.getOwnHandle();
    var users = Object.keys(dmState.userDirectory).map(function (key) {
      return dmState.userDirectory[key];
    });

    users = users.filter(function (user) {
      return dmNormalizeHandle(user.username) !== own;
    });

    if (needle) {
      users = users.filter(function (user) {
        return (
          user.handle.toLowerCase().indexOf(needle) !== -1 ||
          String(user.displayName || '').toLowerCase().indexOf(needle) !== -1
        );
      });
    }

    users.sort(function (a, b) {
      var aOpen = dmState.conversations[a.username] ? 1 : 0;
      var bOpen = dmState.conversations[b.username] ? 1 : 0;

      if (aOpen !== bOpen) {
        return aOpen - bOpen;
      }

      return (Number(b.followers) || 0) - (Number(a.followers) || 0);
    });

    return users.slice(0, 12);
  },

  sendMessage: function (handleValue, textValue) {
    var normalized = dmNormalizeHandle(handleValue);
    var text = String(textValue || '').trim();

    if (!normalized || !text) {
      return null;
    }

    var message = this.appendMessage(normalized, {
      author: this.getOwnHandle(),
      text: text,
      incrementUnread: false,
      silent: true
    });

    this.markConversationRead(normalized, true);
    this.notify(false);

    if (normalized !== this.getOwnHandle()) {
      this.scheduleMockReply(normalized);
    }

    return message;
  },

  receiveMessage: function (handleValue, textValue) {
    var normalized = dmNormalizeHandle(handleValue);
    var text = String(textValue || '').trim();

    if (!normalized || !text) {
      return null;
    }

    var dmState = this.ensureState();
    var isCurrent = dmNormalizeHandle(dmState.activeConversation) === normalized;
    var onMessagesView = (typeof AppRouter !== 'undefined' && AppRouter && AppRouter.currentView === 'mensagens');
    var shouldIncrementUnread = !(isCurrent && onMessagesView);

    var message = this.appendMessage(normalized, {
      author: normalized,
      text: text,
      incrementUnread: shouldIncrementUnread,
      silent: true
    });

    if (shouldIncrementUnread && typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.sendButtonNudge === 'function') {
      HeaderModule.sendButtonNudge();
    }

    this.notify(shouldIncrementUnread);
    return message;
  },

  scheduleMockReply: function (handleValue) {
    var self = this;
    var normalized = dmNormalizeHandle(handleValue);
    var conversation = this.ensureConversation(normalized);

    if (!conversation) {
      return;
    }

    if (conversation.replyTimer) {
      clearTimeout(conversation.replyTimer);
      conversation.replyTimer = null;
    }

    conversation.replyTimer = setTimeout(function () {
      conversation.replyTimer = null;
      self.receiveMessage(normalized, self.getMockReply(normalized));
    }, 850 + Math.floor(Math.random() * 900));
  },

  getMockReply: function (handleValue) {
    var normalized = dmNormalizeHandle(handleValue);
    var canned = {
      nebula_core: [
        'passei aqui para confirmar o horario.',
        'vi agora, vou te mandar mais detalhes.',
        'deixa comigo, estou monitorando.'
      ],
      sus_bacon: [
        'kkk sabia que voce ia responder rapido.',
        'depois te mando print disso.',
        'tudo certo por aqui.'
      ],
      orbital_zero: [
        'boa, qualquer novidade eu aviso.',
        'recebi os dados, valeu.',
        'acho que vai dar bom agora.'
      ]
    };

    var pool = canned[normalized] || [
      'recebido.',
      'boa! depois falamos com calma.',
      'fechado, obrigado pela resposta.'
    ];

    return pool[Math.floor(Math.random() * pool.length)] || 'ok';
  },

  toggleReaction: function (handleValue, messageId, reactionType) {
    var normalized = dmNormalizeHandle(handleValue);
    var type = String(reactionType || '').trim().toLowerCase();
    var messageKey = String(messageId || '');

    if (!normalized || !type || !messageKey) {
      return;
    }

    var conversation = this.getConversation(normalized);

    if (!conversation) {
      return;
    }

    var message = conversation.messages.find(function (entry) {
      return String(entry.id) === messageKey;
    });

    if (!message) {
      return;
    }

    if (!message.reactions || typeof message.reactions !== 'object') {
      message.reactions = {};
    }

    if (!Array.isArray(message.reactions[type])) {
      message.reactions[type] = [];
    }

    var ownHandle = dmAtHandle(this.getOwnHandle());
    var existingIndex = message.reactions[type].findIndex(function (author) {
      return dmNormalizeHandle(author) === dmNormalizeHandle(ownHandle);
    });

    if (existingIndex >= 0) {
      message.reactions[type].splice(existingIndex, 1);
    } else {
      message.reactions[type].push(ownHandle);
    }

    if (!message.reactions[type].length) {
      delete message.reactions[type];
    }

    this.notify(false);
  },

  getUnreadTotal: function () {
    var dmState = this.ensureState();

    return Object.keys(dmState.conversations).reduce(function (sum, key) {
      return sum + Math.max(0, Number(dmState.conversations[key].unread) || 0);
    }, 0);
  },

  syncHeaderBadge: function (animate) {
    var count = this.getUnreadTotal();

    if (typeof HeaderModule === 'undefined' || !HeaderModule) {
      return;
    }

    HeaderModule.dmCount = count;

    if (typeof HeaderModule.updateBadge === 'function' && HeaderModule.dmBadge) {
      HeaderModule.updateBadge(HeaderModule.dmBadge, count, !!animate);
      return;
    }

    if (typeof HeaderModule.syncBadges === 'function') {
      HeaderModule.syncBadges(!!animate);
    }
  }
};

var DMReactions = {
  presets: [
    { key: 'like', label: 'Like' },
    { key: 'zap', label: 'Zap' },
    { key: 'echo', label: 'Eco' }
  ],

  renderButtons: function (conversationKey, message) {
    var own = dmAtHandle(DMStore.getOwnHandle());
    var safeConversation = dmEscapeHtml(conversationKey);
    var safeMessageId = dmEscapeHtml(message.id);

    return this.presets.map(function (preset) {
      var list = (message.reactions && Array.isArray(message.reactions[preset.key]))
        ? message.reactions[preset.key]
        : [];
      var active = list.some(function (author) {
        return dmNormalizeHandle(author) === dmNormalizeHandle(own);
      });

      return (
        '<button type="button" class="dm-reaction-btn' + (active ? ' is-active' : '') + '" ' +
          'data-dm-handle="' + safeConversation + '" ' +
          'data-dm-message-id="' + safeMessageId + '" ' +
          'data-dm-reaction="' + preset.key + '">' +
            '<span>' + preset.label + '</span>' +
            (list.length ? '<span class="dm-reaction-count">' + list.length + '</span>' : '') +
        '</button>'
      );
    }).join('');
  },

  toggle: function (conversationKey, messageId, reactionType) {
    DMStore.toggleReaction(conversationKey, messageId, reactionType);
  }
};

var DMComposer = {
  maxLength: 1000,
  page: null,
  textarea: null,
  counter: null,
  sendButton: null,
  initialized: false,

  init: function (page) {
    this.page = page;
    this.textarea = document.getElementById('dmComposerInput');
    this.counter = document.getElementById('dmComposerCounter');
    this.sendButton = document.getElementById('dmSendButton');

    if (!this.textarea || !this.sendButton || this.initialized) {
      this.updateState();
      return;
    }

    this.initialized = true;

    var self = this;

    this.textarea.addEventListener('input', function () {
      self.autoResize();
      self.updateState();
    });

    this.textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        self.sendCurrent();
      }
    });

    this.sendButton.addEventListener('click', function () {
      self.sendCurrent();
    });

    this.updateState();
  },

  autoResize: function () {
    if (!this.textarea) {
      return;
    }

    this.textarea.style.height = 'auto';
    this.textarea.style.height = Math.min(this.textarea.scrollHeight, 176) + 'px';
  },

  setDisabled: function (disabled) {
    if (!this.textarea || !this.sendButton) {
      return;
    }

    this.textarea.disabled = !!disabled;
    this.sendButton.disabled = !!disabled;

    if (disabled) {
      this.textarea.value = '';
      this.autoResize();
    }

    this.updateState();
  },

  updateState: function () {
    if (!this.textarea || !this.sendButton) {
      return;
    }

    var currentText = String(this.textarea.value || '').slice(0, this.maxLength);

    if (currentText !== this.textarea.value) {
      this.textarea.value = currentText;
    }

    if (this.counter) {
      this.counter.textContent = currentText.length + '/' + this.maxLength;
      this.counter.classList.toggle('is-limit', currentText.length >= this.maxLength);
    }

    var hasActiveConversation = !!DMStore.getActiveConversation();
    this.sendButton.disabled = !hasActiveConversation || !currentText.trim() || this.textarea.disabled;
  },

  sendCurrent: function () {
    if (!this.textarea) {
      return;
    }

    var activeConversation = DMStore.getActiveConversation();

    if (!activeConversation) {
      return;
    }

    var text = String(this.textarea.value || '').trim();

    if (!text) {
      return;
    }

    DMStore.sendMessage(activeConversation.username, text);

    this.textarea.value = '';
    this.autoResize();
    this.updateState();

    if (this.page && typeof this.page.scrollThreadToBottom === 'function') {
      this.page.scrollThreadToBottom();
    }
  }
};

var NewDMModal = {
  initialized: false,
  page: null,
  overlay: null,
  searchInput: null,
  list: null,

  init: function (page) {
    this.page = page;
    this.ensureModal();

    if (!this.overlay || this.initialized) {
      return;
    }

    this.initialized = true;

    var self = this;

    this.overlay.addEventListener('click', function (event) {
      if (event.target === self.overlay) {
        self.close();
      }
    });

    var closeButton = document.getElementById('dmNewModalClose');
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        self.close();
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', function () {
        self.renderResults(self.searchInput.value);
      });

      this.searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          self.close();
          return;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          var first = self.list ? self.list.querySelector('[data-dm-user-handle]') : null;
          if (first) {
            self.startConversation(first.getAttribute('data-dm-user-handle'));
          }
        }
      });
    }

    if (this.list) {
      this.list.addEventListener('click', function (event) {
        var button = event.target.closest('[data-dm-user-handle]');
        if (!button) {
          return;
        }

        self.startConversation(button.getAttribute('data-dm-user-handle'));
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') {
        return;
      }

      if (self.overlay && self.overlay.classList.contains('is-open')) {
        self.close();
      }
    });
  },

  ensureModal: function () {
    if (!this.page || !this.page.view) {
      return;
    }

    this.overlay = document.getElementById('dmNewModalOverlay');

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'dmNewModalOverlay';
      this.overlay.className = 'dm-new-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.innerHTML = [
        '<article class="dm-new-modal" role="dialog" aria-modal="true" aria-labelledby="dmNewModalTitle">',
          '<header class="dm-new-header">',
            '<h3 id="dmNewModalTitle">Nova mensagem</h3>',
            '<button id="dmNewModalClose" type="button" class="drawer-close-btn" aria-label="Fechar">',
              '<i data-lucide="x"></i>',
            '</button>',
          '</header>',
          '<div class="dm-new-body">',
            '<label class="sr-only" for="dmNewModalSearch">Buscar usuario</label>',
            '<input id="dmNewModalSearch" class="dm-new-search" type="search" autocomplete="off" placeholder="Buscar por @usuario">',
            '<ul id="dmNewModalList" class="dm-new-list"></ul>',
          '</div>',
        '</article>'
      ].join('');

      this.page.view.appendChild(this.overlay);
      safeIconRefresh();
    }

    this.searchInput = document.getElementById('dmNewModalSearch');
    this.list = document.getElementById('dmNewModalList');
  },

  open: function () {
    if (!this.overlay) {
      return;
    }

    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');

    if (this.searchInput) {
      this.searchInput.value = '';
      this.renderResults('');
      this.searchInput.focus();
    }
  },

  close: function () {
    if (!this.overlay) {
      return;
    }

    this.overlay.classList.remove('is-open');
    this.overlay.setAttribute('aria-hidden', 'true');
  },

  renderResults: function (query) {
    if (!this.list) {
      return;
    }

    var users = DMStore.searchUsers(query);

    if (!users.length) {
      this.list.innerHTML = '<li class="dm-new-empty">Nenhum usuario encontrado.</li>';
      return;
    }

    this.list.innerHTML = users.map(function (user) {
      var existing = DMStore.getConversation(user.username);

      return [
        '<li>',
          '<button type="button" class="dm-user-pick" data-dm-user-handle="' + dmEscapeHtml(user.username) + '">',
            '<img class="dm-user-avatar" src="' + dmEscapeHtml(user.avatar) + '" alt="Avatar ' + dmEscapeHtml(user.handle) + '">',
            '<span class="dm-user-meta">',
              '<strong>' + dmEscapeHtml(user.handle) + '</strong>',
              '<span>' + dmEscapeHtml(user.displayName) + '</span>',
            '</span>',
            existing ? '<span class="dm-user-chip">existente</span>' : '<span class="dm-user-chip dm-user-chip--new">novo</span>',
          '</button>',
        '</li>'
      ].join('');
    }).join('');
  },

  startConversation: function (handleValue) {
    var normalized = dmNormalizeHandle(handleValue);

    if (!normalized) {
      return;
    }

    DMStore.ensureConversation(normalized);
    this.close();

    if (this.page && typeof this.page.navigateToConversation === 'function') {
      this.page.navigateToConversation(normalized);
    }

    if (typeof showAppToast === 'function') {
      showAppToast('Conversa pronta com ' + dmAtHandle(normalized) + '.');
    }
  }
};

var DMPage = {
  initialized: false,
  view: null,
  conversationSearch: null,
  conversationList: null,
  newConversationButton: null,
  threadBackButton: null,
  threadAvatar: null,
  threadTitle: null,
  threadSubtitle: null,
  threadNewButton: null,
  threadEmpty: null,
  messageStream: null,
  composerWrap: null,
  unsubscribeStore: null,

  init: function () {
    if (this.initialized) {
      return;
    }

    this.ensureViewShell();
    this.cacheElements();

    if (!this.view) {
      return;
    }

    this.bindEvents();

    DMStore.init();
    DMComposer.init(this);
    NewDMModal.init(this);

    var self = this;
    this.unsubscribeStore = DMStore.subscribe(function () {
      self.onStoreUpdate();
    });

    this.initialized = true;

    this.injectProfileMessageButton();
    this.render();
  },

  ensureViewShell: function () {
    var appContainer = document.getElementById('app-view-container');

    if (!appContainer) {
      return;
    }

    this.view = document.getElementById('view-mensagens');

    if (this.view) {
      return;
    }

    this.view = document.createElement('section');
    this.view.id = 'view-mensagens';
    this.view.className = 'app-view dm-view';
    this.view.setAttribute('data-view', 'mensagens');
    this.view.setAttribute('aria-label', 'Mensagens diretas');
    this.view.innerHTML = [
      '<div class="view-shell dm-shell">',
        '<header class="view-head dm-view-head">',
          '<h2 class="view-title">Mensagens</h2>',
          '<p class="view-subtitle">Converse em privado com sua rede, sem sair da Chrono.</p>',
        '</header>',
        '<div class="dm-layout">',
          '<aside class="dm-sidebar" aria-label="Lista de conversas">',
            '<div class="dm-sidebar-head">',
              '<label class="sr-only" for="dmConversationSearch">Buscar conversa</label>',
              '<input id="dmConversationSearch" class="dm-search-input" type="search" autocomplete="off" placeholder="Buscar por @usuario">',
              '<button id="dmNewConversationButton" class="btn-primary dm-new-conversation" type="button">Nova mensagem</button>',
            '</div>',
            '<ul id="dmConversationList" class="dm-conversation-list" aria-label="Conversas"></ul>',
          '</aside>',
          '<section id="dmThreadPanel" class="dm-thread-panel" aria-label="Conversa ativa">',
            '<header class="dm-thread-head">',
              '<button id="dmThreadBackButton" class="dm-thread-back" type="button" aria-label="Voltar para conversas">',
                '<i data-lucide="chevron-left"></i>',
              '</button>',
              '<img id="dmThreadAvatar" class="dm-thread-avatar" src="' + dmAvatarFor('chrono', 72) + '" alt="Avatar conversa">',
              '<div class="dm-thread-meta">',
                '<button id="dmThreadTitle" class="dm-thread-title" type="button">Selecione uma conversa</button>',
                '<span id="dmThreadSubtitle" class="dm-thread-subtitle">Sem conversa ativa.</span>',
              '</div>',
              '<button id="dmThreadNewButton" class="btn-subtle dm-thread-new" type="button">Nova conversa</button>',
            '</header>',
            '<div id="dmThreadEmptyState" class="dm-thread-empty">',
              '<p>Abra uma conversa existente ou inicie uma nova mensagem.</p>',
              '<p>Voce tambem pode usar a rota #mensagens/usuario para abrir direto.</p>',
            '</div>',
            '<div id="dmMessageStream" class="dm-message-stream" role="log" aria-live="polite"></div>',
            '<footer id="dmComposerWrap" class="dm-composer-wrap">',
              '<label class="sr-only" for="dmComposerInput">Digite uma mensagem</label>',
              '<textarea id="dmComposerInput" class="dm-composer-input" rows="1" maxlength="1000" placeholder="Digite sua mensagem"></textarea>',
              '<div class="dm-composer-footer">',
                '<span id="dmComposerCounter" class="dm-composer-counter">0/1000</span>',
                '<button id="dmSendButton" class="btn-primary" type="button" disabled>Enviar</button>',
              '</div>',
            '</footer>',
          '</section>',
        '</div>',
      '</div>'
    ].join('');

    var signedOutView = document.getElementById('view-signed-out');

    if (signedOutView) {
      appContainer.insertBefore(this.view, signedOutView);
    } else {
      appContainer.appendChild(this.view);
    }

    safeIconRefresh();
  },

  cacheElements: function () {
    this.view = document.getElementById('view-mensagens');
    this.conversationSearch = document.getElementById('dmConversationSearch');
    this.conversationList = document.getElementById('dmConversationList');
    this.newConversationButton = document.getElementById('dmNewConversationButton');
    this.threadBackButton = document.getElementById('dmThreadBackButton');
    this.threadAvatar = document.getElementById('dmThreadAvatar');
    this.threadTitle = document.getElementById('dmThreadTitle');
    this.threadSubtitle = document.getElementById('dmThreadSubtitle');
    this.threadNewButton = document.getElementById('dmThreadNewButton');
    this.threadEmpty = document.getElementById('dmThreadEmptyState');
    this.messageStream = document.getElementById('dmMessageStream');
    this.composerWrap = document.getElementById('dmComposerWrap');
  },

  bindEvents: function () {
    var self = this;

    if (this.conversationSearch) {
      this.conversationSearch.addEventListener('input', function () {
        DMStore.setSearchQuery(self.conversationSearch.value);
      });
    }

    if (this.conversationList) {
      this.conversationList.addEventListener('click', function (event) {
        var target = event.target.closest('[data-dm-handle]');

        if (!target) {
          return;
        }

        self.navigateToConversation(target.getAttribute('data-dm-handle'));
      });

      this.conversationList.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }

        var target = event.target.closest('[data-dm-handle]');

        if (!target) {
          return;
        }

        event.preventDefault();
        self.navigateToConversation(target.getAttribute('data-dm-handle'));
      });
    }

    if (this.newConversationButton) {
      this.newConversationButton.addEventListener('click', function () {
        NewDMModal.open();
      });
    }

    if (this.threadNewButton) {
      this.threadNewButton.addEventListener('click', function () {
        NewDMModal.open();
      });
    }

    if (this.threadBackButton) {
      this.threadBackButton.addEventListener('click', function () {
        self.navigateToInbox();
      });
    }

    if (this.threadTitle) {
      this.threadTitle.addEventListener('click', function () {
        var active = DMStore.getActiveConversation();

        if (!active) {
          return;
        }

        if (typeof openProfileRouteFromHandle === 'function') {
          openProfileRouteFromHandle(active.handle);
        }
      });
    }

    if (this.messageStream) {
      this.messageStream.addEventListener('click', function (event) {
        var reactionButton = event.target.closest('[data-dm-reaction]');

        if (!reactionButton) {
          return;
        }

        DMReactions.toggle(
          reactionButton.getAttribute('data-dm-handle'),
          reactionButton.getAttribute('data-dm-message-id'),
          reactionButton.getAttribute('data-dm-reaction')
        );
      });
    }
  },

  parseRoute: function (routeValue) {
    var route = String(routeValue || '').replace(/^#/, '').replace(/^\/+/, '').trim();
    var normalized = route.toLowerCase();

    if (normalized === 'mensagens') {
      return { handle: '' };
    }

    if (normalized.indexOf('mensagens/') !== 0) {
      return { handle: '' };
    }

    var handleSegment = route.slice('mensagens/'.length);

    try {
      handleSegment = decodeURIComponent(handleSegment);
    } catch (error) {
      handleSegment = String(handleSegment || '');
    }

    return { handle: dmNormalizeHandle(handleSegment) };
  },

  handleRoute: function (routeValue) {
    if (!this.initialized) {
      this.init();
    }

    var parsed = this.parseRoute(routeValue);

    if (!parsed.handle) {
      DMStore.setActiveConversation('', { keepUnread: true });
      this.render();
      return;
    }

    DMStore.ensureConversation(parsed.handle);
    DMStore.setActiveConversation(parsed.handle);
    this.render();
  },

  navigateToInbox: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('mensagens');
      return;
    }

    this.handleRoute('mensagens');
  },

  navigateToConversation: function (handleValue) {
    var normalized = dmNormalizeHandle(handleValue);

    if (!normalized) {
      return;
    }

    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('mensagens/' + normalized);
      return;
    }

    this.handleRoute('mensagens/' + normalized);
  },

  clipPreview: function (textValue, maxLength) {
    var text = String(textValue || '').replace(/\s+/g, ' ').trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength - 1) + '...';
  },

  renderConversationList: function () {
    if (!this.conversationList) {
      return;
    }

    var searchQuery = DMStore.getSearchQuery();
    var conversations = DMStore.searchConversations(searchQuery);
    var active = DMStore.getActiveConversation();
    var activeKey = active ? active.username : '';

    if (!conversations.length) {
      this.conversationList.innerHTML = '<li class="dm-conversation-empty">Nenhuma conversa encontrada.</li>';
      return;
    }

    this.conversationList.innerHTML = conversations.map(function (conversation) {
      var safeKey = dmEscapeHtml(conversation.username);
      var lastMessage = conversation.messages.length
        ? conversation.messages[conversation.messages.length - 1]
        : null;
      var subtitle = lastMessage ? DMPage.clipPreview(lastMessage.text, 58) : 'Conversa iniciada.';
      var statusLine = conversation.online ? 'online agora' : dmFormatRelative(conversation.updatedAt);
      var unreadHtml = conversation.unread > 0
        ? '<span class="dm-conversation-unread">' + conversation.unread + '</span>'
        : '';

      return [
        '<li>',
          '<button type="button" class="dm-conversation-item' + (activeKey === conversation.username ? ' is-active' : '') + '" data-dm-handle="' + safeKey + '">',
            '<img class="dm-conversation-avatar" src="' + dmEscapeHtml(conversation.avatar) + '" alt="Avatar ' + dmEscapeHtml(conversation.handle) + '">',
            '<span class="dm-conversation-main">',
              '<span class="dm-conversation-top">',
                '<strong>' + dmEscapeHtml(conversation.handle) + '</strong>',
                '<span>' + dmEscapeHtml(statusLine) + '</span>',
              '</span>',
              '<span class="dm-conversation-preview">' + dmEscapeHtml(subtitle) + '</span>',
            '</span>',
            unreadHtml,
          '</button>',
        '</li>'
      ].join('');
    }).join('');
  },

  renderMessageItem: function (conversation, message) {
    var own = dmNormalizeHandle(message.author) === DMStore.getOwnHandle();
    var safeText = dmEscapeHtml(message.text).replace(/\n/g, '<br>');

    return [
      '<article class="dm-message-item' + (own ? ' is-own' : '') + '" data-dm-message-id="' + dmEscapeHtml(message.id) + '">',
        '<div class="dm-message-bubble">',
          '<p class="dm-message-text">' + safeText + '</p>',
          '<time class="dm-message-time">' + dmEscapeHtml(dmFormatClock(message.createdAt)) + '</time>',
        '</div>',
        '<div class="dm-message-reactions">',
          DMReactions.renderButtons(conversation.username, message),
        '</div>',
      '</article>'
    ].join('');
  },

  renderThreadPanel: function () {
    var conversation = DMStore.getActiveConversation();

    if (!conversation) {
      if (this.threadAvatar) {
        this.threadAvatar.src = dmAvatarFor('chrono', 72);
        this.threadAvatar.alt = 'Avatar conversa';
      }

      if (this.threadTitle) {
        this.threadTitle.textContent = 'Selecione uma conversa';
      }

      if (this.threadSubtitle) {
        this.threadSubtitle.textContent = 'Use #mensagens/usuario para abrir direto.';
      }

      if (this.threadEmpty) {
        this.threadEmpty.classList.remove('is-hidden');
      }

      if (this.messageStream) {
        this.messageStream.innerHTML = '';
        this.messageStream.classList.add('is-hidden');
      }

      if (this.composerWrap) {
        this.composerWrap.classList.add('is-disabled');
      }

      DMComposer.setDisabled(true);
      return;
    }

    if (this.threadAvatar) {
      this.threadAvatar.src = conversation.avatar;
      this.threadAvatar.alt = 'Avatar ' + conversation.handle;
    }

    if (this.threadTitle) {
      this.threadTitle.textContent = conversation.handle;
    }

    if (this.threadSubtitle) {
      this.threadSubtitle.textContent = conversation.online
        ? 'online agora'
        : 'ultima atividade ' + dmFormatRelative(conversation.updatedAt);
    }

    if (this.threadEmpty) {
      this.threadEmpty.classList.add('is-hidden');
    }

    if (this.messageStream) {
      this.messageStream.classList.remove('is-hidden');
      this.messageStream.innerHTML = conversation.messages.map(function (message) {
        return DMPage.renderMessageItem(conversation, message);
      }).join('');
    }

    if (this.composerWrap) {
      this.composerWrap.classList.remove('is-disabled');
    }

    DMComposer.setDisabled(false);
    DMStore.markConversationRead(conversation.username, true);
    DMStore.syncHeaderBadge(false);

    if (DMComposer.textarea) {
      DMComposer.textarea.placeholder = 'Mensagem para ' + conversation.handle;
    }

    this.scrollThreadToBottom();
  },

  scrollThreadToBottom: function () {
    if (!this.messageStream || this.messageStream.classList.contains('is-hidden')) {
      return;
    }

    this.messageStream.scrollTop = this.messageStream.scrollHeight;
  },

  syncMobileState: function () {
    var onMessagesView = (typeof AppRouter !== 'undefined' && AppRouter && AppRouter.currentView === 'mensagens');
    var activeConversation = DMStore.getActiveConversation();

    document.body.classList.toggle('dm-thread-open', !!(onMessagesView && activeConversation));
  },

  getProfileTargetHandle: function () {
    var candidate = '';

    if (typeof window !== 'undefined' && window.__chronoLastProfileHandle) {
      candidate = window.__chronoLastProfileHandle;
    }

    if (!candidate && typeof AppState !== 'undefined' && AppState && AppState.lastProfileHandle) {
      candidate = AppState.lastProfileHandle;
    }

    if (!candidate && typeof profileHandleEl !== 'undefined' && profileHandleEl && profileHandleEl.textContent) {
      candidate = profileHandleEl.textContent;
    }

    if (!candidate && typeof getProfileHandleValue === 'function') {
      candidate = getProfileHandleValue();
    }

    var normalized = dmNormalizeHandle(candidate);
    var own = DMStore.getOwnHandle();

    if (normalized && normalized !== own) {
      return normalized;
    }

    if (typeof AppState !== 'undefined' && AppState && Array.isArray(AppState.following) && AppState.following.length) {
      var following = dmNormalizeHandle(AppState.following[0]);
      if (following) {
        return following;
      }
    }

    return normalized || own;
  },

  injectProfileMessageButton: function () {
    var actionsWrap = document.querySelector('.profile-side-actions');

    if (!actionsWrap) {
      return;
    }

    var existing = document.getElementById('profileMessageCta');

    if (!existing) {
      existing = document.createElement('button');
      existing.id = 'profileMessageCta';
      existing.type = 'button';
      existing.className = 'profile-edit-cta profile-message-cta';
      existing.textContent = 'Mensagem';

      if (typeof profileBackToFeedCta !== 'undefined' && profileBackToFeedCta && profileBackToFeedCta.parentNode === actionsWrap) {
        actionsWrap.insertBefore(existing, profileBackToFeedCta);
      } else {
        actionsWrap.appendChild(existing);
      }

      existing.addEventListener('click', this.handleProfileMessageClick.bind(this));
    }
  },

  handleProfileMessageClick: function () {
    var targetHandle = this.getProfileTargetHandle();

    if (!targetHandle) {
      return;
    }

    this.navigateToConversation(targetHandle);
  },

  render: function () {
    if (!this.initialized) {
      return;
    }

    this.injectProfileMessageButton();

    if (this.conversationSearch) {
      var currentQuery = DMStore.getSearchQuery();
      if (this.conversationSearch.value !== currentQuery) {
        this.conversationSearch.value = currentQuery;
      }
    }

    this.renderConversationList();
    this.renderThreadPanel();
    this.syncMobileState();
    safeIconRefresh();
  },

  onStoreUpdate: function () {
    this.render();
  }
};
