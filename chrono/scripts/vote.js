'use strict';

var VoteSystem = (function () {

        var _states = {};
        var _longPressTimer = null;

        function _createState(post) {
          var rng = seededRandom((post && post.id ? post.id : 'post') + '-vote');
          return {
            up: 10 + Math.floor(rng() * 20),
            stable: 3 + Math.floor(rng() * 10),
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

        function getState(postId, post) {
          if (!postId) { return { up: 0, stable: 0, down: 0, userVote: null }; }
          if (!_states[postId]) {
            _states[postId] = _createState(post || getPostById(postId) || { id: postId });
          }
          return _states[postId];
        }

        function getCounts(postId) {
          var s = getState(postId);
          return { up: s.up, stable: s.stable, down: s.down };
        }

        function getScore(postId) {
          var s = getState(postId);
          return s.up - s.down;
        }

        function buildClusterHTML(postId) {
          var s = getState(postId);
          var score = s.up - s.down;
          return (
            '<div class="vote-cluster" data-vote-cluster="true" data-post-id="' + postId + '">' +
              '<button class="vote-quick vote-up' + (s.userVote === 'up' ? ' is-active' : '') + '" data-vote-quick="up" type="button" aria-label="Upvote">' +
                '<i data-lucide="chevron-up"></i>' +
              '</button>' +
              '<span class="vote-score-value ' + _scoreClass(score) + '" data-vote-score="true">' + _fmtScore(score) + '</span>' +
              '<button class="vote-quick vote-stable' + (s.userVote === 'stable' ? ' is-active' : '') + '" data-vote-quick="stable" type="button" aria-label="Estavel">' +
                '<i data-lucide="minus"></i>' +
              '</button>' +
              '<button class="vote-quick vote-down' + (s.userVote === 'down' ? ' is-active' : '') + '" data-vote-quick="down" type="button" aria-label="Downvote">' +
                '<i data-lucide="chevron-down"></i>' +
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
            if (scoreEl) {
              scoreEl.textContent = _fmtScore(score);
              scoreEl.className = 'vote-score-value ' + _scoreClass(score);
            }

            Array.prototype.slice.call(cluster.querySelectorAll('[data-vote-quick]')).forEach(function (btn) {
              btn.classList.toggle('is-active', s.userVote === btn.getAttribute('data-vote-quick'));
            });
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
            cluster.classList.remove('vote-cluster-flash');
            void cluster.offsetWidth;
            cluster.classList.add('vote-cluster-flash');
          });
        }

        function setVote(postId, voteType) {
          var s = getState(postId);
          var current = s.userVote;

          if (current === voteType) { return s; }

          if (current && s[current] > 0) { s[current] -= 1; }

          if (voteType && typeof s[voteType] === 'number') {
            s[voteType] += 1;
            s.userVote = voteType;
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
          var s = getState(postId);
          if (s.userVote === voteType) {
            return clearVote(postId);
          }
          return setVote(postId, voteType);
        }

        function _animateBtn(btn, type) {
          var map = { up: 'vote-pop-up', stable: 'vote-pop-stable', down: 'vote-pop-down' };
          var cls = map[type];
          if (!cls) { return; }
          btn.classList.remove(cls);
          void btn.offsetWidth;
          btn.classList.add(cls);
          setTimeout(function () { btn.classList.remove(cls); }, 320);
        }

        function init() {
          document.addEventListener('click', function (event) {
            var cluster = event.target.closest('[data-vote-cluster="true"]');
            var quickBtn = event.target.closest('[data-vote-quick]');
            var openBtn = event.target.closest('[data-vote-open="true"]');
            var postId;

            if (!cluster) { return; }

            postId = cluster.getAttribute('data-post-id');
            if (!postId) { return; }

            if (quickBtn) {
              event.preventDefault();
              event.stopPropagation();
              var type = quickBtn.getAttribute('data-vote-quick');
              toggleQuickVote(postId, type);
              _animateBtn(quickBtn, type);
              flashCluster(postId);
              return;
            }

            if (openBtn) {
              event.preventDefault();
              event.stopPropagation();
              if (typeof VoteModal !== 'undefined' && typeof VoteModal.open === 'function') {
                VoteModal.open(postId, openBtn);
              }
            }
          });

          document.addEventListener('pointerdown', function (event) {
            var cluster = event.target.closest('[data-vote-cluster="true"]');
            if (!cluster) { return; }
            if (event.pointerType === 'mouse' && event.button !== 0) { return; }

            clearTimeout(_longPressTimer);
            _longPressTimer = setTimeout(function () {
              var postId = cluster.getAttribute('data-post-id');
              if (postId && typeof VoteModal !== 'undefined' && typeof VoteModal.open === 'function') {
                VoteModal.open(postId, cluster);
              }
            }, 350);
          });

          function cancelLongPress() { clearTimeout(_longPressTimer); _longPressTimer = null; }
          document.addEventListener('pointerup', cancelLongPress);
          document.addEventListener('pointercancel', cancelLongPress);

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
