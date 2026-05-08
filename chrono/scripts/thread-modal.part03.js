'use strict';

Object.assign(ThreadModal, {
updateReplyInputState: function () {
          var textarea = threadModalContent.querySelector('#threadReplyTextarea');
          var counter = threadModalContent.querySelector('#threadCharCount');
          var sendBtn = threadModalContent.querySelector('#threadReplySend');

          if (!textarea || !counter || !sendBtn) {
            return;
          }

          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';

          var length = textarea.value.length;
          var remaining = 280 - length;

          if (!length) {
            counter.textContent = '';
            counter.className = 'thread-char-count';
            sendBtn.disabled = true;
            return;
          }

          counter.textContent = remaining >= 0 ? (length + '/280') : String(remaining);
          counter.className = 'thread-char-count';

          if (remaining <= 49 && remaining >= 10) {
            counter.classList.add('warn');
          } else if (remaining < 10 && remaining >= 0) {
            counter.classList.add('danger');
          } else if (remaining < 0) {
            counter.classList.add('over');
          }

          sendBtn.disabled = remaining < 0 || !textarea.value.trim();
        },
submitReply: function () {
          var textarea = threadModalContent.querySelector('#threadReplyTextarea');
          var sendBtn = threadModalContent.querySelector('#threadReplySend');
          if (!textarea || !sendBtn) {
            return;
          }

          var text = textarea.value.trim();
          if (!text || text.length > 280) {
            return;
          }

          sendBtn.classList.add('btn-pop');
          setTimeout(function () {
            sendBtn.classList.remove('btn-pop');
          }, 160);

          var reply = {
            id: 'reply-new-' + Date.now(),
            user: '@Juvinho',
            avatar: 'https://picsum.photos/seed/reply-juvinho/68/68',
            time: 'agora',
            minutesAgo: 0,
            score: 999,
            text: text,
          };

          this.responses.unshift(reply);
          this.metrics.respostas += 1;
          this.currentPost.metrics.comments = this.metrics.respostas;
          this.updateMetricValue('respostas', this.metrics.respostas, true);
          this.renderResponsesList(reply.id);
          this.syncPostCardUi();

          textarea.value = '';
          this.updateReplyInputState();
        },
renderResponsesList: function (newId) {
          var list = threadModalContent.querySelector('#threadResponsesList');
          if (!list) {
            return;
          }

          list.innerHTML = this.renderResponsesHtml(newId);

          Array.prototype.slice.call(list.querySelectorAll('.thread-profile-link')).forEach(function (link) {
            link.addEventListener('click', function (event) {
              event.preventDefault();
              openProfileRouteFromHandle(link.getAttribute('data-user') || '@usuario');
            });
          });
        },
updateMetricValue: function (key, value, withFlip) {
          var metric = threadModalContent.querySelector('[data-metric-key="' + key + '"]');
          if (!metric) {
            return;
          }

          var targetValue = Number(value);
          var initialValue = Number(metric.textContent);

          if (withFlip && Number.isFinite(initialValue) && Number.isFinite(targetValue) && initialValue !== targetValue) {
            var startTime = Date.now();
            var duration = 260;
            var direction = targetValue > initialValue ? 1 : -1;

            var timer = setInterval(function () {
              var elapsed = Date.now() - startTime;
              var progress = Math.min(elapsed / duration, 1);
              var next = initialValue + Math.round((targetValue - initialValue) * progress);

              if ((direction > 0 && next > targetValue) || (direction < 0 && next < targetValue)) {
                next = targetValue;
              }

              metric.textContent = String(next);

              if (progress >= 1) {
                clearInterval(timer);
              }
            }, 16);
          } else {
            metric.textContent = String(value);
          }

          if (withFlip) {
            metric.classList.add('flip');
            setTimeout(function () {
              metric.classList.remove('flip');
            }, 340);
          }
        },
getCurrentPostCard: function () {
          if (!feedList || !this.currentPost) {
            return null;
          }

          return feedList.querySelector('[data-post-id="' + this.currentPost.id + '"]');
        },
syncPostCardUi: function () {
          var card = this.getCurrentPostCard();

          if (!card || !this.currentPost) {
            return;
          }

          var commentsCount = card.querySelector('.action-comment .action-count');
          var repostCount = card.querySelector('.action-repost .action-count');
          var repostBtn = card.querySelector('.action-repost');
          var bookmarkBtn = card.querySelector('.action-bookmark');

          if (commentsCount) {
            commentsCount.textContent = String(this.currentPost.metrics.comments);
          }

          if (repostCount) {
            repostCount.textContent = String(this.currentPost.metrics.reposts);
          }

          if (repostBtn) {
            repostBtn.classList.toggle('active', !!this.currentPost.state.repost);
          }

          if (bookmarkBtn) {
            bookmarkBtn.classList.toggle('active', !!this.currentPost.state.bookmark);
          }
        }
});

Object.assign(ThreadModal, {
syncVoteMetrics: function () {
          if (!this.currentPost || !threadModalContent || typeof VoteSystem === 'undefined') {
            return;
          }

          var postId = this.currentPost.id;
          var counts = VoteSystem.getCounts(postId);
          var score = VoteSystem.getScore(postId);
          var scoreStr = score > 0 ? '+' + score : String(score);
          var scoreColor = score > 0 ? '#ff8a3d' : score < 0 ? '#4da3ff' : 'var(--color-text-muted)';

          var upsEl = threadModalContent.querySelector('.thread-vote-ups');
          var stablesEl = threadModalContent.querySelector('.thread-vote-stables');
          var downsEl = threadModalContent.querySelector('.thread-vote-downs');
          var scoreEl = threadModalContent.querySelector('.thread-vote-score');

          if (upsEl) { upsEl.textContent = String(counts.up); }
          if (stablesEl) { stablesEl.textContent = String(counts.stable); }
          if (downsEl) { downsEl.textContent = String(counts.down); }
          if (scoreEl) { scoreEl.textContent = scoreStr; scoreEl.style.color = scoreColor; }
        },
toggleThreadAction: function (button) {
          var action = button.getAttribute('data-thread-action');
          if (!action) {
            return;
          }

          if (action === 'comment') {
            var textarea = threadModalContent.querySelector('#threadReplyTextarea');
            if (textarea) {
              textarea.focus();
            }
            return;
          }

          if (action === 'share') {
            copyCurrentLinkToast('Link da thread pronto para compartilhar.');
            return;
          }

          if (action === 'repost') {
            this.actionState.repost = !this.actionState.repost;
            this.currentPost.state.repost = this.actionState.repost;
            button.classList.toggle('is-active', this.actionState.repost);
            button.classList.add('repost-spin');
            setTimeout(function () {
              button.classList.remove('repost-spin');
            }, 320);

            var repostLabel = button.querySelector('span');
            if (repostLabel) {
              repostLabel.textContent = this.actionState.repost ? 'Ecoado' : 'Ecoar';
            }

            this.metrics.ecos += this.actionState.repost ? 1 : -1;
            this.metrics.ecos = Math.max(0, this.metrics.ecos);
            this.currentPost.metrics.reposts = this.metrics.ecos;
            this.updateMetricValue('ecos', this.metrics.ecos, false);
            this.syncPostCardUi();
            return;
          }

          if (action === 'bookmark') {
            this.actionState.bookmark = !this.actionState.bookmark;
            this.currentPost.state.bookmark = this.actionState.bookmark;
            button.classList.toggle('is-active', this.actionState.bookmark);
            button.classList.add('bookmark-pop');
            setTimeout(function () {
              button.classList.remove('bookmark-pop');
            }, 260);

            var bookmarkLabel = button.querySelector('span');
            if (bookmarkLabel) {
              bookmarkLabel.textContent = this.actionState.bookmark ? 'Salvo' : 'Salvar';
            }

            this.syncPostCardUi();
          }
        },
openLightbox: function (src) {
          if (!threadLightbox || !threadLightboxImage || !src) {
            return;
          }

          threadLightboxImage.src = src;
          threadLightbox.classList.remove('is-hidden');
          requestAnimationFrame(function () {
            threadLightbox.classList.add('is-open');
          });
          threadLightbox.setAttribute('aria-hidden', 'false');
        },
closeLightbox: function () {
          if (!threadLightbox || threadLightbox.classList.contains('is-hidden')) {
            return;
          }

          threadLightbox.classList.remove('is-open');
          threadLightbox.setAttribute('aria-hidden', 'true');

          setTimeout(function () {
            threadLightbox.classList.add('is-hidden');
            if (threadLightboxImage) {
              threadLightboxImage.src = '';
            }
          }, 180);
        }
});
