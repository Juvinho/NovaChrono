'use strict';

var PollSystem = (function () {
        var _userVotes = {}; // { postId: optionId }

        function vote(postId, optionId) {
          if (hasUserVoted(postId)) {
            return false;
          }

          _userVotes[postId] = optionId;
          return true;
        }

        function hasUserVoted(postId) {
          return typeof _userVotes[postId] !== 'undefined';
        }

        function getUserVote(postId) {
          return _userVotes[postId] || null;
        }

        function updateUI(postEl) {
          if (!postEl) return;

          var poll = postEl.querySelector('.poll-card-interactive');
          if (!poll) return;

          var postId = postEl.getAttribute('data-post-id');
          var post = getPostById(postId);
          if (!post || !post.poll) return;

          var options = poll.querySelectorAll('.poll-option-interactive');
          var userVote = getUserVote(postId);

          options.forEach(function (optEl, idx) {
            var optionId = optEl.getAttribute('data-option-id');
            var option = post.poll.options[idx];
            var isVoted = userVote === optionId;

            // Update percentage
            var percent = post.poll.totalVotes > 0 
              ? Math.round((option.votes / post.poll.totalVotes) * 100) 
              : 0;

            var percentEl = optEl.querySelector('.poll-option-percent');
            if (percentEl) {
              percentEl.textContent = percent + '%';
            }

            // Update fill
            var fillEl = optEl.querySelector('.poll-option-fill');
            if (fillEl) {
              fillEl.style.width = percent + '%';
            }

            // Update state
            optEl.classList.toggle('voted', isVoted);
            if (isVoted) {
              optEl.classList.add('voted-pulse');
              setTimeout(function () {
                optEl.classList.remove('voted-pulse');
              }, 300);
            }
          });

          // Update meta
          var metaEl = poll.querySelector('.poll-status-text');
          if (metaEl) {
            var totalText = post.poll.totalVotes + ' voto' + (post.poll.totalVotes !== 1 ? 's' : '');
            var statusText = post.poll.closed ? 'Enquete encerrada' : 'Votação ativa';
            metaEl.textContent = totalText + ' • ' + statusText;
          }
        }

        return {
          vote: vote,
          hasUserVoted: hasUserVoted,
          getUserVote: getUserVote,
          updateUI: updateUI
        };
      })();

      // ===== UPDATE PUBLISH STATE =====
      function updatePublishStateEnhanced() {
        var composerState = ComposerController.getState();
        var hasText = composerState.text.length > 0;
        var hasImage = !!composerState.image;
        var hasPoll = !!composerState.poll && 
                      composerState.poll.options.filter(function (o) { return o.trim(); }).length >= 2;

        publishBtn.disabled = !(hasText || hasImage || hasPoll);
      }

      var originalUpdatePublishState = updatePublishState;
      updatePublishState = updatePublishStateEnhanced;

      // ===== ENHANCE addNewPost =====
      var originalAddNewPost = addNewPost;
      addNewPost = function () {
        var composerState = ComposerController.getState();
        var text = composerState.text;
        var image = composerState.image;
        var pollData = composerState.poll;

        if (!text && !image && !pollData) {
          return;
        }

        // Validate poll if present
        var pollOptions = pollData 
          ? pollData.options.filter(function (o) { return o.trim(); })
          : [];

        if (pollData && pollOptions.length < 2) {
          alert('A enquete precisa de pelo menos 2 opções.');
          return;
        }

        var newId = 'new-' + Date.now();

        // Build poll object if exists
        var poll = null;
        if (pollData && pollOptions.length >= 2) {
          var closesAt = pollData.autoClose24h ? Date.now() + (24 * 60 * 60 * 1000) : null;
          poll = {
            question: pollData.question || '',
            options: pollOptions.map(function (optText, idx) {
              return {
                id: 'opt-' + idx,
                text: optText,
                votes: 0
              };
            }),
            totalVotes: 0,
            userVote: null,
            closed: false,
            closesAt: closesAt
          };
        }

        var newPost = {
          id: newId,
          user: typeof getProfileHandleValue === 'function' ? getProfileHandleValue() : '@Juvinho',
          avatar: (typeof AppState !== 'undefined' && AppState.profile && AppState.profile.avatar)
            ? AppState.profile.avatar
            : 'https://picsum.photos/seed/new-juvinho/80/80',
          time: 'agora',
          text: text,
          image: image || undefined,
          poll: poll || undefined,
          verified: true,
          source: 'composer',
          metrics: { comments: 0, reposts: 0, likes: 0 },
          state: { repost: false, like: false, bookmark: false }
        };

        applyPostMetadata(newPost, 'composer');
        postStore.unshift(newPost);

        var newCard = createPostCardElement(newPost, 0, { newPostId: newId, source: 'composer' });

        if (newCard && feedList) {
          feedList.prepend(newCard);

          // Setup poll voting if poll exists
          if (poll) {
            setupPollVoting(newCard);
          }

          safeIconRefresh();
          document.dispatchEvent(new CustomEvent('chrono:post-created', {
            detail: { postEl: newCard }
          }));
        }

        // Reset composer
        ComposerController.reset();
        composer.style.height = '54px';
        updatePublishState();

        var feedStart = document.querySelector('.feed-column');
        if (feedStart) {
          feedStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // ===== SETUP POLL VOTING =====
      function setupPollVoting(postEl) {
        var poll = postEl.querySelector('.poll-card-interactive');
        if (!poll) return;

        var postId = postEl.getAttribute('data-post-id');
        var options = poll.querySelectorAll('.poll-option-interactive');

        options.forEach(function (optEl, idx) {
          optEl.addEventListener('click', function () {
            var post = getPostById(postId);
            if (!post || !post.poll || post.poll.closed) return;

            if (PollSystem.hasUserVoted(postId)) {
              return; // Already voted
            }

            var optionId = optEl.getAttribute('data-option-id');
            var optionIdx = parseInt(optionId.split('-')[1]);

            // Increment votes
            post.poll.options[optionIdx].votes++;
            post.poll.totalVotes++;
            post.poll.userVote = optionId;

            // Vote in system
            PollSystem.vote(postId, optionId);

            // Update UI
            PollSystem.updateUI(postEl);
          });
        });
      }

      // ===== RENDER POLL WITH VOTING =====
      var originalRenderPoll = renderPoll;
      renderPoll = function (poll) {
        if (!poll || !poll.options || !poll.options.length) {
          return '';
        }

        var isClosed = poll.closed || (poll.closesAt && Date.now() > poll.closesAt);
        if (isClosed) {
          poll.closed = true;
        }

        var optionsHtml = poll.options.map(function (option, idx) {
          var percent = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100)
            : 0;

          return (
            '<div class="poll-option-interactive" data-option-id="opt-' + idx + '" ' +
              (isClosed ? 'style="pointer-events:none;"' : '') + '>' +
              '<div class="poll-option-fill" style="width:' + percent + '%"></div>' +
              '<div class="poll-option-content">' +
                '<span class="poll-option-text">' + option.text + '</span>' +
                '<span class="poll-option-percent">' + percent + '%</span>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        var closesInText = '';
        if (poll.closesAt && !isClosed) {
          var msRemaining = poll.closesAt - Date.now();
          if (msRemaining > 0) {
            var hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000));
            closesInText = 'Encerra em ' + hoursRemaining + 'h';
          }
        }

        var statusText = isClosed 
          ? 'Enquete encerrada' 
          : (closesInText || 'Enquete ativa');

        return (
          '<section class="poll-card poll-card-interactive" aria-label="Enquete">' +
            (poll.question ? '<div style="font-weight:600;margin-bottom:10px;font-size:13px;">' + poll.question + '</div>' : '') +
            optionsHtml +
            '<div class="poll-status-text">' + poll.totalVotes + ' voto' + (poll.totalVotes !== 1 ? 's' : '') + ' • ' + statusText + '</div>' +
          '</section>'
        );
      };

      // ===== ENHANCE createPostCardElement =====
      var originalCreatePostCardElement = createPostCardElement;
      createPostCardElement = function (post, index, options) {
        var el = originalCreatePostCardElement(post, index, options);

        // Setup poll voting if post has poll
        if (post.poll && el) {
          setupPollVoting(el);
        }

        return el;
      };
