function renderTSRReports59() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима', 'Отчёты 5-9']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="tsr59-container">
            <div class="tsr59-header">
                <h2 class="tsr59-header__title">Отчёты 5-9</h2>
                <div class="tsr59-header__subtitle">Форма повышения с перечнем работ и подсчётом баллов по датам</div>
            </div>

            <div class="tsr59-form">
                <div class="tsr59-row">
                    <div class="tsr59-field">
                        <label>Ваше имя и фамилия (на англ.)</label>
                        <input type="text" id="tsr59_name" placeholder="Имя_Фамилия">
                    </div>
                    <div class="tsr59-field">
                        <label>Ссылка на пакет документов</label>
                        <input type="text" id="tsr59_pass_link" value="https://imgur.com/a/4Db5" placeholder="https://imgur.com/...">
                    </div>
                </div>

                <div class="tsr59-section-title">Доказательства проделанной работы [по датам]</div>

                <div class="tsr59-days" id="tsr59DaysContainer"></div>

                <div class="tsr59-add-actions">
                    <button class="btn small" id="tsr59AddDay">+ Добавить дату</button>
                </div>

                <div class="tsr59-total tsr59-total--grand">
                    <span>Всего баллов за всё время:</span>
                    <strong id="tsr59GrandTotal">0</strong>
                </div>

                <div class="tsr59-row">
                    <div class="tsr59-field">
                        <label>Подпись (вручную)</label>
                        <input type="text" id="tsr59_signature" placeholder="Подпись">
                    </div>
                </div>

                <div class="tsr59-buttons">
                    <button class="btn" id="tsr59Generate">Сгенерировать</button>
                    <button class="btn ghost" id="tsr59Clear">Очистить</button>
                </div>
            </div>

            <div class="tsr59-result" id="tsr59Result" style="display: none;">
                <div class="tsr59-result__header">
                    <h3>Готовый BBCode</h3>
                    <div class="tsr59-result__buttons">
                        <button class="btn small" id="tsr59Copy">Скопировать</button>
                        <button class="btn small ghost" id="tsr59Download">Скачать .txt</button>
                    </div>
                </div>
                <pre class="tsr59-result__code" id="tsr59Code"></pre>
            </div>
        </div>
    `;

    initTSRReports59();
}

function initTSRReports59() {
    const nameInput = document.getElementById('tsr59_name');
    if (nameInput && typeof currentUser !== 'undefined' && currentUser) {
        nameInput.value = currentUser.username || '';
    }

    const container = document.getElementById('tsr59DaysContainer');
    if (container) container.innerHTML = '';

    addTSR59Day();

    document.getElementById('tsr59AddDay')?.addEventListener('click', addTSR59Day);
    document.getElementById('tsr59Generate')?.addEventListener('click', generateTSR59Report);
    document.getElementById('tsr59Clear')?.addEventListener('click', () => renderTSRReports59());
    document.getElementById('tsr59Copy')?.addEventListener('click', copyTSR59Report);
    document.getElementById('tsr59Download')?.addEventListener('click', downloadTSR59Report);
}

function updateAddDayButtonState() {
    const container = document.getElementById('tsr59DaysContainer');
    const addBtn = document.getElementById('tsr59AddDay');
    if (!container || !addBtn) return;

    const count = container.querySelectorAll('.tsr59-day').length;
    if (count >= 5) {
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
        addBtn.style.cursor = 'not-allowed';
        addBtn.textContent = 'Максимум 5 дней';
    } else {
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
        addBtn.style.cursor = 'pointer';
        addBtn.textContent = '+ Добавить дату';
    }
}

function addTSR59Day() {
    const container = document.getElementById('tsr59DaysContainer');
    if (!container) return;

    const existingDays = container.querySelectorAll('.tsr59-day');
    if (existingDays.length >= 5) {
        showError('Максимум 5 дней (срок годности скриншотов — 5 дней)');
        return;
    }

    const dayIndex = existingDays.length + 1;
    const today = new Date().toISOString().slice(0, 10);

    const day = document.createElement('div');
    day.className = 'tsr59-day';
    day.dataset.dayIndex = dayIndex;

    day.innerHTML = `
        <div class="tsr59-day__head">
            <div class="tsr59-day__num">${dayIndex}</div>
            <input type="date" class="tsr59-day__date" value="${today}">
            <div class="tsr59-day__total">Баллов за день: <strong class="tsr59-day__total-value">0</strong></div>
            <button class="tsr59-day__remove" type="button" title="Удалить дату">×</button>
        </div>
        <div class="tsr59-day__actions tsr59-actions"></div>
        <div class="tsr59-day__footer">
            <button class="btn small tsr59-day__add-action" type="button">+ Добавить пункт</button>
        </div>
    `;

    container.appendChild(day);

    day.querySelector('.tsr59-day__remove').addEventListener('click', () => {
        day.remove();
        renumberTSR59Days();
        recalcTSR59Total();
        recalcDatesFromBottom();
        updateAddDayButtonState();
    });

    day.querySelector('.tsr59-day__add-action').addEventListener('click', () => {
        addTSR59Action(day.querySelector('.tsr59-day__actions'));
        recalcTSR59Total();
    });

    day.querySelector('.tsr59-day__date').addEventListener('change', () => {
        recalcDatesFromBottom();
        recalcTSR59Total();
    });

    addTSR59Action(day.querySelector('.tsr59-day__actions'));
    recalcTSR59Total();
    recalcDatesFromBottom();
    updateAddDayButtonState();
}

function recalcDatesFromBottom() {
    const days = Array.from(document.querySelectorAll('#tsr59DaysContainer .tsr59-day'));
    if (days.length === 0) return;

    const lastDay = days[days.length - 1];
    const lastDateInput = lastDay.querySelector('.tsr59-day__date');
    if (!lastDateInput || !lastDateInput.value) return;

    let currentDate = new Date(lastDateInput.value);

    for (let i = days.length - 2; i >= 0; i--) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateInput = days[i].querySelector('.tsr59-day__date');
        if (dateInput) {
            dateInput.value = currentDate.toISOString().slice(0, 10);
        }
    }
}

function renumberTSR59Days() {
    const days = document.querySelectorAll('#tsr59DaysContainer .tsr59-day');
    days.forEach((day, i) => {
        day.dataset.dayIndex = i + 1;
        const num = day.querySelector('.tsr59-day__num');
        if (num) num.textContent = i + 1;
    });
}

function addTSR59Action(container) {
    if (!container) return;

    const index = container.children.length + 1;
    const row = document.createElement('div');
    row.className = 'tsr59-action-row';
    row.dataset.index = index;

    row.innerHTML = `
        <div class="tsr59-action-num">${index}.</div>
        <div class="tsr59-action-body">
            <div class="tsr59-action-input-wrap">
                <input type="text" class="tsr59-action-input" placeholder="Начните вводить действие..." autocomplete="off">
                <div class="tsr59-suggestions" style="display: none;"></div>
            </div>
            <div class="tsr59-action-info">
                <span class="tsr59-action-points">Баллы: 0</span>
                <span class="tsr59-action-limit"></span>
                <span class="tsr59-limit-badge"></span>
            </div>
            <div class="tsr59-action-controls">
                <div class="tsr59-action-qty">
                    <label>Кол-во:</label>
                    <input type="number" class="tsr59-action-qty-input" min="1" value="1">
                </div>
                <div class="tsr59-action-link">
                    <label>Ссылка:</label>
                    <input type="text" class="tsr59-action-link-input" placeholder="https://imgur.com/...">
                </div>
            </div>
        </div>
        <button class="tsr59-action-remove" type="button" title="Удалить">×</button>
    `;

    container.appendChild(row);

    const input = row.querySelector('.tsr59-action-input');
    const suggestions = row.querySelector('.tsr59-suggestions');
    const pointsEl = row.querySelector('.tsr59-action-points');
    const limitEl = row.querySelector('.tsr59-action-limit');
    const qtyInput = row.querySelector('.tsr59-action-qty-input');
    const linkInput = row.querySelector('.tsr59-action-link-input');

    let selectedAction = null;

    const updatePoints = () => {
        let qty = parseInt(qtyInput.value) || 1;
        if (selectedAction && selectedAction.maxPointsPerDay) {
            const maxQty = Math.floor(selectedAction.maxPointsPerDay / selectedAction.points);
            if (qty > maxQty) {
                qty = maxQty;
                qtyInput.value = qty;
                showError(`Максимум ${maxQty} шт. в день (${selectedAction.maxPointsPerDay} баллов)`);
            }
        }
        const total = selectedAction ? selectedAction.points * qty : 0;
        pointsEl.textContent = `Баллы: ${total}`;
        recalcTSR59Total();
    };

    const hideSuggestions = () => {
        suggestions.style.display = 'none';
    };

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        selectedAction = null;
        limitEl.textContent = '';

        if (query.length < 1) {
            hideSuggestions();
            updatePoints();
            return;
        }

        const matches = (window.TSR_ACTIONS_5_9 || [])
            .filter(a => a.text.toLowerCase().includes(query))
            .slice(0, 8);

        if (matches.length === 0) {
            hideSuggestions();
            updatePoints();
            return;
        }

        suggestions.innerHTML = matches.map((a, i) => `
            <div class="tsr59-suggestion" data-idx="${i}">
                <span class="tsr59-suggestion__text">${escapeHtml(a.text)}</span>
                <span class="tsr59-suggestion__points">${a.points} б.</span>
            </div>
        `).join('');
        suggestions.style.display = 'block';

        suggestions.querySelectorAll('.tsr59-suggestion').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                const chosen = matches[idx];
                input.value = chosen.text;
                selectedAction = chosen;
                limitEl.textContent = chosen.limit ? `(${chosen.ranks} · ${chosen.limit})` : `(${chosen.ranks})`;
                hideSuggestions();
                updatePoints();
            });
        });
    });

    input.addEventListener('blur', () => {
        setTimeout(hideSuggestions, 150);
    });

    qtyInput.addEventListener('input', updatePoints);

    row.querySelector('.tsr59-action-remove').addEventListener('click', () => {
        row.remove();
        renumberTSR59ActionsInContainer(container);
        recalcTSR59Total();
    });
}

function renumberTSR59ActionsInContainer(container) {
    const rows = container.querySelectorAll('.tsr59-action-row');
    rows.forEach((row, i) => {
        row.dataset.index = i + 1;
        const num = row.querySelector('.tsr59-action-num');
        if (num) num.textContent = `${i + 1}.`;
    });
}

function getActionByText(text) {
    if (!text) return null;
    const clean = text.trim().toLowerCase();
    return (window.TSR_ACTIONS_5_9 || []).find(a => a.text.toLowerCase() === clean) || null;
}

function getDayTotals(day) {
    const totals = {};
    day.querySelectorAll('.tsr59-action-row').forEach(row => {
        const text = row.querySelector('.tsr59-action-input').value.trim();
        const qty = parseInt(row.querySelector('.tsr59-action-qty-input').value) || 1;
        const link = row.querySelector('.tsr59-action-link-input').value.trim();
        if (!text) return;
        const action = getActionByText(text);
        if (!action) return;
        const key = action.text;
        if (!totals[key]) totals[key] = { action, qty: 0, points: 0, links: [] };
        totals[key].qty += qty;
        totals[key].points += action.points * qty;
        if (link) totals[key].links.push(link);
    });
    return totals;
}

function recalcTSR59Total() {
    let grand = 0;

    document.querySelectorAll('#tsr59DaysContainer .tsr59-day').forEach(day => {
        const totals = getDayTotals(day);
        let dayTotal = 0;

        Object.values(totals).forEach(t => {
            dayTotal += t.points;
        });

        const dayTotalEl = day.querySelector('.tsr59-day__total-value');
        if (dayTotalEl) dayTotalEl.textContent = dayTotal;

        grand += dayTotal;

        markDayLimits(day, totals);
    });

    const grandEl = document.getElementById('tsr59GrandTotal');
    if (grandEl) grandEl.textContent = grand;
}

function markDayLimits(day, totals) {
    day.querySelectorAll('.tsr59-action-row').forEach(row => {
        const input = row.querySelector('.tsr59-action-input');
        const text = input.value.trim();
        if (!text) return;
        const action = getActionByText(text);
        if (!action) return;

        const infoWrap = row.querySelector('.tsr59-action-info');
        if (!infoWrap) return;

        let limitBadge = row.querySelector('.tsr59-limit-badge');
        if (!limitBadge) {
            limitBadge = document.createElement('span');
            limitBadge.className = 'tsr59-limit-badge';
            infoWrap.appendChild(limitBadge);
        }

        if (!action.dailyLimit || action.dailyLimit >= 999) {
            limitBadge.textContent = '';
            limitBadge.className = 'tsr59-limit-badge';
            row.classList.remove('tsr59-action-row--over');
            return;
        }

        const data = totals[action.text];
        const used = data ? data.qty : 0;
        const limit = action.dailyLimit;

        let limitText = `${used}/${limit}`;

        if (action.dailyLimitPoints && action.dailyLimitPoints !== limit) {
            limitText += ` шт (макс ${action.dailyLimitPoints} б.)`;
        }

        if (used > limit) {
            limitBadge.textContent = `⚠ Превышен лимит: ${limitText}`;
            limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--over';
            row.classList.add('tsr59-action-row--over');
        } else if (used === limit) {
            limitBadge.textContent = `Лимит достигнут: ${limitText}`;
            limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--warn';
            row.classList.remove('tsr59-action-row--over');
        } else {
            limitBadge.textContent = limitText;
            limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--ok';
            row.classList.remove('tsr59-action-row--over');
        }
    });
}

function escapeBBCode(str) {
    if (!str) return '';
    return String(str).replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDateRU(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function generateTSR59Report() {
    const name = document.getElementById('tsr59_name').value.trim() || 'Имя';
    const passLink = document.getElementById('tsr59_pass_link').value.trim() || 'https://imgur.com/a/4Db5';
    const signature = document.getElementById('tsr59_signature').value.trim() || 'Вручную';

    const days = document.querySelectorAll('#tsr59DaysContainer .tsr59-day');
    if (days.length === 0) {
        showError('Добавьте хотя бы одну дату');
        return;
    }

    const daysBlocks = [];
    let grandTotal = 0;
    const warnings = [];

    days.forEach(day => {
        const dateISO = day.querySelector('.tsr59-day__date').value;
        const formattedDate = formatDateRU(dateISO) || 'Дата не указана';

        const totals = getDayTotals(day);
        let dayTotal = 0;
        const actionLines = [];

        Object.values(totals).forEach(t => {
            const { action, qty, points, links } = t;
            dayTotal += points;

            if (action.dailyLimit && action.dailyLimit < 999 && qty > action.dailyLimit) {
                warnings.push(`«${action.text}»: указано ${qty}, максимум ${action.dailyLimit} в день`);
            }

            let linkStr = '';
            if (links.length > 0) {
                linkStr = links.map(l => `[URL='${l}']Тык[/URL]`).join(', ');
            } else {
                linkStr = 'Тык';
            }

            actionLines.push(`• ${escapeBBCode(action.text)}[[U]${points}[/U]]: ${linkStr}`);
        });

        if (actionLines.length === 0) return;

        grandTotal += dayTotal;

        daysBlocks.push(
`[COLOR=rgb(250, 197, 28)][SIZE=5][I][B][I][B]Дата: ${formattedDate}[/B][/I][/B][/I][/SIZE][/COLOR]
[COLOR=rgb(209, 213, 216)][SIZE=5][I][B][I]${actionLines.join('\n')}
[B]Баллов за день: [U]${dayTotal}[/U][/B]
[/I][/B][/I][/SIZE][/COLOR]`
        );
    });

    if (daysBlocks.length === 0) {
        showError('Заполните хотя бы одну дату');
        return;
    }

    if (warnings.length > 0) {
        const proceed = confirm(
            'Внимание! Превышены дневные лимиты:\n\n' + warnings.join('\n') + '\n\nПродолжить генерацию?'
        );
        if (!proceed) return;
    }

    const lineImg = `[IMG size="928x20"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]`;
    const extraImg = `[IMG size="2039x771"]https://media.discordapp.net/attachments/1410665560739676172/1565758686754906224/MakeMSPgreatAgain.png?ex=6ae611e9&is=6ae4c069&hm=0b4ef52350e37472d364c3ef07008cb77adac355847a058d4d579f1ba992a970&=&format=webp&quality=lossless[/IMG]`;

    const code =
`[CENTER][I]${lineImg}[/I]
[B][I][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]Прошу Вас рассмотреть моё заявление на повышение в должности, порядком перечнем ограничений и запретов, распространяющихся на сотрудников, информацией перед заполнением, ознакомлен и согласен. Ниже своих слов прикрепляю все необходимые документы и информацию:
[I]${lineImg}[/I][/SIZE][/COLOR][/FONT][/I][/B]
[FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][I][B][I]Ваше имя и фамилия(На англ.): [/I][/B][/I][/SIZE][/COLOR][COLOR=rgb(184, 49, 47)][SIZE=5][I][B][I]${escapeBBCode(name)}[/I][/B][/I][/SIZE][/COLOR]
[COLOR=rgb(209, 213, 216)][SIZE=5][I][B][I]Ксерокопия паспорта [/showpass]:[B][I] [B][I][URL='${passLink}']Пакет документов[/URL][/I][/B][/I][/B]
Ксерокопия военного билета[B][I][/showpass][/I][/B]:[B][I] Выше[/I][/B]
Выписка из мэрии [/stats]:[B][I] Выше[/I][/B]
Ксерокопия мед. карты [/showmc]:[B][I] Выше[/I][/B]
Выписка из базы данных сотрудников [/members]:[B][I] Выше[/I][/B]
Ксерокопия трудового контракта [/jobprogress]:[B][I] Выше[/I][/B]
Доказательства нахождения в специальной рации "Discord": Выше
Доказательства проделанной мною работы [по пунктам]:[/I][/B]
[I]${lineImg}[/I][/I][/SIZE][/COLOR]
${daysBlocks.join('\n\n')}

[COLOR=rgb(209, 213, 216)][SIZE=5][I][B][I][B]Всего баллов: ${grandTotal}[/B][/I][/B][/I][/SIZE][/COLOR][/I][/FONT]
[I][B][I][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]Подпись: [/SIZE][/COLOR][COLOR=rgb(184, 49, 47)][FONT=courier new][SIZE=5]${escapeBBCode(signature)}[/SIZE][/FONT][/COLOR]
[FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][I]${lineImg}[/I][/SIZE][/COLOR][/FONT][/FONT][/I][B][I][B][I][B][I]${extraImg}[/I][/B][/I][/B][/I][/B]
[I][FONT=courier new][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][I][I][B][I][I]${lineImg}[/I][/I][/B][/I][/I][/SIZE][/COLOR][/FONT][/FONT][/I][/B][/I][/CENTER]`;

    document.getElementById('tsr59Result').style.display = 'block';
    document.getElementById('tsr59Code').textContent = code;
    showMessage(`Отчёт сгенерирован. Всего баллов: ${grandTotal}`, 'success');
}

function copyTSR59Report() {
    const code = document.getElementById('tsr59Code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Скопировано', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showMessage('Скопировано', 'success');
    });
}

function downloadTSR59Report() {
    const code = document.getElementById('tsr59Code').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `Отчёт_5-9_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

window.renderTSRReports59 = renderTSRReports59;
window.generateTSR59Report = generateTSR59Report;
window.copyTSR59Report = copyTSR59Report;
window.downloadTSR59Report = downloadTSR59Report;
