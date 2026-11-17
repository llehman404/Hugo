// ==========================================
// SIDEBAR - Recherche et Navigation par Arbre
// ==========================================

// État global
let searchIndex = null;
let fuse = null;
let isHomePage = false;

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si on est sur la page d'accueil
    isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    // Charger l'index de recherche
    loadSearchIndex();
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser la navigation par arbre
    initTreeNavigation();
    
    // Tout plier par défaut au chargement
    setTimeout(() => {
        collapseAllTreeItems();
        // Ne pas déplier automatiquement sur la page d'accueil
        if (!isHomePage) {
            expandCurrentPagePath();
        }
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
            // Fuse.js est déjà chargé via la balise <script> dans le HTML
            initFuseWithRetry(data);
        })
        .catch(error => {
            console.error('Erreur chargement index:', error);
        });
}

function initFuseWithRetry(data, attempt = 1) {
    if (typeof Fuse === 'undefined') {
        if (attempt < 10) {
            setTimeout(() => initFuseWithRetry(data, attempt + 1), 200);
        }
        return;
    }
    
    fuse = new Fuse(data, {
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
        shouldSort: true
    });
}

// ==========================================
// RECHERCHE
// ==========================================
function initSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    const loadingIndicator = document.querySelector('.search-loading');
    
    if (!searchInput || !searchResults) return;

    let searchTimeout;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        // Fermer si vide
        if (query.length === 0) {
            searchResults.classList.remove('show');
            if (loadingIndicator) loadingIndicator.classList.remove('show');
            return;
        }

        // Minimum 2 caractères
        if (query.length < 2) {
            searchResults.innerHTML = '<div class="no-results">Tapez au moins 2 caractères</div>';
            searchResults.classList.add('show');
            return;
        }

        if (loadingIndicator) loadingIndicator.classList.add('show');
        searchResults.classList.add('show');
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query, searchResults, loadingIndicator);
        }, 200);
    });

    // Fermer quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });

    // Navigation clavier
    searchInput.addEventListener('keydown', function(e) {
        const results = searchResults.querySelectorAll('.search-result-item');
        let currentIndex = -1;
        
        results.forEach((item, index) => {
            if (item.classList.contains('focused')) currentIndex = index;
        });

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (results.length > 0) {
                results.forEach(r => r.classList.remove('focused'));
                const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
                results[newIndex].classList.add('focused');
                results[newIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                results.forEach(r => r.classList.remove('focused'));
                const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
                results[newIndex].classList.add('focused');
                results[newIndex].scrollIntoView({ block: 'nearest' });
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
        resultsContainer.innerHTML = '<div class="no-results">Recherche en cours...</div>';
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
            const snippet = item.content ? item.content.substring(0, 150) : (item.summary || '');
            const highlightedSnippet = highlightText(snippet + '...', query);
            
            html += `
                <div class="search-result-item" data-url="${item.permalink || item.url}">
                    <a href="${item.permalink || item.url}">
                        <div class="search-result-title">${highlightedTitle}</div>
                        ${highlightedSnippet ? `<div class="search-result-snippet">${highlightedSnippet}</div>` : ''}
                    </a>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        
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
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = this.closest('.tree-item');
            const childList = parentItem.querySelector('.tree-nav');
            
            if (childList) {
                const isExpanded = childList.classList.contains('show');
                
                if (isExpanded) {
                    // Fermer ce niveau
                    childList.classList.remove('show');
                    this.textContent = '+ ';
                } else {
                    // Ouvrir ce niveau
                    childList.classList.add('show');
                    this.textContent = '- ';
                }
            }
        });
    });
}

// ==========================================
// GESTION DE L'ÉTAT INITIAL
// ==========================================
function collapseAllTreeItems() {
    document.querySelectorAll('.tree-nav:not(.root-level)').forEach(list => {
        list.classList.remove('show');
    });
    
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.textContent = '+ ';
    });
}

function expandCurrentPagePath() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Trouver le lien correspondant
    let bestMatch = null;
    let bestScore = -1;
    
    document.querySelectorAll('.tree-link').forEach(link => {
        const href = link.getAttribute('href');
        const normalizedHref = normalizeUrl(href);
        const normalizedCurrent = normalizeUrl(currentUrl);
        
        let score = 0;
        
        if (normalizedCurrent === normalizedHref) {
            score = 100;
        } else if (normalizedCurrent.startsWith(normalizedHref) && normalizedHref !== '/') {
            score = 50;
        } else if (normalizedHref.startsWith(normalizedCurrent)) {
            score = 25;
        } else if (normalizedHref.includes(normalizedCurrent.split('/').pop())) {
            score = 10;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = link;
        }
    });
    
    if (bestMatch) {
        let current = bestMatch.closest('.tree-item');
        while (current && current.classList) {
            if (current.classList.contains('tree-item')) {
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
}

function normalizeUrl(url) {
    return url
        .split('?')[0]
        .split('#')[0]
        .replace(/\/+$/, '')
        .replace(/\/index\.html$/, '/');
}

// ==========================================
// NETTOYAGE
// ==========================================
window.addEventListener('beforeunload', function() {
    clearTimeout(window.searchTimeout);
});
