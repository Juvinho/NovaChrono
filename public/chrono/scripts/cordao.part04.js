'use strict';

var CordaoModal = {
        isOpen: false,
        closeTimer: null,
        quickSuggestions: ['$chrono', '$artedistopica', '$railway', '$ossodemais'],

        init: function () {
          if (!cordaoModalOverlay || !cordaoModal) {
            return;
          }

          this.renderSuggestionChips();
          this.bindEvents();
          this.syncUserPreview();
          this.resetForm();
        },

        syncUserPreview: function () {
          var handle = getProfileHandleValue();
          var displayName = (AppState && AppState.profile && AppState.profile.displayName) || 'Chrono User';
          var avatar = (AppState && AppState.profile && AppState.profile.avatar) || 'https://picsum.photos/seed/juvinho-compose/64/64';

          if (cordaoModalUserName) {
            cordaoModalUserName.textContent = displayName;
          }

          if (cordaoModalUserHandle) {
            cordaoModalUserHandle.textContent = handle;
          }

          if (cordaoModalUserAvatar) {
            cordaoModalUserAvatar.src = avatar;
            cordaoModalUserAvatar.alt = 'Avatar ' + handle;
          }
        },

        renderSuggestionChips: function () {
          if (!cordaoModalChips) {
            return;
          }

          var fromStore = CordaoStore.getCordoes().slice(0, 6).map(function (item) {
            return displayCordao(item.slug);
          });

          var merged = this.quickSuggestions.concat(fromStore).reduce(function (acc, current) {
            var normalized = displayCordao(current);
            if (acc.indexOf(normalized) === -1 && normalized !== '$') {
              acc.push(normalized);
            }
            return acc;
          }, []).slice(0, 6);

          cordaoModalChips.innerHTML = merged.map(function (tag) {
            return '<button class="cordao-chip" type="button" data-cordao-chip="' + toCordaoSlug(tag) + '">' + tag + '</button>';
          }).join('');
        },

        sanitizeCordaoInput: function (value) {
          var raw = String(value || '');
          var normalized = normalizeCordao(raw);

          if (!normalized && /^[#$]/.test(raw.trim())) {
            return '$';
          }

          return normalized;
        },

        setError: function (message, fieldKey) {
          if (cordaoModalError) {
            cordaoModalError.textContent = String(message || '');
          }

          if (cordaoModalTextarea) {
            cordaoModalTextarea.classList.toggle('is-error', fieldKey === 'content');
          }

          if (cordaoModalInput) {
            cordaoModalInput.classList.toggle('is-error', fieldKey === 'cordao');
          }
        },

        updateCounter: function () {
          if (!cordaoModalCounter || !cordaoModalTextarea) {
            return;
          }

          cordaoModalCounter.textContent = cordaoModalTextarea.value.length + '/280';
        },

        updatePublishState: function () {
          if (!cordaoModalPublish || !cordaoModalTextarea || !cordaoModalInput) {
            return;
          }

          var hasContent = !!String(cordaoModalTextarea.value || '').trim();
          var hasCordao = !!toCordaoSlug(cordaoModalInput.value);
          cordaoModalPublish.disabled = !(hasContent && hasCordao);
        },

        autoExpandTextarea: function () {
          if (!cordaoModalTextarea) {
            return;
          }

          cordaoModalTextarea.style.height = 'auto';
          cordaoModalTextarea.style.height = Math.min(cordaoModalTextarea.scrollHeight, 260) + 'px';
        },

        resetForm: function () {
          if (cordaoModalTextarea) {
            cordaoModalTextarea.value = '';
            cordaoModalTextarea.classList.remove('is-error');
            cordaoModalTextarea.style.height = '120px';
          }

          if (cordaoModalInput) {
            cordaoModalInput.value = '';
            cordaoModalInput.classList.remove('is-error');
          }

          this.setError('', '');
          this.updateCounter();
          this.updatePublishState();
        },

        open: function (prefillSlug) {
          if (!cordaoModalOverlay) {
            return;
          }

          this.syncUserPreview();
          this.renderSuggestionChips();
          this.resetForm();

          var safePrefill = toCordaoSlug(prefillSlug);
          if (safePrefill && cordaoModalInput) {
            cordaoModalInput.value = displayCordao(safePrefill);
          }

          this.updatePublishState();
          this.isOpen = true;

          clearTimeout(this.closeTimer);
          cordaoModalOverlay.classList.remove('is-hidden');
          cordaoModalOverlay.setAttribute('aria-hidden', 'false');

          requestAnimationFrame(function () {
            cordaoModalOverlay.classList.add('is-open');
          });

          if (cordaoModalTextarea) {
            cordaoModalTextarea.focus();
          }
        },

        close: function () {
          var self = this;

          if (!cordaoModalOverlay || !this.isOpen) {
            return;
          }

          this.isOpen = false;
          cordaoModalOverlay.classList.remove('is-open');
          cordaoModalOverlay.setAttribute('aria-hidden', 'true');

          clearTimeout(this.closeTimer);
          this.closeTimer = setTimeout(function () {
            cordaoModalOverlay.classList.add('is-hidden');
            self.resetForm();
          }, 170);
        },

        submit: function () {
          var content = String(cordaoModalTextarea && cordaoModalTextarea.value ? cordaoModalTextarea.value : '').trim();
          var slug = toCordaoSlug(cordaoModalInput && cordaoModalInput.value ? cordaoModalInput.value : '');

          if (!slug) {
            this.setError('Voce precisa escolher um cordao para publicar.', 'cordao');
            if (cordaoModalInput) {
              cordaoModalInput.focus();
            }
            this.updatePublishState();
            return;
          }

          if (!content) {
            this.setError('Escreva algo antes de publicar.', 'content');
            if (cordaoModalTextarea) {
              cordaoModalTextarea.focus();
            }
            this.updatePublishState();
            return;
          }

          this.setError('', '');

          var newPost = CordaoStore.createPostInCordao({
            content: content,
            cordao: slug,
            author: getProfileHandleValue(),
            avatar: (AppState && AppState.profile && AppState.profile.avatar) || '',
            verified: true,
            createdAt: Date.now()
          });

          if (!newPost) {
            return;
          }

          CordaoView.lastInsertedPostId = newPost.id;
          prependPostToFeed(newPost, 'cordao-modal');
          this.close();
          showAppToast('Post publicado em ' + displayCordao(slug));
          CordaoRouter.navigateToSlug(slug);
        },

        bindEvents: function () {
          var self = this;

          if (cordaoModalClose) {
            cordaoModalClose.addEventListener('click', function () {
              self.close();
            });
          }

          if (cordaoModalCancel) {
            cordaoModalCancel.addEventListener('click', function () {
              self.close();
            });
          }

          if (cordaoModalPublish) {
            cordaoModalPublish.addEventListener('click', function () {
              self.submit();
            });
          }

          if (cordaoModalOverlay) {
            cordaoModalOverlay.addEventListener('click', function (event) {
              if (event.target === cordaoModalOverlay) {
                self.close();
              }
            });
          }

          if (cordaoModalTextarea) {
            cordaoModalTextarea.addEventListener('input', function () {
              self.updateCounter();
              self.autoExpandTextarea();
              self.setError('', '');
              self.updatePublishState();
            });
          }

          if (cordaoModalInput) {
            cordaoModalInput.addEventListener('input', function () {
              cordaoModalInput.value = self.sanitizeCordaoInput(cordaoModalInput.value);
              self.setError('', '');
              self.updatePublishState();
            });

            cordaoModalInput.addEventListener('blur', function () {
              if (!cordaoModalInput.value.trim()) {
                cordaoModalInput.value = '';
                return;
              }

              cordaoModalInput.value = normalizeCordao(cordaoModalInput.value);
              self.updatePublishState();
            });
          }

          if (cordaoModalChips) {
            cordaoModalChips.addEventListener('click', function (event) {
              var chip = event.target.closest('[data-cordao-chip]');
              if (!chip || !cordaoModalInput) {
                return;
              }

              var slug = toCordaoSlug(chip.getAttribute('data-cordao-chip'));
              cordaoModalInput.value = displayCordao(slug);
              self.setError('', '');
              self.updatePublishState();
              cordaoModalInput.focus();
            });
          }

          document.addEventListener('keydown', function (event) {
            if (!self.isOpen || event.key !== 'Escape') {
              return;
            }

            self.close();
          });
        }
      };
