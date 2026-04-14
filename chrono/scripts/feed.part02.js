'use strict';

var FeedFilters = {
        current: 'all',
        tabs: [],
        posts: [],
        emptyStateEl: null,
        hideTimer: null,
        animationToken: 0,
        isInitialized: false,
        emptyConfig: {
          following: {
            icon: 'users',
            title: 'Nenhum post de quem voce segue',
            text: 'Quando alguem que voce segue publicar, ele aparece aqui.'
          },
          media: {
            icon: 'image',
            title: 'Nenhuma midia por aqui',
            text: 'Posts com imagens e conteudos visuais aparecerao nesta aba.'
          },
          polls: {
            icon: 'bar-chart-3',
            title: 'Nenhuma enquete encontrada',
            text: 'Quando houver votacoes publicadas, elas aparecerao aqui.'
          },
          all: {
            icon: 'search',
            title: 'Nenhum post encontrado',
            text: 'Tente ajustar os filtros ou a busca para encontrar mais conteudo.'
          }
        },

        init: function () {
          if (!feedList) {
            return;
          }

          this.tabs = Array.prototype.slice.call(document.querySelectorAll('.feed-tab'));
          this.normalizeTabFilters();
          this.collectPosts();
          this.bindEvents();
          this.setActiveTab(this.current);
          this.applyFilter(this.current, false);
          this.isInitialized = true;
        },

        normalizeTabFilters: function () {
          var map = {
            todos: 'all',
            seguindo: 'following',
            midia: 'media',
            enquetes: 'polls'
          };

          this.tabs.forEach(function (tab) {
            var filter = tab.getAttribute('data-feed-filter');

            if (!filter) {
              var legacyTab = tab.getAttribute('data-tab') || 'todos';
              filter = map[legacyTab] || 'all';
              tab.setAttribute('data-feed-filter', filter);
            }

            if (tab.classList.contains('active')) {
              this.current = filter;
            }
          }, this);
        },

        collectPosts: function () {
          this.posts = Array.prototype.slice.call(feedList.querySelectorAll('.post-card'));
          this.posts.forEach(function (postEl) {
            decoratePostElement(postEl);
          });
        },

        bindEvents: function () {
          var self = this;

          this.tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
              var filter = tab.getAttribute('data-feed-filter') || 'all';
              if (filter === self.current) {
                return;
              }

              self.setActiveTab(filter);
              self.applyFilter(filter, true);
              playFeedTransition('tab-animate');
            });
          });

          document.addEventListener('chrono:post-created', function (event) {
            if (!event || !event.detail || !event.detail.postEl) {
              return;
            }

            self.registerPost(event.detail.postEl);
          });
        },

        setActiveTab: function (filter) {
          this.current = filter || 'all';

          this.tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.getAttribute('data-feed-filter') === this.current);
          }, this);
        },

        matchesFilter: function (postEl, filter) {
          var activeFilter = filter || this.current;

          if (!postEl) {
            return false;
          }

          if (activeFilter === 'following') {
            return postEl.getAttribute('data-following') === 'true';
          }

          if (activeFilter === 'media') {
            return postEl.getAttribute('data-has-media') === 'true';
          }

          if (activeFilter === 'polls') {
            return postEl.getAttribute('data-has-poll') === 'true';
          }

          return true;
        },

        matchesSearch: function (postEl) {
          if (!state.query) {
            return true;
          }

          var haystack = normalize(postEl.getAttribute('data-search-text') || '');
          return haystack.indexOf(state.query) !== -1;
        },

        shouldShowPost: function (postEl, filter) {
          return this.matchesFilter(postEl, filter) && this.matchesSearch(postEl);
        },

        hidePostImmediately: function (postEl) {
          postEl.classList.remove('is-hiding', 'is-showing', 'is-visible');
          postEl.classList.add('is-hidden');
          postEl.style.transitionDelay = '0ms';
          postEl.classList.remove('search-match');
        },

        revealPost: function (postEl, delay) {
          postEl.classList.remove('is-hidden', 'is-hiding', 'is-showing');
          postEl.classList.add('is-showing');
          postEl.style.transitionDelay = (Number(delay) || 0) + 'ms';

          requestAnimationFrame(function () {
            postEl.classList.add('is-visible');
            postEl.classList.remove('is-showing');
          });
        },

        applyFilter: function (filter, animated) {
          var self = this;
          var shouldAnimate = animated !== false;
          var token;

          if (filter) {
            this.current = filter;
          }

          this.collectPosts();
          token = ++this.animationToken;
          clearTimeout(this.hideTimer);

          function commitVisibility() {
            var visibleCount = 0;
            var visibleIndex = 0;

            self.posts.forEach(function (postEl) {
              var visible = self.shouldShowPost(postEl, self.current);

              postEl.classList.toggle('search-match', !!state.query && visible);

              if (visible) {
                visibleCount += 1;
                if (shouldAnimate) {
                  self.revealPost(postEl, visibleIndex * 35);
                } else {
                  postEl.classList.remove('is-hidden', 'is-hiding', 'is-showing');
                  postEl.classList.add('is-visible');
                  postEl.style.transitionDelay = '0ms';
                }
                visibleIndex += 1;
              } else {
                self.hidePostImmediately(postEl);
              }
            });

            self.updateEmptyState(visibleCount);
          }

          if (!shouldAnimate) {
            commitVisibility();
            return;
          }

          this.posts.forEach(function (postEl) {
            if (!postEl.classList.contains('is-hidden')) {
              postEl.classList.remove('is-showing', 'is-visible');
              postEl.classList.add('is-hiding');
              postEl.style.transitionDelay = '0ms';
            }
          });

          this.hideTimer = setTimeout(function () {
            if (token !== self.animationToken) {
              return;
            }

            commitVisibility();
          }, 140);
        },

        updateEmptyState: function (visibleCount) {
          if (visibleCount > 0) {
            this.hideEmptyState();
            return;
          }

          this.showEmptyState(this.current);
        },

        showEmptyState: function (filter) {
          var config = this.emptyConfig[filter] || this.emptyConfig.all;

          if (!this.emptyStateEl) {
            this.emptyStateEl = document.createElement('article');
            this.emptyStateEl.id = 'feedFilterEmptyState';
            this.emptyStateEl.className = 'feed-empty-state';
          }

          this.emptyStateEl.innerHTML = (
            '<i data-lucide="' + config.icon + '"></i>' +
            '<h3 class="feed-empty-title">' + config.title + '</h3>' +
            '<p class="feed-empty-text">' + config.text + '</p>'
          );

          if (!this.emptyStateEl.parentNode && feedList) {
            feedList.insertBefore(this.emptyStateEl, feedList.firstChild);
          }

          safeIconRefresh();
        },

        hideEmptyState: function () {
          if (this.emptyStateEl && this.emptyStateEl.parentNode) {
            this.emptyStateEl.parentNode.removeChild(this.emptyStateEl);
          }
        },

        registerPost: function (postEl) {
          if (!postEl) {
            return;
          }

          decoratePostElement(postEl);
          this.posts = [postEl].concat(this.posts.filter(function (item) {
            return item !== postEl;
          }));
          this.syncCurrentView(postEl);
        },

        syncCurrentView: function (postEl) {
          if (!postEl) {
            return;
          }

          var visible = this.shouldShowPost(postEl, this.current);
          postEl.classList.toggle('search-match', !!state.query && visible);

          if (visible) {
            postEl.classList.remove('is-hidden', 'is-hiding');
            this.revealPost(postEl, 0);
          } else {
            this.hidePostImmediately(postEl);
          }

          this.updateEmptyState(this.posts.filter(function (item) {
            return !item.classList.contains('is-hidden');
          }).length);
        }
      };
