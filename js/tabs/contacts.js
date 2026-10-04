function renderContacts() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('contactsArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Контакты']);
    } else if (typeof setBreadcrumb === 'function') {
        setBreadcrumb('Контакты');
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('contactsArea');
    if (!area) return;

    area.innerHTML = `
        <div class="contacts-container">
            <div class="contacts-header">
                <h2 class="contacts-header__title">Контактные данные</h2>
                <div class="contacts-header__subtitle">Актуальные контакты руководства Военной Полиции</div>
            </div>

            <div class="contacts-grid" id="contactsGrid"></div>

            <div class="contacts-footer">
                <span>© Arizona RP | Военная Полиция</span>
            </div>
        </div>
    `;

    renderContactsGrid();
}

function renderContactsGrid() {
    const grid = document.getElementById('contactsGrid');
    if (!grid) return;

    const contacts = [
        {
            name: 'Jan_Abobbi',
            position: ' Главный Администратор',
            discord: 'trombes',
            note: 'Главный Администратор сайта и системы тестирования Военной Полиции. Отвечает за техническую поддержку и обновления.',
            tier: 'admin'
        },
        {
            name: 'Dobriy_Abobbi',
            position: 'Куратор Военной Полиции',
            discord: 'h0llyshet',
            note: 'Куратор ВП, отвечает за работу подразделения и взаимодействие с другими организациями.',
            tier: 'curator'
        },
        {
            name: 'Chaffy_Waschington',
            position: 'Заместитель Куратора ВП',
            discord: 'karliona.',
            note: 'Заместитель Куратора ВП, отвечает за административные вопросы и координацию деятельности подразделения.',
            tier: 'deputy'
        },
        {
            name: 'Ralph_Laurence',
            position: 'Заместитель Куратора ВП',
            discord: 'glagol163',
            note: 'Заместитель Куратора ВП, отвечает за оперативные вопросы и взаимодействие с сотрудниками подразделения.',
            tier: 'deputy'
        }
    ];

    grid.innerHTML = contacts.map(contact => {
        const isVacant = contact.name === 'Вакантно';
        return `
            <div class="contact-card contact-card--${contact.tier} ${isVacant ? 'contact-card--vacant' : ''}">
                <div class="contact-card__head">
                    <div class="contact-card__avatar">${isVacant ? '?' : getInitials(contact.name)}</div>
                    <div class="contact-card__info">
                        <div class="contact-card__name">${escapeHtml(contact.name)}</div>
                        <div class="contact-card__position">${escapeHtml(contact.position)}</div>
                    </div>
                </div>
                ${contact.discord ? `
                    <div class="contact-card__row">
                        <span>Discord</span>
                        <strong>${escapeHtml(contact.discord)}</strong>
                    </div>
                ` : `
                    <div class="contact-card__row contact-card__row--empty">
                        <span>Discord</span>
                        <strong>не указан</strong>
                    </div>
                `}
                ${contact.note ? `<div class="contact-card__note">${escapeHtml(contact.note)}</div>` : ''}
            </div>
        `;
    }).join('');
}

window.renderContacts = renderContacts;
window.renderContactsGrid = renderContactsGrid;