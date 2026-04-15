'use strict';

Object.assign(ThreadModal, {
render: function () {
          if (!threadModalContent || !this.currentPost || !this.currentTimestamp) {
            return;
          }

          var timestampText = this.formatFullTimestamp(this.currentTimestamp);
          var timestampIso = this.currentTimestamp.toISOString();
          var mainPostCardHtml = renderPost(this.currentPost, 0, { source: 'thread-modal' });
          mainPostCardHtml = mainPostCardHtml.replace('class="post-card', 'class="post-card thread-main-card');

          threadModalContent.innerHTML = (
            this.renderParentHtml() +
            '<section class="thread-main-post thread-main-post-card">' +
              mainPostCardHtml +
              '<p class="thread-main-meta"><time title="' + timestampIso + '">' + timestampText + '</time> ┬À <span class="source">Chrono Web</span></p>' +
            '</section>' +
            this.renderMetricsHtml() +
            this.renderActionsHtml() +
            '<section class="thread-reply-box">' +
              '<img class="thread-reply-avatar" src="https://picsum.photos/seed/juvinho-reply/60/60" alt="Avatar @Juvinho">' +
              '<div class="thread-reply-main">' +
                '<textarea id="threadReplyTextarea" class="thread-reply-textarea" placeholder="Responda ' + this.currentPost.user + '..."></textarea>' +
                '<div class="thread-reply-footer">' +
                  '<div class="thread-reply-tools">' +
                    '<button type="button" aria-label="Adicionar imagem"><i data-lucide="image"></i></button>' +
                    '<button type="button" aria-label="Criar enquete"><i data-lucide="bar-chart-2"></i></button>' +
                    '<button type="button" aria-label="Adicionar emoji"><i data-lucide="smile"></i></button>' +
                  '</div>' +
                  '<div class="thread-reply-right">' +
                    '<span id="threadCharCount" class="thread-char-count"></span>' +
                    '<button type="button" id="threadReplySend" class="thread-reply-send" disabled>Responder</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</section>' +
            '<section class="thread-divider">' +
              '<span class="thread-divider-title">Respostas</span>' +
              '<span class="thread-divider-line" aria-hidden="true"></span>' +
              '<button type="button" id="threadSortBtn" class="thread-sort-btn"><span>' + this.sortModes[this.sortIndex] + '</span><i data-lucide="chevron-down"></i></button>' +
            '</section>' +
            '<ul id="threadResponsesList" class="thread-responses">' + this.renderResponsesHtml() + '</ul>'
          );

          safeIconRefresh();
          this.bindContentControls();
        },
bindContentControls: function () {
          var self = this;
          var sortBtn = threadModalContent.querySelector('#threadSortBtn');
          var replyTextarea = threadModalContent.querySelector('#threadReplyTextarea');
          var replySend = threadModalContent.querySelector('#threadReplySend');

          Array.prototype.slice.call(threadModalContent.querySelectorAll('.thread-profile-link')).forEach(function (link) {
            link.addEventListener('click', function (event) {
              event.preventDefault();
              event.stopPropagation();
              openProfileRouteFromHandle(link.getAttribute('data-user') || '@usuario');
            });
          });

          Array.prototype.slice.call(threadModalContent.querySelectorAll('[data-thread-link="tag"]')).forEach(function (link) {
            link.addEventListener('click', function (event) {
              event.preventDefault();
              openHashtagFeed(link.getAttribute('data-tag') || '');
            });
          });

          Array.prototype.slice.call(threadModalContent.querySelectorAll('[data-thread-link="mention"]')).forEach(function (link) {
            link.addEventListener('click', function (event) {
              event.preventDefault();
              openProfileRouteFromHandle(link.getAttribute('data-user') || '@usuario');
            });
          });

          var parentBox = threadModalContent.querySelector('[data-thread-parent="true"]');
          if (parentBox) {
            parentBox.addEventListener('click', function () {
              if (typeof showAppToast === 'function') {
                showAppToast('Thread pai indisponivel nesta demo.');
              }
            });
          }

          Array.prototype.slice.call(threadModalContent.querySelectorAll('.post-card .post-image')).forEach(function (image) {
            image.addEventListener('click', function () {
              self.openLightbox(image.getAttribute('src'));
            });
          });

          Array.prototype.slice.call(threadModalContent.querySelectorAll('.post-card .action-btn')).forEach(function (btn) {
            btn.addEventListener('click', function () {
              var action = btn.getAttribute('data-action');

              if (action === 'comment') {
                var textarea = threadModalContent.querySelector('#threadReplyTextarea');
                if (textarea) {
                  setTimeout(function () {
                    textarea.focus();
                  }, 0);
                }
              }

              if (typeof self.syncMainCardMetrics === 'function') {
                setTimeout(function () {
                  self.syncMainCardMetrics();
                }, 0);
              }
            });
          });

          Array.prototype.slice.call(threadModalContent.querySelectorAll('[data-thread-action]')).forEach(function (btn) {
            btn.addEventListener('click', function () {
              self.toggleThreadAction(btn);
            });
          });

          if (sortBtn) {
            sortBtn.addEventListener('click', function () {
              self.sortIndex = (self.sortIndex + 1) % self.sortModes.length;
              var label = sortBtn.querySelector('span');
              if (label) {
                label.textContent = self.sortModes[self.sortIndex];
              }
              self.renderResponsesList();
            });
          }

          Array.prototype.slice.call(threadModalContent.querySelectorAll('.thread-metric')).forEach(function (metric) {
            metric.addEventListener('click', function (event) {
              event.preventDefault();
            });
          });

          if (replyTextarea) {
            if (window.registerTextareaForAutocomplete) {
              window.registerTextareaForAutocomplete(replyTextarea);
            }

            replyTextarea.addEventListener('click', function (event) {
              event.stopPropagation();
            });

            replyTextarea.addEventListener('input', function () {
              self.updateReplyInputState();
            });

            self.updateReplyInputState();
          }

          if (replySend) {
            replySend.addEventListener('click', function () {
              self.submitReply();
            });
          }
        }
});
