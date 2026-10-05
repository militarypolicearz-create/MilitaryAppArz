function renderLegends() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('legendsArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Легенды');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('legendsArea');
    if (!area) return;

    const legends = (typeof LEGENDS_DB !== 'undefined') ? LEGENDS_DB : [];

    area.innerHTML = `
        <div class="legends-container">
            <div class="legends-header">
                <button class="btn small ghost" id="legendsBackBtn">← Назад</button>
                <div class="legends-header__titles">
                    <h2 class="legends-header__title">Легенды Военной Полиции</h2>
                    <div class="legends-header__subtitle">Сотрудники, оставившие значительный след в истории организации</div>
                </div>
                <div class="legends-header__count">${legends.length}</div>
            </div>

            <div class="legends-grid" id="legendsGrid"></div>
        </div>
    `;

    const backBtn = document.getElementById('legendsBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof renderMembers === 'function') renderMembers();
            if (typeof setSidebarActive === 'function') setSidebarActive('members');
        });
    }

    renderLegendsGrid();
}

function renderLegendsGrid() {
    const grid = document.getElementById('legendsGrid');
    if (!grid) return;

    const legends = (typeof LEGENDS_DB !== 'undefined') ? LEGENDS_DB : [];

    if (legends.length === 0) {
        grid.innerHTML = `
            <div class="vp-empty">
                <div class="vp-empty__title">Список легенд пуст</div>
                <div class="vp-empty__text">Добавьте записи в файл js/data/legends.js</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = legends.map((legend, index) => {
        const themeClass = legend.theme ? ` legend-card--${legend.theme}` : '';
        return `
            <div class="legend-card${themeClass}" style="animation-delay: ${index * 0.05}s">
                <div class="legend-card__head">
                    <div class="legend-card__avatar">${getInitials(legend.name)}</div>
                    <div class="legend-card__info">
                        <div class="legend-card__name">${escapeHtml(legend.name)}</div>
                        <div class="legend-card__position">${escapeHtml(legend.position || '')}</div>
                    </div>
                </div>
                ${legend.period ? `<div class="legend-card__period">${escapeHtml(legend.period)}</div>` : ''}
                ${legend.note ? `<div class="legend-card__note">${escapeHtml(legend.note)}</div>` : ''}
            </div>
        `;
    }).join('');
}

window.renderLegends = renderLegends;
window.renderLegendsGrid = renderLegendsGrid;
