/**
 * Careers Page JavaScript
 * Handles filtering, searching, and sorting of job listings
 */

class CareersManager {
  constructor() {
    this.jobs = [];
    this.filteredJobs = [];
    this.currentCategory = 'All';
    this.currentSearch = '';
    this.currentSort = 'newest';
    this.debounceTimer = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadJobs();
      this.setupEventListeners();
      this.restoreStateFromURL();
      this.renderJobs();
    } catch (error) {
      console.error('Failed to initialize careers page:', error);
      this.showError('Failed to load job listings. Please refresh the page.');
    }
  }

  async loadJobs() {
    try {
      const response = await fetch('/data/jobs.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.jobs = await response.json();
      this.filteredJobs = [...this.jobs];
    } catch (error) {
      console.error('Error loading jobs:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Category filter buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setCategory(e.target.dataset.category);
      });
    });

    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.debouncedSearch(e.target.value);
      });
    }

    // Sort select
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.setSort(e.target.value);
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.querySelector('.clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Keyboard navigation for category buttons
    const categoryFilter = document.querySelector('.category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('keydown', (e) => {
        this.handleCategoryKeydown(e);
      });
    }
  }

  debouncedSearch(searchTerm) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.setSearch(searchTerm);
    }, 300);
  }

  setCategory(category) {
    this.currentCategory = category;
    this.updateCategoryButtons();
    this.filterAndSort();
    this.updateURL();
  }

  setSearch(searchTerm) {
    this.currentSearch = searchTerm.toLowerCase().trim();
    this.filterAndSort();
    this.updateURL();
  }

  setSort(sortType) {
    this.currentSort = sortType;
    this.filterAndSort();
    this.updateURL();
  }

  clearFilters() {
    this.currentCategory = 'All';
    this.currentSearch = '';
    this.currentSort = 'newest';
    
    // Reset UI elements
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) sortSelect.value = 'newest';
    
    this.updateCategoryButtons();
    this.filterAndSort();
    this.updateURL();
  }

  updateCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === this.currentCategory) {
        btn.classList.add('active');
      }
    });
  }

  filterAndSort() {
    // Filter by category
    let filtered = this.jobs;
    if (this.currentCategory !== 'All') {
      filtered = filtered.filter(job => job.category === this.currentCategory);
    }

    // Filter by search term
    if (this.currentSearch) {
      filtered = filtered.filter(job => {
        const searchableText = [
          job.title,
          job.summary,
          ...job.keywords
        ].join(' ').toLowerCase();
        return searchableText.includes(this.currentSearch);
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.posted) - new Date(a.posted);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    this.filteredJobs = filtered;
    this.renderJobs();
  }

  renderJobs() {
    const jobsGrid = document.querySelector('.jobs-grid');
    const resultsCount = document.querySelector('.results-count');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    if (!jobsGrid) return;

    // Update results count
    if (resultsCount) {
      const count = this.filteredJobs.length;
      resultsCount.textContent = `${count} ${count === 1 ? 'position' : 'positions'} found`;
    }

    // Show/hide clear filters button
    if (clearFiltersBtn) {
      const hasActiveFilters = this.currentCategory !== 'All' || this.currentSearch || this.currentSort !== 'newest';
      clearFiltersBtn.style.display = hasActiveFilters ? 'block' : 'none';
    }

    // Render job cards
    if (this.filteredJobs.length === 0) {
      this.renderEmptyState(jobsGrid);
    } else {
      this.renderJobCards(jobsGrid);
    }
  }

  renderJobCards(container) {
    container.innerHTML = this.filteredJobs.map(job => this.createJobCard(job)).join('');
    
    // Add click handlers to job cards
    const jobCards = container.querySelectorAll('.job-card');
    jobCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on a link or button
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        
        const jobCode = card.dataset.jobCode;
        if (jobCode) {
          window.location.href = `/careers/roles/${jobCode}.html`;
        }
      });
    });
  }

  createJobCard(job) {
    const postedDate = new Date(job.posted);
    const relativeTime = this.getRelativeTime(postedDate);
    
    return `
      <article class="job-card" data-job-code="${job.code}" role="button" tabindex="0" aria-label="View ${job.title} position">
        <div class="job-card-header">
          <div>
            <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
            <div class="job-code">${job.code}</div>
          </div>
        </div>
        
        <div class="job-badges">
          <span class="job-badge category">${job.category}</span>
          ${job.remote ? '<span class="job-badge remote">Remote</span>' : ''}
        </div>
        
        <div class="job-meta">
          <div class="job-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${this.escapeHtml(job.location)}
          </div>
          <div class="job-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${job.type}
          </div>
        </div>
        
        <p class="job-summary">${this.escapeHtml(job.summary)}</p>
        
        <div class="job-cta">
          <a href="${job.url}" class="job-link" aria-label="View ${job.title} position details">
            View role
            <svg class="job-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </a>
          <span class="job-posted">${relativeTime}</span>
        </div>
      </article>
    `;
  }

  renderEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No positions found</h3>
        <p>Try adjusting your search criteria or browse all available positions.</p>
        <button class="btn btn-primary clear-filters">Clear filters</button>
      </div>
    `;
    
    // Add click handler to clear filters button in empty state
    const clearBtn = container.querySelector('.clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
  }

  getRelativeTime(date) {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) === 1 ? '' : 's'} ago`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleCategoryKeydown(e) {
    const buttons = Array.from(document.querySelectorAll('.category-btn'));
    const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        buttons[prevIndex].focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        buttons[nextIndex].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        document.activeElement.click();
        break;
    }
  }

  updateURL() {
    const params = new URLSearchParams();
    
    if (this.currentCategory !== 'All') {
      params.set('category', this.currentCategory);
    }
    if (this.currentSearch) {
      params.set('search', this.currentSearch);
    }
    if (this.currentSort !== 'newest') {
      params.set('sort', this.currentSort);
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }

  restoreStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    const category = params.get('category');
    if (category && ['All', 'Operations', 'Tech', 'Sales', 'Legal'].includes(category)) {
      this.currentCategory = category;
    }
    
    const search = params.get('search');
    if (search) {
      this.currentSearch = search.toLowerCase().trim();
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.value = search;
    }
    
    const sort = params.get('sort');
    if (sort && ['newest', 'az', 'location'].includes(sort)) {
      this.currentSort = sort;
      const sortSelect = document.querySelector('.sort-select');
      if (sortSelect) sortSelect.value = sort;
    }
    
    this.updateCategoryButtons();
  }

  showError(message) {
    const jobsGrid = document.querySelector('.jobs-grid');
    if (jobsGrid) {
      jobsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>Error loading positions</h3>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CareersManager();
});

// Export for potential external use
window.CareersManager = CareersManager;
