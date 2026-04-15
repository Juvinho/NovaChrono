'use strict';

if (typeof ComposerController === 'undefined') {
  var ComposerController = {
    init: function () {},
    getState: function () {
      return { text: '', image: null, poll: null };
    },
    reset: function () {}
  };
}

(function () {
  var MIN_OPTIONS = 2;
  var MAX_OPTIONS = 4;
  var OPTION_MAX_LENGTH = 80;

  var pollDraft = null;
  var pollBuilderOpen = false;

  var originalInit = typeof ComposerController.init === 'function' ? ComposerController.init : function () {};
  var originalGetState = typeof ComposerController.getState === 'function'
    ? ComposerController.getState
    : function () {
      return {
        text: (composer && composer.value ? composer.value.trim() : ''),
        image: null,
        poll: null
      };
    };
  var originalReset = typeof ComposerController.reset === 'function' ? ComposerController.reset : function () {};

  function getPollHost() {
    return document.getElementById('composerPollBuilder');
  }

  function getPollButton() {
    return document.getElementById('composerPollBtn');
  }

  function getPublishButton() {
    return document.getElementById('publishBtn');
  }

  function currentDateKey() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function isTodaySelected() {
    if (typeof state === 'undefined' || !state || !state.selectedDate) {
      return true;
    }

    var selected = String(state.selectedDate || '').trim();
    if (!selected) {
      return true;
    }

    return selected === currentDateKey();
  }

  function defaultPollDraft() {
    return {
      options: ['', ''],
      duration: 86400,
      durationLabel: '1 dia',
      error: ''
    };
  }

  function trimOption(value) {
    return String(value || '').trim().slice(0, OPTION_MAX_LENGTH);
  }

  function setDraftError(message) {
    if (!pollDraft) {
      return;
    }

    pollDraft.error = String(message || '');
  }

  function clearDraftError() {
    setDraftError('');
  }

  function ensureDurationPolicy() {
    if (!pollDraft) {
      return;
    }

    if (!isTodaySelected() && Number(pollDraft.duration) === 3600) {
      pollDraft.duration = 86400;
      pollDraft.durationLabel = '1 dia';
    }
  }

  function setPollButtonActive(active) {
    var button = getPollButton();
    if (!button) {
      return;
    }

    button.classList.toggle('active', !!active);
  }

  function getFilledOptions() {
    if (!pollDraft || !Array.isArray(pollDraft.options)) {
      return [];
    }

    return pollDraft.options
      .map(trimOption)
      .filter(function (value) {
        return value.length > 0;
      });
  }

  function markInvalidOptions(indexes) {
    var host = getPollHost();
    if (!host || !Array.isArray(indexes) || !indexes.length) {
      return;
    }

    indexes.forEach(function (idx) {
      var input = host.querySelector('.poll-option-input[data-index="' + idx + '"]');
      if (!input) {
        return;
      }

      input.classList.remove('poll-shake', 'is-error');
      void input.offsetWidth;
      input.classList.add('poll-shake', 'is-error');
    });
  }

  function validatePollDraft() {
    if (!pollDraft) {
      return true;
    }

    var normalized = (pollDraft.options || []).map(trimOption);
    var filledIndexes = [];
    normalized.forEach(function (value, index) {
      if (value) {
        filledIndexes.push(index);
      }
    });

    if (filledIndexes.length < MIN_OPTIONS) {
      setDraftError('Preencha pelo menos 2 opcoes para publicar a enquete.');
      markInvalidOptions([0, 1]);
      renderPollBuilder();
      return false;
    }

    var seen = {};
    var duplicated = [];
    filledIndexes.forEach(function (index) {
      var key = normalized[index].toLowerCase();
      if (seen[key] !== undefined) {
        duplicated.push(index);
        duplicated.push(seen[key]);
      } else {
        seen[key] = index;
      }
    });

    if (duplicated.length) {
      var uniqueDuplicated = Array.from(new Set(duplicated));
      setDraftError('As opcoes da enquete devem ser unicas.');
      markInvalidOptions(uniqueDuplicated);
      renderPollBuilder();
      return false;
    }

    clearDraftError();
    return true;
  }

  function buildPollPayload() {
    if (!pollDraft) {
      return null;
    }

    ensureDurationPolicy();

    var options = getFilledOptions();
    if (options.length < MIN_OPTIONS) {
      return null;
    }

    var duration = Number(pollDraft.duration) || 86400;
    var durationLabel = String(pollDraft.durationLabel || (typeof PollSystem !== 'undefined' && PollSystem && typeof PollSystem.durationLabelFromSeconds === 'function'
      ? PollSystem.durationLabelFromSeconds(duration)
      : '1 dia'));

    return {
      options: options.map(function (optionText, index) {
        return {
          id: 'opt_' + index,
          text: optionText,
          votes: 0
        };
      }),
      totalVotes: 0,
      duration: duration,
      durationLabel: durationLabel,
      expiresAt: Date.now() + (duration * 1000),
      userVote: null,
      closed: false
    };
  }

  function syncPollOptionValue(index, value) {
    if (!pollDraft || !Array.isArray(pollDraft.options)) {
      return;
    }

    pollDraft.options[index] = String(value || '').slice(0, OPTION_MAX_LENGTH);
  }

  function removeBuilderDom() {
    var host = getPollHost();
    if (host) {
      host.innerHTML = '';
    }
  }

  function closePollBuilder(discard) {
    pollBuilderOpen = false;
    setPollButtonActive(false);

    if (discard) {
      pollDraft = null;
    }

    removeBuilderDom();
    updatePublishState();
  }

  function openPollBuilder() {
    pollBuilderOpen = true;
    setPollButtonActive(true);

    if (!pollDraft) {
      pollDraft = defaultPollDraft();
    }

    ensureDurationPolicy();
    renderPollBuilder();
    updatePublishState();
  }

  function togglePollBuilder(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    if (pollBuilderOpen) {
      closePollBuilder(true);
      return;
    }

    openPollBuilder();
  }

  function renderOptionRow(value, index) {
    var safeValue = escapeHtml(String(value || '').slice(0, OPTION_MAX_LENGTH));
    var count = String(String(value || '').length);

    return (
      '<div class="poll-option-row">' +
        '<input type="text" placeholder="Opcao ' + (index + 1) + '" maxlength="80" class="poll-option-input" data-index="' + index + '" value="' + safeValue + '">' +
        '<span class="poll-option-charcount" data-charcount-index="' + index + '">' + count + '/80</span>' +
      '</div>'
    );
  }

  function renderPollBuilder() {
    var host = getPollHost();
    if (!host || !pollBuilderOpen || !pollDraft) {
      return;
    }

    ensureDurationPolicy();

    var optionsHtml = (pollDraft.options || []).map(function (value, index) {
      return renderOptionRow(value, index);
    }).join('');

    var canAddOption = (pollDraft.options || []).length < MAX_OPTIONS;
    var allowHour = isTodaySelected();

    host.innerHTML = (
      '<div class="poll-builder" id="poll-builder">' +
        '<div class="poll-builder-header">' +
          '<span>📊 Criar enquete</span>' +
          '<button class="poll-builder-close" type="button" aria-label="Fechar">×</button>' +
        '</div>' +
        '<div class="poll-options-list">' + optionsHtml + '</div>' +
        '<button class="poll-add-option" id="poll-add-option" type="button"' + (canAddOption ? '' : ' hidden') + '>+ Adicionar opcao</button>' +
        '<div class="poll-duration-selector">' +
          '<span class="poll-duration-label">Duracao:</span>' +
          '<div class="poll-duration-options">' +
            '<button class="poll-duration-btn' + (pollDraft.duration === 3600 ? ' active' : '') + '" type="button" data-duration="3600" data-label="1 hora"' + (allowHour ? '' : ' disabled') + '>1 hora</button>' +
            '<button class="poll-duration-btn' + (pollDraft.duration === 86400 ? ' active' : '') + '" type="button" data-duration="86400" data-label="1 dia">1 dia</button>' +
            '<button class="poll-duration-btn' + (pollDraft.duration === 604800 ? ' active' : '') + '" type="button" data-duration="604800" data-label="1 semana">1 semana</button>' +
          '</div>' +
        '</div>' +
        '<p class="poll-builder-error" data-poll-builder-error="true">' + escapeHtml(pollDraft.error || '') + '</p>' +
      '</div>'
    );

    var closeBtn = host.querySelector('.poll-builder-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closePollBuilder(true);
      });
    }

    Array.prototype.slice.call(host.querySelectorAll('.poll-option-input')).forEach(function (input) {
      input.addEventListener('input', function (event) {
        var index = Number(event.target.getAttribute('data-index'));
        syncPollOptionValue(index, event.target.value);
        clearDraftError();

        var count = host.querySelector('[data-charcount-index="' + index + '"]');
        if (count) {
          count.textContent = String(event.target.value.length) + '/80';
        }

        updatePublishState();
      });
    });

    var addOptionBtn = host.querySelector('#poll-add-option');
    if (addOptionBtn) {
      addOptionBtn.addEventListener('click', function () {
        if (!pollDraft || !Array.isArray(pollDraft.options) || pollDraft.options.length >= MAX_OPTIONS) {
          return;
        }

        pollDraft.options.push('');
        clearDraftError();
        renderPollBuilder();
        updatePublishState();
      });
    }

    Array.prototype.slice.call(host.querySelectorAll('.poll-duration-btn')).forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();

        if (button.hasAttribute('disabled') || !pollDraft) {
          return;
        }

        pollDraft.duration = Number(button.getAttribute('data-duration')) || 86400;
        pollDraft.durationLabel = String(button.getAttribute('data-label') || '1 dia');
        clearDraftError();
        renderPollBuilder();
      });
    });
  }

  function patchComposerController() {
    ComposerController.init = function () {
      originalInit();

      var pollButton = getPollButton();
      if (pollButton && pollButton.getAttribute('data-poll-builder-patched') !== 'true') {
        pollButton.setAttribute('data-poll-builder-patched', 'true');
        pollButton.addEventListener('click', togglePollBuilder, true);
      }
    };

    ComposerController.getState = function () {
      var base = originalGetState() || {};
      return {
        text: String(base.text || '').trim(),
        image: base.image || null,
        poll: buildPollPayload()
      };
    };

    ComposerController.reset = function () {
      originalReset();
      pollDraft = null;
      pollBuilderOpen = false;
      setPollButtonActive(false);
      removeBuilderDom();
      clearDraftError();
    };
  }

  var originalUpdatePublishState = typeof updatePublishState === 'function'
    ? updatePublishState
    : function () {};

  updatePublishState = function () {
    var publishButton = getPublishButton();
    if (!publishButton) {
      originalUpdatePublishState();
      return;
    }

    var base = originalGetState() || {};
    var text = String(base.text || '').trim();
    var hasText = text.length > 0;
    var hasImage = !!base.image;
    var hasPoll = getFilledOptions().length >= MIN_OPTIONS;

    publishButton.disabled = !(hasText || hasImage || hasPoll);
  };

  addNewPost = function () {
    var base = originalGetState() || {};
    var text = String(base.text || '').trim();
    var image = base.image || null;
    var pollPayload = null;

    if (pollDraft) {
      if (!validatePollDraft()) {
        return;
      }
      pollPayload = buildPollPayload();
    }

    if (!text && !image && !pollPayload) {
      return;
    }

    var postId = typeof generateId === 'function' ? generateId('post') : ('post-' + Date.now());
    var userHandle = typeof getProfileHandleValue === 'function' ? getProfileHandleValue() : '@Juvinho';
    var avatar = (typeof AppState !== 'undefined' && AppState && AppState.profile && AppState.profile.avatar)
      ? AppState.profile.avatar
      : 'https://picsum.photos/seed/new-juvinho/80/80';

    var newPost = {
      id: postId,
      user: userHandle,
      avatar: avatar,
      time: 'agora',
      text: text,
      image: image || undefined,
      verified: true,
      source: 'composer',
      metrics: { comments: 0, reposts: 0, likes: 0 },
      state: { repost: false, like: false, bookmark: false },
      createdAt: Date.now(),
      poll: pollPayload
    };

    var savedPost = null;

    if (typeof FeedStore !== 'undefined' && FeedStore && typeof FeedStore.addPost === 'function') {
      savedPost = FeedStore.addPost(newPost);
    } else {
      if (typeof applyPostMetadata === 'function') {
        applyPostMetadata(newPost, 'composer');
      }
      if (Array.isArray(postStore)) {
        postStore.unshift(newPost);
      }
      savedPost = newPost;
    }

    var newCard = typeof createPostCardElement === 'function'
      ? createPostCardElement(savedPost, 0, { newPostId: savedPost.id, source: 'composer' })
      : null;

    if (newCard && feedList) {
      feedList.prepend(newCard);
      if (typeof safeIconRefresh === 'function') {
        safeIconRefresh();
      }

      document.dispatchEvent(new CustomEvent('chrono:post-created', {
        detail: { postEl: newCard }
      }));
    }

    if (typeof ComposerController.reset === 'function') {
      ComposerController.reset();
    }

    if (composer) {
      composer.style.height = '54px';
    }

    updatePublishState();

    var feedStart = document.querySelector('.feed-column');
    if (feedStart) {
      feedStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  patchComposerController();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (pollBuilderOpen) {
        renderPollBuilder();
      }
    });
  }
})();