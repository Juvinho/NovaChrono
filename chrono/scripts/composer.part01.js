'use strict';

function onPostActionClick(event) {
        var profileLink = event.target.closest('.post-user-link');
        if (profileLink) {
          event.preventDefault();
          var profileHandle = profileLink.textContent || '@usuario';
          openProfileRouteFromHandle(profileHandle);
          return;
        }

        var button = event.target.closest('.action-btn');

        if (!button) {
          var postCard = event.target.closest('.post-card');

          if (!postCard) {
            return;
          }

          if (event.target.closest('button, a, input, textarea, select, label, .poll-option, [role="button"]')) {
            return;
          }

          var clickedPostId = postCard.getAttribute('data-post-id');
          if (clickedPostId) {
            ThreadModal.open(clickedPostId);
          }
          return;
        }

        var card = button.closest('.post-card');

        if (!card) {
          return;
        }

        var action = button.getAttribute('data-action');
        var postId = card.getAttribute('data-post-id');
        var post = postStore.find(function (item) { return item.id === postId; });

        if (action === 'comment') {
          button.classList.add('pop');
          setTimeout(function () { button.classList.remove('pop'); }, 220);
          ThreadModal.open(postId);
          return;
        }

        if (action === 'share') {
          button.classList.add('pop');
          setTimeout(function () { button.classList.remove('pop'); }, 220);
          copyCurrentLinkToast('Link do post pronto para compartilhar.');
          return;
        }

        toggleMetric(post, action);

        if (action === 'repost') {
          button.classList.toggle('active', !!post.state.repost);
          var repostCount = card.querySelector('.action-repost .action-count');
          if (repostCount) {
            repostCount.textContent = String(post.metrics.reposts);
          }
        }

        if (action === 'bookmark') {
          button.classList.toggle('active', !!post.state.bookmark);
        }

        button.classList.add('pop');
        setTimeout(function () { button.classList.remove('pop'); }, 220);
      }

function autoExpandComposer() {
        composer.style.height = 'auto';
        composer.style.height = Math.min(composer.scrollHeight, 220) + 'px';
      }

function updatePublishState() {
        publishBtn.disabled = !composer.value.trim();
      }

function addNewPost() {
        var text = composer.value.trim();
        var newPost;
        var newCard;

        if (!text) {
          return;
        }

        var newId = 'new-' + Date.now();

        newPost = {
          id: newId,
          user: typeof getProfileHandleValue === 'function' ? getProfileHandleValue() : '@Juvinho',
          avatar: (typeof AppState !== 'undefined' && AppState.profile && AppState.profile.avatar)
            ? AppState.profile.avatar
            : 'https://picsum.photos/seed/new-juvinho/80/80',
          time: 'agora',
          text: text,
          verified: true,
          source: 'composer',
          metrics: { comments: 0, reposts: 0, likes: 0 },
          state: { repost: false, like: false, bookmark: false }
        };

        applyPostMetadata(newPost, 'composer');
        postStore.unshift(newPost);

        composer.value = '';
        composer.style.height = '54px';
        updatePublishState();

        newCard = createPostCardElement(newPost, 0, { newPostId: newId, source: 'composer' });

        if (newCard && feedList) {
          feedList.prepend(newCard);
          safeIconRefresh();
          document.dispatchEvent(new CustomEvent('chrono:post-created', {
            detail: { postEl: newCard }
          }));
        }

        var feedStart = document.querySelector('.feed-column');
        if (feedStart) {
          feedStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

function attachEvents() {
        searchInput.addEventListener('input', function () {
          state.query = normalize(searchInput.value.trim());

          if (FeedFilters.isInitialized) {
            FeedFilters.applyFilter(FeedFilters.current, false);
            return;
          }

          renderFeed();
        });

        composer.addEventListener('input', function () {
          autoExpandComposer();
          updatePublishState();
        });

        publishBtn.addEventListener('click', addNewPost);
        feedList.addEventListener('click', onPostActionClick);

        if (cordaoFeedList) {
          cordaoFeedList.addEventListener('click', onPostActionClick);
        }

        // ===== COMPOSER ENHANCEMENTS SETUP =====
        ComposerController.init();
        EmojiPicker.init();
      }
