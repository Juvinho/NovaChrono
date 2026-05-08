'use strict';

Object.assign(ChronoTimeline, {
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
newPostsPillTimer: null,
pendingNewPosts: 0,
currentClock: nowHm(),
feedBannerHost: null,
newPostsPillHost: null,
drag: {
          active: false,
          startX: 0,
          scrollLeft: 0,
          lastX: 0,
          lastTime: 0,
          velocity: 0,
        },
init: function () {
          this.today = startOfDay(new Date());
          this.selectedDate = new Date(this.today);
          this.rangeCenter = new Date(this.today);
          this.calendarViewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
          this.todayState = null;
          this.generateDaysData(this.rangeCenter);
          this.ensureFeedHosts();
          this.renderTimeline({ preserveScroll: false, animateBars: true });
          this.renderCalendarPopup();
          this.setupDrag();
          this.setupKeyboard();
          this.bindEvents();
          this.scrollToToday(false, false);
          this.startNewPostSimulation();
          this.startClock();
          this.updateEdgeIndicators();
          this.updateTodayButton();
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
          var rng = seededRandom(key + '-chrono');
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

          if (isPast) {
            activityCount = Math.floor(rng() * 9);
            hasNewContent = rng() < 0.3;
            var avatarCount = activityCount > 0 ? Math.min(3, 1 + Math.floor(rng() * 3)) : 0;
            var i;

            for (i = 0; i < avatarCount; i += 1) {
              avatars.push('https://picsum.photos/seed/' + key + '-u' + i + '/22/22');
            }
          } else if (isToday) {
            if (!this.todayState) {
              var baseCount = Math.max(2, Math.floor(rng() * 7));
              var baseAvatarCount = Math.min(3, 1 + Math.floor(rng() * 3));
              var j;
              var baseAvatars = [];

              for (j = 0; j < baseAvatarCount; j += 1) {
                baseAvatars.push('https://picsum.photos/seed/' + key + '-u' + j + '/22/22');
              }

              this.todayState = {
                activityCount: baseCount,
                avatars: baseAvatars,
                hasNewContent: false,
                hasNewBadge: false,
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
            hasNewBadge: hasNewBadge,
          };
        },
getDaySnapshot: function (date) {
          return this.createDayDataForDate(date, -1);
        }
});

Object.assign(ChronoTimeline, {
generateDaysData: function (centerDate) {
          var center = startOfDay(centerDate || this.rangeCenter || this.today);
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

          return formatMonthPt(day.date) + ' ' + day.date.getDate();
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
            return (
              '<span class="timeline-avatar-wrap">' +
                '<img class="timeline-avatar" src="' + avatars[0] + '" alt="Atividade do dia" style="left:9px" loading="lazy">' +
              '</span>'
            );
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
          var labelClass = 'timeline-label';

          if (day.isToday) {
            labelClass += ' today';
          } else if (day.offsetFromToday === -1 || day.offsetFromToday === 1) {
            labelClass += ' near';
          } else if (day.isFuture && day.offsetFromToday > 1) {
            labelClass += ' future-far';
          }

          var dayClasses = ['timeline-day'];
          if (day.isToday) {
            dayClasses.push('today');
          }
          if (isSelected) {
            dayClasses.push('selected');
          }

          var barColor = activityColor(day.activityCount);
          var barWidth = activityWidth(day.activityCount);
          var badgeHtml = day.isToday && day.hasNewBadge ? '<span class="new-activity-badge" aria-hidden="true"></span>' : '';
          var clockHtml = day.isToday ? '<span class="timeline-now-clock">' + this.currentClock + '</span>' : '';

          return (
            '<button class="' + dayClasses.join(' ') + '" type="button" role="option" data-date="' + day.key + '" data-index="' + day.index + '">' +
              badgeHtml +
              '<span class="timeline-avatar-zone">' + this.renderAvatarZone(day) + '</span>' +
              '<span class="timeline-intensity-track"><span class="timeline-intensity-fill" style="background:' + barColor + ';width:0" data-target-width="' + barWidth + '"></span></span>' +
              '<span class="timeline-label-wrap"><span class="' + labelClass + '">' + this.getDayLabel(day) + '</span>' + clockHtml + '</span>' +
            '</button>'
          );
        },
renderTimeline: function (options) {
          options = options || {};
          var preserveScroll = !!options.preserveScroll;
          var animateBars = options.animateBars !== false;
          var scrollLeft = preserveScroll ? timelineScroll.scrollLeft : 0;

          timelineScroll.innerHTML = this.daysData.map(this.renderTimelineDay.bind(this)).join('');
          safeIconRefresh();

          if (preserveScroll) {
            timelineScroll.scrollLeft = scrollLeft;
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
          var bars = Array.prototype.slice.call(timelineScroll.querySelectorAll('.timeline-intensity-fill'));

          bars.forEach(function (bar, index) {
            bar.style.width = '0px';
            setTimeout(function () {
              bar.style.width = (Number(bar.getAttribute('data-target-width')) || 0) + 'px';
            }, 80 + (index * 12));
          });
        },
applyBarsDirect: function () {
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

          if (calendarJumpInput) {
            calendarJumpInput.value = formatDateBr(this.selectedDate);
            calendarJumpInput.classList.remove('is-invalid');
          }
        }
});
