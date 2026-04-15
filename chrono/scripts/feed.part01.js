'use strict';

function renderPoll(poll) {
        if (!poll || !poll.options || !poll.options.length) {
          return '';
        }

        var optionsHtml = poll.options.map(function (option) {
          return (
            '<div class="poll-option">' +
              '<div class="poll-label"><span>' + option.label + '</span><strong>' + option.pct + '%</strong></div>' +
              '<div class="poll-track"><span class="poll-fill" data-value="' + option.pct + '"></span></div>' +
            '</div>'
          );
        }).join('');

        return (
          '<section class="poll-card" aria-label="Enquete">' +
            optionsHtml +
            '<div class="poll-meta">Encerrada • ' + poll.votes + ' voto' + (poll.votes > 1 ? 's' : '') + '</div>' +
          '</section>'
        );
      }

function renderRepost(repost) {
        if (!repost) {
          return '';
        }

        var imageHtml = repost.image
          ? '<img class="post-image" src="' + repost.image + '" alt="Imagem do post original" loading="lazy">'
          : '';

        return (
          '<article class="nested-repost">' +
            '<div class="nested-head"><strong>' + repost.user + '</strong><span>•</span><span>' + repost.time + '</span></div>' +
            '<p class="post-text">' + repost.text + '</p>' +
            imageHtml +
          '</article>'
        );
      }

function passesTabFilter(post) {
        if (state.activeTab === 'seguindo') {
          return !!post.following;
        }

        if (state.activeTab === 'midia') {
          return !!post.image || !!(post.repost && post.repost.image);
        }

        if (state.activeTab === 'enquetes') {
          return !!post.poll;
        }

        return true;
      }

function passesSearch(post) {
        if (!state.query) {
          return true;
        }

        var haystack = [
          post.user,
          post.text,
          post.threadNote || '',
          (post.repost && post.repost.text) || ''
        ].join(' ');

        return normalize(haystack).indexOf(state.query) !== -1;
      }

function filteredPosts() {
        return postStore.filter(function (post) {
          return passesSearch(post);
        });
      }

function renderPost(post, index, options) {
        options = options || {};
        applyPostMetadata(post, options.source || post.source || 'initial', index);

        var withStagger = !!options.withStagger;
        var isSearchMatch = !!state.query;
        var classes = ['post-card'];

        if (withStagger) {
          classes.push('stagger-in');
        }

        if (options.newPostId && options.newPostId === post.id) {
          classes.push('post-new');
        }

        if (isSearchMatch) {
          classes.push('search-match');
        }

        var threadLine = post.thread ? '<span class="thread-line" aria-hidden="true"></span>' : '';
        var repostInfo = post.repostInfo ? '<div class="post-repost-info">' + post.repostInfo + '</div>' : '';
        var imageHtml = post.image
          ? '<img class="post-image" src="' + post.image + '" alt="Imagem do post" loading="lazy">'
          : '';
        var pollHtml = renderPoll(post.poll);
        var repostHtml = renderRepost(post.repost);
        var threadNote = post.threadNote ? '<div class="thread-note">' + post.threadNote + '</div>' : '';
        var verified = post.verified ? '<span class="verified-dot" aria-hidden="true"></span>' : '';
        var postSearchText = escapeHtml(getSearchTextForPost(post));

        return (
          '<article class="' + classes.join(' ') + '" data-post-id="' + post.id + '" data-author="' + escapeHtml(post.author || '') + '" data-following="' + (post.following ? 'true' : 'false') + '" data-has-media="' + (post.hasMedia ? 'true' : 'false') + '" data-has-poll="' + (post.hasPoll ? 'true' : 'false') + '" data-created-at="' + post.createdAt + '" data-source="' + escapeHtml(post.source || 'initial') + '" data-search-text="' + postSearchText + '" style="--stagger:' + (index * 80) + 'ms">' +
            '<div class="post-avatar-wrap">' +
              threadLine +
              '<img class="post-avatar" src="' + post.avatar + '" alt="Avatar de ' + post.user + '">' +
            '</div>' +
            '<div class="post-main">' +
              '<header class="post-head">' +
                '<a href="#" class="post-handle post-user-link" data-user-link="true" data-user="' + post.user + '">' + post.user + '</a>' +
                verified +
                '<span>•</span>' +
                '<time>' + post.time + '</time>' +
              '</header>' +
              repostInfo +
              '<p class="post-text">' + post.text + '</p>' +
              pollHtml +
              imageHtml +
              repostHtml +
              threadNote +
              '<footer class="post-actions">' +
                VoteSystem.buildClusterHTML(post.id) +
                '<button class="action-btn action-comment" data-action="comment" type="button" aria-label="Comentarios">' +
                  '<i data-lucide="message-circle"></i><span class="action-count">' + post.metrics.comments + '</span>' +
                '</button>' +
                '<button class="action-btn action-repost ' + (post.state.repost ? 'active' : '') + '" data-action="repost" type="button" aria-label="Repostar">' +
                  '<i data-lucide="repeat-2"></i><span class="action-count">' + post.metrics.reposts + '</span>' +
                '</button>' +
                '<button class="action-btn action-share" data-action="share" type="button" aria-label="Compartilhar">' +
                  '<i data-lucide="share-2"></i>' +
                '</button>' +
                '<button class="action-btn action-bookmark ' + (post.state.bookmark ? 'active' : '') + '" data-action="bookmark" type="button" aria-label="Salvar">' +
                  '<i data-lucide="bookmark"></i>' +
                '</button>' +
              '</footer>' +
            '</div>' +
          '</article>'
        );
      }

function animatePollBars() {
        var bars = Array.prototype.slice.call(document.querySelectorAll('.poll-fill'));
        bars.forEach(function (bar) {
          var target = Number(bar.getAttribute('data-value')) || 0;
          requestAnimationFrame(function () {
            bar.style.width = target + '%';
          });
        });
      }

function renderFeed(options) {
        options = options || {};

        var posts = filteredPosts();

        if (!posts.length) {
          feedList.innerHTML = '<div class="empty-feed">Nenhum post encontrado para este filtro.</div>';
          safeIconRefresh();
          return;
        }

        feedList.innerHTML = posts.map(function (post, index) {
          return renderPost(post, index, options);
        }).join('');

        animatePollBars();
        safeIconRefresh();
        VoteSystem.syncAllCards();

        if (typeof setupPollVoting === 'function') {
          Array.prototype.slice.call(feedList.querySelectorAll('[data-post-id]')).forEach(function (card) {
            if (card.querySelector('.poll-card-interactive')) {
              setupPollVoting(card);
            }
          });
        }
      }

function updateTabButtons() {
        tabs.forEach(function (tab) {
          tab.classList.toggle('active', tab.getAttribute('data-tab') === state.activeTab);
        });
      }

function playFeedTransition(className) {
        feedList.classList.remove(className);
        void feedList.offsetWidth;
        feedList.classList.add(className);
      }

function toggleMetric(post, action) {
        if (!post) {
          return;
        }

        if (action === 'repost') {
          post.state.repost = !post.state.repost;
          post.metrics.reposts += post.state.repost ? 1 : -1;
        }

        if (action === 'bookmark') {
          post.state.bookmark = !post.state.bookmark;
        }
      }

function openProfileRouteFromHandle(handle) {
        var profileHandle = String(handle || '@usuario').trim() || '@usuario';
  var routeHandle = profileHandle.replace(/^@/, '').trim().toLowerCase() || 'usuario';

        if (typeof window !== 'undefined') {
          window.__chronoLastProfileHandle = profileHandle;
        }

        if (typeof AppState !== 'undefined' && AppState && typeof AppState === 'object') {
          AppState.lastProfileHandle = profileHandle;
        }

        if (ThreadModal && ThreadModal.isOpen && typeof ThreadModal.close === 'function') {
          ThreadModal.close();
        }

        if (AppRouter && typeof AppRouter.navigate === 'function') {
          AppRouter.navigate('perfil/' + routeHandle);
        }

        if (typeof showAppToast === 'function') {
          showAppToast('Abrindo perfil de ' + profileHandle + '.');
        }
      }

function openHashtagFeed(tag) {
  var cleanTag = String(tag || '').replace(/^[#$]/, '').trim().toLowerCase();

        if (!cleanTag) {
          return;
        }

        if (ThreadModal && ThreadModal.isOpen && typeof ThreadModal.close === 'function') {
          ThreadModal.close();
        }

        if (searchInput) {
          searchInput.value = '$' + cleanTag;
          state.query = normalize(searchInput.value);
        }

        if (FeedFilters && FeedFilters.isInitialized) {
          FeedFilters.setActiveTab('all');
          FeedFilters.applyFilter('all', false);
        } else {
          renderFeed();
        }

        if (AppRouter && typeof AppRouter.navigate === 'function') {
          AppRouter.navigate('feed');
        }

        if (typeof showAppToast === 'function') {
          showAppToast('Filtrando por $' + cleanTag + '.');
        }
      }

function copyCurrentLinkToast(fallbackMessage) {
        var done = false;

        function notify(message) {
          if (done) {
            return;
          }

          done = true;
          if (typeof showAppToast === 'function') {
            showAppToast(message);
          }
        }

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(window.location.href)
            .then(function () {
              notify('Link copiado para a area de transferencia.');
            })
            .catch(function () {
              notify(fallbackMessage || 'Link pronto para compartilhar.');
            });
          return;
        }

        notify(fallbackMessage || 'Link pronto para compartilhar.');
      }
