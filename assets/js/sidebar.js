// ========== RECHERCHE GLOBALE ==========
let searchIndex = null;

// Configuration optimisée pour la recherche dans le contenu
let fuseOptions = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  location: 0,
  threshold: 0.2,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: true,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.6 },
    { name: 'permalink', weight: 0.3 }
  ]
};

// Charger l'index de recherche
function loadSearchIndex() {
  // Utiliser une URL absolue vers index.json à la racine
  const indexUrl = new URL('/index.json', window.location.origin).toString();
  const loadingIndicator = document.querySelector('.search-loading');
  
  if (loadingIndicator) {
    loadingIndicator.classList.add('show');
  }
  
  fetch(indexUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load search index: ${response.status}`);
      return response.json();
    })
    .then(data => {
      searchIndex = new Fuse(data, fuseOptions);
      setupSearch();
      if (loadingIndicator) {
        loadingIndicator.classList.remove('show');
      }
    })
    .catch(error => {
      console.error('Error loading search index:', error);
      if (loadingIndicator) {
        loadingIndicator.classList.remove('show');
      }
    });
}

// Configurer la barre de recherche
function setupSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('global-search-results');
  const loadingIndicator = document.querySelector('.search-loading');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.classList.remove('show');
      return;
    }
    
    // Afficher l'indicateur de chargement
    if (loadingIndicator) {
      loadingIndicator.classList.add('show');
    }
    
    searchTimeout = setTimeout(() => {
      if (!searchIndex) {
        if (loadingIndicator) loadingIndicator.classList.remove('show');
        return;
      }
      
      // Recherche avec Fuse.js
      const results = searchIndex.search(query);
      
      // Limiter à 15 résultats
      const limitedResults = results.slice(0, 15);
      
      if (limitedResults.length > 0) {
        searchResults.innerHTML = '';
        limitedResults.forEach(result => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          
          // Surligner le texte trouvé
          const title = highlightText(result.item.title, query);
          const contentPreview = getContentPreview(result.item.content, query, 100);
          
          item.innerHTML = `
            <a href="${result.item.permalink}">
              <div class="search-result-title">${title}</div>
              ${contentPreview ? `<div class="search-result-snippet">${contentPreview}</div>` : ''}
            </a>
          `;
          
          item.onclick = () => {
            searchResults.classList.remove('show');
            searchInput.value = '';
            if (loadingIndicator) loadingIndicator.classList.remove('show');
          };
          
          searchResults.appendChild(item);
        });
        searchResults.classList.add('show');
      } else {
        searchResults.innerHTML = '<div class="search-result-item no-results">Aucun résultat trouvé</div>';
        searchResults.classList.add('show');
      }
      
      if (loadingIndicator) {
        loadingIndicator.classList.remove('show');
      }
    }, 150);
  });
  
  // Fermer les résultats quand on clique à l'extérieur
  document.addEventListener('click', (e) => {
    if (searchInput && searchResults && 
        !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });
  
  // Fermer avec la touche Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchResults) searchResults.classList.remove('show');
      if (searchInput) searchInput.value = '';
    }
  });
}

// Extraire un extrait du contenu avec le terme de recherche
function getContentPreview(content, query, maxLength) {
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const pos = contentLower.indexOf(queryLower);
  
  if (pos === -1) return '';
  
  const start = Math.max(0, pos - 20);
  const end = Math.min(content.length, pos + maxLength);
  let preview = content.substring(start, end);
  
  if (start > 0) {
    preview = '...' + preview;
  }
  
  preview = highlightText(preview, query);
  
  return preview;
}

// Surligner le texte trouvé dans les résultats
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Échapper les caractères spéciaux pour Regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========== ARBRE DE NAVIGATION ==========

// Initialiser l'arbre
function initTree() {
  const treeContainers = document.querySelectorAll('.tree-nav-container');
  
  // D'abord, tout fermer (par défaut tout est plié)
  closeAllTreeItems();
  
  // Puis ouvrir seulement le chemin vers la page courante
  const currentPath = window.location.pathname;
  const treeLinks = document.querySelectorAll('.tree-link');
  
  treeLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (currentPath === linkHref || currentPath.startsWith(linkHref + '/')) {
      const parentItem = link.closest('.tree-item');
      if (parentItem) {
        parentItem.classList.add('active');
        // Ouvrir tous les parents
        openParentTreeItems(parentItem);
      }
    }
  });
  
  // Ajouter les handlers pour le toggle
  treeContainers.forEach(container => {
    container.addEventListener('click', toggleTree);
  });
}

// Fermer tous les items de l'arbre
function closeAllTreeItems() {
  const allTreeNavs = document.querySelectorAll('.tree-nav:not(.root-level)');
  allTreeNavs.forEach(nav => {
    nav.classList.remove('show');
  });
  
  const allToggles = document.querySelectorAll('.tree-toggle');
  allToggles.forEach(toggle => {
    toggle.textContent = '+';
  });
  
  const allItems = document.querySelectorAll('.tree-item');
  allItems.forEach(item => {
    item.classList.remove('active');
  });
}

// Ouvrir les items parents
function openParentTreeItems(item) {
  let ancestor = item.parentElement?.closest('.tree-item');
  while (ancestor) {
    ancestor.classList.add('active');
    const childNav = ancestor.querySelector('.tree-nav');
    if (childNav) {
      childNav.classList.add('show');
      const toggle = ancestor.querySelector('.tree-toggle');
      if (toggle) toggle.textContent = '−';
    }
    ancestor = ancestor.parentElement?.closest('.tree-item');
  }
}

// Toggle pour les sous-sections
function toggleTree(event) {
  if (event.target.classList.contains('tree-toggle')) {
    event.preventDefault();
    event.stopPropagation();
    const parent = event.target.closest('.tree-item');
    const childNav = parent.querySelector('.tree-nav');
    const toggle = parent.querySelector('.tree-toggle');
    
    if (childNav) {
      childNav.classList.toggle('show');
      if (toggle) {
        toggle.textContent = childNav.classList.contains('show') ? '−' : '+';
      }
    }
  }
}

// ========== INITIALISATION ==========

document.addEventListener('DOMContentLoaded', () => {
  loadSearchIndex();
  initTree();
});

// Re-initialiser quand on navigue
if (window.history.pushState) {
  const originalPushState = window.history.pushState;
  window.history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(() => {
      initTree();
    }, 50);
  };
  
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      initTree();
    }, 50);
  });
}
