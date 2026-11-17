// ==========================================
// SIDEBAR - Recherche et Navigation par Arbre
// ==========================================

// Fuse.js pour la recherche (chargé depuis PaperMod)
let searchIndex = null;
let fuse = null;

// Charger l'index de recherche
document.addEventListener('DOMContentLoaded', function() {
    loadSearchIndex();
    initTreeNavigation();
    initSearch();
    fixInitialTreeState();
});

// ==========================================
// CHARGEMENT DE L'INDEX DE RECHERCHE
// ==========================================
function loadSearchIndex() {
    const indexPath = typeof __SEARCH_INDEX__ !== 'undefined' ? __SEARCH_INDEX__ : '/index.json';
    
    fetch(indexPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            searchIndex = data;
            
            // Configuration Fuse.js
            const options = {
                keys: [
                    { name: 'title', weight: 0.4 },
                    { name: 'content', weight: 0.6 }
                ],
                threshold: 0.2,
                ignoreLocation: true,
                minMatchCharLength: 2,
                useExtendedSearch: true,
                findAllMatches: true,
                isCaseSensitive: false,
                shouldSort: true
            };
            
            fuse = new Fuse(data, options);
        })
        .catch(error => {
            console.error('Erreur lors du chargement de l\'index de recherche:', error);
        });
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
            if (currentIndex < results.length - 1) {
                results[currentIndex]?.classList.remove('focused');
                results[currentIndex + 1].classList.add('focused');
                results[currentIndex + 1].scrollIntoView({ block: 'nearest' });
            } else if (results.length > 0) {
                results[currentIndex]?.classList.remove('focused');
                results[0].classList.add('focused');
                results[0].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                results[currentIndex].classList.remove('focused');
                results[currentIndex - 1].classList.add('focused');
                results[currentIndex - 1].scrollIntoView({ block: 'nearest' });
            } else if (results.length > 0) {
                results[currentIndex]?.classList.remove('focused');
                results[results.length - 1].classList.add('focused');
                results[results.length - 1].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const focused = searchResults.querySelector('.search-result-item.focused');
            if (focused) {
                focused.click();
            } else if (results.length > 0) {
                results[0].click();
            }
        } else if (e.key === 'Escape') {
            searchResults.classList.remove('show');
        }
    });
}

function performSearch(query, resultsContainer, loadingIndicator) {
    if (!fuse || query.length < 2) {
        resultsContainer.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
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
            const highlightedSnippet = item.content ? highlightText(item.content.substring(0, 150) + '...', query) : '';
            
            html += `
                <div class="search-result-item" data-url="${item.url}">
                    <a href="${item.url}">
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-snippet">${highlightedSnippet || item.description || ''}</div>
                    </a>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        
        // Ajouter les gestionnaires de clic
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('data-url');
                window.location.href = url;
                resultsContainer.classList.remove('show');
            });
            
            item.addEventListener('mouseenter', function() {
                this.classList.add('focused');
            });
            
            item.addEventListener('mouseleave', function() {
                this.classList.remove('focused');
            });
        });
    }
    
    if (loadingIndicator) loadingIndicator.classList.remove('show');
}

function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
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
            const icon = this;
            
            if (childList) {
                const isExpanded = childList.classList.contains('show');
                
                if (isExpanded) {
                    childList.classList.remove('show');
                    icon.textContent = '+ ';
                } else {
                    childList.classList.add('show');
                    icon.textContent = '- ';
                }
            }
        });
    });
    
    // Gestion des clics sur les liens (pour activer la classe active)
    document.querySelectorAll('.tree-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Ne pas empêcher la navigation
            // Mais marquer l'item comme actif
            const parentItem = this.closest('.tree-item');
            
            // Supprimer l Active de tous
            document.querySelectorAll('.tree-item.active').forEach(item => {
                item.classList.remove('active');
            });
            
            // Marquer les parents comme actifs
            let current = parentItem;
            while (current && current.classList) {
                if (current.classList.contains('tree-item')) {
                    current.classList.add('active');
                    // Déplier les enfants
                    const childList = current.querySelector('.tree-nav');
                    if (childList) {
                        childList.classList.add('show');
                        const toggle = current.querySelector('.tree-toggle');
                        if (toggle) toggle.textContent = '- ';
                    }
                }
                current = current.parentElement?.closest('.tree-item');
            }
        });
    });
}

// ==========================================
// CORRECTION DE L'ÉTAT INITIAL DE L'ARBRE
// ==========================================
function fixInitialTreeState() {
    // TOUT doit être plié par défaut
    // Le CSS s'en charge, mais on peut vérifier au cas où
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
    
    // Trouver le lien correspondant
    let activeLink = null;
    document.querySelectorAll('.tree-link').forEach(link => {
        const href = link.getAttribute('href');
        
        // Normaliser les URLs pour comparaison
        const normalizedHref = normalizeUrl(href);
        const normalizedCurrent = normalizeUrl(currentUrl);
        
        if (normalizedCurrent.endsWith(normalizedHref) || 
            normalizedHref.endsWith(normalizedCurrent.split('/').pop())) {
            activeLink = link;
        }
    });
    
    if (activeLink) {
        const parentItem = activeLink.closest('.tree-item');
        
        // Marquer les parents comme actifs et les déplier
        let current = parentItem;
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
}

function normalizeUrl(url) {
    // Supprimer les query strings et les hashs
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '');
}


// ==========================================
// UTILITAIRES
// ==========================================

// Vérifier si on est sur une page avec sidebar
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar.left-sidebar');
    if (sidebar) {
        document.body.classList.add('has-sidebar');
    }
});
