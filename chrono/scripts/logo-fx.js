'use strict';

var ChronoLogoFX = {
        logoEl: null,
        stackEl: null,
        imgEl: null,
        logoSources: [],
        sourceIndex: 0,
        isGlitching: false,
        glitchTimer: 0,

        captureElements: function () {
          this.logoEl = document.querySelector('.chrono-logo');
          this.stackEl = this.logoEl ? this.logoEl.querySelector('.chrono-logo-stack') : null;
          this.imgEl = this.logoEl ? this.logoEl.querySelector('.chrono-logo-img') : null;
        },

        init: function () {
          this.captureElements();
          if (!this.logoEl || !this.stackEl || !this.imgEl) {
            return;
          }

          this.prepareLogoSources();
          this.bindImageEvents();
          this.bindInteractionEvents();

          if (this.imgEl.complete && this.imgEl.naturalWidth === 0) {
            this.applyNextLogoSource();
          } else {
            this.syncGlitchBackground();
          }

          this.syncWithRoute(AppRouter && AppRouter.currentView ? AppRouter.currentView : 'feed');
        },

        prepareLogoSources: function () {
          var initial = String(this.imgEl.getAttribute('src') || '').trim();
          var isFileProtocol = !!(window.location && window.location.protocol === 'file:');
          var candidates = [
            initial,
            'public/Chrono.png',
            './public/Chrono.png',
            'Chrono.png',
            CHRONO_LOGO_FALLBACK_DATA_URI
          ];

          if (!isFileProtocol) {
            candidates.splice(3, 0, '/Chrono.png');
          }

          var seen = {};
          this.logoSources = [];
          this.sourceIndex = 0;

          candidates.forEach(function (source) {
            if (!source || seen[source]) {
              return;
            }

            seen[source] = true;
            this.logoSources.push(source);
          }, this);
        },

        applyNextLogoSource: function () {
          if (!this.imgEl || !this.logoSources.length) {
            return;
          }

          if (this.sourceIndex >= this.logoSources.length - 1) {
            return;
          }

          this.sourceIndex += 1;
          this.imgEl.src = this.logoSources[this.sourceIndex];
        },

        bindImageEvents: function () {
          var self = this;

          this.imgEl.addEventListener('load', function () {
            self.syncGlitchBackground();
          });

          this.imgEl.addEventListener('error', function () {
            self.applyNextLogoSource();
          });
        },

        bindInteractionEvents: function () {
          var self = this;

          this.logoEl.addEventListener('mouseenter', function () {
            self.triggerGlitch();
          });

          this.logoEl.addEventListener('focus', function () {
            self.triggerGlitch();
          }, true);

          this.logoEl.addEventListener('mouseleave', function () {
            self.logoEl.classList.remove('is-glitching');
            self.isGlitching = false;

            if (self.glitchTimer) {
              clearTimeout(self.glitchTimer);
              self.glitchTimer = 0;
            }
          });
        },

        syncGlitchBackground: function () {
          if (!this.stackEl || !this.imgEl) {
            return;
          }

          var source = this.imgEl.currentSrc || this.imgEl.getAttribute('src') || '';
          if (!source) {
            return;
          }

          this.stackEl.style.setProperty('--chrono-logo-bg', 'url("' + source + '")');
        },

        shouldReduceMotion: function () {
          if (document.body && document.body.classList.contains('reduced-motion')) {
            return true;
          }

          return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        },

        triggerGlitch: function () {
          if (!this.logoEl || this.shouldReduceMotion() || this.isGlitching) {
            return;
          }

          this.isGlitching = true;
          this.logoEl.classList.add('is-glitching');

          if (this.glitchTimer) {
            clearTimeout(this.glitchTimer);
          }

          var self = this;
          this.glitchTimer = setTimeout(function () {
            self.logoEl.classList.remove('is-glitching');
            self.isGlitching = false;
            self.glitchTimer = 0;
          }, 460);
        },

        syncWithRoute: function (viewName) {
          this.captureElements();
          if (!this.logoEl) {
            return;
          }

          var hasActiveRoute = !!String(viewName || '').trim() || !!window.location.hash;
          var logo = this.logoEl;

          logo.classList.remove('is-route-active');

          if (!hasActiveRoute) {
            return;
          }

          requestAnimationFrame(function () {
            logo.classList.add('is-route-active');
          });
        }
      };


var HeaderLogoController = {
        logoEl: null,
        hashBound: false,

        init: function () {
          this.logoEl = document.querySelector('.chrono-logo');
          this.syncWithRoute(AppRouter && AppRouter.currentView ? AppRouter.currentView : window.location.hash);

          if (!this.hashBound) {
            var self = this;
            window.addEventListener('hashchange', function () {
              self.syncWithRoute(window.location.hash);
            });
            this.hashBound = true;
          }
        },

        syncWithRoute: function (viewName) {
          if (!this.logoEl) {
            return;
          }

          var hasActiveRoute = !!String(viewName || '').trim() || !!window.location.hash;
          var logo = this.logoEl;

          logo.classList.remove('is-route-active');

          if (!hasActiveRoute) {
            return;
          }

          requestAnimationFrame(function () {
            logo.classList.add('is-route-active');
          });
        }
      };
