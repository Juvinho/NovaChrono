'use strict';

var PollSystem = (function () {
  var countdownIntervalId = 0;
  var expirationIntervalId = 0;
  var eventsBound = false;
  var started = false;

  function escapePollText(value) {
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

  function voteLabel(totalVotes) {
    var safe = Math.max(0, Number(totalVotes) || 0);
    return safe + ' voto' + (safe === 1 ? '' : 's');
  }

  function durationLabelFromSeconds(seconds) {
    var safe = Number(seconds) || 86400;

    if (safe === 3600) {
      return '1 hora';
    }

    if (safe === 604800) {
      return '1 semana';
    }

    return '1 dia';
  }

  function normalizeDurationSeconds(seconds) {
    var safe = Number(seconds);

    if (safe === 3600 || safe === 86400 || safe === 604800) {
      return safe;
    }

    return 86400;
  }

  function normalizeOption(option, index) {
    var source = option || {};
    var text = '';

    if (typeof source.text === 'string') {
      text = source.text;
    } else if (typeof source.label === 'string') {
      text = source.label;
    }

    text = text.trim().slice(0, 80);

    return {
      id: String(source.id || ('opt_' + index)),
      text: text,
      votes: Math.max(0, Number(source.votes) || 0)
    };
  }

  function normalizePoll(rawPoll, createdAt) {
    if (!rawPoll || typeof rawPoll !== 'object') {
      return null;
    }

    var options = (Array.isArray(rawPoll.options) ? rawPoll.options : [])
      .map(normalizeOption)
      .filter(function (option) {
        return option.text.length > 0;
      });

    if (options.length < 2) {
      return null;
    }

    var duration = normalizeDurationSeconds(rawPoll.duration);
    var durationLabel = String(rawPoll.durationLabel || durationLabelFromSeconds(duration));
    var expiresAt = Number(rawPoll.expiresAt);

    if (!Number.isFinite(expiresAt)) {
      var base = Number(createdAt);
      if (!Number.isFinite(base)) {
        base = Date.now();
      }
      expiresAt = base + (duration * 1000);
    }

    var totalVotes = Number(rawPoll.totalVotes);
    if (!Number.isFinite(totalVotes) || totalVotes < 0) {
      totalVotes = options.reduce(function (sum, option) {
        return sum + option.votes;
      }, 0);
    }

    var userVote = rawPoll.userVote === null ? null : String(rawPoll.userVote || '');
    if (userVote && !options.some(function (option) { return option.id === userVote; })) {
      userVote = null;
    }

    var closed = !!rawPoll.closed || Date.now() >= expiresAt;

    return {
      options: options,
      totalVotes: totalVotes,
      duration: duration,
      durationLabel: durationLabel,
      expiresAt: expiresAt,
      userVote: userVote,
      closed: closed
    };
  }

  function ensurePostPoll(post) {
    if (!post || !post.poll) {
      return null;
    }

    post.poll = normalizePoll(post.poll, post.createdAt);
    return post.poll;
  }

  function findPost(postId) {
    if (!postId) {
      return null;
    }

    if (typeof getPostById === 'function') {
      return getPostById(postId);
    }

    if (!Array.isArray(postStore)) {
      return null;
    }

    return postStore.find(function (post) {
      return post.id === postId;
    }) || null;
  }

  function isExpired(poll) {
    return !!poll && Number(poll.expiresAt) <= Date.now();
  }

  function syncClosedState(poll) {
    if (!poll) {
      return true;
    }

    if (isExpired(poll)) {
      poll.closed = true;
    }

    return !!poll.closed;
  }

  function pollPercent(votes, totalVotes) {
    var votesSafe = Math.max(0, Number(votes) || 0);
    var totalSafe = Math.max(0, Number(totalVotes) || 0);

    if (!totalSafe) {
      return 0;
    }

    return Math.round((votesSafe / totalSafe) * 100);
  }

  function getRemainingText(poll) {
    if (syncClosedState(poll)) {
      return 'Enquete encerrada';
    }

    var msRemaining = Math.max(0, Number(poll.expiresAt) - Date.now());
    var minute = 60 * 1000;
    var hour = 60 * minute;
    var day = 24 * hour;

    if (msRemaining > day) {
      var days = Math.ceil(msRemaining / day);
      return 'Encerra em ' + days + ' dia' + (days > 1 ? 's' : '');
    }

    if (msRemaining > hour) {
      var hours = Math.floor(msRemaining / hour);
      var minutes = Math.floor((msRemaining % hour) / minute);
      return 'Encerra em ' + hours + 'h ' + minutes + 'min';
    }

    if (msRemaining > minute) {
      var mins = Math.floor(msRemaining / minute);
      return 'Encerra em ' + mins + ' min';
    }

    if (msRemaining > 0) {
      return 'Encerrando em breve...';
    }

    return 'Enquete encerrada';
  }

  function getMetaLine(poll) {
    var votesText = voteLabel(poll.totalVotes);

    if (syncClosedState(poll)) {
      return '🔒 Enquete encerrada · ' + votesText;
    }

    return '⏱ ' + getRemainingText(poll) + ' · ' + votesText;
  }

  function buildRankMap(options) {
    var rankMap = {};
    var ranked = (options || []).slice().sort(function (a, b) {
      return (Number(b.votes) || 0) - (Number(a.votes) || 0);
    });

    ranked.forEach(function (option, index) {
      rankMap[option.id] = index <= 1 ? index + 1 : 3;
    });

    return rankMap;
  }

  function renderOpenState(post, poll) {
    var optionsHtml = poll.options.map(function (option) {
      return (
        '<button class="poll-option-btn" type="button" data-option-id="' + escapePollText(option.id) + '">' +
          escapePollText(option.text) +
        '</button>'
      );
    }).join('');

    return (
      '<section class="poll-widget poll-widget-open" data-poll-widget="true" data-post-id="' + escapePollText(post.id) + '" data-poll-state="open">' +
        optionsHtml +
        '<div class="poll-meta"><span data-poll-meta-line="true">' + escapePollText(getMetaLine(poll)) + '</span></div>' +
      '</section>'
    );
  }

  function renderResultsState(post, poll) {
    var ranks = buildRankMap(poll.options);
    var isClosed = syncClosedState(poll);
    var totalVotes = Math.max(0, Number(poll.totalVotes) || 0);

    var rows = poll.options.map(function (option) {
      var pct = pollPercent(option.votes, totalVotes);
      var rankClass = 'rank-' + (ranks[option.id] || 3);
      var userVoted = poll.userVote === option.id;

      return (
        '<div class="poll-result-item" data-option-id="' + escapePollText(option.id) + '">' +
          '<div class="poll-result-header">' +
            '<span class="poll-result-label' + (userVoted ? ' user-voted' : '') + '">' + escapePollText(option.text) + '</span>' +
            '<span class="poll-result-percent">' + pct + '%</span>' +
          '</div>' +
          '<div class="poll-bar-track">' +
            '<span class="poll-bar-fill ' + rankClass + (userVoted ? ' user-voted' : '') + (isClosed ? ' poll-closed' : '') + '" data-target-width="' + pct + '" style="width:0%"></span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<section class="poll-widget poll-widget-results' + (isClosed ? ' is-closed' : '') + '" data-poll-widget="true" data-post-id="' + escapePollText(post.id) + '" data-poll-state="results">' +
        rows +
        '<div class="poll-meta' + (isClosed ? ' closed' : '') + '"><span data-poll-meta-line="true">' + escapePollText(getMetaLine(poll)) + '</span></div>' +
      '</section>'
    );
  }

  function renderWidget(post) {
    if (!post || !post.poll) {
      return '';
    }

    var poll = ensurePostPoll(post);
    if (!poll) {
      return '';
    }

    var shouldShowResults = syncClosedState(poll) || poll.userVote !== null;
    return shouldShowResults ? renderResultsState(post, poll) : renderOpenState(post, poll);
  }

  function applyResultAnimation(widget, animate) {
    if (!widget) {
      return;
    }

    var fills = Array.prototype.slice.call(widget.querySelectorAll('.poll-bar-fill'));
    if (!fills.length) {
      return;
    }

    fills.forEach(function (fill) {
      fill.style.width = '0%';
    });

    fills.forEach(function (fill, index) {
      var target = Number(fill.getAttribute('data-target-width')) || 0;

      if (!animate) {
        fill.style.width = target + '%';
        return;
      }

      setTimeout(function () {
        fill.style.width = target + '%';
      }, index * 60);
    });
  }

  function applyVoteConfirmation(widget, optionId) {
    if (!widget || !optionId) {
      return;
    }

    var row = widget.querySelector('.poll-result-item[data-option-id="' + optionId + '"] .poll-result-label');
    if (!row) {
      return;
    }

    row.classList.remove('vote-confirmed');
    void row.offsetWidth;
    row.classList.add('vote-confirmed');
  }

  function mountWidgetInCard(card, post, options) {
    if (!card || !post || !post.poll) {
      return;
    }

    var pollHtml = renderWidget(post);
    if (!pollHtml) {
      return;
    }

    var current = card.querySelector('[data-poll-widget="true"]');
    if (current) {
      current.outerHTML = pollHtml;
    } else {
      var actions = card.querySelector('.post-actions');
      if (actions) {
        actions.insertAdjacentHTML('beforebegin', pollHtml);
      }
    }

    var mounted = card.querySelector('[data-poll-widget="true"]');
    if (!mounted) {
      return;
    }

    var state = mounted.getAttribute('data-poll-state');
    if (state === 'results') {
      applyResultAnimation(mounted, !!(options && options.animateResults));
      applyVoteConfirmation(mounted, options && options.confirmOptionId);
    }
  }

  function refreshWidget(postId, options) {
    var post = findPost(postId);
    if (!post || !post.poll) {
      return;
    }

    var poll = ensurePostPoll(post);
    if (!poll) {
      return;
    }

    syncClosedState(poll);

    var cards = Array.prototype.slice.call(
      document.querySelectorAll('.post-card[data-post-id="' + postId + '"]')
    );

    cards.forEach(function (card) {
      mountWidgetInCard(card, post, options || {});
    });
  }

  function refreshAllWidgets(options) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.post-card[data-post-id]'));
    var seen = {};

    cards.forEach(function (card) {
      var postId = card.getAttribute('data-post-id');
      if (!postId || seen[postId]) {
        return;
      }

      seen[postId] = true;
      refreshWidget(postId, options || {});
    });
  }

  function persistPoll(postId, poll) {
    if (!postId || !poll) {
      return;
    }

    if (typeof FeedStore !== 'undefined' && FeedStore && typeof FeedStore.upsertPoll === 'function') {
      FeedStore.upsertPoll(postId, poll);
      return;
    }

    var post = findPost(postId);
    if (post) {
      post.poll = poll;
    }
  }

  function vote(postId, optionId) {
    var post = findPost(postId);
    if (!post || !post.poll) {
      return false;
    }

    var poll = ensurePostPoll(post);
    if (!poll) {
      return false;
    }

    if (syncClosedState(poll)) {
      persistPoll(postId, poll);
      refreshWidget(postId, { animateResults: false });
      return false;
    }

    if (poll.userVote !== null) {
      return false;
    }

    var option = poll.options.find(function (entry) {
      return entry.id === optionId;
    });

    if (!option) {
      return false;
    }

    option.votes += 1;
    poll.totalVotes += 1;
    poll.userVote = option.id;
    syncClosedState(poll);

    persistPoll(postId, poll);
    refreshWidget(postId, {
      animateResults: true,
      confirmOptionId: option.id
    });

    return true;
  }

  function checkExpired() {
    if (!Array.isArray(postStore)) {
      return;
    }

    var changed = [];

    postStore.forEach(function (post) {
      var poll = ensurePostPoll(post);
      if (!poll || poll.closed || !isExpired(poll)) {
        return;
      }

      poll.closed = true;
      persistPoll(post.id, poll);
      changed.push(post.id);
    });

    changed.forEach(function (postId) {
      refreshWidget(postId, { animateResults: false });
    });
  }

  function updateWidgetMeta(widget, poll) {
    if (!widget || !poll) {
      return;
    }

    var line = widget.querySelector('[data-poll-meta-line="true"]');
    if (line) {
      line.textContent = getMetaLine(poll);
    }
  }

  function tickCountdowns() {
    var widgets = Array.prototype.slice.call(document.querySelectorAll('[data-poll-widget="true"]'));

    widgets.forEach(function (widget) {
      var postId = widget.getAttribute('data-post-id');
      var post = findPost(postId);
      if (!post || !post.poll) {
        return;
      }

      var poll = ensurePostPoll(post);
      if (!poll) {
        return;
      }

      if (!poll.closed && isExpired(poll)) {
        poll.closed = true;
        persistPoll(postId, poll);
        refreshWidget(postId, { animateResults: false });
        return;
      }

      updateWidgetMeta(widget, poll);
    });
  }

  function bindEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    document.addEventListener('click', function (event) {
      var button = event.target.closest('.poll-option-btn');
      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      var card = button.closest('[data-post-id]');
      if (!card) {
        return;
      }

      vote(card.getAttribute('data-post-id'), button.getAttribute('data-option-id'));
    });

    document.addEventListener('chrono:post-created', function (event) {
      var postEl = event && event.detail ? event.detail.postEl : null;
      if (!postEl) {
        return;
      }

      var postId = postEl.getAttribute('data-post-id');
      if (postId) {
        refreshWidget(postId, { animateResults: false });
      }
    });
  }

  function init() {
    if (started) {
      return;
    }

    started = true;

    if (Array.isArray(postStore)) {
      postStore.forEach(function (post) {
        ensurePostPoll(post);
      });
    }

    bindEvents();

    clearInterval(countdownIntervalId);
    clearInterval(expirationIntervalId);

    countdownIntervalId = setInterval(tickCountdowns, 1000);
    expirationIntervalId = setInterval(checkExpired, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  return {
    init: init,
    vote: vote,
    renderWidget: renderWidget,
    refreshWidget: refreshWidget,
    refreshAllWidgets: refreshAllWidgets,
    checkExpired: checkExpired,
    normalizePoll: normalizePoll,
    durationLabelFromSeconds: durationLabelFromSeconds
  };
})();