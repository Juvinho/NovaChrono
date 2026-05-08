'use strict';

Object.assign(ChronoTimeline, {
scrollToToday: function (smooth, withPulse) {
          var todayKey = this.getTodayKey();
          this.selectDay(todayKey, { smooth: smooth !== false, effects: false });
          var dayEl = timelineScroll.querySelector('[data-date="' + todayKey + '"]');

          if (dayEl) {
            dayEl.scrollIntoView({ behavior: smooth === false ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });

            if (withPulse) {
              dayEl.classList.add('today-pulse');
              setTimeout(function () {
                dayEl.classList.remove('today-pulse');
              }, 340);
            }
          }
        },
isCalendarOpen: function () {
          return !timelineCalendarPopup.classList.contains('is-hidden') && !timelineCalendarPopup.classList.contains('is-closing');
        },
openCalendarPopup: function () {
          clearTimeout(this.calendarCloseTimer);
          timelineCalendarPopup.classList.remove('is-hidden', 'is-closing');
          timelineCalendarPopup.classList.add('is-open');
          timelineCalendarPopup.setAttribute('aria-hidden', 'false');
          this.renderCalendarPopup();
        },
closeCalendarPopup: function () {
          if (timelineCalendarPopup.classList.contains('is-hidden') || timelineCalendarPopup.classList.contains('is-closing')) {
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

          if (calendarJumpInput) {
            calendarJumpInput.value = formatDateBr(this.selectedDate);
            calendarJumpInput.classList.remove('is-invalid');
          }

          calendarTitle.textContent = formatMonthYearLong(this.calendarViewDate);

          var firstDay = new Date(this.calendarViewDate.getFullYear(), this.calendarViewDate.getMonth(), 1);
          var startDate = new Date(firstDay);
          startDate.setDate(firstDay.getDate() - firstDay.getDay());

          var html = '';
          var i;

          for (i = 0; i < 42; i += 1) {
            var dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            var key = toDateKey(dayDate);
            var day = this.getDaySnapshot(dayDate);
            var outsideMonth = dayDate.getMonth() !== this.calendarViewDate.getMonth();
            var classes = ['calendar-day'];
            var heatStyle = '';

            if (outsideMonth) {
              classes.push('outside-month');
            }

            if (day.isFuture) {
              classes.push('future');
            }

            if (day.isToday) {
              classes.push('today');
            } else if (key === this.getSelectedKey()) {
              classes.push('selected');
            }

            if (day.isPast && day.activityCount > 0) {
              classes.push('has-activity');
            }

            if (!day.isToday && !(key === this.getSelectedKey())) {
              heatStyle = ' style="background:' + calendarHeat(day.activityCount) + '"';
            }

            html += '<button class="' + classes.join(' ') + '" type="button" data-date="' + key + '"' + heatStyle + '>' + dayDate.getDate() + '</button>';
          }

          calendarGrid.innerHTML = html;
        },
tooltipText: function (day) {
          var info;

          if (day.isFuture) {
            if (day.hasScheduled) {
              info = '<span class="tooltip-accent">┬À ' + day.scheduledCount + ' posts agendados</span>';
            } else {
              info = '<span class="tooltip-faint">┬À Nenhum post agendado</span>';
            }
          } else if (day.activityCount > 0) {
            info = '<span class="tooltip-accent">┬À ' + day.activityCount + ' posts</span>';
          } else {
            info = '<span class="tooltip-faint">┬À Nenhuma atividade</span>';
          }

          return formatLongDatePt(day.date) + ' ' + info;
        },
showTooltip: function (dayEl, day, autoHide) {
          if (!timelineTooltip || !dayEl || !day) {
            return;
          }

          clearTimeout(this.tooltipDelayTimer);
          clearTimeout(this.tooltipAutoHideTimer);

          var barRect = document.querySelector('.timeline-bar').getBoundingClientRect();
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
        }
});

Object.assign(ChronoTimeline, {
updateEdgeIndicators: function () {
          if (!timelineScrollWrap) {
            return;
          }

          var maxScroll = Math.max(0, timelineScroll.scrollWidth - timelineScroll.clientWidth);
          var left = timelineScroll.scrollLeft;

          timelineScrollWrap.classList.toggle('has-left', left > 12);
          timelineScrollWrap.classList.toggle('has-right', left < maxScroll - 12);
        },
setupDrag: function () {
          var self = this;

          function dragStart(clientX) {
            self.drag.active = true;
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
            self.applyDragInertia();
          }

          timelineScroll.addEventListener('mousedown', function (event) {
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
            if (event.touches.length !== 1) {
              return;
            }

            dragMove(event.touches[0].clientX);
          }, { passive: true });

          timelineScroll.addEventListener('touchend', dragEnd);
        },
applyDragInertia: function () {
          var velocity = this.drag.velocity;
          var duration = 200;
          var start = performance.now();
          var self = this;

          if (Math.abs(velocity) < 0.02) {
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
          var self = this;

          document.addEventListener('keydown', function (event) {
            var targetTag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
            if (targetTag === 'input' || targetTag === 'textarea') {
              return;
            }

            if (event.key === 'Escape') {
              self.closeCalendarPopup();
              return;
            }

            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              var currentKey = self.getSelectedKey();
              var currentDay = self.getDayByKey(currentKey);
              if (!currentDay) {
                return;
              }

              var nextIndex = currentDay.index + (event.key === 'ArrowRight' ? 1 : -1);
              nextIndex = Math.max(0, Math.min(self.daysData.length - 1, nextIndex));
              var nextDay = self.daysData[nextIndex];
              self.selectDay(nextDay.key, { smooth: true, effects: true, keyboard: true });
              return;
            }

            if (event.key === 'Home' || event.key === 't' || event.key === 'T') {
              event.preventDefault();
              self.scrollToToday(true, true);
            }
          });
        }
});
