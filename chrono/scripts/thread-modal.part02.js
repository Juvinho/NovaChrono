'use strict';

Object.assign(ThreadModal, {
render: function () {
          if (!threadModalContent || !this.currentPost || !this.currentTimestamp) {
            return;
          }

          var followClass = this.following ? 'is-following' : '';
          var followText = this.following ? 'Seguindo' : 'Seguir';
          var timestampText = this.formatFullTimestamp(this.currentTimestamp);
          var timestampIso = this.currentTimestamp.toISOString();
          var imageHtml = this.currentPost.image
            ? '<img class="thread-main-image" src="' + this.currentPost.image + '" alt="Imagem do post" data-lightbox-src="' + this.currentPost.image + '">'
            : '';

          threadModalContent.innerHTML = (
            this.renderParentHtml() +
            '<section class="thread-main-post">' +
              '<header class="thread-main-head">' +
                '<img class="thread-main-avatar" src="' + this.currentPost.avatar + '" alt="Avatar ' + this.currentPost.user + '">' +
                '<div class="thread-main-user">' +
                  '<div class="thread-main-user-line"><a href="#" class="thread-response-handle thread-profile-link" data-user="' + this.currentPost.user + '">' + this.currentPost.user + '</a>' + (this.currentPost.verified ? '<span class="verified-dot" aria-hidden="true"></span>' : '') + '</div>' +
                  '<div class="thread-display-name">' + escapeHtml(handleToDisplayName(this.currentPost.user)) + '</div>' +
                '</div>' +
                '<button type="button" class="thread-follow-btn ' + followClass + '" id="threadFollowBtn">' + followText + '</button>' +
              '</header>' +
              '<p class="thread-main-text">' + formatThreadText(this.currentPost.text) + '</p>' +
              imageHtml +
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
          var followBtn = threadModalContent.querySelector('#threadFollowBtn');
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

          if (followBtn) {
            followBtn.addEventListener('click', function () {
              self.following = !self.following;
              followBtn.classList.toggle('is-following', self.following);
              followBtn.textContent = self.following ? 'Seguindo' : 'Seguir';
            });

            followBtn.addEventListener('mouseenter', function () {
              if (self.following) {
                followBtn.textContent = 'Deixar de seguir';
              }
            });

            followBtn.addEventListener('mouseleave', function () {
              if (self.following) {
                followBtn.textContent = 'Seguindo';
              }
            });
          }

          Array.prototype.slice.call(threadModalContent.querySelectorAll('.thread-main-image')).forEach(function (image) {
            image.addEventListener('click', function () {
              self.openLightbox(image.getAttribute('data-lightbox-src'));
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
