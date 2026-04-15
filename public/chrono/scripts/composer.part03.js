'use strict';

// ===== EMOJI PICKER =====
      var EmojiPicker = (function () {
        var emojis = ['😀', '😎', '🔥', '💀', '🚀', '🧠', '👁️', '⚡', '❤️', '🫠', '👀', '🤖', '🌌', '🕳️', '🧵', '📡', '🌀', '🫀'];

        function init() {
          // Can be called on demand
        }

        function render(container) {
          container.innerHTML = '';
          var picker = document.createElement('div');
          picker.className = 'emoji-picker';

          var grid = document.createElement('div');
          grid.className = 'emoji-grid';

          emojis.forEach(function (emoji) {
            var btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.type = 'button';
            btn.textContent = emoji;
            btn.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              ComposerController.insertEmoji(emoji);
              EmojiPicker.close();
            });
            grid.appendChild(btn);
          });

          picker.appendChild(grid);
          container.appendChild(picker);
        }

        function close() {
          var container = document.getElementById('emojiPickerContainer');
          if (container) {
            container.innerHTML = '';
          }
          var emojiBtn = document.getElementById('composerEmojiBtn');
          if (emojiBtn) {
            emojiBtn.classList.remove('active');
          }
        }

        return {
          init: init,
          render: render,
          close: close
        };
      })();

var AutocompleteSystem = {};

Object.assign(AutocompleteSystem, {
dropdown: null,
headerEl: null,
listEl: null,
activeField: null,
triggerData: null,
selectedIndex: -1,
currentItems: [],
debounceTimer: null,
blurTimer: null,
closeTimer: null,
lastSignature: '',
isOpen: false,
pointerInsideDropdown: false,
observer: null,
init: function () {
          var self = this;

          this.createDropdownElement();
          this.attachToField(document.getElementById('postComposer'));
          this.attachToField(document.getElementById('globalSearch'));

          Array.prototype.slice.call(document.querySelectorAll('.thread-reply-textarea')).forEach(function (field) {
            self.attachToField(field);
          });

          this.observeDynamicFields();
          this.bindGlobalEvents();

          window.registerTextareaForAutocomplete = function (el) {
            self.attachToField(el);
          };
        },
createDropdownElement: function () {
          var self = this;

          if (this.dropdown) {
            return;
          }

          this.dropdown = document.createElement('div');
          this.dropdown.id = 'autocompleteDropdown';
          this.dropdown.className = 'autocomplete-dropdown';
          this.dropdown.setAttribute('aria-hidden', 'true');
          this.dropdown.innerHTML = '<div class="autocomplete-header"></div><div class="autocomplete-list"></div>';

          document.body.appendChild(this.dropdown);
          this.headerEl = this.dropdown.querySelector('.autocomplete-header');
          this.listEl = this.dropdown.querySelector('.autocomplete-list');

          this.dropdown.addEventListener('mouseenter', function () {
            self.pointerInsideDropdown = true;
          });

          this.dropdown.addEventListener('mouseleave', function () {
            self.pointerInsideDropdown = false;
          });

          this.dropdown.addEventListener('mousedown', function (event) {
            event.preventDefault();
          });

          this.dropdown.addEventListener('mousemove', function (event) {
            var item = event.target.closest('.autocomplete-item');
            if (!item) {
              return;
            }

            var index = Number(item.getAttribute('data-index'));
            if (!Number.isNaN(index)) {
              self.setSelectedIndex(index);
            }
          });

          this.dropdown.addEventListener('click', function (event) {
            var item = event.target.closest('.autocomplete-item');
            if (!item) {
              return;
            }

            var index = Number(item.getAttribute('data-index'));
            if (Number.isNaN(index)) {
              return;
            }

            self.selectByIndex(index);
          });
        },
observeDynamicFields: function () {
          var self = this;

          if (this.observer || !window.MutationObserver || !document.body) {
            return;
          }

          this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              Array.prototype.slice.call(mutation.addedNodes || []).forEach(function (node) {
                if (!node || node.nodeType !== 1) {
                  return;
                }

                if (node.matches && node.matches('.thread-reply-textarea')) {
                  self.attachToField(node);
                }

                if (node.querySelectorAll) {
                  Array.prototype.slice.call(node.querySelectorAll('.thread-reply-textarea')).forEach(function (field) {
                    self.attachToField(field);
                  });
                }
              });
            });
          });

          this.observer.observe(document.body, { childList: true, subtree: true });
        },
bindGlobalEvents: function () {
          var self = this;

          window.addEventListener('resize', function () {
            self.reposition();
          });

          window.addEventListener('scroll', function () {
            self.reposition();
          }, true);

          document.addEventListener('mousedown', function (event) {
            if (!self.isOpen) {
              return;
            }

            if (self.dropdown && self.dropdown.contains(event.target)) {
              return;
            }

            if (self.activeField && event.target === self.activeField) {
              return;
            }

            self.close();
          });
        }
});
