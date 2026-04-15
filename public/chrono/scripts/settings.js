'use strict';

var ACCENT_COLORS = {
  purple: {
    primary: '#7c5af0',
    hover: '#9370ff',
    active: '#5e3fd4',
    highlight: 'rgba(124,90,240,0.12)',
    glowLeft: 'rgba(108,60,220,0.18)',
    glowRight: 'rgba(0,180,190,0.14)'
  },
  blue: {
    primary: '#3b82f6',
    hover: '#60a5fa',
    active: '#2563eb',
    highlight: 'rgba(59,130,246,0.12)',
    glowLeft: 'rgba(30,80,220,0.18)',
    glowRight: 'rgba(0,150,255,0.14)'
  },
  teal: {
    primary: '#00c4cc',
    hover: '#22d3db',
    active: '#0099a3',
    highlight: 'rgba(0,196,204,0.12)',
    glowLeft: 'rgba(0,160,170,0.18)',
    glowRight: 'rgba(0,200,180,0.14)'
  },
  pink: {
    primary: '#ec4899',
    hover: '#f472b6',
    active: '#db2777',
    highlight: 'rgba(236,72,153,0.12)',
    glowLeft: 'rgba(200,50,130,0.18)',
    glowRight: 'rgba(220,80,160,0.14)'
  },
  orange: {
    primary: '#f59e0b',
    hover: '#fbbf24',
    active: '#d97706',
    highlight: 'rgba(245,158,11,0.12)',
    glowLeft: 'rgba(200,100,0,0.18)',
    glowRight: 'rgba(220,140,0,0.14)'
  },
  green: {
    primary: '#22c55e',
    hover: '#4ade80',
    active: '#16a34a',
    highlight: 'rgba(34,197,94,0.12)',
    glowLeft: 'rgba(20,160,60,0.18)',
    glowRight: 'rgba(0,200,100,0.14)'
  }
};

var ACCENT_COLOR_ALIASES = {
  roxo: 'purple',
  azul: 'blue',
  rosa: 'pink',
  laranja: 'orange',
  verde: 'green'
};

function normalizeAccentColorId(colorId) {
  var normalized = String(colorId || '').trim().toLowerCase();
  if (!normalized) {
    return 'purple';
  }

  if (ACCENT_COLOR_ALIASES[normalized]) {
    normalized = ACCENT_COLOR_ALIASES[normalized];
  }

  return ACCENT_COLORS[normalized] ? normalized : 'purple';
}

function scaleRgbaAlpha(colorValue, intensity) {
  var match = String(colorValue || '').trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (!match) {
    return String(colorValue || '');
  }

  var red = Number(match[1]);
  var green = Number(match[2]);
  var blue = Number(match[3]);
  var alpha = match[4] !== undefined ? Number(match[4]) : 1;
  var safeIntensity = Number(intensity);

  if (!Number.isFinite(safeIntensity)) {
    safeIntensity = 1;
  }

  var nextAlpha = Math.max(0, Math.min(1, alpha * safeIntensity));
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + Number(nextAlpha.toFixed(3)) + ')';
}

var ACCENT_STORAGE_KEY = 'chrono:accentColor';

function getAccentStorage() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }
  } catch (error) {}

  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch (error) {}

  return null;
}

function readStoredAccentColor() {
  var storage = getAccentStorage();
  if (!storage) {
    return '';
  }

  try {
    return normalizeAccentColorId(storage.getItem(ACCENT_STORAGE_KEY));
  } catch (error) {
    return '';
  }
}

function saveStoredAccentColor(colorId) {
  var storage = getAccentStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(ACCENT_STORAGE_KEY, normalizeAccentColorId(colorId));
  } catch (error) {}
}

var ThemeController = {
  current: 'purple',
  pulseTimer: 0,

  getSavedAccentColor: function () {
    var storedColor = readStoredAccentColor();
    if (storedColor) {
      return storedColor;
    }

    if (typeof AppState !== 'undefined' && AppState && AppState.user && AppState.user.accentColor) {
      return normalizeAccentColorId(AppState.user.accentColor);
    }

    return 'purple';
  },

  getPreset: function (colorId) {
    var normalized = normalizeAccentColorId(colorId);
    return {
      id: normalized,
      value: ACCENT_COLORS[normalized]
    };
  },

  applyAccentColor: function (colorId, preview, options) {
    options = options || {};

    var preset = this.getPreset(colorId);
    var root = document.documentElement;
    var isPreview = !!preview;
    var persist = isPreview ? false : options.persist !== false;
    var pulse = isPreview ? false : options.pulse !== false;
    var forceCurrent = !!options.forceCurrent;
    var glowIntensity = isPreview ? 0.6 : 1;

    root.style.setProperty('--color-primary', preset.value.primary);
    root.style.setProperty('--color-primary-hover', preset.value.hover);
    root.style.setProperty('--color-primary-active', preset.value.active);
    root.style.setProperty('--color-primary-highlight', preset.value.highlight);
    root.style.setProperty('--glow-left', scaleRgbaAlpha(preset.value.glowLeft, glowIntensity));
    root.style.setProperty('--glow-right', scaleRgbaAlpha(preset.value.glowRight, glowIntensity));

    if (persist || forceCurrent) {
      this.current = preset.id;
    }

    if (persist) {
      saveStoredAccentColor(preset.id);

      if (typeof AppState !== 'undefined' && AppState) {
        AppState.user = AppState.user || {};
        AppState.user.accentColor = preset.id;

        if (AppState.settingsPage && AppState.settingsPage.appearance) {
          AppState.settingsPage.appearance.accent = preset.id;
        }
      }

      if (pulse) {
        this.triggerPulse();
      }
    }
  },

  restoreCurrent: function () {
    this.applyAccentColor(this.current, false, {
      persist: false,
      pulse: false,
      forceCurrent: true
    });
  },

  syncFromState: function () {
    var savedColor = this.getSavedAccentColor();
    this.applyAccentColor(savedColor, false, {
      persist: false,
      pulse: false,
      forceCurrent: true
    });

    if (typeof AppState !== 'undefined' && AppState) {
      AppState.user = AppState.user || {};
      AppState.user.accentColor = savedColor;
      if (AppState.settingsPage && AppState.settingsPage.appearance) {
        AppState.settingsPage.appearance.accent = savedColor;
      }
    }
  },

  triggerPulse: function () {
    var root = document.documentElement;
    root.classList.remove('glow-pulse');
    void root.offsetWidth;
    root.classList.add('glow-pulse');

    clearTimeout(this.pulseTimer);
    this.pulseTimer = setTimeout(function () {
      root.classList.remove('glow-pulse');
    }, 400);
  },

  init: function () {
    this.syncFromState();
  }
};

var SettingsPanel = {
  init: function () {},
  open: function () {
    if (typeof AppRouter !== 'undefined' && AppRouter && typeof AppRouter.navigate === 'function') {
      AppRouter.navigate('configuracoes');
    }
  },
  close: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && typeof HeaderModule.closeSettingsOverlay === 'function') {
      HeaderModule.closeSettingsOverlay();
    }
  },
  toggle: function () {
    if (typeof HeaderModule !== 'undefined' && HeaderModule && HeaderModule.settingsOverlay && HeaderModule.settingsOverlay.classList.contains('is-open')) {
      HeaderModule.closeSettingsOverlay();
      return;
    }
    this.open();
  },
  renderSection: function () {}
};
