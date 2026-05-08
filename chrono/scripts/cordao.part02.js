'use strict';

var SidebarCordoes = {
        activeSlug: '',
        initialized: false,

        init: function () {
          if (this.initialized) {
            return;
          }

          this.initialized = true;
          this.bindList(rightThreadList);
          this.bindList(cordaoSidebarList);

          var self = this;
          CordaoStore.subscribe(function () {
            self.render();
          });

          this.render();
        },

        bindList: function (listEl) {
          if (!listEl) {
            return;
          }

          listEl.addEventListener('click', function (event) {
            var item = event.target.closest('.thread-item[data-cordao-slug]');
            if (!item) {
              return;
            }

            var slug = item.getAttribute('data-cordao-slug');
            if (!slug) {
              return;
            }

            CordaoRouter.navigateToSlug(slug);
          });
        },

        setActiveSlug: function (slug) {
          this.activeSlug = toCordaoSlug(slug);
          this.paintActiveState();
        },

        paintActiveState: function () {
          var current = this.activeSlug;

          [rightThreadList, cordaoSidebarList].forEach(function (listEl) {
            if (!listEl) {
              return;
            }

            Array.prototype.slice.call(listEl.querySelectorAll('.thread-item[data-cordao-slug]')).forEach(function (item) {
              item.classList.toggle('is-active', item.getAttribute('data-cordao-slug') === current);
            });
          });
        },

        renderList: function (listEl) {
          if (!listEl) {
            return;
          }

          var self = this;
          var items = CordaoStore.getCordoes();

          if (!items.length) {
            listEl.innerHTML = '';
            return;
          }

          listEl.innerHTML = items.map(function (item) {
            var slug = item.slug;
            var isActive = slug === self.activeSlug;
            var classes = 'thread-item' + (isActive ? ' is-active' : '');

            return (
              '<li class="' + classes + '" data-cordao-slug="' + slug + '">' +
                '<span class="tag">' + displayCordao(slug) + '</span>' +
                '<span class="count">' + formatCompactCount(Number(item.posts) || 0) + '</span>' +
              '</li>'
            );
          }).join('');
        },

        render: function () {
          this.renderList(rightThreadList);
          this.renderList(cordaoSidebarList);
          this.paintActiveState();
        }
      };

var CordaoRouter = {
        activeSlug: '',

        parseRouteSlug: function (route) {
          var normalized = String(route || '').replace(/^#/, '').replace(/^\/+/, '').toLowerCase();
          var match = normalized.match(/^cordao(?:\/([a-z0-9_]+))?$/);

          if (!match) {
            return '';
          }

          return toCordaoSlug(match[1] || '');
        },

        getFallbackSlug: function () {
          var list = CordaoStore.getCordoes();
          return list.length ? String(list[0].slug || '') : 'chrono';
        },

        syncFromRoute: function (route) {
          var normalized = String(route || '').replace(/^#/, '').replace(/^\/+/, '').toLowerCase();
          var slug = this.parseRouteSlug(normalized);

          if (!slug) {
            slug = this.getFallbackSlug();
          }

          if (!slug) {
            return '';
          }

          this.activeSlug = slug;
          SidebarCordoes.setActiveSlug(slug);

          var expected = 'cordao/' + slug;
          if (normalized !== expected && AppRouter && typeof AppRouter.navigate === 'function') {
            AppRouter.navigate(expected, { replace: true });
          }

          return slug;
        },

        navigateToSlug: function (slug, options) {
          var safeSlug = toCordaoSlug(slug);
          if (!safeSlug) {
            return;
          }

          if (AppRouter && typeof AppRouter.navigate === 'function') {
            AppRouter.navigate('cordao/' + safeSlug, options || {});
            return;
          }

          window.location.hash = 'cordao/' + safeSlug;
        }
      };
