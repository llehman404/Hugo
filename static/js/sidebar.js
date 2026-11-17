// ========== RECHERCHE GLOBALE ==========
let searchIndex = null;
let fuseOptions = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  location: 0,
  threshold: 0.4,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'content', weight: 0.3 },
    { name: 'permalink', weight: 0.5 }
  ]
};

// Charger l'index de recherche
function loadSearchIndex() {
  const baseUrl = document.querySelector('link[rel="canonical"]')?.href || '';
  const indexUrl = new URL('index.json', baseUrl).toString();
  
  fetch(indexUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load search index: ${response.status}`);
      return response.json();
    })
    .then(data => {
      searchIndex = new Fuse(data, fuseOptions);
      setupSearch();
    })
    .catch(error => {
      console.error('Error loading search index:', error);
    });
}

// Configurer la barre de recherche
function setupSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('global-search-results');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.classList.remove('show');
      return;
    }
    
    searchTimeout = setTimeout(() => {
      if (!searchIndex) return;
      
      const results = searchIndex.search(query).slice(0, 10);
      
      if (results.length > 0) {
        searchResults.innerHTML = '';
        results.forEach(result => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `<a href="${result.item.permalink}">${highlightText(result.item.title, query)}</a>`;
          item.onclick = () => {
            searchResults.classList.remove('show');
            searchInput.value = '';
          };
          searchResults.appendChild(item);
        });
        searchResults.classList.add('show');
      } else {
        searchResults.classList.remove('show');
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
    }
  });
}

// Surligner le texte trouvé dans les résultats
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ========== ARBRE DE NAVIGATION ==========

// Initialiser l'arbre
function initTree() {
  const treeContainers = document.querySelectorAll('.tree-nav-container');
  
  // Activer l'item correspondant à la page courante
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

// Re-initialiser quand on navigue (pour les SPAs, mais utile aussi pour Turbo/HTMX)
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
