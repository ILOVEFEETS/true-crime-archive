const state = {
  selectedCategory: 'Alle',
  searchTerm: '',
  favorites: new Set(
    JSON.parse(localStorage.getItem('tc-favorites') || '[]').map((value) => String(value))
  ),
  currentView: 'home'
};

const baseCases = expandedCases || cases;
const storedCustomCases = JSON.parse(localStorage.getItem('tc-custom-cases') || '[]');
const allCases = [...baseCases, ...storedCustomCases];

function getStoryPreview(item) {
  const paragraphs = item.story.split('\n\n').filter(Boolean);
  const previewText = paragraphs.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
  return previewText || item.summary;
}

function saveFavorites() {
  localStorage.setItem('tc-favorites', JSON.stringify([...state.favorites]));
}

function syncFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach((btn) => {
    const id = String(btn.dataset.id);
    const isFavorite = state.favorites.has(id);
    btn.classList.toggle('active', isFavorite);
    btn.setAttribute('aria-pressed', String(isFavorite));
  });
}

function toggleFavorite(id) {
  const normalizedId = String(id);
  if (state.favorites.has(normalizedId)) {
    state.favorites.delete(normalizedId);
  } else {
    state.favorites.add(normalizedId);
  }
  saveFavorites();
  render();
}

function getFilteredCases() {
  return allCases.filter((item) => {
    const matchesCategory = state.selectedCategory === 'Alle' || item.category === state.selectedCategory;
    const matchesSearch =
      !state.searchTerm ||
      `${item.title} ${item.summary} ${item.location} ${item.person}`.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function getFavoriteCases() {
  return allCases.filter((item) => state.favorites.has(String(item.id)));
}

function openCase(id) {
  const item = allCases.find((entry) => entry.id === id);
  if (!item) return;

  const paragraphs = item.story.split('\n\n').filter(Boolean);

  document.getElementById('modalBody').innerHTML = `
    <div class="modal__inner">
      <span class="modal__eyebrow">${item.category}</span>
      <h3>${item.title}</h3>
      <p class="modal__meta"><strong>Jahr:</strong> ${item.year} · <strong>Ort:</strong> ${item.location} · <strong>Person:</strong> ${item.person}</p>
      <p class="modal__summary">${item.summary}</p>
      ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
    </div>
  `;
  document.getElementById('caseModal').classList.add('open');
}

function closeModal() {
  document.getElementById('caseModal').classList.remove('open');
}

function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  const uniqueCategories = [...new Set(allCases.map((item) => item.category))];
  const pills = ['Alle', ...uniqueCategories];
  container.innerHTML = '';
  pills.forEach((category) => {
    const btn = document.createElement('button');
    btn.className = `category-pill ${state.selectedCategory === category ? 'active' : ''}`;
    btn.textContent = category;
    btn.addEventListener('click', () => {
      state.selectedCategory = category;
      state.currentView = 'categories';
      render();
      document.getElementById('categoriesView').scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(btn);
  });
}

function renderCaseCard(item) {
  const preview = getStoryPreview(item);
  const itemId = String(item.id);
  const isFavorite = state.favorites.has(itemId);
  const card = document.createElement('article');
  card.className = 'case-card';
  card.innerHTML = `
    <div class="case-card__image">
      <span>${item.category}</span>
    </div>
    <div class="case-card__body">
      <h4>${item.title}</h4>
      <p class="case-card__preview" data-preview="${item.id}">${preview}</p>
      <button class="case-card__toggle" data-toggle="${item.id}">Mehr lesen</button>
      <div class="case-card__meta">
        <span>${item.year}</span>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${itemId}" aria-label="Favorit setzen">♥</button>
      </div>
    </div>
  `;

  const previewEl = card.querySelector('.case-card__preview');
  const toggleBtn = card.querySelector('.case-card__toggle');
  const favoriteBtn = card.querySelector('.favorite-btn');

  const updateToggle = () => {
    const isExpanded = previewEl.dataset.expanded === 'true';
    previewEl.classList.toggle('expanded', isExpanded);
    previewEl.textContent = isExpanded ? item.story.replace(/\n\n/g, ' ') : preview;
    toggleBtn.textContent = isExpanded ? 'Weniger' : 'Mehr lesen';
  };

  toggleBtn.addEventListener('click', () => {
    previewEl.dataset.expanded = previewEl.dataset.expanded === 'true' ? 'false' : 'true';
    updateToggle();
  });

  favoriteBtn.addEventListener('click', () => {
    toggleFavorite(itemId);
  });

  card.querySelector('.case-card__image').addEventListener('click', () => openCase(item.id));
  card.querySelector('h4').addEventListener('click', () => openCase(item.id));
  return card;
}

function renderHome() {
  const latest = [...allCases].sort((a, b) => b.year - a.year).slice(0, 6);
  const container = document.getElementById('latestCases');
  container.innerHTML = '';
  latest.forEach((item) => container.appendChild(renderCaseCard(item)));
}

function renderCategories() {
  const filtered = getFilteredCases();
  const container = document.getElementById('categoryCases');
  container.innerHTML = '';
  filtered.forEach((item) => container.appendChild(renderCaseCard(item)));
}

function renderFavorites() {
  const favorites = getFavoriteCases();
  const container = document.getElementById('favoritesCases');
  container.innerHTML = '';
  if (!favorites.length) {
    container.innerHTML = '<p>Keine Favoriten gespeichert.</p>';
    return;
  }
  favorites.forEach((item) => container.appendChild(renderCaseCard(item)));
}

function renderSearch() {
  const query = state.searchTerm.trim();
  const filtered = query ? getFilteredCases() : [];
  const count = document.getElementById('searchCount');
  const container = document.getElementById('searchResults');
  count.textContent = `${filtered.length} Treffer`;
  container.innerHTML = '';
  filtered.forEach((item) => container.appendChild(renderCaseCard(item)));
}

function renderTimeline() {
  const container = document.getElementById('timelineContent');
  const grouped = allCases.reduce((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
  container.innerHTML = '';

  years.forEach((year) => {
    const section = document.createElement('div');
    section.className = 'timeline-year';
    section.innerHTML = `
      <div class="timeline-year__label">${year}</div>
      <div class="timeline-year__cards"></div>
    `;
    const cards = section.querySelector('.timeline-year__cards');
    grouped[year].forEach((item) => {
      cards.appendChild(renderCaseCard(item));
    });
    container.appendChild(section);
  });
}

function setView(view) {
  state.currentView = view;
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view-section').forEach((section) => {
    section.classList.toggle('active', section.id === `${view}View`);
  });
}

function render() {
  renderCategoryPills();
  renderHome();
  renderCategories();
  renderFavorites();
  renderSearch();
  renderTimeline();
  syncFavoriteButtons();
  setView(state.currentView);
}

function init() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === 'about') {
        setView('about');
      } else {
        setView(view);
      }
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    state.currentView = 'search';
    render();
  });

  document.getElementById('moreBtn').addEventListener('click', () => {
    document.getElementById('menuPanel').classList.toggle('open');
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
  });

  document.getElementById('editorBtn').addEventListener('click', () => {
    document.getElementById('codeModal').classList.add('open');
  });

  const unlockEditor = () => {
    const enteredCode = document.getElementById('editorCodeInput').value.trim();
    if (enteredCode === '22022026') {
      document.getElementById('codeModal').classList.remove('open');
      document.getElementById('editorModal').classList.add('open');
      document.getElementById('editorCodeInput').value = '';
    } else {
      alert('Falscher Code');
    }
  };

  document.getElementById('unlockEditorBtn').addEventListener('click', unlockEditor);
  document.getElementById('editorCodeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      unlockEditor();
    }
  });

  document.getElementById('editorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCase = {
      id: `custom-${Date.now()}`,
      title: formData.get('title'),
      category: formData.get('category'),
      year: Number(formData.get('year')),
      location: formData.get('location'),
      person: formData.get('person'),
      summary: formData.get('summary'),
      story: formData.get('story')
    };

    const customCases = JSON.parse(localStorage.getItem('tc-custom-cases') || '[]');
    customCases.unshift(newCase);
    localStorage.setItem('tc-custom-cases', JSON.stringify(customCases));

    allCases.unshift(newCase);
    state.selectedCategory = 'Alle';
    state.currentView = 'home';
    e.target.reset();
    document.getElementById('editorModal').classList.remove('open');
    render();
  });

  document.getElementById('closeCodeModal').addEventListener('click', () => {
    document.getElementById('codeModal').classList.remove('open');
  });

  document.getElementById('closeEditorModal').addEventListener('click', () => {
    document.getElementById('editorModal').classList.remove('open');
  });

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('caseModal').addEventListener('click', (e) => {
    if (e.target.id === 'caseModal') closeModal();
  });

  document.getElementById('codeModal').addEventListener('click', (e) => {
    if (e.target.id === 'codeModal') {
      document.getElementById('codeModal').classList.remove('open');
    }
  });

  document.getElementById('editorModal').addEventListener('click', (e) => {
    if (e.target.id === 'editorModal') {
      document.getElementById('editorModal').classList.remove('open');
    }
  });

  render();
}

init();
