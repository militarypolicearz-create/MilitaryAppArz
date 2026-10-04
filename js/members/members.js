function renderMembers() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('membersArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Пользователи']);
    } else if (typeof setBreadcrumb === 'function') {
        setBreadcrumb('Пользователи');
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('membersArea');
    if (!area) return;

    const legendsCount = (typeof LEGENDS_DB !== 'undefined') ? LEGENDS_DB.length : 0;
    const employeesData = (typeof loadEmployeesData === 'function') ? loadEmployeesData() : {};
    const employeesCount = Object.values(employeesData).filter(emp => emp.username && emp.username !== 'Вакантно').length;

    area.innerHTML = `
        <div class="members-container">
            <div class="members-header">
                <h2 class="members-header__title">Пользователи</h2>
                <div class="members-header__subtitle">Разделы, связанные с личным составом и историей организации</div>
            </div>

            <div class="members-cards">
                <div class="members-card" data-target="legends">
                    <div class="members-card__top">
                        <div class="members-card__title">Легенды</div>
                        <div class="members-card__count">${legendsCount}</div>
                    </div>
                    <div class="members-card__desc">Сотрудники, оставившие значительный след в истории Военной Полиции</div>
                    <div class="members-card__arrow">Перейти →</div>
                </div>

                <div class="members-card" data-target="active">
                    <div class="members-card__top">
                        <div class="members-card__title">Действующий состав</div>
                        <div class="members-card__count">${employeesCount}</div>
                    </div>
                    <div class="members-card__desc">Список сотрудников, находящихся на службе в настоящий момент</div>
                    <div class="members-card__arrow">Перейти →</div>
                </div>

                <div class="members-card members-card--disabled">
                    <div class="members-card__top">
                        <div class="members-card__title">Чёрный список</div>
                        <div class="members-card__count">0</div>
                    </div>
                    <div class="members-card__desc">Лица, отстранённые от службы по решению руководства</div>
                    <div class="members-card__arrow">Скоро</div>
                </div>
            </div>
        </div>
    `;

    area.querySelectorAll('.members-card').forEach(card => {
        if (card.classList.contains('members-card--disabled')) return;
        card.addEventListener('click', () => {
            const target = card.dataset.target;
            if (target === 'legends') {
                if (typeof renderLegends === 'function') renderLegends();
            } else if (target === 'active') {
                renderActiveMembers();
            }
        });
    });
}

function renderActiveMembers() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('membersArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Пользователи', 'Действующий состав']);
    } else if (typeof setBreadcrumb === 'function') {
        setBreadcrumb('Действующий состав');
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('membersArea');
    if (!area) return;

    const employeesData = (typeof loadEmployeesData === 'function') ? loadEmployeesData() : {};
    const all = Object.values(employeesData).filter(emp => emp.username && emp.username !== 'Вакантно');

    const curator = all.filter(emp => emp.type === 'curator');
    const seniorOfficers = all.filter(emp => emp.type === 'senior_officer').sort((a, b) => a.position.localeCompare(b.position));
    const officers = all.filter(emp => emp.type === 'officer').sort((a, b) => a.position.localeCompare(b.position));
    const cadets = all.filter(emp => emp.type === 'cadet').sort((a, b) => a.position.localeCompare(b.position));

    const renderCard = (emp) => `
        <div class="member-card member-card--${emp.type}">
            <div class="member-card__avatar">${getInitials(emp.username)}</div>
            <div class="member-card__body">
                <div class="member-card__name">${escapeHtml(emp.username)}</div>
                <div class="member-card__position">${escapeHtml(emp.position)}</div>
            </div>
        </div>
    `;

    const orderedAll = [...curator, ...seniorOfficers, ...officers, ...cadets];

    area.innerHTML = `
        <div class="members-container">
            <div class="members-header">
                <button class="btn small ghost" id="membersBackBtn">← Назад</button>
                <h2 class="members-header__title">Действующий состав</h2>
                <div class="members-header__subtitle">Сотрудники Военной Полиции, находящиеся на службе</div>
            </div>

            ${all.length === 0 ? `
                <div class="members-empty">
                    <div class="members-empty__title">Состав пуст</div>
                    <div class="members-empty__text">Назначьте сотрудников в админ-панели</div>
                </div>
            ` : `
                <div class="members-grid members-grid--active">
                    ${orderedAll.map(renderCard).join('')}
                </div>
            `}

            <div class="members-footer">
                <span>Всего: <strong>${all.length}</strong></span>
            </div>
        </div>
    `;

    const backBtn = document.getElementById('membersBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof renderMembers === 'function') renderMembers();
        });
    }
}

window.renderMembers = renderMembers;
window.renderActiveMembers = renderActiveMembers;