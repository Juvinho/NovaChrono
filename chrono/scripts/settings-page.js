'use strict';

var SETTINGS_SECTION_MAP = {
  conta: 'conta',
  seguranca: 'seguranca',
  aparencia: 'aparencia',
  privacidade: 'privacidade',
  notificacoes: 'notificacoes',
  cordoes: 'cordoes',
  acessibilidade: 'acessibilidade',
  'zona-de-perigo': 'zona-de-perigo'
};

var SETTINGS_ACCENTS = {
  roxo: { primary: '#7c5af0', hover: '#9370ff' },
  azul: { primary: '#3b82f6', hover: '#60a5fa' },
  teal: { primary: '#00c4cc', hover: '#35d6dc' },
  rosa: { primary: '#e05c9a', hover: '#ec7caf' },
  laranja: { primary: '#f59e0b', hover: '#fbbf24' },
  verde: { primary: '#22c55e', hover: '#4ade80' }
};

function ensureSettingsState() {
  AppState.settingsPage = AppState.settingsPage || {
    section: 'conta',
    appearance: { accent: 'roxo', fontBase: 14, density: AppState.settings.density || 'default' },
    privacy: {
      privateAccount: false,
      visibleSearch: true,
      mentions: 'todos',
      dm: 'todos',
      likes: 'todos',
      indexed: true
    },
    notifications: {
      master: true,
      followers: true,
      mentions: true,
      reposts: true,
      votes: true,
      dms: true,
      cordoes: true,
      email: false
    },
    a11y: {
      reducedMotion: !!AppState.settings.reducedMotion,
      highContrast: false,
      touchTargets: false
    },
    security: {
      twoFactor: false,
      googleConnected: true
    },
    cordoes: {
      highlight: !!AppState.settings.cordaoHighlight,
      autoFollow: false
    }
  };

  AppState.user = AppState.user || {
    displayName: AppState.profile.displayName,
    username: String(AppState.profile.username || '').replace(/^@/, ''),
    email: 'juvinho@gmail.com',
    bio: AppState.profile.bio || '',
    location: AppState.profile.location || '',
    website: AppState.profile.website || '',
    avatar: AppState.profile.avatar || '',
    favoriteCordao: AppState.profile.favoriteCordao || 'chrono'
  };

  return AppState.settingsPage;
}

function getCurrentHandle() {
  var username = (AppState.user && AppState.user.username) || (AppState.profile && AppState.profile.username) || 'juvinho';
  return String(username || 'juvinho').replace(/^@/, '').toLowerCase();
}

function maskEmail(email) {
  var value = String(email || 'juvinho@gmail.com');
  var pieces = value.split('@');
  if (pieces.length !== 2) {
    return 'j***@gmail.com';
  }
  return pieces[0].slice(0, 1) + '***@' + pieces[1];
}

function getRouteSection(route) {
  var normalized = String(route || '').replace(/^#/, '').replace(/^\/+/, '').toLowerCase();

  if (normalized === 'configuracoes' || normalized === 'settings' || normalized === 'settings/theme' || normalized === 'settings/language') {
    return { section: normalized === 'settings/language' ? 'aparencia' : 'conta', isRoot: normalized === 'configuracoes' || normalized === 'settings' };
  }

  var match = normalized.match(/^configuracoes\/?([^?]*)/);
  if (match) {
    var picked = match[1] ? match[1].split('/')[0] : 'conta';
    if (!SETTINGS_SECTION_MAP[picked]) {
      picked = 'conta';
    }
    return { section: picked, isRoot: !match[1] };
  }

  return { section: 'conta', isRoot: true };
}

var SettingsCard = {
  render: function (title, subtitle, body, extraClass) {
    return (
      '<article class="settings-card-block ' + (extraClass || '') + '">' +
        '<header class="settings-card-head">' +
          '<h3 class="settings-card-title">' + escapeHtml(title) + '</h3>' +
          (subtitle ? '<p class="settings-card-subtitle">' + escapeHtml(subtitle) + '</p>' : '') +
        '</header>' +
        '<div class="settings-card-body">' + (body || '') + '</div>' +
      '</article>'
    );
  }
};

var SettingsToggle = {
  render: function (id, checked, disabled) {
    return (
      '<label class="settings-toggle">' +
        '<input id="' + id + '" class="settings-toggle-input" type="checkbox" ' + (checked ? 'checked ' : '') + (disabled ? 'disabled ' : '') + '/>' +
        '<span class="settings-toggle-track"><span class="settings-toggle-thumb"></span></span>' +
      '</label>'
    );
  }
};

var SettingsRow = {
  render: function (label, description, controlHtml) {
    return (
      '<div class="settings-row">' +
        '<div class="settings-row-copy">' +
          '<p class="settings-row-label">' + escapeHtml(label) + '</p>' +
          '<p class="settings-row-desc">' + escapeHtml(description || '') + '</p>' +
        '</div>' +
        '<div class="settings-row-control">' + (controlHtml || '') + '</div>' +
      '</div>'
    );
  }
};

var PasswordStrengthBar = {
  score: function (password) {
    var value = String(password || '');
    var score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^a-zA-Z0-9]/.test(value)) score += 1;
    return Math.max(0, Math.min(4, score));
  },
  render: function (score) {
    var status = score <= 1 ? 'Fraca' : score <= 2 ? 'Media' : 'Forte';
    var bars = [1, 2, 3, 4].map(function (step) {
      var active = step <= score;
      var cls = active ? (score <= 1 ? 'is-weak' : score <= 2 ? 'is-medium' : 'is-strong') : '';
      return '<span class="password-segment ' + cls + '"></span>';
    }).join('');

    return '<div class="password-strength"><div class="password-strength-bar">' + bars + '</div><span class="password-strength-label">' + status + '</span></div>';
  }
};

var SettingsNav = {
  bindClicks: function () {
    var nav = document.getElementById('settingsNavList');
    if (!nav) {
      return;
    }

    nav.addEventListener('click', function (event) {
      var target = event.target.closest('[data-settings-section]');
      if (!target) {
        return;
      }

      event.preventDefault();
      var section = target.getAttribute('data-settings-section') || 'conta';
      if (AppRouter && typeof AppRouter.navigate === 'function') {
        AppRouter.navigate('configuracoes/' + section);
      }
    });
  },
  setActive: function (section) {
    Array.prototype.slice.call(document.querySelectorAll('[data-settings-section]')).forEach(function (node) {
      node.classList.toggle('is-active', node.getAttribute('data-settings-section') === section);
    });
  },
  init: function () {
    this.bindClicks();
  }
};

function setDensityClass(value) {
  var body = document.body;
  body.classList.remove('density-compact', 'density-normal', 'density-spacious');
  body.classList.add('density-' + (value || 'normal'));
}

function applyAccent(name) {
  var preset = SETTINGS_ACCENTS[name] || SETTINGS_ACCENTS.roxo;
  document.documentElement.style.setProperty('--color-primary', preset.primary);
  document.documentElement.style.setProperty('--color-primary-hover', preset.hover);
}

var SettingsAccount = {
  render: function () {
    var user = AppState.user;
    var html = SettingsCard.render('Informacoes da conta', 'Gerencie as informacoes do seu perfil publico',
      '<div class="settings-avatar-row">' +
        '<img id="settingsAccountAvatar" class="settings-avatar" src="' + escapeHtml(user.avatar || AppState.profile.avatar) + '" alt="Avatar atual" />' +
        '<div><button type="button" id="settingsAvatarBtn" class="btn-subtle">Alterar foto</button><input id="settingsAvatarInput" type="file" accept="image/*" hidden /></div>' +
      '</div>' +
      '<div class="settings-form-grid">' +
        '<label>Nome de exibicao<input id="settingsDisplayName" class="settings-input" value="' + escapeHtml(user.displayName || '') + '" /></label>' +
        '<label>@username<input id="settingsUsername" class="settings-input" value="' + escapeHtml(user.username || '') + '" /><small>Mudar o @ pode quebrar links existentes.</small></label>' +
        '<label>E-mail<input class="settings-input" value="' + escapeHtml(maskEmail(user.email)) + '" disabled /><button type="button" id="settingsChangeEmail" class="btn-link-inline">Alterar e-mail</button></label>' +
        '<label>Bio<textarea id="settingsBio" class="settings-textarea" maxlength="160">' + escapeHtml(user.bio || '') + '</textarea><small id="settingsBioCount"></small></label>' +
        '<label>Localizacao<input id="settingsLocation" class="settings-input" value="' + escapeHtml(user.location || '') + '" /></label>' +
        '<label>Site<input id="settingsWebsite" class="settings-input" value="' + escapeHtml(user.website || '') + '" /></label>' +
      '</div>' +
      '<div class="settings-actions"><button type="button" id="settingsAccountCancel" class="btn-subtle">Cancelar</button><button type="button" id="settingsAccountSave" class="btn-primary">Salvar alteracoes</button></div>'
    );

    return html;
  },
  save: function (mount) {
    var username = String(mount.querySelector('#settingsUsername').value || '').replace(/^@/, '').trim();
    AppState.user.displayName = String(mount.querySelector('#settingsDisplayName').value || '').trim() || 'Juvinho Silva';
    AppState.user.username = username || 'juvinho';
    AppState.user.bio = String(mount.querySelector('#settingsBio').value || '').trim();
    AppState.user.location = String(mount.querySelector('#settingsLocation').value || '').trim();
    AppState.user.website = String(mount.querySelector('#settingsWebsite').value || '').trim();

    AppState.profile.displayName = AppState.user.displayName;
    AppState.profile.username = AppState.user.username;
    AppState.profile.bio = AppState.user.bio;
    AppState.profile.location = AppState.user.location;
    AppState.profile.website = AppState.user.website;
    AppState.profile.avatar = AppState.user.avatar || AppState.profile.avatar;

    if (typeof syncHeaderIdentity === 'function') {
      syncHeaderIdentity();
    }
    if (typeof renderProfileView === 'function' && AppRouter && AppRouter.currentView === 'profile') {
      renderProfileView();
    }

    showAppToast('Perfil atualizado com sucesso.');
  }
};

var SettingsSecurity = {
  render: function () {
    var security = ensureSettingsState().security;
    return (
      SettingsCard.render('Seguranca e senha', 'Gerencie como voce acessa sua conta',
        '<label>Senha atual<input id="settingsPasswordCurrent" class="settings-input" type="password" autocomplete="off" /></label>' +
        '<label>Nova senha<input id="settingsPasswordNext" class="settings-input" type="password" autocomplete="off" /></label>' +
        '<label>Confirmar nova senha<input id="settingsPasswordConfirm" class="settings-input" type="password" autocomplete="off" /></label>' +
        '<div id="settingsPasswordStrength">' + PasswordStrengthBar.render(0) + '</div>' +
        '<button type="button" id="settingsPasswordSave" class="btn-primary">Salvar nova senha</button>'
      ) +
      SettingsCard.render('Autenticacao em dois fatores (2FA)', 'Status atual: ' + (security.twoFactor ? 'Ativado' : 'Desativado'),
        SettingsRow.render('Ativar 2FA', 'Adicione uma camada extra de seguranca', SettingsToggle.render('settingsToggle2fa', security.twoFactor, false))
      ) +
      SettingsCard.render('Login com Google', 'Conta conectada',
        '<div class="settings-inline-row"><span>Conta conectada</span><button type="button" id="settingsGoogleDisconnect" class="btn-subtle">Desconectar</button></div>'
      )
    );
  }
};

var SettingsAppearance = {
  render: function () {
    var settings = ensureSettingsState();
    var currentTheme = AppState.settings.theme || 'dark';
    var currentAccent = settings.appearance.accent;

    var themeCards = [
      { id: 'dark', icon: '🌙', label: 'Escuro' },
      { id: 'light', icon: '☀️', label: 'Claro' },
      { id: 'system', icon: '💻', label: 'Sistema' }
    ].map(function (item) {
      return '<button type="button" class="settings-theme-card ' + (currentTheme === item.id ? 'is-active' : '') + '" data-theme-value="' + item.id + '">' + item.icon + ' ' + item.label + '</button>';
    }).join('');

    var accents = Object.keys(SETTINGS_ACCENTS).map(function (name) {
      var color = SETTINGS_ACCENTS[name].primary;
      return '<button type="button" class="settings-accent-dot ' + (name === currentAccent ? 'is-active' : '') + '" data-accent-value="' + name + '" style="--accent-preview:' + color + '"></button>';
    }).join('');

    return (
      SettingsCard.render('Aparencia', 'Personalize como o Chrono parece para voce',
        '<div class="settings-theme-grid">' + themeCards + '</div>' +
        '<div class="settings-subtitle">Cor de destaque</div><div class="settings-accent-grid">' + accents + '</div>' +
        '<div class="settings-subtitle">Tamanho da fonte</div>' +
        '<input id="settingsFontScale" type="range" min="12" max="18" value="' + Number(settings.appearance.fontBase || 14) + '" />' +
        '<p class="settings-font-preview" id="settingsFontPreview">Preview: O Chrono permanece legivel em qualquer densidade.</p>' +
        '<div class="settings-subtitle">Densidade</div>' +
        '<div class="settings-density-grid">' +
          '<button type="button" class="settings-density-btn ' + ((settings.appearance.density || 'default') === 'compact' ? 'is-active' : '') + '" data-density-value="compact">Compacto</button>' +
          '<button type="button" class="settings-density-btn ' + ((settings.appearance.density || 'default') === 'default' ? 'is-active' : '') + '" data-density-value="default">Normal</button>' +
          '<button type="button" class="settings-density-btn ' + ((settings.appearance.density || 'default') === 'comfortable' ? 'is-active' : '') + '" data-density-value="comfortable">Espacado</button>' +
        '</div>'
      )
    );
  }
};

var SettingsPrivacy = {
  render: function () {
    var privacy = ensureSettingsState().privacy;
    return SettingsCard.render('Privacidade', 'Controle sua visibilidade e contato',
      SettingsRow.render('Conta privada', 'Apenas seus seguidores verao seus posts', SettingsToggle.render('settingsPrivateAccount', privacy.privateAccount, false)) +
      SettingsRow.render('Visibilidade na busca', 'Aparecer quando alguem buscar seu @username', SettingsToggle.render('settingsSearchVisible', privacy.visibleSearch, false)) +
      SettingsRow.render('Quem pode me mencionar', '', '<select id="settingsMentions" class="settings-select"><option value="todos">Todos</option><option value="seguindo">Apenas quem sigo</option><option value="ninguem">Ninguem</option></select>') +
      SettingsRow.render('Quem pode me enviar DMs', '', '<select id="settingsDm" class="settings-select"><option value="todos">Todos</option><option value="seguindo">Apenas quem sigo</option><option value="ninguem">Ninguem</option></select>') +
      SettingsRow.render('Quem pode ver meus curtidos', '', '<select id="settingsLikesVisibility" class="settings-select"><option value="todos">Todos</option><option value="eu">Apenas eu</option></select>') +
      SettingsRow.render('Indexacao por mecanismos de busca', '', SettingsToggle.render('settingsIndexed', privacy.indexed, false))
    );
  }
};

var SettingsNotifs = {
  render: function () {
    var data = ensureSettingsState().notifications;
    var disabled = !data.master;
    return SettingsCard.render('Notificacoes', 'Gerencie alertas do app e por e-mail',
      SettingsRow.render('Ativar notificacoes do app', 'Desativa tudo abaixo quando desligado', SettingsToggle.render('settingsNotifMaster', data.master, false)) +
      SettingsRow.render('Novos seguidores', '', SettingsToggle.render('settingsNotifFollowers', data.followers, disabled)) +
      SettingsRow.render('Mencoes e respostas', '', SettingsToggle.render('settingsNotifMentions', data.mentions, disabled)) +
      SettingsRow.render('Reposts dos seus posts', '', SettingsToggle.render('settingsNotifReposts', data.reposts, disabled)) +
      SettingsRow.render('Votos nos seus posts', '', SettingsToggle.render('settingsNotifVotes', data.votes, disabled)) +
      SettingsRow.render('Novas DMs', '', SettingsToggle.render('settingsNotifDms', data.dms, disabled)) +
      SettingsRow.render('Atividade nos cordoes', '', SettingsToggle.render('settingsNotifCordoes', data.cordoes, disabled)) +
      SettingsRow.render('Notificacoes por e-mail', '', SettingsToggle.render('settingsNotifEmail', data.email, disabled))
    );
  },
  toggleMaster: function () {
    ensureSettingsState().notifications.master = !!document.getElementById('settingsNotifMaster').checked;
    SettingsPage.render('notificacoes', false);
  }
};

var SettingsA11y = {
  render: function () {
    var a11y = ensureSettingsState().a11y;
    return SettingsCard.render('Acessibilidade', 'Ajustes para leitura e navegacao',
      SettingsRow.render('Reduzir animacoes', 'Remove ou reduz efeitos de movimento', SettingsToggle.render('settingsA11yMotion', a11y.reducedMotion, false)) +
      SettingsRow.render('Modo alto contraste', 'Aumenta contraste de bordas e textos', SettingsToggle.render('settingsA11yContrast', a11y.highContrast, false)) +
      SettingsRow.render('Tamanho dos alvos de toque', 'Aumenta area clicavel dos botoes', SettingsToggle.render('settingsA11yTouch', a11y.touchTargets, false))
    );
  }
};

var DangerZone = {
  render: function () {
    return (
      '<article class="settings-card-block is-danger">' +
        '<header class="settings-card-head"><h3 class="settings-card-title">⚠ Zona de perigo</h3><p class="settings-card-subtitle">Acoes irreversiveis. Proceda com cuidado.</p></header>' +
        '<div class="settings-card-body">' +
          '<div class="settings-danger-item"><p><strong>Pausar conta</strong><br/>Sua conta ficara invisivel por 30 dias.</p><button type="button" id="settingsPauseAccount" class="btn-danger-outline">Pausar minha conta</button></div>' +
          '<div class="settings-danger-item"><p><strong>Excluir conta</strong><br/>Todos os seus dados serao removidos permanentemente.</p><button type="button" id="settingsDeleteAccount" class="btn-danger-solid">Excluir conta permanentemente</button></div>' +
        '</div>' +
      '</article>'
    );
  },
  pauseAccount: function () {
    SettingsPage.openTextConfirm({
      title: 'Pausar conta',
      message: 'Digite PAUSAR para confirmar',
      placeholder: 'PAUSAR',
      expected: 'PAUSAR',
      confirmLabel: 'Confirmar pausa',
      onConfirm: function () {
        showAppToast('Conta pausada por 30 dias (demo).');
      }
    });
  },
  deleteAccount: function () {
    SettingsPage.openTextConfirm({
      title: 'Excluir conta',
      message: 'Digite seu @username para confirmar',
      placeholder: '@' + getCurrentHandle(),
      expected: '@' + getCurrentHandle(),
      confirmLabel: 'Confirmar exclusao',
      onConfirm: function () {
        showAppToast('Voce nao pode excluir sua conta em modo demo.');
      }
    });
  }
};

var SettingsCordoes = {
  render: function () {
    var data = ensureSettingsState().cordoes;
    return SettingsCard.render('Cordoes', 'Preferencias para seus cordoes',
      SettingsRow.render('Destaque de cordoes', 'Realca marcacoes de cordao no feed', SettingsToggle.render('settingsCordaoHighlight', data.highlight, false)) +
      SettingsRow.render('Seguir cordoes automaticamente', 'Ao interagir com um cordao, seguir automaticamente', SettingsToggle.render('settingsCordaoAutoFollow', data.autoFollow, false))
    );
  }
};

var SettingsPage = {
  mounted: false,
  activeSection: 'conta',
  parseRoute: function (route) {
    return getRouteSection(route);
  },
  ensureView: function () {
    if (document.getElementById('view-settings')) {
      return;
    }

    if (!appViewContainer) {
      return;
    }

    var section = document.createElement('section');
    section.id = 'view-settings';
    section.className = 'app-view settings-view';
    section.setAttribute('data-view', 'settings');
    section.setAttribute('aria-label', 'Configuracoes');
    section.innerHTML = (
      '<div class="settings-page-shell" id="settingsPageShell">' +
        '<aside class="settings-nav-col"><div class="settings-nav-card"><p class="settings-nav-title">Configuracoes</p><nav id="settingsNavList" class="settings-nav-list"></nav></div></aside>' +
        '<section class="settings-panel-col"><div class="settings-panel-card"><button type="button" id="settingsMobileBack" class="settings-mobile-back">← Voltar</button><div id="settingsPanelMount"></div></div></section>' +
        '<aside class="settings-hub-col"><div class="settings-hub-card"><h3>Hub rapido</h3><p>Gerencie conta, privacidade e aparencia sem sair do fluxo principal.</p></div></aside>' +
      '</div>'
    );

    var signedOut = document.getElementById('view-signed-out');
    appViewContainer.insertBefore(section, signedOut || null);
  },
  openTextConfirm: function (options) {
    var overlay = document.getElementById('settingsConfirmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'settingsConfirmOverlay';
      overlay.className = 'settings-confirm-overlay';
      overlay.innerHTML = '<div class="settings-confirm-modal" role="dialog" aria-modal="true"><h4 id="settingsConfirmTitle"></h4><p id="settingsConfirmMessage"></p><input id="settingsConfirmInput" class="settings-input" /><div class="settings-actions"><button type="button" id="settingsConfirmCancel" class="btn-subtle">Cancelar</button><button type="button" id="settingsConfirmOk" class="btn-danger-solid" disabled>Confirmar</button></div></div>';
      document.body.appendChild(overlay);
    }

    var title = overlay.querySelector('#settingsConfirmTitle');
    var message = overlay.querySelector('#settingsConfirmMessage');
    var input = overlay.querySelector('#settingsConfirmInput');
    var cancel = overlay.querySelector('#settingsConfirmCancel');
    var confirm = overlay.querySelector('#settingsConfirmOk');
    var expected = String(options.expected || '').trim();

    title.textContent = options.title || 'Confirmar';
    message.textContent = options.message || 'Digite para confirmar';
    input.value = '';
    input.placeholder = options.placeholder || '';
    confirm.textContent = options.confirmLabel || 'Confirmar';
    confirm.disabled = true;

    function close() {
      overlay.classList.remove('is-open');
      document.removeEventListener('keydown', escClose, true);
    }

    function escClose(event) {
      if (event.key === 'Escape') {
        close();
      }
    }

    input.oninput = function () {
      confirm.disabled = String(input.value || '').trim() !== expected;
    };

    cancel.onclick = function () { close(); };
    overlay.onclick = function (event) {
      if (event.target === overlay) {
        close();
      }
    };

    confirm.onclick = function () {
      if (String(input.value || '').trim() !== expected) {
        return;
      }
      close();
      if (typeof options.onConfirm === 'function') {
        options.onConfirm();
      }
    };

    overlay.classList.add('is-open');
    document.addEventListener('keydown', escClose, true);
    setTimeout(function () { input.focus(); }, 0);
  },
  renderSection: function (section) {
    var mount = document.getElementById('settingsPanelMount');
    if (!mount) {
      return;
    }

    var html = '';

    if (section === 'conta') {
      html = SettingsAccount.render();
    } else if (section === 'seguranca') {
      html = SettingsSecurity.render();
    } else if (section === 'aparencia') {
      html = SettingsAppearance.render();
    } else if (section === 'privacidade') {
      html = SettingsPrivacy.render();
    } else if (section === 'notificacoes') {
      html = SettingsNotifs.render();
    } else if (section === 'cordoes') {
      html = SettingsCordoes.render();
    } else if (section === 'acessibilidade') {
      html = SettingsA11y.render();
    } else if (section === 'zona-de-perigo') {
      html = DangerZone.render();
    } else {
      html = SettingsAccount.render();
    }

    mount.innerHTML = html;
    mount.classList.remove('is-entering');
    void mount.offsetWidth;
    mount.classList.add('is-entering');

    this.bindSection(section, mount);
    safeIconRefresh();
  },
  bindSection: function (section, mount) {
    if (section === 'conta') {
      var bio = mount.querySelector('#settingsBio');
      var bioCount = mount.querySelector('#settingsBioCount');
      var avatarInput = mount.querySelector('#settingsAvatarInput');
      var avatarBtn = mount.querySelector('#settingsAvatarBtn');
      var avatar = mount.querySelector('#settingsAccountAvatar');

      function updateBioCount() {
        if (bio && bioCount) {
          bioCount.textContent = String(160 - bio.value.length) + ' restantes';
        }
      }

      updateBioCount();

      if (bio) {
        bio.addEventListener('input', updateBioCount);
      }

      if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', function () { avatarInput.click(); });
        avatarInput.addEventListener('change', function () {
          var file = avatarInput.files && avatarInput.files[0];
          if (!file || typeof FileReader === 'undefined') {
            return;
          }
          var reader = new FileReader();
          reader.onload = function (event) {
            var result = String((event.target && event.target.result) || '');
            if (avatar) {
              avatar.src = result;
            }
            AppState.user.avatar = result;
          };
          reader.readAsDataURL(file);
        });
      }

      var saveButton = mount.querySelector('#settingsAccountSave');
      if (saveButton) {
        saveButton.addEventListener('click', function () {
          saveButton.classList.add('is-saving');
          setTimeout(function () { saveButton.classList.remove('is-saving'); }, 220);
          SettingsAccount.save(mount);
        });
      }

      var cancelButton = mount.querySelector('#settingsAccountCancel');
      if (cancelButton) {
        cancelButton.addEventListener('click', function () {
          SettingsPage.render('conta', false);
        });
      }
    }

    if (section === 'seguranca') {
      var passNext = mount.querySelector('#settingsPasswordNext');
      var passStrength = mount.querySelector('#settingsPasswordStrength');
      if (passNext && passStrength) {
        passNext.addEventListener('input', function () {
          passStrength.innerHTML = PasswordStrengthBar.render(PasswordStrengthBar.score(passNext.value));
        });
      }

      var passSave = mount.querySelector('#settingsPasswordSave');
      if (passSave) {
        passSave.addEventListener('click', function () {
          showAppToast('Senha atualizada (demo).');
        });
      }

      var twoFa = mount.querySelector('#settingsToggle2fa');
      if (twoFa) {
        twoFa.addEventListener('change', function () {
          ensureSettingsState().security.twoFactor = !!twoFa.checked;
          if (twoFa.checked) {
            SettingsPage.openTextConfirm({ title: 'Ativar 2FA', message: 'Digite ATIVAR para confirmar e exibir QR mockado', placeholder: 'ATIVAR', expected: 'ATIVAR', confirmLabel: 'Ativar', onConfirm: function () { showAppToast('2FA ativado (QR mockado).'); } });
          }
        });
      }

      var disconnect = mount.querySelector('#settingsGoogleDisconnect');
      if (disconnect) {
        disconnect.addEventListener('click', function () {
          ensureSettingsState().security.googleConnected = false;
          showAppToast('Google desconectado.');
        });
      }
    }

    if (section === 'aparencia') {
      Array.prototype.slice.call(mount.querySelectorAll('[data-theme-value]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          AppState.settings.theme = btn.getAttribute('data-theme-value') || 'dark';
          if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
          }
          SettingsPage.render('aparencia', false);
        });
      });

      Array.prototype.slice.call(mount.querySelectorAll('[data-accent-value]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var accent = btn.getAttribute('data-accent-value') || 'roxo';
          ensureSettingsState().appearance.accent = accent;
          applyAccent(accent);
          SettingsPage.render('aparencia', false);
        });
      });

      var scale = mount.querySelector('#settingsFontScale');
      if (scale) {
        scale.addEventListener('input', function () {
          var base = Math.max(12, Math.min(18, Number(scale.value) || 14));
          ensureSettingsState().appearance.fontBase = base;
          document.documentElement.style.setProperty('--text-base', base + 'px');
          document.documentElement.style.setProperty('--text-sm', Math.max(11, base - 2) + 'px');
          var preview = mount.querySelector('#settingsFontPreview');
          if (preview) {
            preview.style.fontSize = base + 'px';
          }
        });
      }

      Array.prototype.slice.call(mount.querySelectorAll('[data-density-value]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var value = btn.getAttribute('data-density-value') || 'default';
          ensureSettingsState().appearance.density = value;
          AppState.settings.density = value;
          if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
          }
          setDensityClass(value === 'default' ? 'normal' : value);
          SettingsPage.render('aparencia', false);
        });
      });
    }

    if (section === 'privacidade') {
      var privacy = ensureSettingsState().privacy;
      var selectIds = ['settingsMentions', 'settingsDm', 'settingsLikesVisibility'];
      selectIds.forEach(function (id) {
        var select = mount.querySelector('#' + id);
        if (!select) {
          return;
        }
        if (id === 'settingsMentions') select.value = privacy.mentions;
        if (id === 'settingsDm') select.value = privacy.dm;
        if (id === 'settingsLikesVisibility') select.value = privacy.likes;
        select.addEventListener('change', function () {
          privacy.mentions = mount.querySelector('#settingsMentions').value;
          privacy.dm = mount.querySelector('#settingsDm').value;
          privacy.likes = mount.querySelector('#settingsLikesVisibility').value;
          showAppToast('Privacidade atualizada.');
        });
      });

      var privateToggle = mount.querySelector('#settingsPrivateAccount');
      var searchToggle = mount.querySelector('#settingsSearchVisible');
      var indexedToggle = mount.querySelector('#settingsIndexed');
      if (privateToggle) privateToggle.onchange = function () { privacy.privateAccount = !!privateToggle.checked; };
      if (searchToggle) searchToggle.onchange = function () { privacy.visibleSearch = !!searchToggle.checked; };
      if (indexedToggle) indexedToggle.onchange = function () { privacy.indexed = !!indexedToggle.checked; };
    }

    if (section === 'notificacoes') {
      var notif = ensureSettingsState().notifications;
      var master = mount.querySelector('#settingsNotifMaster');
      if (master) {
        master.addEventListener('change', function () {
          notif.master = !!master.checked;
          SettingsNotifs.toggleMaster();
        });
      }

      ['Followers', 'Mentions', 'Reposts', 'Votes', 'Dms', 'Cordoes', 'Email'].forEach(function (suffix) {
        var node = mount.querySelector('#settingsNotif' + suffix);
        if (!node) {
          return;
        }
        node.addEventListener('change', function () {
          notif[suffix.toLowerCase()] = !!node.checked;
          showAppToast('Preferencia de notificacao atualizada.');
        });
      });
    }

    if (section === 'acessibilidade') {
      var a11y = ensureSettingsState().a11y;
      var motion = mount.querySelector('#settingsA11yMotion');
      var contrast = mount.querySelector('#settingsA11yContrast');
      var touch = mount.querySelector('#settingsA11yTouch');

      if (motion) {
        motion.addEventListener('change', function () {
          a11y.reducedMotion = !!motion.checked;
          AppState.settings.reducedMotion = a11y.reducedMotion;
          document.documentElement.classList.toggle('a11y-reduced-motion', a11y.reducedMotion);
          if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
          }
        });
      }
      if (contrast) {
        contrast.addEventListener('change', function () {
          a11y.highContrast = !!contrast.checked;
          document.documentElement.classList.toggle('a11y-high-contrast', a11y.highContrast);
        });
      }
      if (touch) {
        touch.addEventListener('change', function () {
          a11y.touchTargets = !!touch.checked;
          document.body.classList.toggle('a11y-touch-targets', a11y.touchTargets);
        });
      }
    }

    if (section === 'cordoes') {
      var cordao = ensureSettingsState().cordoes;
      var highlight = mount.querySelector('#settingsCordaoHighlight');
      var autoFollow = mount.querySelector('#settingsCordaoAutoFollow');
      if (highlight) {
        highlight.checked = !!cordao.highlight;
        highlight.onchange = function () {
          cordao.highlight = !!highlight.checked;
          AppState.settings.cordaoHighlight = cordao.highlight;
          if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
          }
        };
      }
      if (autoFollow) {
        autoFollow.checked = !!cordao.autoFollow;
        autoFollow.onchange = function () {
          cordao.autoFollow = !!autoFollow.checked;
        };
      }
    }

    if (section === 'zona-de-perigo') {
      var pauseBtn = mount.querySelector('#settingsPauseAccount');
      var deleteBtn = mount.querySelector('#settingsDeleteAccount');
      if (pauseBtn) pauseBtn.addEventListener('click', function () { DangerZone.pauseAccount(); });
      if (deleteBtn) deleteBtn.addEventListener('click', function () { DangerZone.deleteAccount(); });
    }
  },
  setActive: function (section) {
    this.activeSection = SETTINGS_SECTION_MAP[section] ? section : 'conta';
    ensureSettingsState().section = this.activeSection;
    SettingsNav.setActive(this.activeSection);
  },
  renderNav: function () {
    var nav = document.getElementById('settingsNavList');
    if (!nav) {
      return;
    }

    nav.innerHTML = [
      '<p class="settings-nav-group">Conta</p>',
      '<button class="settings-nav-item" data-settings-section="conta">Informacoes da conta</button>',
      '<button class="settings-nav-item" data-settings-section="seguranca">Seguranca e senha</button>',
      '<button class="settings-nav-item" data-settings-section="cordoes">Cordoes</button>',
      '<p class="settings-nav-group">Aparencia</p>',
      '<button class="settings-nav-item" data-settings-section="aparencia">Tema, idioma e fonte</button>',
      '<p class="settings-nav-group">Privacidade</p>',
      '<button class="settings-nav-item" data-settings-section="privacidade">Visibilidade e mencoes</button>',
      '<button class="settings-nav-item" data-settings-section="notificacoes">Notificacoes</button>',
      '<button class="settings-nav-item" data-settings-section="acessibilidade">Acessibilidade</button>',
      '<hr class="settings-nav-divider"/>',
      '<p class="settings-nav-group is-danger">Zona de perigo</p>',
      '<button class="settings-nav-item is-danger" data-settings-section="zona-de-perigo">Pausar ou excluir conta</button>'
    ].join('');
  },
  render: function (section, isRootRoute) {
    this.ensureView();
    this.renderNav();
    this.setActive(section || 'conta');
    this.renderSection(this.activeSection);

    var view = document.getElementById('view-settings');
    if (view) {
      view.classList.toggle('is-root-route', !!isRootRoute);
    }

    var mobileBack = document.getElementById('settingsMobileBack');
    if (mobileBack) {
      mobileBack.onclick = function () {
        if (AppRouter && typeof AppRouter.navigate === 'function') {
          AppRouter.navigate('configuracoes');
        }
      };
    }

    SettingsNav.init();
  },
  init: function () {
    ensureSettingsState();
    this.ensureView();
  }
};

var LogoutDialog = {
  initialized: false,
  isOpen: false,
  keepDropdown: false,
  init: function () {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.overlay = document.getElementById('logoutOverlay');
    this.title = document.getElementById('logoutTitle');
    this.subtitle = document.getElementById('logoutSubtitle');
    this.cancelButton = document.getElementById('logoutCancelButton');
    this.confirmButton = document.getElementById('logoutConfirmButton');

    if (!this.overlay) {
      return;
    }

    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', this.close.bind(this));
    }

    if (this.confirmButton) {
      this.confirmButton.addEventListener('click', this.confirm.bind(this));
    }

    this.overlay.addEventListener('click', function (event) {
      if (event.target === LogoutDialog.overlay) {
        LogoutDialog.close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!LogoutDialog.isOpen) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        LogoutDialog.close();
        return;
      }
      if (event.key === 'Tab') {
        LogoutDialog.trapFocus(event);
      }
    });
  },
  trapFocus: function (event) {
    if (!this.overlay) {
      return;
    }
    var focusable = Array.prototype.slice.call(this.overlay.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },
  open: function (options) {
    this.init();
    if (!this.overlay) {
      return;
    }

    this.keepDropdown = !!(options && options.keepDropdown);
    this.isOpen = true;
    if (this.title) {
      this.title.textContent = 'Sair da Chrono';
    }
    if (this.subtitle) {
      this.subtitle.textContent = 'Tem certeza que deseja sair da sua conta? Voce precisara entrar novamente para acessar o app.';
    }
    if (this.confirmButton) {
      this.confirmButton.textContent = 'Sair da conta';
    }

    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');
    setTimeout(function () {
      if (LogoutDialog.confirmButton) {
        LogoutDialog.confirmButton.focus();
      }
    }, 0);
  },
  close: function () {
    if (!this.overlay) {
      return;
    }

    this.isOpen = false;
    this.overlay.classList.remove('is-open');
    this.overlay.setAttribute('aria-hidden', 'true');
  },
  confirm: function () {
    if (HeaderModule && this.keepDropdown && typeof HeaderModule.closePanel === 'function') {
      HeaderModule.closePanel();
    }

    AppState.signedOut = true;

    if (AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('login', { replace: true });
    } else if (AppRouter && typeof AppRouter.performLogout === 'function') {
      AppRouter.performLogout();
    }

    this.close();
    showAppToast('Sessao encerrada.');
  }
};
