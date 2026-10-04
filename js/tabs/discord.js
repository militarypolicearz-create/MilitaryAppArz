function renderDiscord() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('discordArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Discord');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('discordArea');
    if (!area) return;

    const servers = [
        {
            title: 'Официальный сервер Arizona RP',
            url: 'https://discord.com/invite/kp7ENmW'
        },
        {
            title: 'Личный сервер Главного Администратора Abobbi Gang',
            url: 'https://discord.gg/JZDNXwKxC'
        }
    ];

    area.innerHTML = `
        <div class="discord-container">
            <div class="discord-header">
                <h2 class="discord-header__title">Discord</h2>
                <div class="discord-header__subtitle">Список серверов</div>
            </div>

            <div class="discord-list">
                ${servers.map(s => `
                    <div class="discord-card">
                        <div class="discord-card__icon">D</div>
                        <div class="discord-card__content">
                            <div class="discord-card__title">${escapeHtml(s.title)}</div>
                            <a class="btn small" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Приглашение</a>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="discord-footer">
                <span>© Arizona RP | Военная Полиция</span>
            </div>
        </div>
    `;
}

window.renderDiscord = renderDiscord;