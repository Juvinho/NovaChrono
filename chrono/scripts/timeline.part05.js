'use strict';

Object.assign(ChronoTimeline, {
bindEvents: function () {
          var self = this;

          timelineScroll.addEventListener('click', function (event) {
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

          timelineScroll.addEventListener('scroll', this.updateEdgeIndicators.bind(this));

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

              var key = dayBtn.getAttribute('data-date');
              if (!key) {
                return;
              }

              self.closeCalendarPopup();
              setTimeout(function () {
                self.jumpToDate(fromDateKey(key), { smooth: true, effects: true });
              }, 120);
            });
          }

          function jumpFromInput() {
            if (!calendarJumpInput || !calendarJumpInput.value) {
              return;
            }

            var valueDate = parseJumpDate(calendarJumpInput.value);
            if (!valueDate) {
              calendarJumpInput.classList.add('is-invalid');
              return;
            }

            calendarJumpInput.classList.remove('is-invalid');
            calendarJumpInput.value = formatDateBr(valueDate);
            self.closeCalendarPopup();
            setTimeout(function () {
              self.jumpToDate(valueDate, { smooth: true, effects: true });
            }, 120);
          }

          if (calendarJumpGo) {
            calendarJumpGo.addEventListener('click', jumpFromInput);
          }

          if (calendarJumpInput) {
            calendarJumpInput.addEventListener('input', function () {
              var masked = maskDateBrInput(calendarJumpInput.value);
              if (calendarJumpInput.value !== masked) {
                calendarJumpInput.value = masked;
              }

              calendarJumpInput.classList.remove('is-invalid');
            });

            calendarJumpInput.addEventListener('blur', function () {
              if (!calendarJumpInput.value) {
                calendarJumpInput.classList.remove('is-invalid');
                return;
              }

              var parsed = parseJumpDate(calendarJumpInput.value);
              if (parsed) {
                calendarJumpInput.value = formatDateBr(parsed);
                calendarJumpInput.classList.remove('is-invalid');
              }
            });

            calendarJumpInput.addEventListener('keydown', function (event) {
              if (event.key === 'Enter') {
                event.preventDefault();
                jumpFromInput();
              }
            });
          }

          if (calendarJumpToday) {
            calendarJumpToday.addEventListener('click', function () {
              self.closeCalendarPopup();
              setTimeout(function () {
                self.scrollToToday(true, true);
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
            }
          });
        }
});
