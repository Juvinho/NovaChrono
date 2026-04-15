'use strict';

// Definição das 10 insígnias do sistema
const BADGES_DATA = {
  primeiro_eco: {
    id: 'primeiro_eco',
    name: 'Primeiro Eco',
    description: 'Fez o 1º repost',
    rarity: 'bronze',
    icon: 'repeat-2',
    unlocked: true
  },
  voz_da_rua: {
    id: 'voz_da_rua',
    name: 'Voz da Rua',
    description: '100 posts publicados',
    rarity: 'prata',
    icon: 'message-circle',
    unlocked: true
  },
  linha_mestra: {
    id: 'linha_mestra',
    name: 'Linha Mestra',
    description: 'Ativo por 30 dias seguidos',
    rarity: 'prata',
    icon: 'timer',
    unlocked: false
  },
  tendencia: {
    id: 'tendencia',
    name: 'Tendência',
    description: 'Post entrou no top 10',
    rarity: 'ouro',
    icon: 'trending-up',
    unlocked: false
  },
  arquiteto: {
    id: 'arquiteto',
    name: 'Arquiteto',
    description: 'Criou 3 cordões',
    rarity: 'bronze',
    icon: 'layers',
    unlocked: true
  },
  noturno: {
    id: 'noturno',
    name: 'Coruja Noturna',
    description: 'Postou após meia-noite',
    rarity: 'bronze',
    icon: 'moon',
    unlocked: true
  },
  popular: {
    id: 'popular',
    name: 'Magneto',
    description: '500 seguidores',
    rarity: 'ouro',
    icon: 'users',
    unlocked: false
  },
  cronista: {
    id: 'cronista',
    name: 'Cronista',
    description: '1000 posts publicados',
    rarity: 'lendario',
    icon: 'feather',
    unlocked: false
  },
  enqueteiro: {
    id: 'enqueteiro',
    name: 'Enqueteiro',
    description: 'Criou 10 enquetes',
    rarity: 'bronze',
    icon: 'bar-chart-2',
    unlocked: true
  },
  viral: {
    id: 'viral',
    name: 'Viral',
    description: 'Post com +500 boosts',
    rarity: 'lendario',
    icon: 'zap',
    unlocked: false
  }
};

function getBadgeIcon(iconName) {
  var svgs = {
    'repeat-2': '<i data-lucide="repeat-2"></i>',
    'message-circle': '<i data-lucide="message-circle"></i>',
    'timer': '<i data-lucide="timer"></i>',
    'trending-up': '<i data-lucide="trending-up"></i>',
    'layers': '<i data-lucide="layers"></i>',
    'moon': '<i data-lucide="moon"></i>',
    'users': '<i data-lucide="users"></i>',
    'feather': '<i data-lucide="feather"></i>',
    'bar-chart-2': '<i data-lucide="bar-chart-2"></i>',
    'zap': '<i data-lucide="zap"></i>'
  };
  return svgs[iconName] || '<i data-lucide="award"></i>';
}

function formatBadgeItem(badge) {
  var lockedClass = badge.unlocked ? '' : ' locked';
  var tooltip = '';

  if (badge.unlocked) {
    var rarityLabel = badge.rarity === 'lendario' ? 'LENDÁRIO' :
                     badge.rarity === 'ouro' ? 'OURO' :
                     badge.rarity === 'prata' ? 'PRATA' :
                     'BRONZE';
    tooltip = '<div class="badge-tooltip">' +
      '<span class="badge-tooltip-name">' + badge.name + '</span>' +
      '<span class="badge-tooltip-desc">' + badge.description + '</span>' +
      '<span class="badge-tooltip-level">' + rarityLabel + '</span>' +
    '</div>';
  }

  var lockIcon = !badge.unlocked ?
    '<div class="badge-lock-icon"><i data-lucide="lock" style="width: 10px; height: 10px;"></i></div>' : '';

  return '<div class="badge-item' + lockedClass + '" data-rarity="' + badge.rarity + '" data-badge-id="' + badge.id + '">' +
    '<div class="badge-icon-container">' +
      getBadgeIcon(badge.icon) +
      lockIcon +
    '</div>' +
    '<div class="badge-name">' + badge.name + '</div>' +
    tooltip +
  '</div>';
}

function renderBadgesCard() {
  var container = document.querySelector('.profile-badges-grid');
  if (!container) return;

  // Filtrar e ordenar: desbloqueadas primeiro
  var unlockedBadges = Object.values(BADGES_DATA).filter(function(b) { return b.unlocked; });
  var lockedBadges = Object.values(BADGES_DATA).filter(function(b) { return !b.unlocked; });
  var allBadges = unlockedBadges.concat(lockedBadges);

  // Mostrar apenas as primeiras 6, adicionar "+N mais" se necessário
  var displayCount = 6;
  var html = '';

  for (var i = 0; i < Math.min(displayCount, allBadges.length); i++) {
    html += formatBadgeItem(allBadges[i]);
  }

  // Adicionar badge "+N mais"
  if (allBadges.length > displayCount) {
    var remaining = allBadges.length - displayCount;
    html += '<div class="badges-more-badge" id="badgesMoreBadge">+' + remaining + '</div>';
  }

  container.innerHTML = html;

  // Re-renderizar ícones Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Adicionar listeners
  setupBadgeListeners();
}

function setupBadgeListeners() {
  var moreButton = document.getElementById('badgesMoreBadge');
  if (moreButton) {
    moreButton.addEventListener('click', openBadgesModal);
  }

  var viewAllButton = document.querySelector('.profile-badges-view-all');
  if (viewAllButton) {
    viewAllButton.addEventListener('click', openBadgesModal);
  }
}

function openBadgesModal() {
  var overlay = document.getElementById('badgesModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('is-hidden');
  setTimeout(function() {
    overlay.classList.add('is-open');
  }, 10);

  renderBadgesModalContent();
}

function closeBadgesModal() {
  var overlay = document.getElementById('badgesModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('is-open');
  setTimeout(function() {
    overlay.classList.add('is-hidden');
  }, 200);
}

function renderBadgesModalContent() {
  var grid = document.getElementById('badgesModalGrid');
  if (!grid) return;

  // Ordenar: desbloqueadas primeiro
  var unlockedBadges = Object.values(BADGES_DATA).filter(function(b) { return b.unlocked; });
  var lockedBadges = Object.values(BADGES_DATA).filter(function(b) { return !b.unlocked; });
  var allBadges = unlockedBadges.concat(lockedBadges);

  var html = '';
  allBadges.forEach(function(badge) {
    html += formatBadgeItem(badge);
  });

  grid.innerHTML = html;

  // Re-renderizar ícones Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function initBadges() {
  renderBadgesCard();

  // Listener para fechar modal
  var closeBtn = document.getElementById('badgesModalClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeBadgesModal);
  }

  // Listener para fechar modal ao clicar fora
  var overlay = document.getElementById('badgesModalOverlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeBadgesModal();
      }
    });
  }

  // Listener para Esc
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = document.getElementById('badgesModalOverlay');
      if (overlay && overlay.classList.contains('is-open')) {
        closeBadgesModal();
      }
    }
  });
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBadges);
} else {
  initBadges();
}
