'use strict';

function toDateKey(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function formatDateBr(date) {
  var normalizedDate = startOfDay(date);
  var day = String(normalizedDate.getDate()).padStart(2, '0');
  var month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
  var year = String(normalizedDate.getFullYear());
  return day + '/' + month + '/' + year;
}

function fromDateKey(key) {
  var parts = String(key || '').split('-');
  if (parts.length !== 3) {
    var fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }

  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function startOfDay(date) {
  var base = new Date(date);
  base.setHours(0, 0, 0, 0);
  return base;
}

function diffDays(fromDate, toDate) {
  var msPerDay = 24 * 60 * 60 * 1000;
  var from = startOfDay(fromDate).getTime();
  var to = startOfDay(toDate).getTime();
  return Math.round((from - to) / msPerDay);
}

function seededHash(seed) {
  var hash = 2166136261;
  var i;

  for (i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  var stateSeed = seededHash(seed);

  return function () {
    stateSeed = (stateSeed * 1664525 + 1013904223) >>> 0;
    return stateSeed / 4294967296;
  };
}

function formatLongDatePt(date) {
  var weekdays = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  var months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return weekdays[date.getDay()] + ', ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear();
}

function formatMonthYearShort(date) {
  if (typeof formatMonthPt === 'function') {
    return formatMonthPt(date) + ' ' + date.getFullYear();
  }

  var shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return shortMonths[date.getMonth()] + ' ' + date.getFullYear();
}

function formatMonthYearLong(date) {
  var months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
}

function nowHm() {
  var now = new Date();
  return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

function activityColor(count) {
  if (count <= 0) {
    return 'transparent';
  }
  if (count <= 2) {
    return 'rgba(124, 90, 240, 0.3)';
  }
  if (count <= 4) {
    return 'rgba(124, 90, 240, 0.6)';
  }
  if (count <= 6) {
    return 'rgba(124, 90, 240, 0.85)';
  }

  return 'linear-gradient(90deg, #7c5af0, #00c4cc)';
}

function activityWidth(count) {
  if (count <= 0) {
    return 0;
  }

  return Math.min(40, 8 + (count * 4));
}

function calendarHeat(count) {
  if (count <= 0) {
    return 'rgba(124, 90, 240, 0)';
  }
  if (count <= 2) {
    return 'rgba(124, 90, 240, 0.15)';
  }
  if (count <= 4) {
    return 'rgba(124, 90, 240, 0.30)';
  }
  if (count <= 6) {
    return 'rgba(124, 90, 240, 0.50)';
  }

  return 'rgba(124, 90, 240, 0.75)';
}

function safeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timelineSafeIconRefresh() {
  if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

var ChronoTimeline = {
  initialized: false,
  eventsBound: false,
  keyboardBound: false,
  today: new Date(),
  selectedDate: new Date(),
  rangeCenter: new Date(),
  daysData: [],
  dayMap: {},
  todayState: null,
  calendarViewDate: new Date(),
  newPostInterval: null,
  clockInterval: null,
  tooltipDelayTimer: null,
  tooltipAutoHideTimer: null,
  calendarCloseTimer: null,
  todayButtonTimer: null,
  newPostsPillTimer: null,
  pendingNewPosts: 0,
  currentClock: nowHm(),
  feedBannerHost: null,
  newPostsPillHost: null,
  suppressClickUntil: 0,
  drag: {
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0
  },

  init: function () {
    if (this.initialized) {
      return;
    }

    if (!this.buildShell()) {
      return;
    }

    this.initialized = true;
    this.syncDomRefs();
    this.ensureToastHost();
    this.ensureFeedHosts();

    this.today = startOfDay(new Date());
    this.selectedDate = new Date(this.today);
    this.rangeCenter = new Date(this.today);
    this.todayState = null;
    this.pendingNewPosts = 0;
    this.currentClock = nowHm();
    this.calendarViewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

    this.generateDaysData(this.rangeCenter);
    this.renderTimeline({ preserveScroll: false, animateBars: true });
    this.renderCalendarPopup();
    this.bindEvents();
    this.setupDrag();
    this.setupKeyboard();
    this.scrollToToday(false, false);
    this.startNewPostSimulation();
    this.startClock();
  },

  buildShell: function () {
    var timelineBarEl = document.querySelector('.timeline-bar');
    if (!timelineBarEl) {
      return false;
    }

    timelineBarEl.innerHTML = [
      '<div class="timeline-inner">',
      '  <div class="timeline-top-row">',
      '    <button id="timelineCalendarToggle" class="timeline-calendar-toggle" type="button" aria-label="Abrir calendario">',
      '      <i data-lucide="calendar-days"></i>',
      '      <span id="timelineMonthLabel">Abr 2026</span>',
      '    </button>',
      '    <button id="timelineTodayBtn" class="timeline-back-today is-hidden" type="button">Voltar para hoje</button>',
      '    <span class="timeline-range-indicator">&larr; 1 mes | 1 mes &rarr;</span>',
      '  </div>',
      '  <div class="timeline-main-row">',
      '    <span class="timeline-main-icon" aria-hidden="true"><i data-lucide="calendar"></i></span>',
      '    <div id="timelineScrollWrap" class="timeline-scroll-wrap">',
      '      <span class="timeline-edge left" aria-hidden="true"></span>',
      '      <span class="timeline-edge right" aria-hidden="true"></span>',
      '      <span class="timeline-edge-hint left" aria-hidden="true">&larr; mais dias</span>',
      '      <span class="timeline-edge-hint right" aria-hidden="true">mais dias &rarr;</span>',
      '      <div id="timelineScroll" class="timeline-scroll" role="listbox" aria-label="Selecao de dias"></div>',
      '    </div>',
      '  </div>',
      '  <div id="timelineCalendarPopup" class="timeline-calendar-popup is-hidden" aria-hidden="true">',
      '    <div class="calendar-popup-header">',
      '      <button id="calendarPrevMonth" class="calendar-nav-btn" type="button" aria-label="Mes anterior"><i data-lucide="chevron-left"></i></button>',
      '      <strong id="calendarTitle" class="calendar-month-title">Abril 2026</strong>',
      '      <button id="calendarNextMonth" class="calendar-nav-btn" type="button" aria-label="Proximo mes"><i data-lucide="chevron-right"></i></button>',
      '    </div>',
      '    <div class="calendar-weekdays" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>',
      '    <div id="calendarGrid" class="calendar-grid"></div>',
      '    <div class="calendar-popup-footer">Navegando: &larr; 30 dias | hoje | +30 dias &rarr;</div>',
      '  </div>',
      '  <div id="timelineTooltip" class="timeline-tooltip is-hidden"></div>',
      '</div>'
    ].join('');

    timelineSafeIconRefresh();
    return true;
  },

  syncDomRefs: function () {
    timelineScroll = document.getElementById('timelineScroll');
    timelineScrollWrap = document.getElementById('timelineScrollWrap');
    timelineTodayBtn = document.getElementById('timelineTodayBtn');
    timelineCalendarToggle = document.getElementById('timelineCalendarToggle');
    timelineCalendarPopup = document.getElementById('timelineCalendarPopup');
    timelineTooltip = document.getElementById('timelineTooltip');
    timelineMonthLabel = document.getElementById('timelineMonthLabel');
    calendarPrevMonth = document.getElementById('calendarPrevMonth');
    calendarNextMonth = document.getElementById('calendarNextMonth');
    calendarGrid = document.getElementById('calendarGrid');
    calendarTitle = document.getElementById('calendarTitle');
    calendarJumpInput = document.getElementById('calendarJumpInput');
    calendarJumpGo = document.getElementById('calendarJumpGo');
    calendarJumpToday = document.getElementById('calendarJumpToday');

    feedList = document.getElementById('feedList') || feedList;
    feedColumn = document.querySelector('.feed-column') || feedColumn;
    toastHost = document.getElementById('timelineToastHost') || toastHost;
  },

  ensureToastHost: function () {
    if (!toastHost) {
      toastHost = document.getElementById('timelineToastHost');
    }

    if (toastHost) {
      return;
    }

    var host = document.createElement('div');
    host.id = 'timelineToastHost';
    host.className = 'timeline-toast-host';
    host.setAttribute('aria-live', 'polite');

    var timelineBarEl = document.querySelector('.timeline-bar');
    if (timelineBarEl && timelineBarEl.parentNode) {
      timelineBarEl.parentNode.insertBefore(host, timelineBarEl.nextSibling);
    } else {
      document.body.appendChild(host);
    }

    toastHost = host;
  },

  ensureFeedHosts: function () {
    if (!feedList || !feedList.parentNode) {
      return;
    }

    if (!this.feedBannerHost) {
      this.feedBannerHost = document.createElement('div');
      this.feedBannerHost.id = 'feedDayBannerHost';
      feedList.parentNode.insertBefore(this.feedBannerHost, feedList);
    }

    if (!this.newPostsPillHost) {
      this.newPostsPillHost = document.createElement('div');
      this.newPostsPillHost.id = 'newPostsPillHost';
      feedList.parentNode.insertBefore(this.newPostsPillHost, feedList);
    }
  },

  getTodayKey: function () {
    return toDateKey(this.today);
  },

  getSelectedKey: function () {
    return toDateKey(this.selectedDate);
  },

  isTodaySelected: function () {
    return this.getSelectedKey() === this.getTodayKey();
  },

  createDayDataForDate: function (date, index) {
    var normalizedDate = startOfDay(date);
    var key = toDateKey(normalizedDate);
    var rng = seededRandom(key + '-chrono-timeline');
    var offsetFromToday = diffDays(normalizedDate, this.today);
    var isPast = offsetFromToday < 0;
    var isFuture = offsetFromToday > 0;
    var isToday = offsetFromToday === 0;
    var activityCount = 0;
    var avatars = [];
    var hasNewContent = false;
    var hasScheduled = false;
    var scheduledCount = 0;
    var hasNewBadge = false;
    var i;

    if (isPast) {
      activityCount = Math.floor(rng() * 9);
      hasNewContent = rng() < 0.3;

      var avatarCount = activityCount > 0 ? Math.floor(rng() * 4) : 0;
      for (i = 0; i < avatarCount; i += 1) {
        avatars.push('https://picsum.photos/seed/' + key + '-u' + i + '/22/22');
      }
    } else if (isToday) {
      if (!this.todayState) {
        var baseCount = Math.max(1, Math.floor(rng() * 7));
        var baseAvatarCount = Math.max(1, 1 + Math.floor(rng() * 3));
        var baseAvatars = [];

        for (i = 0; i < baseAvatarCount; i += 1) {
          baseAvatars.push('https://picsum.photos/seed/' + key + '-u' + i + '/22/22');
        }

        this.todayState = {
          activityCount: baseCount,
          avatars: baseAvatars,
          hasNewContent: false,
          hasNewBadge: false
        };
      }

      activityCount = this.todayState.activityCount;
      avatars = this.todayState.avatars.slice();
      hasNewContent = this.todayState.hasNewContent;
      hasNewBadge = this.todayState.hasNewBadge;
    } else {
      hasScheduled = rng() < 0.1;
      scheduledCount = hasScheduled ? 1 + Math.floor(rng() * 2) : 0;
    }

    return {
      index: index,
      offsetFromToday: offsetFromToday,
      date: normalizedDate,
      key: key,
      isPast: isPast,
      isFuture: isFuture,
      isToday: isToday,
      activityCount: activityCount,
      avatars: avatars,
      hasNewContent: hasNewContent,
      hasScheduled: hasScheduled,
      scheduledCount: scheduledCount,
      hasNewBadge: hasNewBadge
    };
  },

  getDaySnapshot: function (date) {
    var key = toDateKey(startOfDay(date));
    if (this.dayMap[key]) {
      return this.dayMap[key];
    }

    return this.createDayDataForDate(date, -1);
  },

  generateDaysData: function (centerDate) {
    var center = startOfDay(centerDate || this.today);
    this.rangeCenter = center;

    var offset;
    var days = [];
    var map = {};

    for (offset = -30; offset <= 30; offset += 1) {
      var date = new Date(center);
      date.setDate(center.getDate() + offset);
      var dayData = this.createDayDataForDate(date, offset + 30);
      days.push(dayData);
      map[dayData.key] = dayData;
    }

    this.daysData = days;
    this.dayMap = map;

    if (!this.dayMap[this.getSelectedKey()]) {
      this.selectedDate = new Date(center);
    }

    return days;
  },

  getDayLabel: function (day) {
    if (day.isToday) {
      return 'Hoje';
    }

    if (day.offsetFromToday === -1) {
      return 'Ontem';
    }

    if (day.offsetFromToday === 1) {
      return 'Amanha';
    }

    if (typeof formatMonthPt === 'function') {
      return formatMonthPt(day.date) + ' ' + day.date.getDate();
    }

    return formatMonthYearShort(day.date).split(' ')[0] + ' ' + day.date.getDate();
  },

  renderAvatarZone: function (day) {
    if (day.isFuture && day.hasScheduled) {
      return '<i data-lucide="clock-3" class="timeline-scheduled-icon" aria-hidden="true"></i>';
    }

    if (day.activityCount <= 0 && !day.isToday) {
      return '<span class="timeline-empty-dot" aria-hidden="true"></span>';
    }

    var avatars = day.avatars.slice(0, 2);
    if (!avatars.length && day.activityCount > 0) {
      avatars = ['https://picsum.photos/seed/' + day.key + '-fallback/22/22'];
    }

    if (day.activityCount === 1 || avatars.length === 1) {
      return '<span class="timeline-avatar-wrap"><img class="timeline-avatar" src="' + avatars[0] + '" alt="Atividade do dia" style="left:9px" loading="lazy"></span>';
    }

    var html = '<span class="timeline-avatar-wrap">';
    html += '<img class="timeline-avatar is-left" src="' + avatars[0] + '" alt="Atividade do dia" loading="lazy">';
    html += '<img class="timeline-avatar is-right" src="' + avatars[Math.min(1, avatars.length - 1)] + '" alt="Atividade do dia" loading="lazy">';

    if (day.activityCount >= 3) {
      html += '<span class="timeline-plus-badge">+' + (day.activityCount - 2) + '</span>';
    }

    html += '</span>';
    return html;
  },

  renderTimelineDay: function (day) {
    var isSelected = day.key === this.getSelectedKey();
    var dayClasses = ['timeline-day'];
    var labelClass = 'timeline-label';

    if (day.isToday) {
      dayClasses.push('today');
      labelClass += ' today';
    } else if (day.offsetFromToday === -1 || day.offsetFromToday === 1) {
      labelClass += ' near';
    } else if (day.isFuture && day.offsetFromToday > 1) {
      labelClass += ' future-far';
    }

    if (isSelected) {
      dayClasses.push('selected');
    }

    var barColor = activityColor(day.activityCount);
    var barWidth = activityWidth(day.activityCount);
    var badgeHtml = day.isToday && day.hasNewBadge ? '<span class="new-activity-badge" aria-hidden="true"></span>' : '';
    var clockHtml = day.isToday ? '<span class="timeline-now-clock">' + this.currentClock + '</span>' : '';

    return [
      '<button class="' + dayClasses.join(' ') + '" type="button" role="option" aria-selected="' + (isSelected ? 'true' : 'false') + '" data-date="' + day.key + '" data-index="' + day.index + '">',
      badgeHtml,
      '<span class="timeline-avatar-zone">' + this.renderAvatarZone(day) + '</span>',
      '<span class="timeline-intensity-track"><span class="timeline-intensity-fill" style="background:' + barColor + ';width:0" data-target-width="' + barWidth + '"></span></span>',
      '<span class="timeline-label-wrap"><span class="' + labelClass + '">' + this.getDayLabel(day) + '</span>' + clockHtml + '</span>',
      '</button>'
    ].join('');
  },

  renderTimeline: function (options) {
    if (!timelineScroll) {
      return;
    }

    options = options || {};
    var preserveScroll = !!options.preserveScroll;
    var animateBars = options.animateBars !== false;
    var oldScroll = preserveScroll ? timelineScroll.scrollLeft : 0;

    timelineScroll.innerHTML = this.daysData.map(this.renderTimelineDay.bind(this)).join('');
    timelineSafeIconRefresh();

    if (preserveScroll) {
      timelineScroll.scrollLeft = oldScroll;
    }

    if (animateBars) {
      this.animateBarsStagger();
    } else {
      this.applyBarsDirect();
    }

    this.updateEdgeIndicators();
    this.updateMonthLabel();
    this.updateTodayButton();
  },

  animateBarsStagger: function () {
    if (!timelineScroll) {
      return;
    }

    var bars = Array.prototype.slice.call(timelineScroll.querySelectorAll('.timeline-intensity-fill'));
    bars.forEach(function (bar, index) {
      bar.style.width = '0px';
      setTimeout(function () {
        bar.style.width = (Number(bar.getAttribute('data-target-width')) || 0) + 'px';
      }, 60 + (index * 14));
    });
  },

  applyBarsDirect: function () {
    if (!timelineScroll) {
      return;
    }

    var bars = Array.prototype.slice.call(timelineScroll.querySelectorAll('.timeline-intensity-fill'));
    bars.forEach(function (bar) {
      bar.style.width = (Number(bar.getAttribute('data-target-width')) || 0) + 'px';
    });
  },

  pulseSelectedBar: function (dayEl) {
    var bar = dayEl ? dayEl.querySelector('.timeline-intensity-fill') : null;
    if (!bar) {
      return;
    }

    var target = (Number(bar.getAttribute('data-target-width')) || 0) + 'px';
    bar.style.transition = 'width 120ms ease';
    bar.style.width = '0px';

    setTimeout(function () {
      bar.style.transition = 'width 300ms ease';
      bar.style.width = target;
    }, 30);
  },

  updateMonthLabel: function () {
    if (timelineMonthLabel) {
      timelineMonthLabel.textContent = formatMonthYearShort(this.selectedDate);
    }
  },

  updateTodayButton: function () {
    if (!timelineTodayBtn) {
      return;
    }

    if (this.isTodaySelected()) {
      if (timelineTodayBtn.classList.contains('is-hidden')) {
        return;
      }

      timelineTodayBtn.classList.remove('is-visible');
      timelineTodayBtn.classList.add('is-leaving');
      clearTimeout(this.todayButtonTimer);
      this.todayButtonTimer = setTimeout(function () {
        timelineTodayBtn.classList.add('is-hidden');
        timelineTodayBtn.classList.remove('is-leaving', 'is-bounce');
      }, 200);
      return;
    }

    clearTimeout(this.todayButtonTimer);
    timelineTodayBtn.classList.remove('is-hidden', 'is-leaving');
    requestAnimationFrame(function () {
      timelineTodayBtn.classList.add('is-visible');
    });
  },

  getDayByKey: function (key) {
    return this.dayMap[key] || null;
  },

  jumpToDate: function (date, options) {
    options = options || {};
    if (!date) {
      return;
    }

    var targetDate = startOfDay(date);
    var firstDay = this.daysData[0] ? this.daysData[0].date : null;
    var lastDay = this.daysData[this.daysData.length - 1] ? this.daysData[this.daysData.length - 1].date : null;

    if (firstDay && targetDate < firstDay) {
      targetDate = new Date(firstDay);
    }

    if (lastDay && targetDate > lastDay) {
      targetDate = new Date(lastDay);
    }

    this.selectDay(toDateKey(targetDate), {
      smooth: options.smooth !== false,
      effects: options.effects !== false,
      keyboard: !!options.keyboard
    });
  },

  showFeedDayBanner: function (day) {
    if (!this.feedBannerHost) {
      return;
    }

    if (day.isToday || !day.isPast || day.activityCount <= 0) {
      this.hideFeedDayBanner();
      return;
    }

    this.feedBannerHost.innerHTML = [
      '<div class="feed-day-banner">',
      '<span>&#128197; Exibindo posts de ' + safeHtml(formatLongDatePt(day.date)) + ' &middot; ' + day.activityCount + ' posts encontrados</span>',
      '<button class="close-banner" type="button" aria-label="Fechar banner">&times;</button>',
      '</div>'
    ].join('');
  },

  hideFeedDayBanner: function () {
    if (this.feedBannerHost) {
      this.feedBannerHost.innerHTML = '';
    }
  },

  runFeedReaction: function () {
    if (!feedList) {
      return;
    }

    if (typeof playFeedTransition === 'function') {
      playFeedTransition('timeline-react');
    } else {
      feedList.classList.add('timeline-react');
    }

    setTimeout(function () {
      feedList.classList.remove('timeline-react');
    }, 430);
  },

  spawnRipple: function (dayEl) {
    if (!dayEl) {
      return;
    }

    var ripple = document.createElement('span');
    ripple.className = 'timeline-ripple';
    dayEl.appendChild(ripple);

    setTimeout(function () {
      ripple.remove();
    }, 420);
  },

  spawnParticles: function (dayEl) {
    if (!dayEl) {
      return;
    }

    var offsets = [-10, 0, 10];
    offsets.forEach(function (offset) {
      var particle = document.createElement('span');
      particle.className = 'timeline-particle';
      particle.style.setProperty('--offset-x', offset + 'px');
      particle.style.setProperty('--particle-size', (3 + Math.floor(Math.random() * 3)) + 'px');
      dayEl.appendChild(particle);

      setTimeout(function () {
        particle.remove();
      }, 620);
    });
  },

  selectDay: function (target, options) {
    options = options || {};

    var key = typeof target === 'string' ? target : toDateKey(target);
    var day = this.getDayByKey(key);
    if (!day || !timelineScroll) {
      return;
    }

    this.selectedDate = new Date(day.date);
    if (typeof state !== 'undefined' && state) {
      state.selectedDate = day.key;
    }

    this.updateMonthLabel();
    this.updateTodayButton();
    this.showFeedDayBanner(day);

    var dayEl = timelineScroll.querySelector('[data-date="' + day.key + '"]');
    var prev = timelineScroll.querySelector('.timeline-day.selected');

    if (options.effects !== false && dayEl) {
      this.spawnRipple(dayEl);
      this.spawnParticles(dayEl);
    }

    setTimeout(function () {
      if (prev && prev !== dayEl) {
        prev.classList.remove('selected');
        prev.setAttribute('aria-selected', 'false');
      }

      if (dayEl) {
        dayEl.classList.add('selected');
        dayEl.setAttribute('aria-selected', 'true');

        var label = dayEl.querySelector('.timeline-label');
        if (label) {
          label.classList.add('label-pop');
          setTimeout(function () {
            label.classList.remove('label-pop');
          }, 260);
        }
      }
    }, options.effects === false ? 0 : 100);

    if (options.effects !== false) {
      setTimeout(this.runFeedReaction.bind(this), 150);
      setTimeout(this.pulseSelectedBar.bind(this, dayEl), 200);
    }

    if (options.smooth !== false && dayEl) {
      dayEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (options.keyboard && dayEl) {
      dayEl.classList.add('keyboard-focus');
      setTimeout(function () {
        dayEl.classList.remove('keyboard-focus');
      }, 900);

      this.showTooltip(dayEl, day, true);
    }

    if (day.isToday) {
      this.hideFeedDayBanner();
      day.hasNewBadge = false;
      if (this.todayState) {
        this.todayState.hasNewBadge = false;
      }

      if (dayEl) {
        var badge = dayEl.querySelector('.new-activity-badge');
        if (badge) {
          badge.remove();
        }
      }
    }

    if (this.isCalendarOpen()) {
      this.calendarViewDate = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
      this.renderCalendarPopup();
    }
  },

  scrollToToday: function (smooth, withPulse) {
    var todayKey = this.getTodayKey();
    this.selectDay(todayKey, { smooth: smooth !== false, effects: false });

    if (!timelineScroll) {
      return;
    }

    var todayEl = timelineScroll.querySelector('[data-date="' + todayKey + '"]');
    if (todayEl) {
      todayEl.scrollIntoView({
        behavior: smooth === false ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      });

      if (withPulse) {
        todayEl.classList.add('today-pulse');
        setTimeout(function () {
          todayEl.classList.remove('today-pulse');
        }, 340);
      }
    }
  },

  isCalendarOpen: function () {
    return !!timelineCalendarPopup && !timelineCalendarPopup.classList.contains('is-hidden') && !timelineCalendarPopup.classList.contains('is-closing');
  },

  openCalendarPopup: function () {
    if (!timelineCalendarPopup) {
      return;
    }

    clearTimeout(this.calendarCloseTimer);
    timelineCalendarPopup.classList.remove('is-hidden', 'is-closing');
    timelineCalendarPopup.classList.add('is-open');
    timelineCalendarPopup.setAttribute('aria-hidden', 'false');
    this.calendarViewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    this.renderCalendarPopup();
  },

  closeCalendarPopup: function () {
    if (!timelineCalendarPopup || timelineCalendarPopup.classList.contains('is-hidden') || timelineCalendarPopup.classList.contains('is-closing')) {
      return;
    }

    timelineCalendarPopup.classList.remove('is-open');
    timelineCalendarPopup.classList.add('is-closing');
    timelineCalendarPopup.setAttribute('aria-hidden', 'true');

    this.calendarCloseTimer = setTimeout(function () {
      timelineCalendarPopup.classList.add('is-hidden');
      timelineCalendarPopup.classList.remove('is-closing');
    }, 150);
  },

  toggleCalendarPopup: function () {
    if (this.isCalendarOpen()) {
      this.closeCalendarPopup();
    } else {
      this.openCalendarPopup();
    }
  },

  changeCalendarMonth: function (delta) {
    this.calendarViewDate = new Date(this.calendarViewDate.getFullYear(), this.calendarViewDate.getMonth() + delta, 1);
    this.renderCalendarPopup();
  },

  renderCalendarPopup: function () {
    if (!calendarGrid || !calendarTitle) {
      return;
    }

    calendarTitle.textContent = formatMonthYearLong(this.calendarViewDate);

    var firstDay = new Date(this.calendarViewDate.getFullYear(), this.calendarViewDate.getMonth(), 1);
    var startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    var selectedKey = this.getSelectedKey();
    var html = '';
    var i;

    for (i = 0; i < 42; i += 1) {
      var dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      var key = toDateKey(dayDate);
      var inRange = !!this.dayMap[key];
      var day = inRange ? this.dayMap[key] : this.createDayDataForDate(dayDate, -1);
      var outsideMonth = dayDate.getMonth() !== this.calendarViewDate.getMonth();
      var classes = ['calendar-day'];

      if (outsideMonth) {
        classes.push('outside-month');
      }

      if (!inRange) {
        classes.push('disabled');
      }

      if (day.isFuture) {
        classes.push('future');
      }

      if (day.isToday) {
        classes.push('today');
      } else if (key === selectedKey) {
        classes.push('selected');
      }

      if (day.isPast && day.activityCount > 0) {
        classes.push('has-activity');
      }

      html += '<button class="' + classes.join(' ') + '" type="button" data-date="' + key + '" data-disabled="' + (inRange ? 'false' : 'true') + '" style="--calendar-heat:' + calendarHeat(day.activityCount) + '">' + dayDate.getDate() + '</button>';
    }

    calendarGrid.innerHTML = html;
  },

  tooltipText: function (day) {
    var info;

    if (day.isFuture) {
      if (day.hasScheduled && day.scheduledCount > 0) {
        info = '<span class="tooltip-accent">&middot; ' + day.scheduledCount + ' posts agendados</span>';
      } else {
        info = '<span class="tooltip-faint">&middot; Nenhum post agendado</span>';
      }
    } else if (day.activityCount > 0) {
      info = '<span class="tooltip-accent">&middot; ' + day.activityCount + ' posts</span>';
    } else {
      info = '<span class="tooltip-faint">&middot; Nenhuma atividade</span>';
    }

    return safeHtml(formatLongDatePt(day.date)) + ' ' + info;
  },

  showTooltip: function (dayEl, day, autoHide) {
    if (!timelineTooltip || !dayEl || !day) {
      return;
    }

    clearTimeout(this.tooltipDelayTimer);
    clearTimeout(this.tooltipAutoHideTimer);

    var bar = document.querySelector('.timeline-bar');
    if (!bar) {
      return;
    }

    var barRect = bar.getBoundingClientRect();
    var dayRect = dayEl.getBoundingClientRect();
    var left = dayRect.left + (dayRect.width / 2) - barRect.left;

    timelineTooltip.innerHTML = this.tooltipText(day);
    timelineTooltip.style.left = left + 'px';
    timelineTooltip.classList.remove('is-hidden');

    requestAnimationFrame(function () {
      timelineTooltip.classList.add('is-visible');
    });

    if (autoHide) {
      this.tooltipAutoHideTimer = setTimeout(this.hideTooltip.bind(this), 1200);
    }
  },

  hideTooltip: function () {
    if (!timelineTooltip) {
      return;
    }

    clearTimeout(this.tooltipDelayTimer);
    clearTimeout(this.tooltipAutoHideTimer);

    timelineTooltip.classList.remove('is-visible');
    setTimeout(function () {
      timelineTooltip.classList.add('is-hidden');
    }, 100);
  },

  updateEdgeIndicators: function () {
    if (!timelineScrollWrap || !timelineScroll) {
      return;
    }

    var maxScroll = Math.max(0, timelineScroll.scrollWidth - timelineScroll.clientWidth);
    var left = timelineScroll.scrollLeft;

    timelineScrollWrap.classList.toggle('has-left', left > 12);
    timelineScrollWrap.classList.toggle('has-right', left < maxScroll - 12);
  },

  setupDrag: function () {
    var self = this;
    if (!timelineScroll) {
      return;
    }

    function dragStart(clientX) {
      self.drag.active = true;
      self.drag.moved = false;
      self.drag.startX = clientX;
      self.drag.scrollLeft = timelineScroll.scrollLeft;
      self.drag.lastX = clientX;
      self.drag.lastTime = performance.now();
      self.drag.velocity = 0;
      timelineScroll.classList.add('is-dragging');
    }

    function dragMove(clientX) {
      if (!self.drag.active) {
        return;
      }

      var now = performance.now();
      var delta = clientX - self.drag.startX;
      if (Math.abs(delta) > 3) {
        self.drag.moved = true;
      }

      timelineScroll.scrollLeft = self.drag.scrollLeft - delta;

      var deltaX = clientX - self.drag.lastX;
      var deltaT = Math.max(1, now - self.drag.lastTime);
      self.drag.velocity = deltaX / deltaT;
      self.drag.lastX = clientX;
      self.drag.lastTime = now;

      self.updateEdgeIndicators();
    }

    function dragEnd() {
      if (!self.drag.active) {
        return;
      }

      self.drag.active = false;
      timelineScroll.classList.remove('is-dragging');

      if (self.drag.moved) {
        self.suppressClickUntil = Date.now() + 140;
      }

      self.applyDragInertia();
    }

    timelineScroll.addEventListener('mousedown', function (event) {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      dragStart(event.clientX);
    });

    window.addEventListener('mousemove', function (event) {
      dragMove(event.clientX);
    });

    window.addEventListener('mouseup', dragEnd);

    timelineScroll.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1) {
        return;
      }

      dragStart(event.touches[0].clientX);
    }, { passive: true });

    timelineScroll.addEventListener('touchmove', function (event) {
      if (!self.drag.active || event.touches.length !== 1) {
        return;
      }

      event.preventDefault();
      dragMove(event.touches[0].clientX);
    }, { passive: false });

    timelineScroll.addEventListener('touchend', dragEnd);
    timelineScroll.addEventListener('touchcancel', dragEnd);
  },

  applyDragInertia: function () {
    if (!timelineScroll) {
      return;
    }

    var velocity = this.drag.velocity;
    var duration = 200;
    var start = performance.now();
    var self = this;

    if (Math.abs(velocity) < 0.02) {
      this.updateEdgeIndicators();
      return;
    }

    function step(now) {
      var progress = (now - start) / duration;
      if (progress >= 1) {
        self.updateEdgeIndicators();
        return;
      }

      var damping = 1 - progress;
      timelineScroll.scrollLeft -= velocity * 16 * damping * 3;
      self.updateEdgeIndicators();
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  },

  setupKeyboard: function () {
    if (this.keyboardBound) {
      return;
    }

    this.keyboardBound = true;
    var self = this;

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var tag = target && target.tagName ? target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) {
        return;
      }

      if (event.key === 'Escape') {
        self.closeCalendarPopup();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();

        var currentDay = self.getDayByKey(self.getSelectedKey());
        if (!currentDay) {
          return;
        }

        var nextIndex = currentDay.index + (event.key === 'ArrowRight' ? 1 : -1);
        nextIndex = Math.max(0, Math.min(self.daysData.length - 1, nextIndex));
        var nextDay = self.daysData[nextIndex];

        if (nextDay) {
          self.selectDay(nextDay.key, { smooth: true, effects: true, keyboard: true });
        }
        return;
      }

      if (event.key === 'Home' || event.key === 't' || event.key === 'T') {
        event.preventDefault();
        self.scrollToToday(true, true);
      }
    });
  },

  bindEvents: function () {
    if (this.eventsBound) {
      return;
    }

    this.eventsBound = true;
    var self = this;

    if (timelineScroll) {
      timelineScroll.addEventListener('click', function (event) {
        if (Date.now() < self.suppressClickUntil) {
          return;
        }

        var dayEl = event.target.closest('.timeline-day');
        if (!dayEl) {
          return;
        }

        self.selectDay(dayEl.getAttribute('data-date'), { smooth: true, effects: true });
      });

      timelineScroll.addEventListener('mouseover', function (event) {
        var dayEl = event.target.closest('.timeline-day');
        if (!dayEl) {
          return;
        }

        var fromDay = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('.timeline-day') : null;
        if (fromDay === dayEl) {
          return;
        }

        clearTimeout(self.tooltipDelayTimer);
        self.tooltipDelayTimer = setTimeout(function () {
          var day = self.getDayByKey(dayEl.getAttribute('data-date'));
          self.showTooltip(dayEl, day, false);
        }, 400);
      });

      timelineScroll.addEventListener('mouseout', function (event) {
        var dayEl = event.target.closest('.timeline-day');
        if (!dayEl) {
          return;
        }

        var toDay = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('.timeline-day') : null;
        if (toDay === dayEl) {
          return;
        }

        self.hideTooltip();
      });

      timelineScroll.addEventListener('mouseleave', self.hideTooltip.bind(self));
      timelineScroll.addEventListener('scroll', this.updateEdgeIndicators.bind(this));
    }

    if (timelineTodayBtn) {
      timelineTodayBtn.addEventListener('click', function () {
        timelineTodayBtn.classList.add('is-bounce');
        setTimeout(function () {
          timelineTodayBtn.classList.remove('is-bounce');
        }, 320);

        self.scrollToToday(true, true);
      });
    }

    if (timelineCalendarToggle) {
      timelineCalendarToggle.addEventListener('click', this.toggleCalendarPopup.bind(this));
    }

    if (calendarPrevMonth) {
      calendarPrevMonth.addEventListener('click', function () {
        self.changeCalendarMonth(-1);
      });
    }

    if (calendarNextMonth) {
      calendarNextMonth.addEventListener('click', function () {
        self.changeCalendarMonth(1);
      });
    }

    if (calendarGrid) {
      calendarGrid.addEventListener('click', function (event) {
        var dayBtn = event.target.closest('.calendar-day');
        if (!dayBtn) {
          return;
        }

        if (dayBtn.getAttribute('data-disabled') === 'true') {
          return;
        }

        var key = dayBtn.getAttribute('data-date');
        if (!key) {
          return;
        }

        self.closeCalendarPopup();
        setTimeout(function () {
          self.selectDay(key, { smooth: true, effects: true });
        }, 120);
      });
    }

    document.addEventListener('click', function (event) {
      var insidePopup = event.target.closest('#timelineCalendarPopup');
      var insideToggle = event.target.closest('#timelineCalendarToggle');

      if (!insidePopup && !insideToggle) {
        self.closeCalendarPopup();
      }
    });

    if (this.feedBannerHost) {
      this.feedBannerHost.addEventListener('click', function (event) {
        if (event.target.closest('.close-banner')) {
          self.hideFeedDayBanner();
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (self.pendingNewPosts > 0 && self.isTodaySelected() && window.scrollY > 100) {
        self.showNewPostsPill(self.pendingNewPosts);
      } else if (window.scrollY <= 100) {
        self.hideNewPostsPill();
      }
    });
  },

  showToast: function (payload) {
    if (!toastHost) {
      return;
    }

    var toast = document.createElement('div');
    toast.className = 'timeline-toast';
    toast.innerHTML = [
      '<img class="timeline-toast-avatar" src="' + safeHtml(payload.avatar) + '" alt="Avatar ' + safeHtml(payload.user) + '">',
      '<div class="timeline-toast-content">',
      '<div class="timeline-toast-head">' + safeHtml(payload.user) + ' &middot; ' + safeHtml(payload.time) + '</div>',
      '<div class="timeline-toast-text">' + safeHtml(payload.text) + '</div>',
      '</div>'
    ].join('');

    toastHost.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    var remaining = 4000;
    var timer = null;
    var startedAt = Date.now();

    function closeToast() {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(function () {
        toast.remove();
      }, 260);
    }

    function startTimer() {
      startedAt = Date.now();
      timer = setTimeout(closeToast, remaining);
    }

    function pauseTimer() {
      clearTimeout(timer);
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    }

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', startTimer);
    toast.addEventListener('click', function () {
      if (feedColumn) {
        feedColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      closeToast();
    });

    startTimer();
  },

  showNewPostsPill: function (count) {
    var self = this;
    if (!this.newPostsPillHost) {
      return;
    }

    var postText = count === 1 ? 'novo post' : 'novos posts';
    var text = '&uarr; ' + count + ' ' + postText + ' &middot; Ver agora';

    var existing = this.newPostsPillHost.querySelector('#newPostsPill');
    if (existing) {
      existing.innerHTML = text;
      clearTimeout(this.newPostsPillTimer);
      this.newPostsPillTimer = setTimeout(function () {
        self.hideNewPostsPill();
      }, 8000);
      return;
    }

    this.newPostsPillHost.innerHTML = '<button id="newPostsPill" class="new-post-pill" type="button">' + text + '</button>';
    var pill = this.newPostsPillHost.querySelector('#newPostsPill');

    if (!pill) {
      return;
    }

    requestAnimationFrame(function () {
      pill.classList.add('show');
    });

    pill.addEventListener('click', function () {
      if (feedColumn) {
        feedColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      self.pendingNewPosts = 0;
      self.hideNewPostsPill();
    });

    clearTimeout(this.newPostsPillTimer);
    this.newPostsPillTimer = setTimeout(function () {
      self.hideNewPostsPill();
    }, 8000);
  },

  hideNewPostsPill: function () {
    if (!this.newPostsPillHost) {
      return;
    }

    var pill = this.newPostsPillHost.querySelector('.new-post-pill');
    if (!pill) {
      this.newPostsPillHost.innerHTML = '';
      return;
    }

    pill.classList.remove('show');
    pill.classList.add('hide');

    setTimeout(function () {
      if (pill.parentNode) {
        pill.parentNode.innerHTML = '';
      }
    }, 220);
  },

  insertNewPost: function (payload) {
    if (!feedList) {
      return;
    }

    var newId = 'sim-' + Date.now();
    var hasMedia = Math.random() < 0.25;
    var hasPoll = !hasMedia && Math.random() < 0.15;
    var newPost = {
      id: newId,
      user: payload.user,
      avatar: payload.avatar,
      time: payload.time,
      text: payload.text,
      verified: false,
      source: 'simulation',
      metrics: { comments: 0, reposts: 0, likes: 0 },
      state: { repost: false, like: false, bookmark: false }
    };

    if (hasMedia) {
      newPost.image = 'https://picsum.photos/seed/' + newId + '-media/760/420';
    }

    if (hasPoll) {
      newPost.poll = {
        options: [
          { label: 'sim', pct: 52 },
          { label: 'nao', pct: 33 },
          { label: 'talvez', pct: 15 }
        ],
        votes: 23,
        closed: false
      };
    }

    if (typeof applyPostMetadata === 'function') {
      applyPostMetadata(newPost, 'simulation');
    }

    if (Array.isArray(postStore)) {
      postStore.unshift(newPost);
    }

    var card = null;
    if (typeof createPostCardElement === 'function') {
      card = createPostCardElement(newPost, 0, { newPostId: newId, source: 'simulation' });
    }

    if (!card) {
      card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = '<p>' + safeHtml(payload.user) + ': ' + safeHtml(payload.text) + '</p>';
    }

    card.classList.add('timeline-post-enter');
    card.style.maxHeight = '0px';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-12px)';
    card.style.overflow = 'hidden';

    feedList.prepend(card);
    timelineSafeIconRefresh();

    if (typeof document.dispatchEvent === 'function') {
      document.dispatchEvent(new CustomEvent('chrono:post-created', {
        detail: { postEl: card }
      }));
    }

    requestAnimationFrame(function () {
      card.style.maxHeight = '220px';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });

    setTimeout(function () {
      card.classList.remove('timeline-post-enter');
      card.style.maxHeight = '';
      card.style.opacity = '';
      card.style.transform = '';
      card.style.overflow = '';
      card.classList.add('timeline-new-highlight');

      setTimeout(function () {
        card.classList.remove('timeline-new-highlight');
      }, 2000);
    }, 420);
  },

  touchTodayActivity: function (payload) {
    if (!this.todayState) {
      this.createDayDataForDate(this.today, 30);
    }

    this.todayState.activityCount += 1;
    this.todayState.hasNewContent = true;
    this.todayState.hasNewBadge = true;

    if (this.todayState.avatars.length < 3) {
      this.todayState.avatars.push(payload.avatar);
    } else {
      this.todayState.avatars = [payload.avatar, this.todayState.avatars[0], this.todayState.avatars[1]];
    }

    var todayDay = this.getDayByKey(this.getTodayKey());
    if (!todayDay) {
      return;
    }

    todayDay.activityCount = this.todayState.activityCount;
    todayDay.hasNewContent = this.todayState.hasNewContent;
    todayDay.hasNewBadge = this.todayState.hasNewBadge;
    todayDay.avatars = this.todayState.avatars.slice();

    this.renderTimeline({ preserveScroll: true, animateBars: false });

    var todayEl = timelineScroll ? timelineScroll.querySelector('[data-date="' + todayDay.key + '"]') : null;
    if (todayEl) {
      this.pulseSelectedBar(todayEl);
    }
  },

  simulateNewPost: function () {
    var usernames = ['@nebula_core', '@pixel_ghost', '@iron_silva', '@sus_bacon', '@byte_favela', '@orbital_zero', '@cuberta_dobrada'];
    var texts = [
      'O sinal da estacao sul voltou. alguem mais captou isso?',
      'tres dias sem chuva e a cidade parece outro planeta $artedistopica',
      'achei os logs do servidor antigo. ta tudo la ainda.',
      'ontem vi aquela luz no topo do arranha-ceu de novo.',
      'o metro parou exatamente no mesmo ponto pela terceira vez.',
      'alguem sabe o que aconteceu com o @padaria_quantica?',
      'nova rota disponivel no hub. nao cliquem ainda.'
    ];
    var tempos = ['agora mesmo', 'ha poucos segundos', '1 min'];

    var user = usernames[Math.floor(Math.random() * usernames.length)];
    var text = texts[Math.floor(Math.random() * texts.length)];
    var time = tempos[Math.floor(Math.random() * tempos.length)];
    var payload = {
      user: user,
      text: text,
      time: time,
      avatar: 'https://picsum.photos/seed/' + user.replace(/[^a-z0-9]/gi, '') + '-' + Date.now() + '/64/64'
    };

    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.handleNewPost === 'function') {
      HeaderModule.handleNewPost(payload);
    }

    this.touchTodayActivity(payload);

    setTimeout(this.showToast.bind(this, payload), 200);

    setTimeout(function () {
      if (ChronoTimeline.isTodaySelected()) {
        ChronoTimeline.insertNewPost(payload);

        if (window.scrollY > 100) {
          ChronoTimeline.pendingNewPosts += 1;
          ChronoTimeline.showNewPostsPill(ChronoTimeline.pendingNewPosts);
        }
      } else {
        ChronoTimeline.pendingNewPosts += 1;
      }
    }, 500);
  },

  startNewPostSimulation: function () {
    clearInterval(this.newPostInterval);
    this.newPostInterval = setInterval(this.simulateNewPost.bind(this), 60000);
  },

  updateClockLabel: function () {
    this.currentClock = nowHm();

    if (!timelineScroll) {
      return;
    }

    var clock = timelineScroll.querySelector('.timeline-day.today .timeline-now-clock');
    if (clock) {
      clock.textContent = this.currentClock;
    }
  },

  startClock: function () {
    this.updateClockLabel();
    clearInterval(this.clockInterval);
    this.clockInterval = setInterval(this.updateClockLabel.bind(this), 60000);
  }
};

if (typeof window !== 'undefined') {
  window.ChronoTimeline = ChronoTimeline;
}

document.addEventListener('DOMContentLoaded', function () {
  if (ChronoTimeline && typeof ChronoTimeline.init === 'function') {
    ChronoTimeline.init();
  }
});
