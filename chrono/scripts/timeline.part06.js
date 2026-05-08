'use strict';

Object.assign(ChronoTimeline, {
showToast: function (payload) {
          if (!toastHost) {
            return;
          }

          var toast = document.createElement('div');
          toast.className = 'timeline-toast';
          toast.innerHTML = (
            '<img class="timeline-toast-avatar" src="' + payload.avatar + '" alt="Avatar ' + payload.user + '">' +
            '<div class="timeline-toast-content">' +
              '<div class="timeline-toast-head">' + payload.user + ' ┬À ' + payload.time + '</div>' +
              '<div class="timeline-toast-text">' + payload.text + '</div>' +
            '</div>'
          );

          toastHost.appendChild(toast);

          requestAnimationFrame(function () {
            toast.classList.add('show');
          });

          var remaining = 4000;
          var timer = null;
          var startAt = Date.now();

          function closeToast() {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(function () {
              toast.remove();
            }, 260);
          }

          function startTimer() {
            startAt = Date.now();
            timer = setTimeout(closeToast, remaining);
          }

          function pauseTimer() {
            clearTimeout(timer);
            remaining = Math.max(0, remaining - (Date.now() - startAt));
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

          var existing = this.newPostsPillHost.querySelector('#newPostsPill');
          if (existing) {
            existing.textContent = 'Ôåæ ' + count + ' novo post ┬À Ver agora';
            clearTimeout(this.newPostsPillTimer);
            this.newPostsPillTimer = setTimeout(function () {
              self.hideNewPostsPill();
            }, 8000);
            return;
          }

          this.newPostsPillHost.innerHTML = '<button id="newPostsPill" class="new-post-pill">Ôåæ ' + count + ' novo post ┬À Ver agora</button>';
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
          }, 200);
        },
insertNewPost: function (payload) {
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

          applyPostMetadata(newPost, 'simulation');
          postStore.unshift(newPost);

          var card = createPostCardElement(newPost, 0, { newPostId: newId, source: 'simulation' });

          if (card && feedList) {
            feedList.prepend(card);
            safeIconRefresh();
            document.dispatchEvent(new CustomEvent('chrono:post-created', {
              detail: { postEl: card }
            }));
          }

          if (card) {
            card.classList.add('timeline-new-highlight');
            setTimeout(function () {
              card.classList.remove('timeline-new-highlight');
            }, 2000);
          }
        }
});

Object.assign(ChronoTimeline, {
touchTodayActivity: function (payload) {
          if (!this.todayState) {
            this.createDayDataForDate(this.today, 30);
          }

          this.todayState.activityCount = Math.min(8, this.todayState.activityCount + 1);
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

          var todayEl = timelineScroll.querySelector('[data-date="' + todayDay.key + '"]');
          if (todayEl) {
            this.pulseSelectedBar(todayEl);
          }
        },
simulateNewPost: function () {
          var usernames = ['@nebula_core', '@pixel_ghost', '@iron_silva', '@sus_bacon', '@byte_favela', '@orbital_zero', '@cuberta_dobrada'];
          var texts = [
            'O sinal da estacao sul voltou. alguem mais captou isso?',
            'tres dias sem chuva e a cidade parece outro planeta #artedistopica',
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

          if (HeaderModule && typeof HeaderModule.handleNewPost === 'function') {
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
});
