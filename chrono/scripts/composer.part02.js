'use strict';

// ===== COMPOSER CONTROLLER =====
      var ComposerController = (function () {
        var state = {
          text: '',
          image: null,
          poll: null,
          emojiPickerOpen: false,
          pollBuilderOpen: false
        };

        var elements = {
          textarea: null,
          photoBtn: null,
          pollBtn: null,
          emojiBtn: null,
          photoInput: null,
          imagePreviewContainer: null,
          pollBuilderContainer: null,
          emojiPickerContainer: null
        };

        function init() {
          elements.textarea = document.getElementById('postComposer');
          elements.photoBtn = document.getElementById('composerPhotoBtn');
          elements.pollBtn = document.getElementById('composerPollBtn');
          elements.emojiBtn = document.getElementById('composerEmojiBtn');
          elements.photoInput = document.getElementById('composerPhotoInput');
          elements.imagePreviewContainer = document.getElementById('composerImagePreview');
          elements.pollBuilderContainer = document.getElementById('composerPollBuilder');
          elements.emojiPickerContainer = document.getElementById('emojiPickerContainer');

          if (!elements.photoBtn || !elements.pollBtn || !elements.emojiBtn) return;

          // Photo button
          elements.photoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            elements.photoInput.click();
          });

          elements.photoInput.addEventListener('change', onPhotoSelected);

          // Poll button
          elements.pollBtn.addEventListener('click', togglePollBuilder);

          // Emoji button
          elements.emojiBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleEmojiPicker();
          });

          // Close emoji picker when clicking outside
          document.addEventListener('click', function (e) {
            if (state.emojiPickerOpen && 
                !e.target.closest('#emojiPickerContainer') && 
                !e.target.closest('#composerEmojiBtn')) {
              closeEmojiPicker();
            }
          });

          // Close emoji picker on Escape
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.emojiPickerOpen) {
              closeEmojiPicker();
            }
          });
        }

        function onPhotoSelected(e) {
          var file = e.target.files[0];
          if (!file) return;

          var reader = new FileReader();
          reader.onload = function (event) {
            state.image = event.target.result;
            renderImagePreview();
            updatePublishState();
          };
          reader.readAsDataURL(file);
        }

        function renderImagePreview() {
          elements.imagePreviewContainer.innerHTML = '';

          if (!state.image) return;

          var preview = document.createElement('div');
          preview.className = 'composer-image-preview';
          preview.innerHTML = 
            '<img src="' + state.image + '" alt="Preview">' +
            '<button class="composer-image-remove" type="button" aria-label="Remover imagem">×</button>';

          preview.querySelector('.composer-image-remove').addEventListener('click', removeImage);
          elements.imagePreviewContainer.appendChild(preview);
        }

        function removeImage() {
          state.image = null;
          elements.photoInput.value = '';
          renderImagePreview();
          updatePublishState();
        }

        function toggleEmojiPicker() {
          if (state.emojiPickerOpen) {
            closeEmojiPicker();
          } else {
            openEmojiPicker();
          }
        }

        function openEmojiPicker() {
          state.emojiPickerOpen = true;
          elements.emojiBtn.classList.add('active');
          EmojiPicker.render(elements.emojiPickerContainer);
        }

        function closeEmojiPicker() {
          state.emojiPickerOpen = false;
          elements.emojiBtn.classList.remove('active');
          elements.emojiPickerContainer.innerHTML = '';
        }

        function togglePollBuilder() {
          if (state.pollBuilderOpen) {
            closePollBuilder();
          } else {
            openPollBuilder();
          }
        }

        function openPollBuilder() {
          state.pollBuilderOpen = true;
          elements.pollBtn.classList.add('active');
          if (!state.poll) {
            state.poll = {
              question: '',
              options: ['', ''],
              autoClose24h: false
            };
          }
          renderPollBuilder();
        }

        function closePollBuilder() {
          state.pollBuilderOpen = false;
          elements.pollBtn.classList.remove('active');
          elements.pollBuilderContainer.innerHTML = '';
        }

        function renderPollBuilder() {
          elements.pollBuilderContainer.innerHTML = '';

          var builder = document.createElement('div');
          builder.className = 'poll-builder';

          var titleHtml = '<div class="poll-title">Nova enquete</div>';
          var questionHtml = 
            '<input type="text" class="poll-question-input" placeholder="Pergunta da enquete (opcional)" value="' + 
            (state.poll.question || '') + '">';

          var optionsHtml = '<div class="poll-options-container">';
          state.poll.options.forEach(function (option, idx) {
            optionsHtml += 
              '<div class="poll-option-row">' +
                '<input type="text" class="poll-option-input" placeholder="Opção ' + (idx + 1) + '" value="' + (option || '') + '" data-option-idx="' + idx + '">' +
                (idx >= 2 ? '<button class="poll-option-remove" type="button" data-option-idx="' + idx + '">−</button>' : '<span style="width:30px"></span>') +
              '</div>';
          });
          optionsHtml += '</div>';

          var addOptionBtn = '<button class="poll-add-option-btn" type="button" ' + 
            (state.poll.options.length >= 5 ? 'disabled' : '') + 
            '>+ Adicionar opção</button>';

          var autoCloseHtml = 
            '<label class="poll-auto-close">' +
              '<input type="checkbox" ' + (state.poll.autoClose24h ? 'checked' : '') + '>' +
              '<span>Encerrar automaticamente em 24h</span>' +
            '</label>';

          var removeBtn = '<button class="poll-remove-btn" type="button">Remover enquete</button>';

          builder.innerHTML = titleHtml + questionHtml + optionsHtml + addOptionBtn + autoCloseHtml + removeBtn;

          // Question input
          builder.querySelector('.poll-question-input').addEventListener('input', function (e) {
            state.poll.question = e.target.value;
          });

          // Option inputs
          var optionInputs = builder.querySelectorAll('.poll-option-input');
          optionInputs.forEach(function (input, idx) {
            input.addEventListener('input', function (e) {
              state.poll.options[idx] = e.target.value;
            });
          });

          // Remove option buttons
          var removeOptBtns = builder.querySelectorAll('.poll-option-remove');
          removeOptBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-option-idx'));
              state.poll.options.splice(idx, 1);
              renderPollBuilder();
            });
          });

          // Add option button
          var addOptBtn = builder.querySelector('.poll-add-option-btn');
          addOptBtn.addEventListener('click', function () {
            if (state.poll.options.length < 5) {
              state.poll.options.push('');
              renderPollBuilder();
            }
          });

          // Auto-close checkbox
          var autoCloseCheckbox = builder.querySelector('.poll-auto-close input[type="checkbox"]');
          autoCloseCheckbox.addEventListener('change', function (e) {
            state.poll.autoClose24h = e.target.checked;
          });

          // Remove poll button
          var removePollBtn = builder.querySelector('.poll-remove-btn');
          removePollBtn.addEventListener('click', removePoll);

          elements.pollBuilderContainer.appendChild(builder);
        }

        function removePoll() {
          state.poll = null;
          closePollBuilder();
          elements.pollBtn.classList.remove('active');
          updatePublishState();
        }

        function insertEmoji(emoji) {
          var textarea = elements.textarea;
          var start = textarea.selectionStart;
          var end = textarea.selectionEnd;
          var text = textarea.value;

          var newText = text.substring(0, start) + emoji + text.substring(end);
          textarea.value = newText;
          textarea.focus();
          textarea.setSelectionRange(start + emoji.length, start + emoji.length);

          state.text = textarea.value;
          updatePublishState();
        }

        function getState() {
          return {
            text: elements.textarea.value.trim(),
            image: state.image,
            poll: state.poll
          };
        }

        function reset() {
          state.text = '';
          state.image = null;
          state.poll = null;
          state.emojiPickerOpen = false;
          state.pollBuilderOpen = false;

          elements.textarea.value = '';
          elements.photoInput.value = '';
          elements.imagePreviewContainer.innerHTML = '';
          elements.pollBuilderContainer.innerHTML = '';
          elements.emojiPickerContainer.innerHTML = '';
          elements.photoBtn.classList.remove('active');
          elements.pollBtn.classList.remove('active');
          elements.emojiBtn.classList.remove('active');
        }

        return {
          init: init,
          getState: getState,
          reset: reset,
          insertEmoji: insertEmoji
        };
      })();
