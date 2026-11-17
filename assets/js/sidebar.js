// ==========================================
// SIDEBAR - Recherche et Navigation par Arbre
// ==========================================

// Fuse.js pour la recherche
let searchIndex = null;
let fuse = null;

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Charger l'index de recherche
    loadSearchIndex();
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser la navigation par arbre
    initTreeNavigation();
    
    // Corriger l'état initial de l'arbre
    setTimeout(() => {
        fixInitialTreeState();
    }, 100);
});

// ==========================================
// CHARGEMENT DE L'INDEX DE RECHERCHE
// ==========================================
function loadSearchIndex() {
    const indexPath = '/index.json';
    
    fetch(indexPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            searchIndex = data;
            initFuse();
        })
        .catch(error => {
            console.error('Erreur lors du chargement de l\'index de recherche:', error);
        });
}

function initFuse() {
    // Vérifier que Fuse est chargé
    if (typeof Fuse === 'undefined') {
        // Attendre et réessayer
        setTimeout(initFuse, 100);
        return;
    }
    
    if (!searchIndex) {
        setTimeout(initFuse, 100);
        return;
    }
    
    // Configuration Fuse.js
    const options = {
        keys: [
            { name: 'title', weight: 0.4 },
            { name: 'content', weight: 0.6 },
            { name: 'summary', weight: 0.3 }
        ],
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 2,
        useExtendedSearch: true,
        findAllMatches: true,
        isCaseSensitive: false,
        shouldSort: true,
        includeScore: true,
        includeMatches: true
    };
    
    fuse = new Fuse(searchIndex, options);
    console.log('Fuse.js initialisé avec', searchIndex.length, 'pages');
}

// ==========================================
// INITIALISATION DE LA RECHERCHE
// ==========================================
function initSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    const loadingIndicator = document.querySelector('.search-loading');
    
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            searchResults.classList.remove('show');
            if (loadingIndicator) loadingIndicator.classList.remove('show');
            return;
        }

        if (query.length < 2) {
            searchResults.innerHTML = '<div class="no-results">Tapez au moins 2 caractères</div>';
            searchResults.classList.add('show');
            return;
        }

        if (loadingIndicator) loadingIndicator.classList.add('show');
        searchResults.classList.add('show');
        
        // Utiliser un délai pour éviter les requêtes trop fréquentes
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            performSearch(query, searchResults, loadingIndicator);
        }, 200);
    });

    // Fermer les résultats quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });

    // Navigation avec les flèches
    searchInput.addEventListener('keydown', function(e) {
        const results = searchResults.querySelectorAll('.search-result-item');
        let currentIndex = -1;
        
        results.forEach((item, index) => {
            if (item.classList.contains('focused')) {
                currentIndex = index;
            }
        });

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (results.length > 0) {
                results.forEach(r => r.classList.remove('focused'));
                if (currentIndex < results.length - 1) {
                    results[currentIndex + 1].classList.add('focused');
                    results[currentIndex + 1].scrollIntoView({ block: 'nearest' });
                } else {
                    results[0].classList.add('focused');
                    results[0].scrollIntoView({ block: 'nearest' });
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                results.forEach(r => r.classList.remove('focused'));
                if (currentIndex > 0) {
                    results[currentIndex - 1].classList.add('focused');
                    results[currentIndex - 1].scrollIntoView({ block: 'nearest' });
                } else {
                    results[results.length - 1].classList.add('focused');
                    results[results.length - 1].scrollIntoView({ block: 'nearest' });
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const focused = searchResults.querySelector('.search-result-item.focused');
            if (focused) {
                window.location.href = focused.getAttribute('data-url');
            } else if (results.length > 0) {
                window.location.href = results[0].getAttribute('data-url');
            }
        } else if (e.key === 'Escape') {
            searchResults.classList.remove('show');
        }
    });
}

function performSearch(query, resultsContainer, loadingIndicator) {
    if (!fuse) {
        // Réessayer d'initialiser Fuse
        initFuse();
        resultsContainer.innerHTML = '<div class="no-results">Recherche en cours d\'initialisation...</div>';
        if (loadingIndicator) loadingIndicator.classList.remove('show');
        return;
    }

    const results = fuse.search(query);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
    } else {
        const maxResults = Math.min(results.length, 10);
        let html = '';
        
        for (let i = 0; i < maxResults; i++) {
            const item = results[i].item;
            const highlightedTitle = highlightText(item.title, query);
            const snippet = item.content ? item.content.substring(0, 200) : (item.summary || '');
            const highlightedSnippet = highlightText(snippet + '...', query);
            
            html += `
                <div class="search-result-item" data-url="${item.permalink || item.url}">
                    <a href="${item.permalink || item.url}">
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-snippet">${highlightedSnippet}</div>
                    </a>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        
        // Ajouter les gestionnaires de clic
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = this.getAttribute('data-url');
            });
        });
    }
    
    if (loadingIndicator) loadingIndicator.classList.remove('show');
}

function highlightText(text, query) {
    if (!query) return text;
    
    try {
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    } catch (e) {
        return text;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==========================================
// NAVIGATION PAR ARBRE
// ==========================================
function initTreeNavigation() {
    // Gestion des toggles
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = this.closest('.tree-item');
            const childList = parentItem.querySelector('.tree-nav');
            
            if (childList) {
                const isExpanded = childList.classList.contains('show');
                
                if (isExpanded) {
                    childList.classList.remove('show');
                    this.textContent = '+ ';
                } else {
                    childList.classList.add('show');
                    this.textContent = '- ';
                }
            }
        });
    });
    
    // Gestion des clics sur les liens
    document.querySelectorAll('.tree-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Marquer les parents comme actifs
            markItemActive(this.closest('.tree-item'));
        });
    });
}

// ==========================================
// ÉTAT INITIAL DE L'ARBRE
// ==========================================
function fixInitialTreeState() {
    // TOUT doit être plié par défaut
    document.querySelectorAll('.tree-nav:not(.root-level)').forEach(list => {
        list.classList.remove('show');
    });
    
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.textContent = '+ ';
    });
    
    // Marquer l'item correspondant à la page actuelle
    markCurrentPageActive();
}

function markCurrentPageActive() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Trouver le lien correspondant à la page courante
    let bestMatch = null;
    let bestScore = -1;
    
    document.querySelectorAll('.tree-link').forEach(link => {
        const href = link.getAttribute('href');
        const normalizedHref = normalizeUrl(href);
        const normalizedCurrent = normalizeUrl(currentUrl);
        
        // Calculer un score de correspondance
        let score = 0;
        
        if (normalizedCurrent === normalizedHref) {
            score = 100; // Match exact
        } else if (normalizedCurrent.startsWith(normalizedHref) && normalizedHref !== '/') {
            score = 50; // La page courante est une sous-page
        } else if (normalizedHref.startsWith(normalizedCurrent)) {
            score = 25; // Le lien est une sous-page de la page courante
        } else if (normalizedHref.includes(normalizedCurrent.split('/').pop())) {
            score = 10; // Le nom de la page est dans l'URL
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = link;
        }
    });
    
    if (bestMatch) {
        markItemActive(bestMatch.closest('.tree-item'));
    }
}

function markItemActive(item) {
    if (!item) return;
    
    // Supprimer l'active de tous les items
    document.querySelectorAll('.tree-item.active').forEach(i => {
        i.classList.remove('active');
    });
    
    // Marquer les parents comme actifs et les déplier
    let current = item;
    while (current && current.classList) {
        if (current.classList.contains('tree-item')) {
            current.classList.add('active');
            // Déplier
            const childList = current.querySelector('.tree-nav');
            if (childList) {
                childList.classList.add('show');
                const toggle = current.querySelector('.tree-toggle');
                if (toggle) toggle.textContent = '- ';
            }
        }
        current = current.parentElement?.closest('.tree-item');
    }
}

function normalizeUrl(url) {
    // Supprimer les query strings, les hashs, et les trailing slashes
    return url
        .split('?')[0]
        .split('#')[0]
        .replace(/\/+$/, '')
        .replace(/\/index\.html$/, '/');
}

// Nettoyer au déchargement
window.addEventListener('beforeunload', function() {
    clearTimeout(window.searchTimeout);
});
