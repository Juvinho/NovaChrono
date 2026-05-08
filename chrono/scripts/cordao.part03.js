'use strict';

var CordaoView = {
        activeSlug: '',
        lastInsertedPostId: '',
        initialized: false,

        init: function () {
          if (this.initialized) {
            return;
          }

          this.initialized = true;

          if (cordaoFeedList) {
            var self = this;
            cordaoFeedList.addEventListener('click', function (event) {
              var action = event.target.closest('[data-cordao-empty-action="publish"]');
              if (!action) {
                return;
              }

              self.focusComposer();
            });
          }

          var selfRef = this;
          CordaoStore.subscribe(function () {
            if (AppRouter && AppRouter.currentView === 'cordao') {
              selfRef.render(selfRef.activeSlug, { preserveInput: true });
            }
          });
        },

        focusComposer: function () {
          if (!cordaoComposerCard) {
            return;
          }

          var textarea = cordaoComposerCard.querySelector('#cordaoComposerTextarea');
          if (textarea) {
            textarea.focus();
          }
        },

        renderHeader: function () {
          if (!cordaoHeaderCard || !this.activeSlug) {
            return;
          }

          var postsCount = CordaoStore.getPostsByCordao(this.activeSlug).length;
          var postsLabel = postsCount === 1 ? 'post recente' : 'posts recentes';

          cordaoHeaderCard.innerHTML = (
            '<p class="cordao-breadcrumb">Cordoes / ' + displayCordao(this.activeSlug) + '</p>' +
            '<h2 class="cordao-title">' + displayCordao(this.activeSlug) + '</h2>' +
            '<p class="cordao-subtitle">Linha tematica em tempo real</p>' +
            '<div class="cordao-metrics">' + postsCount + ' ' + postsLabel + ' / Atualizado agora</div>'
          );
        },

        renderComposer: function (draftText) {
          if (!cordaoComposerCard || !this.activeSlug) {
            return;
          }

          var avatar = (AppState && AppState.profile && AppState.profile.avatar) || 'https://picsum.photos/seed/juvinho-compose/64/64';

          cordaoComposerCard.innerHTML = (
            '<div class="cordao-composer-top">' +
              '<img class="cordao-composer-avatar" src="' + avatar + '" alt="Avatar do usuario logado">' +
              '<label style="display:block; width:100%;">' +
                '<span class="sr-only" style="position:absolute;left:-9999px;">Postar no cordao</span>' +
                '<textarea id="cordaoComposerTextarea" class="cordao-composer-textarea" placeholder="Postar em ' + displayCordao(this.activeSlug) + '..."></textarea>' +
              '</label>' +
            '</div>' +
            '<p id="cordaoComposerError" class="cordao-modal-error" role="alert"></p>' +
            '<div class="cordao-composer-bottom">' +
              '<span class="cordao-pill">' + displayCordao(this.activeSlug) + '</span>' +
              '<button id="cordaoComposerPublish" class="publish-btn" type="button" disabled>Publicar</button>' +
            '</div>'
          );

          var textarea = cordaoComposerCard.querySelector('#cordaoComposerTextarea');
          var publish = cordaoComposerCard.querySelector('#cordaoComposerPublish');
          var error = cordaoComposerCard.querySelector('#cordaoComposerError');
          var self = this;

          function updateComposerState() {
            if (!textarea || !publish) {
              return;
            }

            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 220) + 'px';
            publish.disabled = !textarea.value.trim();

            if (textarea.value.trim()) {
              textarea.classList.remove('is-error');
              if (error) {
                error.textContent = '';
              }
            }
          }

          if (textarea) {
            textarea.value = String(draftText || '');
            textarea.addEventListener('input', updateComposerState);
          }

          if (publish) {
            publish.addEventListener('click', function () {
              var content = String(textarea && textarea.value ? textarea.value : '').trim();

              if (!content) {
                if (error) {
                  error.textContent = 'Escreva algo antes de publicar.';
                }
                if (textarea) {
                  textarea.classList.add('is-error');
                  textarea.focus();
                }
                return;
              }

              var newPost = CordaoStore.createPostInCordao({
                content: content,
                cordao: self.activeSlug,
                author: getProfileHandleValue(),
                avatar: (AppState && AppState.profile && AppState.profile.avatar) || '',
                verified: true,
                createdAt: Date.now()
              });

              if (!newPost) {
                return;
              }

              self.lastInsertedPostId = newPost.id;
              prependPostToFeed(newPost, 'cordao-view');

              if (textarea) {
                textarea.value = '';
                textarea.classList.remove('is-error');
              }

              if (error) {
                error.textContent = '';
              }

              updateComposerState();
              showAppToast('Post publicado em ' + displayCordao(self.activeSlug));
              self.render(self.activeSlug);
            });
          }

          updateComposerState();
        },

        decorateFeedCards: function () {
          var self = this;
          if (!cordaoFeedList || !self.activeSlug) {
            return;
          }

          Array.prototype.slice.call(cordaoFeedList.querySelectorAll('.post-card .post-head')).forEach(function (head) {
            if (!head || head.querySelector('.cordao-card-tag')) {
              return;
            }

            var tagEl = document.createElement('span');
            tagEl.className = 'cordao-card-tag';
            tagEl.textContent = displayCordao(self.activeSlug);
            head.appendChild(tagEl);
          });
        },

        renderFeed: function () {
          if (!cordaoFeedList || !this.activeSlug) {
            return;
          }

          var self = this;
          var posts = CordaoStore.getPostsByCordao(this.activeSlug);

          if (!posts.length) {
            cordaoFeedList.innerHTML = (
              '<article class="cordao-empty">' +
                '<h4>Ainda nao ha publicacoes nesse cordao.</h4>' +
                '<p>Seja o primeiro a puxar essa linha.</p>' +
                '<button class="cordao-modal-btn publish" type="button" data-cordao-empty-action="publish">Publicar agora</button>' +
              '</article>'
            );
            return;
          }

          cordaoFeedList.innerHTML = posts.map(function (post, index) {
            return renderPost(post, index, {
              source: 'cordao-view',
              newPostId: self.lastInsertedPostId
            });
          }).join('');

          this.lastInsertedPostId = '';
          this.decorateFeedCards();
          animatePollBars();
          safeIconRefresh();
          VoteSystem.syncAllCards();
        },

        render: function (slug, options) {
          options = options || {};

          var safeSlug = toCordaoSlug(slug) || CordaoRouter.activeSlug || CordaoRouter.getFallbackSlug();
          if (!safeSlug) {
            return;
          }

          this.activeSlug = safeSlug;
          CordaoRouter.activeSlug = safeSlug;
          SidebarCordoes.setActiveSlug(safeSlug);

          var currentDraft = '';
          if (options.preserveInput && cordaoComposerCard) {
            var currentField = cordaoComposerCard.querySelector('#cordaoComposerTextarea');
            currentDraft = currentField ? currentField.value : '';
          }

          this.renderHeader();
          this.renderComposer(currentDraft);
          this.renderFeed();
        }
      };
