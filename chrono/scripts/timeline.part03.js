'use strict';

Object.assign(ChronoTimeline, {
updateTodayButton: function () {
          if (!timelineTodayBtn) {
            return;
          }

          if (this.isTodaySelected()) {
            if (timelineTodayBtn.classList.contains('is-hidden')) {
              return;
            }

            timelineTodayBtn.classList.remove('is-visible');
            setTimeout(function () {
              timelineTodayBtn.classList.add('is-hidden');
            }, 200);
            return;
          }

          timelineTodayBtn.classList.remove('is-hidden');
          requestAnimationFrame(function () {
            timelineTodayBtn.classList.add('is-visible');
          });
        },
getDayByKey: function (key) {
          return this.dayMap[key] || null;
        },
jumpToDate: function (date, options) {
          var targetDate = startOfDay(date);
          this.selectedDate = new Date(targetDate);
          this.generateDaysData(targetDate);
          this.renderTimeline({ preserveScroll: false, animateBars: true });
          this.selectDay(toDateKey(targetDate), {
            smooth: !options || options.smooth !== false,
            effects: !options || options.effects !== false,
            keyboard: !!(options && options.keyboard),
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

          this.feedBannerHost.innerHTML = (
            '<div class="feed-day-banner">' +
              '<span>­ƒôà Exibindo posts de ' + this.getDayLabel(day) + ' ┬À ' + day.activityCount + ' posts encontrados</span>' +
              '<button class="close-banner" type="button" aria-label="Fechar banner">├ù</button>' +
            '</div>'
          );
        },
hideFeedDayBanner: function () {
          if (this.feedBannerHost) {
            this.feedBannerHost.innerHTML = '';
          }
        },
runFeedReaction: function () {
          playFeedTransition('timeline-react');
          setTimeout(function () {
            feedList.classList.remove('timeline-react');
          }, 450);
        },
spawnRipple: function (dayEl) {
          var ripple = document.createElement('span');
          ripple.className = 'timeline-ripple';
          dayEl.appendChild(ripple);

          setTimeout(function () {
            ripple.remove();
          }, 420);
        },
spawnParticles: function (dayEl) {
          var offsets = [-10, 0, 10];
          offsets.forEach(function (offset) {
            var particle = document.createElement('span');
            particle.className = 'timeline-particle';
            particle.style.setProperty('--offset-x', offset + 'px');
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

          if (!day) {
            this.jumpToDate(typeof target === 'string' ? fromDateKey(target) : target, options);
            return;
          }

          this.selectedDate = new Date(day.date);
          state.selectedDate = day.key;
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
            }
            if (dayEl) {
              dayEl.classList.add('selected');
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
            setTimeout(this.pulseSelectedBar.bind(this, dayEl), 200);
            setTimeout(this.runFeedReaction.bind(this), 150);
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
            this.renderTimeline({ preserveScroll: true, animateBars: false });
          }

          if (this.isCalendarOpen()) {
            this.calendarViewDate = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
            this.renderCalendarPopup();
          }
        }
});
