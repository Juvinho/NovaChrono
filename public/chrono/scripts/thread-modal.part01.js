'use strict';

var ThreadModal = {};

Object.assign(ThreadModal, {
isOpen: false,
currentPost: null,
currentTimestamp: null,
parentPost: null,
responses: [],
sortModes: ['Relevantes', 'Recentes', 'Antigos'],
sortIndex: 0,
actionState: null,
metrics: null,
following: false,
init: function () {
          var self = this;

          if (threadBackBtn) {
            threadBackBtn.addEventListener('click', function (event) {
              event.preventDefault();
              self.close();
            });
          }

          if (threadShareBtn) {
            threadShareBtn.addEventListener('click', function () {
              copyCurrentLinkToast('Link da thread pronto para compartilhar.');
            });
          }

          if (threadModalOverlay) {
            threadModalOverlay.addEventListener('click', function (event) {
              if (event.target === threadModalOverlay) {
                self.close();
              }
            });
          }

          if (threadLightboxClose) {
            threadLightboxClose.addEventListener('click', function () {
              self.closeLightbox();
            });
          }

          if (threadLightbox) {
            threadLightbox.addEventListener('click', function (event) {
              if (event.target === threadLightbox) {
                self.closeLightbox();
              }
            });
          }

          document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') {
              return;
            }

            if (threadLightbox && threadLightbox.classList.contains('is-open')) {
              self.closeLightbox();
              return;
            }

            if (self.isOpen) {
              self.close();
            }
          });
        },
open: function (postId) {
          var post = postStore.find(function (item) {
            return item.id === postId;
          });

          if (!post || !threadModalOverlay || !threadModalContent) {
            return;
          }

          this.currentPost = post;
          this.currentTimestamp = this.createTimestamp(post);
          this.parentPost = this.createParent(post);
          this.responses = this.createMockReplies(post);
          this.sortIndex = 0;
          this.following = !!post.following;
          this.actionState = {
            repost: !!post.state.repost,
            bookmark: !!post.state.bookmark,
          };
          this.metrics = {
            ecos: post.metrics.reposts,
            respostas: Math.max(post.metrics.comments, this.responses.length),
            views: (post.metrics.comments + post.metrics.reposts + 1) * 40,
          };

          this.render();
          this.isOpen = true;

          threadModalOverlay.classList.remove('is-hidden', 'is-closing');
          requestAnimationFrame(function () {
            threadModalOverlay.classList.add('is-open');
          });

          document.body.style.overflow = 'hidden';
        },
close: function () {
          if (!this.isOpen || !threadModalOverlay) {
            return;
          }

          this.closeLightbox();
          this.isOpen = false;

          threadModalOverlay.classList.remove('is-open');
          threadModalOverlay.classList.add('is-closing');

          setTimeout(function () {
            threadModalOverlay.classList.add('is-hidden');
            threadModalOverlay.classList.remove('is-closing');
          }, 200);

          document.body.style.overflow = '';
        },
createTimestamp: function (post) {
          var hash = seededHash(post.id + '-thread-ts');
          var date = new Date(2026, 3, 1, 0, 0, 0, 0);
          date.setDate((hash % 28) + 1);
          date.setHours(hash % 24);
          date.setMinutes(hash % 60);
          return date;
        },
formatFullTimestamp: function (date) {
          var months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          var hh = String(date.getHours()).padStart(2, '0');
          var mm = String(date.getMinutes()).padStart(2, '0');
          return hh + ':' + mm + ' ┬À ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear();
        },
createParent: function (post) {
          var hasParent = (seededHash(post.id + '-parent') % 2) === 0;
          if (!hasParent) {
            return null;
          }

          var handles = ['@metro_fantasma', '@viga_noite', '@esquina_42', '@satelite_urbano', '@cuberta_dobrada'];
          var texts = [
            'O sinal antigo voltou por 13 segundos. Tem algo sincronizando as torres da zona oeste.',
            'Consegui mapear duas rotas seguras pela madrugada, mas ainda nao confiem no trecho da estacao.',
            'A janela do predio central ficou acesa ate 4h. Ninguem entrou e ninguem saiu.',
            'Atualizei o mural colaborativo com os relatos da ponte e da avenida leste.',
            'Se voce ouvir o apito curto, nao atravesse a passarela. Espera cinco minutos.'
          ];

          var index = seededHash(post.id + '-parent-content') % handles.length;
          return {
            user: handles[index],
            time: 'ha ' + (1 + (seededHash(post.id + '-parent-time') % 8)) + ' h',
            text: texts[index],
            avatar: 'https://picsum.photos/seed/' + post.id + '-parent/72/72',
          };
        }
});

Object.assign(ThreadModal, {
createMockReplies: function (post) {
          var rng = seededRandom(post.id + '-replies');
          var count = 4 + Math.floor(rng() * 3);
          var handles = ['@nebula_core', '@pixel_ghost', '@iron_silva', '@sus_bacon', '@byte_favela', '@orbital_zero', '@cuberta_dobrada'];
          var messages = [
            'Eu vi a mesma coisa perto da estacao. Parece que o padrao se repete toda noite.',
            'Conferi os logs aqui e bate com o horario que voce postou.',
            'A rua ficou sem sinal 2 minutos antes disso acontecer.',
            'Se isso continuar, precisamos abrir um cordao so para monitorar.',
            'Tenho video desse trecho, vou subir daqui a pouco.',
            'No meu bairro tambem aconteceu, mas com 10 minutos de atraso.',
            'Isso explica porque o mapa colaborativo mudou de cor agora cedo.'
          ];
          var replies = [];
          var i;

          for (i = 0; i < count; i += 1) {
            var handle = handles[Math.floor(rng() * handles.length)];
            var text = messages[Math.floor(rng() * messages.length)];
            var minutesAgo = 1 + Math.floor(rng() * 50);
            replies.push({
              id: post.id + '-reply-' + i,
              user: handle,
              avatar: 'https://picsum.photos/seed/' + post.id + '-reply-avatar-' + i + '/68/68',
              time: 'ha ' + minutesAgo + ' min',
              minutesAgo: minutesAgo,
              score: 20 + Math.floor(rng() * 80),
              text: text,
            });
          }

          return replies;
        },
renderParentHtml: function () {
          if (!this.parentPost) {
            return '';
          }

          return (
            '<article class="thread-parent-box" data-thread-parent="true">' +
              '<div class="thread-parent-left">' +
                '<img class="thread-parent-avatar" src="' + this.parentPost.avatar + '" alt="Avatar ' + this.parentPost.user + '">' +
                '<span class="thread-parent-line" aria-hidden="true"></span>' +
              '</div>' +
              '<div class="thread-parent-main">' +
                '<div class="thread-parent-head"><a href="#" class="handle thread-profile-link" data-user="' + this.parentPost.user + '">' + this.parentPost.user + '</a><span>ÔÇó</span><span>' + this.parentPost.time + '</span></div>' +
                '<p class="thread-parent-text">' + escapeHtml(this.parentPost.text) + '</p>' +
              '</div>' +
            '</article>'
          );
        },
renderMetricsHtml: function () {
          var postId = this.currentPost ? this.currentPost.id : '';
          var counts = (postId && typeof VoteSystem !== 'undefined') ? VoteSystem.getCounts(postId) : { up: 0, down: 0 };
          var score = (postId && typeof VoteSystem !== 'undefined') ? VoteSystem.getScore(postId) : 0;
          var scoreStr = score > 0 ? '+' + score : String(score);
          var scoreColor = score > 0 ? '#ff8a3d' : score < 0 ? '#4da3ff' : 'var(--color-text-muted)';
          return (
            '<section class="thread-metrics-bar">' +
              '<a href="#" class="thread-metric" title="Ver quem ecoou"><span class="metric-value" data-metric-key="ecos">' + this.metrics.ecos + '</span><span class="metric-label">Ecos</span></a>' +
              '<span class="thread-metric"><span class="metric-value thread-vote-ups" style="color:#ff8a3d">' + counts.up + '</span><span class="metric-label">Upvotos</span></span>' +
              '<span class="thread-metric"><span class="metric-value thread-vote-downs" style="color:#4da3ff">' + counts.down + '</span><span class="metric-label">Downvotos</span></span>' +
              '<span class="thread-metric"><span class="metric-value thread-vote-score" style="color:' + scoreColor + '">' + scoreStr + '</span><span class="metric-label">Pontuacao</span></span>' +
              '<a href="#" class="thread-metric" title="Ver respostas"><span class="metric-value" data-metric-key="respostas">' + this.metrics.respostas + '</span><span class="metric-label">Respostas</span></a>' +
              '<a href="#" class="thread-metric" title="Visualizacoes"><span class="metric-value" data-metric-key="views">' + this.metrics.views + '</span><span class="metric-label">Visualizacoes</span></a>' +
            '</section>'
          );
        },
renderActionsHtml: function () {
          var repostLabel = this.actionState.repost ? 'Ecoado' : 'Ecoar';
          var bookmarkLabel = this.actionState.bookmark ? 'Salvo' : 'Salvar';
          var postId = this.currentPost ? this.currentPost.id : '';
          var voteHtml = (postId && typeof VoteSystem !== 'undefined' && VoteSystem && typeof VoteSystem.buildClusterHTML === 'function')
            ? VoteSystem.buildClusterHTML(postId, 'thread')
            : '';

          return (
            '<section class="thread-actions-bar">' +
              '<button type="button" class="thread-action-btn thread-action-comment" data-thread-action="comment"><i data-lucide="message-circle"></i><span>Comentar</span></button>' +
              '<button type="button" class="thread-action-btn thread-action-repost ' + (this.actionState.repost ? 'is-active' : '') + '" data-thread-action="repost"><i data-lucide="repeat-2"></i><span>' + repostLabel + '</span></button>' +
              voteHtml +
              '<button type="button" class="thread-action-btn thread-action-share" data-thread-action="share"><i data-lucide="share-2"></i><span>Compartilhar</span></button>' +
              '<button type="button" class="thread-action-btn thread-action-bookmark ' + (this.actionState.bookmark ? 'is-active' : '') + '" data-thread-action="bookmark"><i data-lucide="bookmark"></i><span>' + bookmarkLabel + '</span></button>' +
            '</section>'
          );
        },
getSortedResponses: function () {
          var mode = this.sortModes[this.sortIndex];
          var sorted = this.responses.slice();

          if (mode === 'Recentes') {
            sorted.sort(function (a, b) {
              return (a.minutesAgo || 0) - (b.minutesAgo || 0);
            });
            return sorted;
          }

          if (mode === 'Antigos') {
            sorted.sort(function (a, b) {
              return (b.minutesAgo || 0) - (a.minutesAgo || 0);
            });
            return sorted;
          }

          sorted.sort(function (a, b) {
            return (b.score || 0) - (a.score || 0);
          });
          return sorted;
        },
renderResponsesHtml: function (newId) {
          return this.getSortedResponses().map(function (reply) {
            return (
              '<li class="thread-response-item' + (reply.id === newId ? ' new' : '') + '">' +
                '<img class="thread-response-avatar" src="' + reply.avatar + '" alt="Avatar ' + reply.user + '">' +
                '<div class="thread-response-main">' +
                  '<div class="thread-response-head"><a href="#" class="thread-response-handle thread-profile-link" data-user="' + reply.user + '">' + reply.user + '</a><span>ÔÇó</span><span>' + reply.time + '</span></div>' +
                  '<p class="thread-response-text">' + escapeHtml(reply.text) + '</p>' +
                '</div>' +
              '</li>'
            );
          }).join('');
        }
});
