'use strict';

function normalizeCordao(input) {
        var raw = String(input || '').trim().toLowerCase();

        if (!raw) {
          return '';
        }

        if (typeof raw.normalize === 'function') {
          raw = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        raw = raw.replace(/^#+/, '');
        raw = raw.replace(/\s+/g, '');
        raw = raw.replace(/[^a-z0-9_]/g, '');

        if (raw.length > 24) {
          raw = raw.slice(0, 24);
        }

        return raw ? ('#' + raw) : '';
      }

function toCordaoSlug(value) {
        return normalizeCordao(value).replace(/^#/, '');
      }

function displayCordao(value) {
        var slug = toCordaoSlug(value);
        return slug ? ('#' + slug) : '#';
      }

function extractCordaoFromText(text) {
        var match = String(text || '').toLowerCase().match(/#([a-z0-9_]{1,24})/);
        if (!match) {
          return '';
        }

        return toCordaoSlug('#' + match[1]);
      }

function prependPostToFeed(post, source) {
        if (!post || !feedList) {
          return null;
        }

        if (feedList.querySelector('[data-post-id="' + post.id + '"]')) {
          return null;
        }

        var card = createPostCardElement(post, 0, {
          newPostId: post.id,
          source: source || post.source || 'cordao'
        });

        if (!card) {
          return null;
        }

        feedList.prepend(card);
        safeIconRefresh();

        document.dispatchEvent(new CustomEvent('chrono:post-created', {
          detail: { postEl: card }
        }));

        return card;
      }

var CordaoStore = {
        cordoes: [],
        posts: [],
        listeners: [],
        initialized: false,

        init: function () {
          if (this.initialized) {
            return;
          }

          var self = this;
          this.initialized = true;

          this.cordoes = [];
          this.posts = [];

          MOCK_CORDOES.forEach(function (item) {
            var slug = toCordaoSlug(item && item.name);
            if (!slug) {
              return;
            }

            var existing = self.createCordaoIfMissing(slug);
            if (!existing) {
              return;
            }

            existing.posts = Math.max(Number(existing.posts) || 0, Number(item.posts) || 0);
            existing.trending = !!item.trending;
          });

          postStore.forEach(function (post, index) {
            applyPostMetadata(post, post && post.source ? post.source : 'initial', index);

            var slug = extractCordaoFromText(post && post.text ? post.text : '');
            if (!slug) {
              return;
            }

            var existing = self.createCordaoIfMissing(slug);
            if (existing) {
              existing.posts = Math.max(Number(existing.posts) || 0, 1);
            }

            self.posts.push({
              id: post.id,
              slug: slug,
              createdAt: Number(post.createdAt) || (Date.now() - (index * 60000))
            });
          });

          this.posts.sort(function (a, b) {
            return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
          });
          this.sortCordoes();
        },

        sortCordoes: function () {
          this.cordoes.sort(function (a, b) {
            var countDiff = (Number(b.posts) || 0) - (Number(a.posts) || 0);
            if (countDiff !== 0) {
              return countDiff;
            }

            return String(a.slug || '').localeCompare(String(b.slug || ''));
          });
        },

        getCordoes: function () {
          return this.cordoes.slice();
        },

        getCordao: function (slug) {
          var safeSlug = toCordaoSlug(slug);
          if (!safeSlug) {
            return null;
          }

          return this.cordoes.find(function (item) {
            return item.slug === safeSlug;
          }) || null;
        },

        getPostsByCordao: function (slug) {
          var safeSlug = toCordaoSlug(slug);
          if (!safeSlug) {
            return [];
          }

          return this.posts
            .filter(function (item) {
              return item.slug === safeSlug;
            })
            .sort(function (a, b) {
              return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
            })
            .map(function (item) {
              return getPostById(item.id);
            })
            .filter(Boolean);
        },

        createCordaoIfMissing: function (slug) {
          var safeSlug = toCordaoSlug(slug);
          if (!safeSlug) {
            return null;
          }

          var existing = this.getCordao(safeSlug);
          if (existing) {
            return existing;
          }

          var created = {
            slug: safeSlug,
            posts: 0,
            trending: false
          };

          this.cordoes.push(created);
          this.sortCordoes();
          return created;
        },

        incrementCordaoCount: function (slug, amount) {
          var safeSlug = toCordaoSlug(slug);
          var target = this.createCordaoIfMissing(safeSlug);
          var nextAmount = Math.max(1, Number(amount) || 1);

          if (!target) {
            return null;
          }

          target.posts = Math.max(0, Number(target.posts) || 0) + nextAmount;
          this.sortCordoes();
          return target;
        },

        registerPostReference: function (postId, slug, createdAt) {
          var safeSlug = toCordaoSlug(slug);
          var safePostId = String(postId || '').trim();

          if (!safePostId || !safeSlug) {
            return;
          }

          this.posts = this.posts.filter(function (item) {
            return item.id !== safePostId;
          });

          this.posts.unshift({
            id: safePostId,
            slug: safeSlug,
            createdAt: Number(createdAt) || Date.now()
          });
        },

        createPostInCordao: function (payload) {
          var content = String(payload && payload.content ? payload.content : '').trim();
          var slug = toCordaoSlug(payload && (payload.cordao || payload.slug));

          if (!content || !slug) {
            return null;
          }

          var tag = displayCordao(slug);
          var finalText = content;

          if (finalText.toLowerCase().indexOf(tag) === -1) {
            finalText += ' ' + tag;
          }

          var newPost = {
            id: 'cd-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            user: String(payload && payload.author ? payload.author : getProfileHandleValue() || '@Juvinho'),
            avatar: String(payload && payload.avatar ? payload.avatar : (AppState && AppState.profile && AppState.profile.avatar) || 'https://picsum.photos/seed/juvinho-compose/64/64'),
            time: 'agora',
            text: finalText,
            verified: !!(payload && payload.verified),
            source: 'cordao',
            metrics: { comments: 0, reposts: 0, likes: 0 },
            state: { repost: false, like: false, bookmark: false },
            createdAt: Number(payload && payload.createdAt) || Date.now()
          };

          applyPostMetadata(newPost, 'cordao');
          postStore.unshift(newPost);

          this.createCordaoIfMissing(slug);
          this.incrementCordaoCount(slug, 1);
          this.registerPostReference(newPost.id, slug, newPost.createdAt);
          this.notify({ type: 'post-created', slug: slug, post: newPost });

          return newPost;
        },

        subscribe: function (listener) {
          var self = this;

          if (typeof listener !== 'function') {
            return function () {};
          }

          this.listeners.push(listener);

          return function () {
            self.listeners = self.listeners.filter(function (item) {
              return item !== listener;
            });
          };
        },

        notify: function (payload) {
          this.sortCordoes();
          this.listeners.slice().forEach(function (listener) {
            try {
              listener(payload || {});
            } catch (_) {
              // no-op
            }
          });
        }
      };
