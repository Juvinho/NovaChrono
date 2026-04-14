'use strict';

function normalizeAuthorHandle(handle) {
        return String(handle || '').replace(/^@/, '').trim().toLowerCase();
      }

      function isFollowingAuthor(handle) {
        var normalized = normalizeAuthorHandle(handle);
        return FOLLOWING_USERS.some(function (followed) {
          return normalizeAuthorHandle(followed) === normalized;
        });
      }

      function buildPostMetadata(post, sourceFallback, index) {
        var safePost = post || {};
        var source = safePost.source || sourceFallback || 'initial';
        var hasMedia = !!safePost.image || !!(safePost.repost && safePost.repost.image);
        var hasPoll = !!safePost.poll;
        var author = String(safePost.user || '@desconhecido').replace(/^@/, '');
        var following = isFollowingAuthor(author);
        var createdAt = Number(safePost.createdAt);

        if (!Number.isFinite(createdAt)) {
          createdAt = Date.now() - ((Number(index) || 0) * 60000);
        }

        return {
          id: safePost.id,
          author: author,
          following: following,
          hasMedia: hasMedia,
          hasPoll: hasPoll,
          createdAt: createdAt,
          source: source,
        };
      }

      function applyPostMetadata(post, sourceFallback, index) {
        if (!post) {
          return null;
        }

        var metadata = buildPostMetadata(post, sourceFallback, index);
        post.author = metadata.author;
        post.following = metadata.following;
        post.hasMedia = metadata.hasMedia;
        post.hasPoll = metadata.hasPoll;
        post.createdAt = metadata.createdAt;
        post.source = metadata.source;
        return metadata;
      }

      function getPostById(postId) {
        return postStore.find(function (item) {
          return item.id === postId;
        }) || null;
      }

      function getSearchTextForPost(post) {
        return normalize([
          post.user || '',
          post.text || '',
          post.threadNote || '',
          (post.repost && post.repost.text) || ''
        ].join(' '));
      }

      function decoratePostElement(postEl) {
        if (!postEl) {
          return;
        }

        var postId = postEl.getAttribute('data-post-id');
        var post = getPostById(postId);

        if (!post) {
          return;
        }

        applyPostMetadata(post, post.source || 'initial');
        postEl.setAttribute('data-author', String(post.author || ''));
        postEl.setAttribute('data-following', post.following ? 'true' : 'false');
        postEl.setAttribute('data-has-media', post.hasMedia ? 'true' : 'false');
        postEl.setAttribute('data-has-poll', post.hasPoll ? 'true' : 'false');
        postEl.setAttribute('data-created-at', String(post.createdAt || Date.now()));
        postEl.setAttribute('data-source', String(post.source || 'initial'));
        postEl.setAttribute('data-search-text', getSearchTextForPost(post));
      }

      function createPostCardElement(post, index, options) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = renderPost(post, index || 0, options || {});
        return wrapper.firstElementChild;
      }

      function safeIconRefresh() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }

      function bindClickOutside(element, callback, options) {
        if (!element || typeof callback !== 'function') {
          return function () {};
        }

        var opts = options || {};
        var ignoreSelectors = Array.isArray(opts.ignoreSelectors) ? opts.ignoreSelectors : [];
        var active = false;

        requestAnimationFrame(function () {
          active = true;
        });

        function handler(event) {
          if (!active) {
            return;
          }

          var target = event.target;
          if (!target) {
            return;
          }

          if (element.contains(target)) {
            return;
          }

          for (var i = 0; i < ignoreSelectors.length; i += 1) {
            if (target.closest(ignoreSelectors[i])) {
              return;
            }
          }

          callback(event);
        }

        document.addEventListener('pointerdown', handler, true);

        return function unbind() {
          document.removeEventListener('pointerdown', handler, true);
        };
      }

      function formatMonthPt(date) {
        var months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months[date.getMonth()];
      }

      function normalize(text) {
        return String(text || '').toLowerCase();
      }

      function formatCompactCount(n) {
        if (n >= 1000) {
          return (n / 1000).toFixed(1).replace('.0', '') + 'k';
        }

        return String(n);
      }

      function detectTrigger(field) {
        if (!field || typeof field.value !== 'string') {
          return null;
        }

        var value = field.value;
        var cursorPos = typeof field.selectionStart === 'number' ? field.selectionStart : value.length;
        var textBeforeCursor = value.slice(0, cursorPos);
        var mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        var cordaoMatch = textBeforeCursor.match(/\$(\w*)$/);

        if (mentionMatch) {
          return {
            type: 'mention',
            query: mentionMatch[1],
            triggerIndex: textBeforeCursor.lastIndexOf('@')
          };
        }

        if (cordaoMatch) {
          return {
            type: 'cordao',
            query: cordaoMatch[1],
            triggerIndex: textBeforeCursor.lastIndexOf('$')
          };
        }

        return null;
      }

      function filterUsers(query) {
        if (!query) {
          return MOCK_USERS.slice().sort(function (a, b) {
            return b.followers - a.followers;
          }).slice(0, 5);
        }

        var q = query.toLowerCase();

        return MOCK_USERS.filter(function (user) {
          return user.username.toLowerCase().indexOf(q) !== -1 || user.display.toLowerCase().indexOf(q) !== -1;
        }).sort(function (a, b) {
          var aStart = a.username.toLowerCase().indexOf(q) === 0 ? 0 : 1;
          var bStart = b.username.toLowerCase().indexOf(q) === 0 ? 0 : 1;

          if (aStart !== bStart) {
            return aStart - bStart;
          }

          return b.followers - a.followers;
        }).slice(0, 6);
      }

      function filterCordoes(query) {
        if (!query) {
          return MOCK_CORDOES.slice().sort(function (a, b) {
            var trendDiff = (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
            if (trendDiff !== 0) {
              return trendDiff;
            }
            return b.posts - a.posts;
          }).slice(0, 5);
        }

        var q = query.toLowerCase();

        return MOCK_CORDOES.filter(function (cordao) {
          return cordao.name.toLowerCase().indexOf(q) !== -1;
        }).sort(function (a, b) {
          var aStart = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
          var bStart = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;

          if (aStart !== bStart) {
            return aStart - bStart;
          }

          return b.posts - a.posts;
        }).slice(0, 6);
      }

      function getCaretCoordinates(element, position) {
        var mirror = document.createElement('div');
        var computed = window.getComputedStyle(element);
        var styleProps = [
          'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'line-height',
          'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
          'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
          'white-space', 'word-wrap', 'overflow-wrap', 'text-transform', 'text-indent'
        ];

        styleProps.forEach(function (prop) {
          mirror.style[prop] = computed[prop];
        });

        mirror.style.position = 'absolute';
        mirror.style.visibility = 'hidden';
        mirror.style.top = '-9999px';
        mirror.style.left = '-9999px';
        mirror.style.width = computed.width;
        mirror.style.whiteSpace = element.tagName.toLowerCase() === 'textarea' ? 'pre-wrap' : 'pre';
        mirror.style.wordWrap = 'break-word';
        mirror.style.overflowWrap = 'break-word';

        mirror.textContent = element.value.substring(0, position);

        var caret = document.createElement('span');
        caret.textContent = element.value.substring(position) || '.';
        mirror.appendChild(caret);
        document.body.appendChild(mirror);

        var rect = element.getBoundingClientRect();
        var caretRect = caret.getBoundingClientRect();
        var mirrorRect = mirror.getBoundingClientRect();

        var coordinates = {
          top: rect.top + (caretRect.top - mirrorRect.top) - (element.scrollTop || 0),
          left: rect.left + (caretRect.left - mirrorRect.left) - (element.scrollLeft || 0)
        };

        document.body.removeChild(mirror);
        return coordinates;
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function handleToDisplayName(handle) {
        var plain = String(handle || '').replace(/^@/, '').replace(/[_\.]/g, ' ');
        return plain.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
      }

      function formatThreadText(text) {
        var escaped = escapeHtml(text);

        escaped = escaped.replace(/(^|\s)(#\w+)/g, function (_, leading, tag) {
          return leading + '<a href="#" class="thread-hashtag" data-thread-link="tag" data-tag="' + tag + '">' + tag + '</a>';
        });

        escaped = escaped.replace(/(^|\s)(@\w+)/g, function (_, leading, mention) {
          return leading + '<a href="#" class="thread-mention" data-thread-link="mention" data-user="' + mention + '">' + mention + '</a>';
        });

        return escaped;
      }
