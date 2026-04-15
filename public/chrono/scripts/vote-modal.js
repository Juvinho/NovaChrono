'use strict';

var VoteModal = (function () {
        var activePostId = '';
        var triggerElement = null;
        var initialized = false;
        var isOpen = false;

        var optionMeta = {
          up: {
            title: 'Upvote',
            desc: 'Valoriza a contribuicao deste post.',
            icon: 'chevron-up',
            className: 'vote-option-up'
          },
          down: {
            title: 'Downvote',
            desc: 'Sinaliza que o conteudo nao agregou.',
            icon: 'chevron-down',
            className: 'vote-option-down'
          }
        };

        function getVoteState() {
          if (!activePostId || typeof VoteSystem === 'undefined' || !VoteSystem || typeof VoteSystem.getState !== 'function') {
            return { userVote: null };
          }

          return VoteSystem.getState(activePostId);
        }

        function getVoteCounts() {
          if (!activePostId || typeof VoteSystem === 'undefined' || !VoteSystem || typeof VoteSystem.getCounts !== 'function') {
            return { up: 0, down: 0 };
          }

          return VoteSystem.getCounts(activePostId);
        }

        function renderHeader(post) {
          if (!voteModalHeader) {
            return;
          }

          var handle = (post && post.user) ? post.user : '@Chrono';
          var text = (post && post.text) ? post.text : 'Selecione a acao de voto para este post.';

          voteModalHeader.innerHTML = (
            '<div>' +
              '<h3 id="vote-modal-title" class="vote-modal-title">Votar em ' + escapeHtml(handle) + '</h3>' +
              '<p class="vote-modal-subtitle">' + escapeHtml(text) + '</p>' +
            '</div>' +
            '<button class="vote-modal-close" type="button" data-vote-close="true" aria-label="Fechar modal de voto">' +
              '<i data-lucide="x"></i>' +
            '</button>'
          );
        }

        function renderBody() {
          if (!voteModalBody) {
            return;
          }

          var counts = getVoteCounts();
          var state = getVoteState();

          voteModalBody.innerHTML = ['up', 'down'].map(function (type) {
            var meta = optionMeta[type];
            var count = counts[type] || 0;
            var activeClass = state.userVote === type ? ' is-active' : '';

            return (
              '<button class="vote-option ' + meta.className + activeClass + '" type="button" data-vote-type="' + type + '">' +
                '<span class="vote-option-icon"><i data-lucide="' + meta.icon + '"></i></span>' +
                '<span class="vote-option-text">' +
                  '<strong class="vote-option-title">' + meta.title + '</strong>' +
                  '<span class="vote-option-desc">' + meta.desc + '</span>' +
                '</span>' +
                '<span class="vote-option-count">' + count + '</span>' +
                '<span class="vote-option-indicator" aria-hidden="true"></span>' +
              '</button>'
            );
          }).join('');
        }

        function renderFooter() {
          if (!voteModalFooter) {
            return;
          }

          voteModalFooter.innerHTML = (
            '<button type="button" class="btn-subtle" data-vote-clear="true">Limpar voto</button>' +
            '<button type="button" class="btn-primary" data-vote-close="true">Fechar</button>'
          );
        }

        function render() {
          var post = activePostId ? getPostById(activePostId) : null;
          renderHeader(post);
          renderBody();
          renderFooter();
          safeIconRefresh();
        }

        function close() {
          if (!voteModalOverlay || !isOpen) {
            return;
          }

          voteModalOverlay.classList.remove('is-open');
          voteModalOverlay.classList.add('is-closing');
          voteModalOverlay.setAttribute('aria-hidden', 'true');

          setTimeout(function () {
            voteModalOverlay.classList.remove('is-closing');
            voteModalOverlay.classList.add('is-hidden');
          }, 160);

          isOpen = false;

          if (triggerElement && typeof triggerElement.focus === 'function') {
            triggerElement.focus();
          }
        }

        function open(postId, opener) {
          if (!voteModalOverlay || !voteModal) {
            return;
          }

          activePostId = String(postId || '').trim();
          if (!activePostId) {
            return;
          }

          triggerElement = opener || document.activeElement;
          render();

          voteModalOverlay.classList.remove('is-hidden', 'is-closing');
          voteModalOverlay.classList.add('is-open');
          voteModalOverlay.setAttribute('aria-hidden', 'false');
          isOpen = true;

          if (typeof voteModal.focus === 'function') {
            voteModal.focus();
          }
        }

        function bindModalActions() {
          if (!voteModal) {
            return;
          }

          voteModal.addEventListener('click', function (event) {
            var closeBtn = event.target.closest('[data-vote-close="true"]');
            if (closeBtn) {
              event.preventDefault();
              close();
              return;
            }

            var clearBtn = event.target.closest('[data-vote-clear="true"]');
            if (clearBtn) {
              event.preventDefault();

              if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.clearVote === 'function' && activePostId) {
                VoteSystem.clearVote(activePostId);
              }

              render();
              return;
            }

            var voteOption = event.target.closest('[data-vote-type]');
            if (!voteOption || !activePostId) {
              return;
            }

            event.preventDefault();

            if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.toggleQuickVote === 'function') {
              VoteSystem.toggleQuickVote(activePostId, voteOption.getAttribute('data-vote-type'));
            }

            if (typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.flashCluster === 'function') {
              VoteSystem.flashCluster(activePostId);
            }

            render();
          });
        }

        function init() {
          if (initialized) {
            return;
          }

          initialized = true;

          if (!voteModalOverlay || !voteModal) {
            return;
          }

          bindModalActions();

          voteModalOverlay.addEventListener('click', function (event) {
            if (event.target === voteModalOverlay) {
              close();
            }
          });

          document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen) {
              close();
            }
          });
        }

        return {
          init: init,
          open: open,
          close: close
        };
      })();
