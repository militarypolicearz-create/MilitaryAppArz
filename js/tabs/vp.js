function renderVP() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('vpCharterArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Устав ВП');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('vpCharterArea');
    if (!area) return;

    area.innerHTML = `
        <div class="vp-container">
            <div class="vp-header">
                <div class="vp-header__titles">
                    <h2 class="vp-header__title">Устав Военной Полиции</h2>
                    <div class="vp-header__subtitle">Внутренний регламент деятельности сотрудников</div>
                </div>
                <div class="vp-header__meta">
                    <span class="vp-badge vp-badge--accent">Актуальная редакция</span>
                </div>
            </div>

            <div class="vp-search">
                <input type="text" id="vpSearchInput" placeholder="Поиск по уставу...">
            </div>

            <div id="vpChaptersContainer" class="vp-chapters"></div>

            <div class="vp-footer">
                <span>© Arizona RP | Военная Полиция</span>
            </div>
        </div>
    `;

    renderVPChapters();
    initVPSearch();
}

function renderVPChapters() {
    const container = document.getElementById('vpChaptersContainer');
    if (!container) return;

    const chapters = buildVPChaptersFromArticles();

    if (chapters.length === 0) {
        container.innerHTML = `
            <div class="vp-empty">
                <div class="vp-empty__title">Данные устава пока не заполнены</div>
                <div class="vp-empty__text">Проверьте массив articlesDB — в нём должны быть записи с категорией "устав ВП"</div>
            </div>
        `;
        return;
    }

    container.innerHTML = chapters.map((chapter, index) => `
        <div class="vp-chapter" data-chapter-index="${index}">
            <div class="vp-chapter__header">
                <div class="vp-chapter__title">
                    <div class="vp-chapter__num">${index + 1}</div>
                    <div class="vp-chapter__name">${escapeHtml(chapter.title)}</div>
                </div>
                <div class="vp-chapter__toggle">▼</div>
            </div>
            <div class="vp-chapter__body">
                ${chapter.rules.map(rule => `
                    <div class="vp-rule">
                        <div class="vp-rule__point">${escapeHtml(rule.point)}</div>
                        <div class="vp-rule__text">${escapeHtml(rule.text)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.vp-chapter__header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });
}

function buildVPChaptersFromArticles() {
    if (typeof articlesDB === 'undefined') return [];

    const vpArticles = articlesDB.filter(a => a.category === 'устав ВП');
    if (vpArticles.length === 0) return [];

    const grouped = {};
    const order = [];

    vpArticles.forEach(art => {
        const chapterName = art.chapter || 'Без главы';
        if (!grouped[chapterName]) {
            grouped[chapterName] = [];
            order.push(chapterName);
        }
        grouped[chapterName].push({
            point: art.point || '',
            text: art.text || ''
        });
    });

    return order.map(title => ({
        title: title,
        rules: grouped[title]
    }));
}

function initVPSearch() {
    const input = document.getElementById('vpSearchInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const chapters = document.querySelectorAll('#vpChaptersContainer .vp-chapter');

        chapters.forEach(chapter => {
            if (query === '') {
                chapter.style.display = '';
                chapter.querySelectorAll('.vp-rule').forEach(r => r.style.display = '');
                return;
            }

            const rules = chapter.querySelectorAll('.vp-rule');
            let hasVisibleRule = false;

            rules.forEach(rule => {
                const text = rule.textContent.toLowerCase();
                if (text.includes(query)) {
                    rule.style.display = '';
                    hasVisibleRule = true;
                } else {
                    rule.style.display = 'none';
                }
            });

            chapter.style.display = hasVisibleRule ? '' : 'none';
            if (hasVisibleRule) chapter.classList.remove('collapsed');
        });
    });
}

window.renderVP = renderVP;
window.renderVPChapters = renderVPChapters;
window.buildVPChaptersFromArticles = buildVPChaptersFromArticles;