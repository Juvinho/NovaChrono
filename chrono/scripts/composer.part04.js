'use strict';

Object.assign(AutocompleteSystem, {
attachToField: function (field) {
          var self = this;

          if (!field || field.getAttribute('data-autocomplete-attached') === 'true') {
            return;
          }

          var tagName = field.tagName ? field.tagName.toLowerCase() : '';
          if (tagName !== 'textarea' && tagName !== 'input') {
            return;
          }

          if (tagName === 'input' && field.id !== 'globalSearch') {
            return;
          }

          field.setAttribute('data-autocomplete-attached', 'true');

          if (tagName === 'textarea') {
            this.createHighlightOverlay(field);
            this.updateHighlight(field);
          }

          field.addEventListener('input', function (event) {
            self.onInput(event);
          });

          field.addEventListener('keydown', function (event) {
            self.onKeydown(event);
          });

          field.addEventListener('blur', function () {
            clearTimeout(self.blurTimer);
            self.blurTimer = setTimeout(function () {
              if (!self.pointerInsideDropdown) {
                self.close();
              }
            }, 150);
          });

          if (tagName === 'textarea') {
            field.addEventListener('scroll', function () {
              self.syncHighlightScroll(field);
            });
          }
        },
onInput: function (event) {
          var self = this;
          var field = event.target;

          if (field.tagName && field.tagName.toLowerCase() === 'textarea') {
            this.updateHighlight(field);
          }

          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(function () {
            var trigger = detectTrigger(field);

            if (!trigger) {
              if (self.activeField === field) {
                self.close();
              }
              return;
            }

            self.activeField = field;
            self.triggerData = trigger;
            self.selectedIndex = -1;
            self.render(trigger, field);
          }, 80);
        },
onKeydown: function (event) {
          if (!this.isOpen || !this.activeField || event.target !== this.activeField) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.moveSelection(1);
            return;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.moveSelection(-1);
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
            return;
          }

          if (event.key === 'Enter' || event.key === 'Tab') {
            if (!this.currentItems.length) {
              return;
            }

            event.preventDefault();
            this.selectByIndex(this.selectedIndex < 0 ? 0 : this.selectedIndex);
          }
        },
render: function (trigger, field) {
          var isMention = trigger.type === 'mention';
          var items = isMention ? filterUsers(trigger.query) : filterCordoes(trigger.query);
          var signature = this.getSignature(trigger, items);

          if (signature === this.lastSignature && this.activeField === field) {
            this.currentItems = items;
            this.reposition();
            this.open();
            return;
          }

          this.lastSignature = signature;
          this.currentItems = items;

          if (this.headerEl) {
            if (isMention) {
              this.headerEl.textContent = trigger.query ? "Resultados para '@" + trigger.query + "'" : 'Populares';
            } else {
              this.headerEl.textContent = trigger.query ? "Resultados para '$" + trigger.query + "'" : 'Cordoes populares';
            }
          }

          if (!this.listEl) {
            return;
          }

          if (!items.length) {
            this.listEl.innerHTML = this.renderEmpty(trigger);
            this.selectedIndex = -1;
            safeIconRefresh();
            this.open();
            this.reposition();
            return;
          }

          this.listEl.innerHTML = items.map(function (item, index) {
            return isMention
              ? AutocompleteSystem.renderUserItem(item, trigger.query, index)
              : AutocompleteSystem.renderCordaoItem(item, trigger.query, index);
          }).join('');

          this.bindAvatarFallbacks();
          safeIconRefresh();
          this.open();
          this.reposition();
        },
getSignature: function (trigger, items) {
          var key = items.map(function (item) {
            return trigger.type === 'mention' ? item.username : item.name;
          }).join('|');

          return trigger.type + '::' + trigger.query.toLowerCase() + '::' + key;
        },
bindAvatarFallbacks: function () {
          Array.prototype.slice.call(this.listEl.querySelectorAll('.autocomplete-avatar-img')).forEach(function (img) {
            if (img.getAttribute('data-fallback-bound') === 'true') {
              return;
            }

            img.setAttribute('data-fallback-bound', 'true');
            img.addEventListener('error', function () {
              img.classList.add('is-broken');
            });
          });
        }
});
