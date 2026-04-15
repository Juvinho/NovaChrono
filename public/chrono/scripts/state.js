'use strict';

var postStore = [
        {
          id: 'p1',
          user: '@cuberta_dobrada',
          avatar: 'https://picsum.photos/seed/p1-avatar/80/80',
          time: 'ha 8 min',
          text: 'A chuva neon refletindo no asfalto hoje parecia frame de filme antigo. $artedistopica',
          verified: true,
          following: true,
          metrics: { comments: 5, reposts: 2, likes: 12 },
          state: { repost: false, like: false, bookmark: false }
        },
        {
          id: 'p2',
          user: '@Sus_Bacon',
          avatar: 'https://picsum.photos/seed/p2-avatar/80/80',
          time: 'ha 21 min',
          text: 'A ponte de aco no fim da avenida acendeu sozinha de novo. Alguem mais viu?',
          image: 'https://picsum.photos/seed/chrono-bridge/760/420',
          verified: false,
          following: false,
          metrics: { comments: 17, reposts: 6, likes: 34 },
          state: { repost: false, like: true, bookmark: false }
        },
        {
          id: 'p3',
          user: '@padaria_quantica',
          avatar: 'https://picsum.photos/seed/p3-avatar/80/80',
          time: 'ha 39 min',
          text: 'Qual e o melhor lanche da Chrono?',
          verified: false,
          following: true,
          poll: {
            options: [
              { id: 'opt_0', text: 'Pao de queijo', votes: 0 },
              { id: 'opt_1', text: 'Pao de batata', votes: 0 },
              { id: 'opt_2', text: 'Tapioca', votes: 0 }
            ],
            totalVotes: 0,
            duration: 86400,
            durationLabel: '1 dia',
            expiresAt: Date.now() + 86400000,
            userVote: null,
            closed: false
          },
          metrics: { comments: 2, reposts: 1, likes: 9 },
          state: { repost: false, like: false, bookmark: true }
        },
        {
          id: 'p4',
          user: '@eco_do_tunel',
          avatar: 'https://picsum.photos/seed/p4-avatar/80/80',
          time: 'ha 1 h',
          text: 'Ecoei isso porque resume bem o que a cidade virou hoje cedo.',
          verified: true,
          following: false,
          repostInfo: '↩ @ferrovelho Ecoou',
          repost: {
            user: '@ferrovelho',
            time: 'ha 1 h',
            text: 'A estacao velha abriu as portas por 47 segundos. Quem entrou saiu com cheiro de mar.',
            image: 'https://picsum.photos/seed/chrono-station/700/360'
          },
          metrics: { comments: 6, reposts: 4, likes: 21 },
          state: { repost: true, like: false, bookmark: false }
        },
        {
          id: 'p5',
          user: '@linha_13',
          avatar: 'https://picsum.photos/seed/p5-avatar/80/80',
          time: 'ha 2 h',
          text: 'Parte 2/4: o sinal da torre mudou para violeta. To juntando tudo neste cordao.',
          verified: false,
          following: true,
          thread: true,
          threadNote: 'Este post faz parte de um cordao em andamento.',
          metrics: { comments: 9, reposts: 2, likes: 18 },
          state: { repost: false, like: false, bookmark: false }
        },
        {
          id: 'p6',
          user: '@cronista_da_rua',
          avatar: 'https://picsum.photos/seed/p6-avatar/80/80',
          time: 'ha 3 h',
          text: 'Prefere trabalhar de dia ou de noite?',
          verified: true,
          following: false,
          poll: {
            options: [
              { id: 'opt_0', text: 'De dia', votes: 14 },
              { id: 'opt_1', text: 'De noite', votes: 31 }
            ],
            totalVotes: 45,
            duration: 604800,
            durationLabel: '1 semana',
            expiresAt: Date.now() + 518400000,
            userVote: null,
            closed: false
          },
          metrics: { comments: 13, reposts: 3, likes: 15 },
          state: { repost: false, like: false, bookmark: false }
        }
      ];

      var state = {
        activeTab: 'todos',
        query: '',
        selectedDate: ''
      };

      const FOLLOWING_USERS = [
        'cuberta_dobrada',
        'Sus_Bacon',
        'orbital_zero',
        'Juvinho'
      ];

      const MOCK_USERS = [
        { username: 'cuberta_dobrada', display: 'Cuberta Dobrada', avatar: 'https://picsum.photos/seed/cuberta/32/32', followers: 1420, verified: true },
        { username: 'Sus_Bacon', display: 'Sus Bacon', avatar: 'https://picsum.photos/seed/bacon/32/32', followers: 893, verified: true },
        { username: 'satelite_urbano', display: 'Satelite Urbano', avatar: 'https://picsum.photos/seed/satelite/32/32', followers: 672, verified: false },
        { username: 'padaria_quantica', display: 'Padaria Quantica', avatar: 'https://picsum.photos/seed/padaria/32/32', followers: 512, verified: false },
        { username: 'orbital_zero', display: 'Orbital Zero', avatar: 'https://picsum.photos/seed/orbital/32/32', followers: 445, verified: false },
        { username: 'nebula_core', display: 'Nebula Core', avatar: 'https://picsum.photos/seed/nebula/32/32', followers: 389, verified: true },
        { username: 'pixel_ghost', display: 'Pixel Ghost', avatar: 'https://picsum.photos/seed/pixel/32/32', followers: 310, verified: false },
        { username: 'byte_favela', display: 'Byte Favela', avatar: 'https://picsum.photos/seed/byte/32/32', followers: 280, verified: false },
        { username: 'iron_silva', display: 'Iron Silva', avatar: 'https://picsum.photos/seed/iron/32/32', followers: 215, verified: false },
        { username: 'Juvinho', display: 'Juvinho', avatar: 'https://picsum.photos/seed/juvinho/32/32', followers: 1150, verified: true }
      ];

      const MOCK_CORDOES = [
        { name: 'artedistopica', posts: 847, trending: true },
        { name: 'ossodemais', posts: 312, trending: true },
        { name: 'fodademais', posts: 198, trending: false },
        { name: 'Railway', posts: 156, trending: false },
        { name: 'chrono', posts: 723, trending: true },
        { name: 'neoncity', posts: 445, trending: true },
        { name: 'dystopia', posts: 334, trending: false },
        { name: 'urbano', posts: 289, trending: false },
        { name: 'logdoservidor', posts: 134, trending: false },
        { name: 'sinaldaestacao', posts: 98, trending: false }
      ];

      var feedList = document.getElementById('feedList');
      var feedSkeleton = document.getElementById('feedSkeleton');
      var tabs = Array.prototype.slice.call(document.querySelectorAll('.feed-tab'));
      var searchInput = document.getElementById('globalSearch');
      var composer = document.getElementById('postComposer');
      var publishBtn = document.getElementById('publishBtn');
      var timelineScroll = document.getElementById('timelineScroll');
      var timelineScrollWrap = document.getElementById('timelineScrollWrap');
      var timelineTodayBtn = document.getElementById('timelineTodayBtn');
      var timelineCalendarToggle = document.getElementById('timelineCalendarToggle');
      var timelineCalendarPopup = document.getElementById('timelineCalendarPopup');
      var timelineTooltip = document.getElementById('timelineTooltip');
      var timelineMonthLabel = document.getElementById('timelineMonthLabel');
      var calendarPrevMonth = document.getElementById('calendarPrevMonth');
      var calendarNextMonth = document.getElementById('calendarNextMonth');
      var calendarGrid = document.getElementById('calendarGrid');
      var calendarTitle = document.getElementById('calendarTitle');
      var calendarJumpInput = document.getElementById('calendarJumpInput');
      var calendarJumpGo = document.getElementById('calendarJumpGo');
      var calendarJumpToday = document.getElementById('calendarJumpToday');
      var toastHost = document.getElementById('timelineToastHost');
      var feedColumn = document.querySelector('.feed-column');
      var threadModalOverlay = document.getElementById('threadModalOverlay');
      var threadModalPanel = document.getElementById('threadModalPanel');
      var threadModalContent = document.getElementById('threadModalContent');
      var threadBackBtn = document.getElementById('threadBackBtn');
      var threadShareBtn = document.getElementById('threadShareBtn');
      var threadLightbox = document.getElementById('threadLightbox');
      var threadLightboxImage = document.getElementById('threadLightboxImage');
      var threadLightboxClose = document.getElementById('threadLightboxClose');
      var voteModalOverlay = document.getElementById('voteModalOverlay');
      var voteModal = document.getElementById('voteModal');
      var voteModalHeader = document.getElementById('voteModalHeader');
      var voteModalBody = document.getElementById('voteModalBody');
      var voteModalFooter = document.getElementById('voteModalFooter');
      var appMain = document.querySelector('.app-main');
      var appViewContainer = document.getElementById('app-view-container');
      var appViews = Array.prototype.slice.call(document.querySelectorAll('#app-view-container .app-view'));

      var viewProfile = document.getElementById('view-profile');
      var viewCordao = document.getElementById('view-cordao');
      var viewEditProfile = document.getElementById('view-edit-profile');
      var viewStats = document.getElementById('view-stats');
      var viewTheme = document.getElementById('view-theme');
      var viewLanguage = document.getElementById('view-language');
      var viewSignedOut = document.getElementById('view-signed-out');

      var profileButtonAvatar = document.querySelector('#profileButton img');
      var profileNameLabel = document.querySelector('#profileButton .profile-name');
      var profileDropdownAvatar = document.getElementById('profileDropdownAvatar');
      var profileMenuHandle = document.getElementById('profileMenuHandle');
      var profileMenuDisplayName = document.getElementById('profileMenuDisplayName');
      var languageMenuLabel = document.getElementById('languageMenuLabel');
      var composerAvatar = document.getElementById('composerAvatar');

      var profileDisplayNameEl = document.getElementById('profileDisplayName');
      var profileHandleEl = document.getElementById('profileHandle');
      var profileBioEl = document.getElementById('profileBio');
      var profileMetaLocationEl = document.getElementById('profileMetaLocation');
      var profileMetaCordaoEl = document.getElementById('profileMetaCordao');
      var profileAvatarLarge = document.getElementById('profileAvatarLarge');
      var profileCoverEl = document.getElementById('profileCover');
      var profilePostsList = document.getElementById('profilePostsList');
      var profileTabs = document.getElementById('profileTabs');
      var profileTabPanels = document.getElementById('profileTabPanels');

      var profileViewButton = document.getElementById('profileViewButton');
      var profileEditButton = document.getElementById('profileEditButton');
      var profileStatsButton = document.getElementById('profileStatsButton');
      var languageSettingsButton = document.getElementById('languageSettingsButton');
      var profileEditCta = document.getElementById('profileEditCta');
      var profileBackToFeedCta = document.getElementById('profileBackToFeedCta');
      var profileFollowingBtn = document.getElementById('profileFollowingBtn');
      var profileFollowersBtn = document.getElementById('profileFollowersBtn');
      var profileFollowersCount = document.getElementById('profileFollowersCount');
      var profileFollowingCount = document.getElementById('profileFollowingCount');
      var profilePostsCount = document.getElementById('profilePostsCount');

      var editProfileForm = document.getElementById('editProfileForm');
      var editAvatarPreview = document.getElementById('editProfileAvatarPreview');
      var editCoverPreview = document.getElementById('editCoverPreview');
      var editAvatarButton = document.getElementById('editAvatarButton');
      var editCoverButton = document.getElementById('editCoverButton');
      var editAvatarInput = document.getElementById('editAvatarInput');
      var editCoverInput = document.getElementById('editCoverInput');
      var editDisplayNameInput = document.getElementById('editDisplayName');
      var editUsernameInput = document.getElementById('editUsername');
      var editUsernameError = document.getElementById('editUsernameError');
      var editBioInput = document.getElementById('editBio');
      var editBioCounter = document.getElementById('editBioCounter');
      var editLocationInput = document.getElementById('editLocation');
      var editWebsiteInput = document.getElementById('editWebsite');
      var editFavoriteCordaoInput = document.getElementById('editFavoriteCordao');
      var editCancelButton = document.getElementById('editCancelButton');

      var statsPeriodTabs = document.getElementById('statsPeriodTabs');
      var statsBars = document.getElementById('statsBars');
      var statsTopPosts = document.getElementById('statsTopPosts');
      var kpiViews = document.getElementById('kpiViews');
      var kpiBoosts = document.getElementById('kpiBoosts');
      var kpiEcos = document.getElementById('kpiEcos');
      var kpiReplies = document.getElementById('kpiReplies');
      var kpiViewsTrend = document.getElementById('kpiViewsTrend');
      var kpiBoostsTrend = document.getElementById('kpiBoostsTrend');
      var kpiEcosTrend = document.getElementById('kpiEcosTrend');
      var kpiRepliesTrend = document.getElementById('kpiRepliesTrend');

      var themeModeChoices = document.getElementById('themeModeChoices');
      var densityChoices = document.getElementById('densityChoices');
      var toggleReducedMotion = document.getElementById('toggleReducedMotion');
      var toggleParticles = document.getElementById('toggleParticles');
      var toggleCordaoHighlight = document.getElementById('toggleCordaoHighlight');
      var applyThemeSettingsButton = document.getElementById('applyThemeSettingsButton');

      var languageList = document.getElementById('languageList');
      var createThreadBtn = document.getElementById('createThreadBtn');
      var rightThreadList = document.getElementById('rightThreadList');
      var cordaoSidebarList = document.getElementById('cordaoSidebarList');
      var cordaoHeaderCard = document.getElementById('cordaoHeaderCard');
      var cordaoComposerCard = document.getElementById('cordaoComposerCard');
      var cordaoFeedList = document.getElementById('cordaoFeedList');
      var notifViewAllButton = document.getElementById('notifViewAllButton');
      var feedTabAll = document.getElementById('feedTabAll');
      var feedTabFollowing = document.getElementById('feedTabFollowing');
      var feedTabMedia = document.getElementById('feedTabMedia');
      var feedTabPolls = document.getElementById('feedTabPolls');
      var signInAgainButton = document.getElementById('signInAgainButton');
      var signedOutTitle = document.getElementById('signedOutTitle');
      var signedOutText = document.getElementById('signedOutText');
      var editViewTitle = document.getElementById('editViewTitle');
      var editViewSubtitle = document.getElementById('editViewSubtitle');
      var statsViewTitle = document.getElementById('statsViewTitle');
      var statsViewSubtitle = document.getElementById('statsViewSubtitle');
      var themeViewTitle = document.getElementById('themeViewTitle');
      var themeViewSubtitle = document.getElementById('themeViewSubtitle');
      var languageViewTitle = document.getElementById('languageViewTitle');
      var languageViewSubtitle = document.getElementById('languageViewSubtitle');
      var logoutTitleEl = document.getElementById('logoutTitle');
      var logoutSubtitleEl = document.getElementById('logoutSubtitle');

      var miniModalOverlay = document.getElementById('miniModalOverlay');
      var miniModalTitle = document.getElementById('miniModalTitle');
      var miniModalList = document.getElementById('miniModalList');
      var miniModalCloseButton = document.getElementById('miniModalCloseButton');
      var unsavedOverlay = document.getElementById('unsavedOverlay');
      var unsavedCancelButton = document.getElementById('unsavedCancelButton');
      var unsavedDiscardButton = document.getElementById('unsavedDiscardButton');
      var cordaoModalOverlay = document.getElementById('cordaoModalOverlay');
      var cordaoModal = document.getElementById('cordaoModal');
      var cordaoModalClose = document.getElementById('cordaoModalClose');
      var cordaoModalTextarea = document.getElementById('cordaoModalTextarea');
      var cordaoModalInput = document.getElementById('cordaoModalInput');
      var cordaoModalChips = document.getElementById('cordaoModalChips');
      var cordaoModalCounter = document.getElementById('cordaoModalCounter');
      var cordaoModalError = document.getElementById('cordaoModalError');
      var cordaoModalCancel = document.getElementById('cordaoModalCancel');
      var cordaoModalPublish = document.getElementById('cordaoModalPublish');
      var cordaoModalUserAvatar = document.getElementById('cordaoModalUserAvatar');
      var cordaoModalUserName = document.getElementById('cordaoModalUserName');
      var cordaoModalUserHandle = document.getElementById('cordaoModalUserHandle');
      var appToastHost = document.getElementById('appToastHost');

      function pollDurationLabelFromSeconds(seconds) {
        var safe = Number(seconds) || 86400;

        if (safe === 3600) {
          return '1 hora';
        }

        if (safe === 604800) {
          return '1 semana';
        }

        return '1 dia';
      }

      function normalizePollForStore(poll, createdAt) {
        if (!poll || typeof poll !== 'object') {
          return null;
        }

        var options = (Array.isArray(poll.options) ? poll.options : [])
          .map(function (option, index) {
            var source = option || {};
            var text = typeof source.text === 'string' ? source.text : source.label;
            text = String(text || '').trim().slice(0, 80);

            return {
              id: String(source.id || ('opt_' + index)),
              text: text,
              votes: Math.max(0, Number(source.votes) || 0)
            };
          })
          .filter(function (option) {
            return option.text.length > 0;
          });

        if (options.length < 2) {
          return null;
        }

        var duration = Number(poll.duration);
        if (duration !== 3600 && duration !== 86400 && duration !== 604800) {
          duration = 86400;
        }

        var expiresAt = Number(poll.expiresAt);
        if (!Number.isFinite(expiresAt)) {
          var created = Number(createdAt);
          if (!Number.isFinite(created)) {
            created = Date.now();
          }
          expiresAt = created + (duration * 1000);
        }

        var totalVotes = Number(poll.totalVotes);
        if (!Number.isFinite(totalVotes) || totalVotes < 0) {
          totalVotes = options.reduce(function (sum, option) {
            return sum + option.votes;
          }, 0);
        }

        var userVote = poll.userVote === null ? null : String(poll.userVote || '');
        if (userVote && !options.some(function (option) { return option.id === userVote; })) {
          userVote = null;
        }

        return {
          options: options,
          totalVotes: totalVotes,
          duration: duration,
          durationLabel: String(poll.durationLabel || pollDurationLabelFromSeconds(duration)),
          expiresAt: expiresAt,
          userVote: userVote,
          closed: !!poll.closed || Date.now() >= expiresAt
        };
      }

      function normalizePostForStore(post) {
        var nextPost = Object.assign({}, post || {});
        nextPost.poll = normalizePollForStore(nextPost.poll, nextPost.createdAt);
        return nextPost;
      }

      postStore = postStore.map(normalizePostForStore);

      postStore.forEach(function (post, index) {
        applyPostMetadata(post, 'initial', index);
      });

      if (typeof AppState === 'undefined') {
        var AppState = {
          user: {
            username: 'juvinho',
            displayName: 'Juvinho Silva'
          },
          theme: 'dark',
          currentView: 'feed'
        };
      }

      var FeedStore = {
        posts: postStore,
        addPost: function (post) {
          if (!post || typeof post !== 'object') {
            return null;
          }

          var nextPost = normalizePostForStore(post);
          if (!nextPost.id) {
            nextPost.id = generateId('post');
          }

          if (!nextPost.createdAt) {
            nextPost.createdAt = Date.now();
          }

          applyPostMetadata(nextPost, nextPost.source || 'feed-store', 0);
          postStore.unshift(nextPost);
          return nextPost;
        },
        getPostById: function (postId) {
          return postStore.find(function (item) {
            return item.id === postId;
          }) || null;
        },
        upsertPoll: function (postId, poll) {
          var post = this.getPostById(postId);
          if (!post) {
            return null;
          }

          post.poll = normalizePollForStore(poll, post.createdAt);
          return post.poll;
        },
        getPosts: function () {
          return postStore.slice();
        }
      };

      var MockData = {
        posts: postStore,
        users: Array.isArray(MOCK_USERS) ? MOCK_USERS.slice() : []
      };

      // Expose globals for search-overlay.js, header.js, and other modules
      window.searchInput = searchInput;
      window.MOCK_USERS = MOCK_USERS;
      window.MOCK_CORDOES = MOCK_CORDOES;
      window.postStore = postStore;
      window.MockData = MockData;
      window.FeedStore = FeedStore;
      window.AppState = AppState;
