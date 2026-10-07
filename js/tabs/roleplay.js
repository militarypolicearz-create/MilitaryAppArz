function renderRoleplay() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('roleplayArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Отыгровки');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('roleplayArea');
    if (!area) return;

    const items = (typeof roleplayDB !== 'undefined') ? roleplayDB : [];

    area.innerHTML = `
        <div class="roleplay-container">
            <div class="roleplay-header">
                <h2 class="roleplay-header__title">Отыгровки Военной Полиции</h2>
                <div class="roleplay-header__subtitle">Готовые RP-команды для типовых ситуаций на службе</div>
                <div class="roleplay-header__count">${items.length}</div>
            </div>

            <div class="roleplay-grid" id="roleplayGrid"></div>
        </div>
    `;

    renderRoleplayGrid();
}

/* ============ Подстановка данных текущего пользователя ============ */
function getRoleplayContext() {
    if (typeof currentUser === 'undefined' || !currentUser) {
        return {
            username: "Имя_Фамилия",
            position: "Ваша должность",
            rank: "(Курсант/Офицер/Старший Офицер)"
        };
    }

    const rankMap = {
        cadet: "Курсант",
        officer: "Офицер",
        senior_officer: "Старший Офицер",
        curator: "Куратор"
    };

    return {
        username: currentUser.username || "Имя_Фамилия",
        position: currentUser.position || "Ваша должность",
        rank: rankMap[currentUser.type] || "Сотрудник"
    };
}

function applyRoleplayContext(text) {
    if (!text) return text;
    const ctx = getRoleplayContext();
    return text
        .replace(/\{\{username\}\}/g, ctx.username)
        .replace(/\{\{position\}\}/g, ctx.position)
        .replace(/\{\{rank\}\}/g, ctx.rank);
}

/* ============ Рендер карточек ============ */
function renderRoleplayGrid() {
    const grid = document.getElementById('roleplayGrid');
    if (!grid) return;

    const items = (typeof roleplayDB !== 'undefined') ? roleplayDB : [];

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="roleplay-empty">
                <div class="roleplay-empty__title">Список отыгровок пуст</div>
                <div class="roleplay-empty__text">Добавьте записи в файл js/data/roleplay.js</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map((item, index) => {
        const commandsHtml = item.commands.map(cmd => {
            const cmdCopy = { ...cmd };
            cmdCopy.text = applyRoleplayContext(cmd.text);
            return renderRoleplayCommand(cmdCopy);
        }).join('');

        return `
            <div class="roleplay-card" style="animation-delay: ${index * 0.05}s">
                <div class="roleplay-card__head">
                    <div class="roleplay-card__number">${item.id}</div>
                    <div class="roleplay-card__titles">
                        <div class="roleplay-card__title">${escapeHtml(item.title)}</div>
                        ${item.description ? `<div class="roleplay-card__desc">${escapeHtml(item.description)}</div>` : ''}
                    </div>
                    <button class="roleplay-card__copy" data-item-id="${item.id}" title="Скопировать все отыгровки">
                        Копировать
                    </button>
                </div>

                <div class="roleplay-card__body">
                    ${commandsHtml}
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.roleplay-card__copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (!item) return;

            const text = item.commands.map(cmd => {
                const finalText = applyRoleplayContext(cmd.text);
                if (cmd.type === 'text') return finalText;
                return `/${cmd.type} ${finalText}`;
            }).join('\n');

            navigator.clipboard.writeText(text).then(() => {
                showMessage(`«${item.title}» скопировано`, 'success');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                showMessage(`«${item.title}» скопировано`, 'success');
            });
        });
    });

    grid.querySelectorAll('.roleplay-command').forEach(row => {
        row.addEventListener('click', () => {
            const text = row.dataset.copyText || row.textContent.trim();
            navigator.clipboard.writeText(text).then(() => {
                showMessage('Команда скопирована', 'success');
            }).catch(() => {});
        });
    });
}

function renderRoleplayCommand(cmd) {
    if (cmd.type === 'text') {
        return `
            <div class="roleplay-command roleplay-command--text" data-copy-text="${escapeHtml(cmd.text)}">
                <span class="roleplay-command__text">${escapeHtml(cmd.text)}</span>
            </div>
        `;
    }

    const prefix = `/${cmd.type}`;
    const fullText = `${prefix} ${cmd.text}`;

    return `
        <div class="roleplay-command roleplay-command--${cmd.type}" data-copy-text="${escapeHtml(fullText)}">
            <span class="roleplay-command__prefix">${prefix}</span>
            <span class="roleplay-command__text">${escapeHtml(cmd.text)}</span>
        </div>
    `;
}

window.renderRoleplay = renderRoleplay;
window.renderRoleplayGrid = renderRoleplayGrid;
window.applyRoleplayContext = applyRoleplayContext;
window.getRoleplayContext = getRoleplayContext;