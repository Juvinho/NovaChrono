'use strict';

var VoteSystem = (function () {

        var _states = {};

        function _createState(post) {
          var rng = seededRandom((post && post.id ? post.id : 'post') + '-vote');
          return {
            up: 10 + Math.floor(rng() * 20),
            down: 4 + Math.floor(rng() * 16),
            userVote: null,
          };
        }

        function _fmtScore(score) {
          return score > 0 ? '+' + score : String(score);
        }

        function _scoreClass(score) {
          return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
        }

        function _voteClass(userVote) {
          if (userVote === 'up') {
            return ' is-upvoted';
          }

          if (userVote === 'down') {
            return ' is-downvoted';
          }

          return '';
        }

        function getState(postId, post) {
          if (!postId) { return { up: 0, down: 0, userVote: null }; }
          if (!_states[postId]) {
            _states[postId] = _createState(post || getPostById(postId) || { id: postId });
          }
          return _states[postId];
        }

        function getCounts(postId) {
          var s = getState(postId);
          return { up: s.up, down: s.down };
        }

        function getScore(postId) {
          var s = getState(postId);
          return s.up - s.down;
        }

        function buildClusterHTML(postId, variant) {
          var s = getState(postId);
          var score = s.up - s.down;
          var classes = 'vote-block' + _voteClass(s.userVote);

          if (variant === 'thread') {
            classes += ' vote-block-thread';
          }

          return (
            '<div class="' + classes + '" data-vote-cluster="true" data-post-id="' + postId + '">' +
              '<button class="vote-btn vote-up" data-vote-btn="up" type="button" aria-label="Upvote">' +
                '&#9650;' +
              '</button>' +
              '<span class="vote-score ' + _scoreClass(score) + '" data-vote-score="true">' + _fmtScore(score) + '</span>' +
              '<button class="vote-btn vote-down" data-vote-btn="down" type="button" aria-label="Downvote">' +
                '&#9660;' +
              '</button>' +
            '</div>'
          );
        }

        function syncCard(postId) {
          var clusters = Array.prototype.slice.call(
            document.querySelectorAll('[data-vote-cluster="true"][data-post-id="' + postId + '"]')
          );
          var s = getState(postId);
          var score = s.up - s.down;

          clusters.forEach(function (cluster) {
            var scoreEl = cluster.querySelector('[data-vote-score="true"]');
            var nextScoreText = _fmtScore(score);

            if (scoreEl) {
              if (scoreEl.textContent !== nextScoreText) {
                scoreEl.classList.remove('is-flip-out', 'is-flip-in');
                void scoreEl.offsetWidth;
                scoreEl.classList.add('is-flip-out');
                setTimeout(function () {
                  scoreEl.textContent = nextScoreText;
                  scoreEl.className = 'vote-score ' + _scoreClass(score) + ' is-flip-in';
                  setTimeout(function () {
                    scoreEl.classList.remove('is-flip-in');
                  }, 130);
                }, 90);
              } else {
                scoreEl.className = 'vote-score ' + _scoreClass(score);
              }
            }

            cluster.classList.toggle('is-upvoted', s.userVote === 'up');
            cluster.classList.toggle('is-downvoted', s.userVote === 'down');
          });

          if (typeof ThreadModal !== 'undefined' && ThreadModal.isOpen &&
              ThreadModal.currentPost && ThreadModal.currentPost.id === postId &&
              typeof ThreadModal.syncVoteMetrics === 'function') {
            ThreadModal.syncVoteMetrics();
          }
        }

        function syncAllCards() {
          Object.keys(_states).forEach(function (postId) { syncCard(postId); });
        }

        function flashCluster(postId) {
          var clusters = Array.prototype.slice.call(
            document.querySelectorAll('[data-vote-cluster="true"][data-post-id="' + postId + '"]')
          );
          clusters.forEach(function (cluster) {
            cluster.classList.remove('vote-block-flash');
            void cluster.offsetWidth;
            cluster.classList.add('vote-block-flash');
          });
        }

        function setVote(postId, voteType) {
          var s = getState(postId);
          var current = s.userVote;
          var nextVote = (voteType === current) ? null : voteType;

          if (nextVote !== 'up' && nextVote !== 'down' && nextVote !== null) {
            return s;
          }

          if (current && s[current] > 0) { s[current] -= 1; }

          if (nextVote && typeof s[nextVote] === 'number') {
            s[nextVote] += 1;
            s.userVote = nextVote;
          } else {
            s.userVote = null;
          }

          syncCard(postId);
          return s;
        }

        function clearVote(postId) {
          return setVote(postId, null);
        }

        function toggleQuickVote(postId, voteType) {
          return setVote(postId, voteType);
        }

        function init() {
          document.addEventListener('click', function (event) {
            var cluster = event.target.closest('[data-vote-cluster="true"]');
            var quickBtn = event.target.closest('[data-vote-btn]');
            var postId;

            if (!cluster) { return; }

            postId = cluster.getAttribute('data-post-id');
            if (!postId) { return; }

            if (quickBtn) {
              event.preventDefault();
              event.stopPropagation();
              var type = quickBtn.getAttribute('data-vote-btn');
              toggleQuickVote(postId, type);
              flashCluster(postId);
            }
          });

          document.addEventListener('chrono:post-created', function (event) {
            if (!event || !event.detail || !event.detail.postEl) { return; }
            var postId = event.detail.postEl.getAttribute('data-post-id');
            if (postId) { getState(postId, getPostById(postId)); syncCard(postId); }
          });
        }

        return {
          init: init,
          getState: getState,
          getCounts: getCounts,
          getScore: getScore,
          buildClusterHTML: buildClusterHTML,
          setVote: setVote,
          clearVote: clearVote,
          toggleQuickVote: toggleQuickVote,
          syncCard: syncCard,
          syncAllCards: syncAllCards,
          flashCluster: flashCluster,
        };
      })();
