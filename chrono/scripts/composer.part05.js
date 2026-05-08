'use strict';

Object.assign(AutocompleteSystem, {
renderUserItem: function (user, query, index) {
          var display = this.highlightMatch(user.display, query);
          var username = this.highlightMatch(user.username, query);
          var initial = escapeHtml(String(user.username || '?').charAt(0).toUpperCase());
          var verified = user.verified ? '<i data-lucide="check-circle-2" class="autocomplete-verified"></i>' : '';

          return (
            '<button type="button" class="autocomplete-item" data-index="' + index + '">' +
              '<span class="autocomplete-avatar-wrap">' +
                '<img class="autocomplete-avatar-img" src="' + user.avatar + '" alt="Avatar @' + escapeHtml(user.username) + '">' +
                '<span class="autocomplete-avatar-fallback">' + initial + '</span>' +
              '</span>' +
              '<span class="autocomplete-meta">' +
                '<span class="autocomplete-main-line">' +
                  '<span class="autocomplete-display">' + display + '</span>' +
                  verified +
                '</span>' +
                '<span class="autocomplete-sub">@' + username + '</span>' +
              '</span>' +
              '<span class="autocomplete-count">' + formatCompactCount(user.followers) + '</span>' +
            '</button>'
          );
        },
renderCordaoItem: function (cordao, query, index) {
          var icon = cordao.trending ? 'trending-up' : 'hash';
          var iconClass = cordao.trending ? 'autocomplete-cordao-icon trending' : 'autocomplete-cordao-icon';
          var badge = cordao.trending ? '<span class="autocomplete-trending-badge">Em alta</span>' : '';
          var cordaoName = this.highlightMatch(cordao.name, query);

          return (
            '<button type="button" class="autocomplete-item cordao-item" data-index="' + index + '">' +
              '<span class="' + iconClass + '"><i data-lucide="' + icon + '"></i></span>' +
              '<span class="autocomplete-meta">' +
                '<span class="autocomplete-cordao-title">$' + cordaoName + badge + '</span>' +
                '<span class="autocomplete-sub">' + formatCompactCount(cordao.posts) + ' posts</span>' +
              '</span>' +
            '</button>'
          );
        },
renderEmpty: function (trigger) {
          var label = trigger.type === 'mention'
            ? "Nenhum resultado para '@" + escapeHtml(trigger.query) + "'"
            : "Nenhum resultado para '$" + escapeHtml(trigger.query) + "'";

          return (
            '<div class="autocomplete-empty">' +
              '<i data-lucide="search-x"></i>' +
              '<span>' + label + '</span>' +
            '</div>'
          );
        },
highlightMatch: function (text, query) {
          var value = String(text || '');
          if (!query) {
            return escapeHtml(value);
          }

          var lowerValue = value.toLowerCase();
          var lowerQuery = query.toLowerCase();
          var index = lowerValue.indexOf(lowerQuery);

          if (index === -1) {
            return escapeHtml(value);
          }

          var before = escapeHtml(value.slice(0, index));
          var match = escapeHtml(value.slice(index, index + query.length));
          var after = escapeHtml(value.slice(index + query.length));

          return before + '<strong class="autocomplete-strong">' + match + '</strong>' + after;
        },
moveSelection: function (delta) {
          if (!this.currentItems.length) {
            return;
          }

          if (this.selectedIndex < 0) {
            this.selectedIndex = delta > 0 ? 0 : this.currentItems.length - 1;
          } else {
            this.selectedIndex = (this.selectedIndex + delta + this.currentItems.length) % this.currentItems.length;
          }

          this.updateActiveState();
        },
setSelectedIndex: function (index) {
          if (index < 0 || index >= this.currentItems.length || index === this.selectedIndex) {
            return;
          }

          this.selectedIndex = index;
          this.updateActiveState();
        },
updateActiveState: function () {
          var self = this;
          var itemNodes = this.listEl ? Array.prototype.slice.call(this.listEl.querySelectorAll('.autocomplete-item')) : [];

          itemNodes.forEach(function (node, index) {
            var isActive = index === self.selectedIndex;
            node.classList.toggle('is-active', isActive);

            if (isActive) {
              node.scrollIntoView({ block: 'nearest' });
            }
          });
        },
selectByIndex: function (index) {
          var field = this.activeField;
          var trigger = this.triggerData;
          var item = this.currentItems[index];

          if (!field || !trigger || !item) {
            return;
          }

          var value = field.value;
          var cursor = typeof field.selectionStart === 'number' ? field.selectionStart : value.length;
          var before = value.slice(0, trigger.triggerIndex);
          var after = value.slice(cursor);
          var insertion = trigger.type === 'mention' ? ('@' + item.username + ' ') : ('$' + item.name + ' ');
          var nextValue = before + insertion + after;
          var nextCursor = before.length + insertion.length;

          field.value = nextValue;
          if (typeof field.setSelectionRange === 'function') {
            field.setSelectionRange(nextCursor, nextCursor);
          }

          if (field.tagName && field.tagName.toLowerCase() === 'textarea') {
            this.updateHighlight(field);
          }

          field.dispatchEvent(new Event('input', { bubbles: true }));
          this.close();
          field.focus();
        },
open: function () {
          if (!this.dropdown) {
            return;
          }

          clearTimeout(this.closeTimer);
          this.dropdown.classList.remove('is-closing');

          if (!this.isOpen) {
            var dropdown = this.dropdown;
            requestAnimationFrame(function () {
              dropdown.classList.add('is-open');
            });
          } else {
            this.dropdown.classList.add('is-open');
          }

          this.dropdown.setAttribute('aria-hidden', 'false');
          this.isOpen = true;
        }
});

Object.assign(AutocompleteSystem, {
close: function () {
          var self = this;

          clearTimeout(this.debounceTimer);
          clearTimeout(this.blurTimer);

          this.selectedIndex = -1;
          this.currentItems = [];
          this.triggerData = null;
          this.lastSignature = '';
          this.activeField = null;

          if (!this.dropdown || !this.isOpen) {
            if (this.dropdown) {
              this.dropdown.classList.remove('is-open', 'is-closing');
              this.dropdown.setAttribute('aria-hidden', 'true');
            }
            this.isOpen = false;
            return;
          }

          this.dropdown.classList.remove('is-open');
          this.dropdown.classList.add('is-closing');
          this.dropdown.setAttribute('aria-hidden', 'true');
          this.isOpen = false;

          clearTimeout(this.closeTimer);
          this.closeTimer = setTimeout(function () {
            if (self.dropdown) {
              self.dropdown.classList.remove('is-closing');
            }
          }, 130);
        },
reposition: function () {
          if (!this.isOpen || !this.dropdown || !this.activeField || !this.triggerData) {
            return;
          }

          var triggerPos = getCaretCoordinates(this.activeField, this.triggerData.triggerIndex);
          var viewportWidth = window.innerWidth;
          var viewportHeight = window.innerHeight;
          var dropdownWidth = this.dropdown.offsetWidth || 280;
          var dropdownHeight = this.dropdown.offsetHeight || 0;
          var computed = window.getComputedStyle(this.activeField);
          var lineHeight = parseFloat(computed.lineHeight) || 18;
          var left = triggerPos.left;

          if (left + dropdownWidth + 8 > viewportWidth) {
            left = viewportWidth - dropdownWidth - 8;
          }
          if (left < 8) {
            left = 8;
          }

          var top = triggerPos.top - dropdownHeight - 8;
          var openBelow = false;

          if (top < 8) {
            top = triggerPos.top + lineHeight + 4;
            openBelow = true;
          }

          if (top + dropdownHeight > viewportHeight - 8) {
            top = Math.max(8, viewportHeight - dropdownHeight - 8);
          }

          this.dropdown.style.left = left + 'px';
          this.dropdown.style.top = top + 'px';

          if (left + dropdownWidth > viewportWidth - 40) {
            this.dropdown.style.transformOrigin = openBelow ? 'top right' : 'bottom right';
          } else {
            this.dropdown.style.transformOrigin = openBelow ? 'top left' : 'bottom left';
          }
        },
createHighlightOverlay: function (field) {
          if (!field || field._acHighlight) {
            return;
          }

          var parent = field.parentNode;
          if (!parent) {
            return;
          }

          var wrap = document.createElement('div');
          wrap.className = 'autocomplete-highlight-wrap';
          parent.insertBefore(wrap, field);
          wrap.appendChild(field);

          var overlay = document.createElement('div');
          overlay.className = 'textarea-highlight';
          overlay.setAttribute('aria-hidden', 'true');
          wrap.insertBefore(overlay, field);

          field._acHighlight = overlay;
          this.syncHighlightStyle(field);
        },
syncHighlightStyle: function (field) {
          if (!field || !field._acHighlight) {
            return;
          }

          var computed = window.getComputedStyle(field);
          var overlay = field._acHighlight;

          overlay.style.fontFamily = computed.fontFamily;
          overlay.style.fontSize = computed.fontSize;
          overlay.style.fontWeight = computed.fontWeight;
          overlay.style.fontStyle = computed.fontStyle;
          overlay.style.lineHeight = computed.lineHeight;
          overlay.style.letterSpacing = computed.letterSpacing;
          overlay.style.paddingTop = computed.paddingTop;
          overlay.style.paddingRight = computed.paddingRight;
          overlay.style.paddingBottom = computed.paddingBottom;
          overlay.style.paddingLeft = computed.paddingLeft;
          overlay.style.borderRadius = computed.borderRadius;
          overlay.style.textAlign = computed.textAlign;
        },
updateHighlight: function (field) {
          if (!field || !field._acHighlight) {
            return;
          }

          this.syncHighlightStyle(field);
          field._acHighlight.innerHTML = this.renderHighlightMarkup(field.value || '');
          this.syncHighlightScroll(field);
        },
renderHighlightMarkup: function (value) {
          if (!value) {
            return '&nbsp;';
          }

          var escaped = escapeHtml(value)
            .replace(/(@[A-Za-z0-9_]+)/g, '<span class="ac-token-mention">$1</span>')
            .replace(/(\$[A-Za-z0-9_]+)/g, '<span class="ac-token-cordao">$1</span>');

          if (escaped.charAt(escaped.length - 1) === '\n') {
            escaped += '&nbsp;';
          }

          return escaped;
        },
syncHighlightScroll: function (field) {
          if (!field || !field._acHighlight) {
            return;
          }

          field._acHighlight.scrollTop = field.scrollTop;
          field._acHighlight.scrollLeft = field.scrollLeft;
        }
});
