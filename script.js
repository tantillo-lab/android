/* ============================================================================
   AnDrOID (Animated Donor-Acceptor Orbital Interaction Databank)
   MAIN JAVASCRIPT FILE
   
   This file handles:
   - Pagination for molecule browsing (homepage - index.html)
   - Search/filter functionality (all molecules page - molecules.html)
   
   NOTE: JSMol initialization is handled DIRECTLY IN MOLECULE HTML FILES.
   This script.js is NOT used by molecule pages like molecule_pages/Adamantane_1.html
   
   File usage:
   - index.html: Uses pagination functions ✅
   - molecules.html: Uses search functions ✅
   - molecule_pages/Adamantane_1.html: Does NOT include this script.js ✅
   ============================================================================ */

/* ============================================================================
   PAGINATION FUNCTIONALITY
   Shows the molecule tiles (Home "Featured" grid and "All Molecules" grid) a page at a time.
   - Tiles per page: 6 by default (two rows of three). A grid can override this with
     data-page-size="9" (for example) on its <div class="molecules-grid...">.
   - Page-number buttons are built automatically from the number of tiles, so adding a
     tile to the HTML is all that's needed. The bar is hidden when everything fits on one page.
   ============================================================================ */

const DEFAULT_PAGE_SIZE = 6;
let currentPage = 1;

// The grid that holds the molecule tiles on this page (null on pages without one)
function moleculeGrid() {
    return document.querySelector('.molecules-grid, .molecules-grid-full');
}

function pageSize() {
    const grid = moleculeGrid();
    const n = grid ? parseInt(grid.dataset.pageSize, 10) : NaN;
    return n > 0 ? n : DEFAULT_PAGE_SIZE;
}

// Tiles that currently match the search box (all tiles when there is no search)
function matchingCards() {
    const grid = moleculeGrid();
    if (!grid) return [];
    return Array.from(grid.querySelectorAll('.molecule-card')).filter(card => card.dataset.searchHidden !== 'true');
}

function totalPages() {
    return Math.max(1, Math.ceil(matchingCards().length / pageSize()));
}

/* Function: Go to next page ("Next →" button) */
function goToNext() {
    goToPage(currentPage + 1);
}

/* Function: Go to previous page ("← Previous" button) */
function goToPrevious() {
    goToPage(currentPage - 1);
}

/* Function: Go to a specific page (page-number buttons)
   Parameters: pageNumber - the page to show */
function goToPage(pageNumber) {
    const pages = totalPages();
    const target = Math.min(Math.max(1, pageNumber), pages);
    const changed = target !== currentPage;
    currentPage = target;
    updatePagination();
    // Bring the top of the grid back into view when the user changes page
    const grid = moleculeGrid();
    if (changed && grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Function: Update pagination display
   Shows only the tiles for the current page, rebuilds the page-number buttons,
   and enables/disables Previous/Next. */
function updatePagination() {
    const grid = moleculeGrid();
    if (!grid) return;
    const size = pageSize();
    const pages = totalPages();
    if (currentPage > pages) currentPage = pages;

    // Hide every tile, then show the ones on the current page
    const all = Array.from(grid.querySelectorAll('.molecule-card'));
    all.forEach(card => { card.style.display = 'none'; });
    matchingCards().slice((currentPage - 1) * size, currentPage * size)
        .forEach(card => { card.style.display = ''; });

    // Page-number buttons
    const indicators = document.querySelector('.page-indicators');
    if (indicators) {
        indicators.innerHTML = '';
        for (let p = 1; p <= pages; p++) {
            const dot = document.createElement('span');
            dot.className = 'page-dot' + (p === currentPage ? ' active' : '');
            dot.textContent = p;
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', 'Page ' + p);
            dot.addEventListener('click', () => goToPage(p));
            indicators.appendChild(dot);
        }
    }

    // Previous / Next buttons and the bar itself
    const prev = document.querySelector('.prev-btn');
    const next = document.querySelector('.next-btn');
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= pages;
    const bar = document.querySelector('.pagination-section');
    if (bar) bar.hidden = pages <= 1;
}

/* ============================================================================
   SEARCH/FILTER FUNCTIONALITY
   Allows users to search molecules by name on "All Molecules" page
   ============================================================================ */

/* Function: Search/filter molecules by name
   Parameters: searchTerm - the text user typed in search box
   Matching tiles are shown a page at a time, starting from page 1 */
function searchMolecules(searchTerm) {
    const term = searchTerm.trim().toLowerCase();
    const grid = moleculeGrid();
    if (!grid) return;
    grid.querySelectorAll('.molecule-card').forEach(card => {
        const moleculeName = card.querySelector('.molecule-name').textContent.toLowerCase();
        card.dataset.searchHidden = moleculeName.includes(term) ? 'false' : 'true';
    });
    currentPage = 1;
    updatePagination();
    console.log('Search filter: ' + searchTerm);
}

/* ============================================================================
   PAGE INITIALIZATION
   This runs automatically when the page fully loads
   ============================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('========================================');
    console.log('AnDrOID Databank - Page Initialization');
    console.log('========================================');
    
    // Initialize pagination display (homepage only)
    console.log('Step 1: Initializing pagination...');
    updatePagination();
    
    // Setup search box event listener (all molecules page only)
    console.log('Step 2: Setting up search functionality...');
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        // Add event listener that runs searchMolecules() as user types
        searchBox.addEventListener('input', function(event) {
            searchMolecules(event.target.value);
        });
        console.log('Search box found and ready');
    }
    
    console.log('========================================');
    console.log('Page initialization complete!');
    console.log('========================================');
});

/* ============================================================================
   UTILITY FUNCTIONS
   Helper functions for common tasks
   ============================================================================ */

/* Function: Format a number with comma separators
   Example: 1234567 becomes "1,234,567" */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* Function: Get URL parameter value
   Parameters: paramName - name of the parameter (e.g., 'molecule' from ?molecule=benzene) */
function getUrlParameter(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
}

/* Function: Smooth scroll to a specific element
   Parameters: elementId - the ID of the element to scroll to */
function smoothScrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ============================================================================
   IMPORTANT NOTES
   
   HOW JSMOL WORKS IN YOUR SETUP:
   
   1. MOLECULE PAGES (molecule_pages/Adamantane_1.html, etc.):
      - JSMol code is DIRECTLY in the HTML <head> section
      - NO script.js needed for JSMol
      - Buttons call Jmol.script() directly in onclick
      - script.js is NOT included in these pages
   
   2. HOMEPAGE (index.html):
      - Uses this script.js for pagination
      - No JSMol needed
      - <script src="script.js"></script> included
   
   3. ALL MOLECULES PAGE (molecules.html):
      - Uses this script.js for search functionality
      - No JSMol needed
      - <script src="script.js"></script> included
   
   JSMOL IS SELF-CONTAINED IN EACH MOLECULE HTML FILE!
   
   File structure:
   project/
   ├── index.html (includes script.js for pagination)
   ├── molecules.html (includes script.js for search)
   ├── molecule_pages/Adamantane_1.html (NO script.js - JSMol in HTML head)
   ├── Benzene.html (NO script.js - JSMol in HTML head)
   ├── script.js (this file - only for pagination/search)
   ├── style.css
   └── molecules/
       ├── Adamantane_1.mol
       └── Benzene.mol
   
   ============================================================================ */

/* ============================================================================
   END OF JAVASCRIPT FILE
   ============================================================================ */
