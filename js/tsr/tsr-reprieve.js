function renderTSRReprieve() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима', 'Снятие выговоров 5-8']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="tsr59-container">
            <div class="tsr59-header">
                <h2 class="tsr59-header__title">Снятие выговоров 5-8</h2>
                <div class="tsr59-header__subtitle">Заявление на снятие служебного выговора с подсчётом баллов</div>
            </div>

            <div class="tsr59-form">
                <div class="tsr59-row">
                    <div class="tsr59-field">
                        <label>Имя и фамилия (на англ.)</label>
                        <input type="text" id="rep_name" placeholder="Имя_Фамилия">
                    </div>
                    <div class="tsr59-field">
                        <label>Ссылка на выписку из Мэрии</label>
                        <input type="text" id="rep_cityhall_link" value="https://imgur.com/a/..." placeholder="https://...">
                    </div>
                </div>

                <div class="tsr59-row">
                    <div class="tsr59-field" style="grid-column: 1 / -1;">
                        <label>За что был получен выговор (пункт устава/ФП)</label>
                        <input type="text" id="rep_reason" placeholder="Например: Пункт 2.5 Запрещено заниматься личными делами">
                    </div>
                </div>

                <div class="tsr59-section-title">Проделанная работа и доказательства</div>

                <div class="tsr59-days" id="rep_days_container"></div>

                <div class="tsr59-add-actions">
                    <button class="btn small" id="rep_add_day">+ Добавить блок работы</button>
                </div>

                <div class="tsr59-total tsr59-total--grand" id="rep_total_container">
                    <span>Всего баллов набрано:</span>
                    <strong id="rep_total_points">0</strong>
                </div>

                <div class="tsr59-row">
                    <div class="tsr59-field">
                        <label>Подпись (вручную)</label>
                        <input type="text" id="rep_signature" placeholder="Подпись">
                    </div>
                </div>

                <div class="tsr59-buttons">
                    <button class="btn" id="rep_generate">Сгенерировать заявление</button>
                    <button class="btn ghost" id="rep_clear">Очистить</button>
                </div>
            </div>

            <div class="tsr59-result" id="rep_result" style="display: none;">
                <div class="tsr59-result__header">
                    <h3>Готовый BBCode</h3>
                    <div class="tsr59-result__buttons">
                        <button class="btn small" id="rep_copy">Скопировать</button>
                        <button class="btn small ghost" id="rep_download">Скачать .txt</button>
                    </div>
                </div>
                <pre class="tsr59-result__code" id="rep_code"></pre>
            </div>
        </div>
    `;

    initTSRReprieve();
}

function initTSRReprieve() {
    const nameInput = document.getElementById('rep_name');
    if (nameInput && typeof currentUser !== 'undefined' && currentUser) {
        nameInput.value = currentUser.username || '';
    }

    const container = document.getElementById('rep_days_container');
    if (container) container.innerHTML = '';

    addReprieveDay();

    document.getElementById('rep_add_day')?.addEventListener('click', addReprieveDay);
    document.getElementById('rep_generate')?.addEventListener('click', generateTSRReprieve);
    document.getElementById('rep_clear')?.addEventListener('click', () => renderTSRReprieve());
    document.getElementById('rep_copy')?.addEventListener('click', copyTSRReprieve);
    document.getElementById('rep_download')?.addEventListener('click', downloadTSRReprieve);
}

function addReprieveDay() {
    const container = document.getElementById('rep_days_container');
    if (!container) return;

    const existingDays = container.querySelectorAll('.tsr59-day');
    const dayIndex = existingDays.length + 1;
    
    const today = new Date().toISOString().slice(0, 10);

    const day = document.createElement('div');
    day.className = 'tsr59-day';
    day.dataset.dayIndex = dayIndex;

    day.innerHTML = `
        <div class="tsr59-day__head">
            <div class="tsr59-day__num">${dayIndex}</div>
            <input type="date" class="tsr59-day__date" value="${today}">
            <div class="tsr59-day__total">Баллов в блоке: <strong class="tsr59-day__total-value">0</strong></div>
            <button class="tsr59-day__remove" type="button" title="Удалить блок">×</button>
        </div>
        <div class="tsr59-day__actions tsr59-actions"></div>
        <div class="tsr59-day__footer">
            <button class="btn small tsr59-day__add-action" type="button">+ Добавить пункт</button>
        </div>
    `;

    container.appendChild(day);

    day.querySelector('.tsr59-day__remove').addEventListener('click', () => {
        day.remove();
        renumberReprieveDays();
        recalcReprieveTotal();
        recalcDatesFromBottom();
    });

    day.querySelector('.tsr59-day__add-action').addEventListener('click', () => {
        addReprieveAction(day.querySelector('.tsr59-day__actions'));
        recalcReprieveTotal();
    });

    day.querySelector('.tsr59-day__date').addEventListener('change', () => {
        recalcDatesFromBottom();
        recalcReprieveTotal();
    });

    addReprieveAction(day.querySelector('.tsr59-day__actions'));
    recalcReprieveTotal();
    recalcDatesFromBottom();
}

function recalcDatesFromBottom() {
    const days = Array.from(document.querySelectorAll('#rep_days_container .tsr59-day'));
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

function renumberReprieveDays() {
    const days = document.querySelectorAll('#rep_days_container .tsr59-day');
    days.forEach((day, i) => {
        day.dataset.dayIndex = i + 1;
        const num = day.querySelector('.tsr59-day__num');
        if (num) num.textContent = i + 1;
    });
}

function addReprieveAction(container) {
    if (!container) return;

    const index = container.children.length + 1;
    const row = document.createElement('div');
    row.className = 'tsr59-action-row';
    row.dataset.index = index;

    row.innerHTML = `
        <div class="tsr59-action-num">${index}.</div>
        <div class="tsr59-action-body">
            <div class="tsr59-action-input-wrap">
                <input type="text" class="tsr59-action-input rep-action-name" placeholder="Начните вводить действие..." autocomplete="off">
                <div class="tsr59-suggestions rep-suggestions" style="display: none;"></div>
            </div>
            <div class="tsr59-action-info">
                <span class="tsr59-action-points">Баллы: 0</span>
                <span class="tsr59-action-limit"></span>
                <span class="tsr59-limit-badge"></span>
            </div>
            <div class="tsr59-action-controls">
                <div class="tsr59-action-qty">
                    <label>Кол-во:</label>
                    <input type="number" class="tsr59-action-qty-input rep-action-qty" min="1" value="1">
                </div>
                <div class="tsr59-action-link">
                    <label>Ссылка:</label>
                    <input type="text" class="tsr59-action-link-input rep-action-link" placeholder="https://imgur.com/...">
                </div>
            </div>
        </div>
        <button class="tsr59-action-remove" type="button" title="Удалить">×</button>
    `;

    container.appendChild(row);

    const nameInput = row.querySelector('.rep-action-name');
    const suggestions = row.querySelector('.rep-suggestions');
    const pointsEl = row.querySelector('.tsr59-action-points');
    const qtyInput = row.querySelector('.rep-action-qty');
    const limitEl = row.querySelector('.tsr59-action-limit');
    const limitBadge = row.querySelector('.tsr59-limit-badge');
    
    let selectedAction = null;

    const updatePointsDisplay = () => {
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
        
        if (!selectedAction) {
            limitBadge.textContent = '';
            limitBadge.className = 'tsr59-limit-badge';
            limitEl.textContent = '';
            row.classList.remove('tsr59-action-row--over');
        } else if (!selectedAction.dailyLimit || selectedAction.dailyLimit >= 999) {
            limitBadge.textContent = '';
            limitBadge.className = 'tsr59-limit-badge';
            limitEl.textContent = '';
            row.classList.remove('tsr59-action-row--over');
        } else {
            const limit = selectedAction.dailyLimit;
            let limitText = `${qty}/${limit}`;
            if (selectedAction.dailyLimitPoints && selectedAction.dailyLimitPoints !== limit) {
                limitText += ` шт (макс ${selectedAction.dailyLimitPoints} б.)`;
            }
            
            limitEl.textContent = `(${selectedAction.ranks} · ${selectedAction.limit})`;
            
            if (qty > limit) {
                limitBadge.textContent = `⚠ Превышен лимит: ${limitText}`;
                limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--over';
                row.classList.add('tsr59-action-row--over');
            } else if (qty === limit) {
                limitBadge.textContent = `Лимит достигнут: ${limitText}`;
                limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--warn';
                row.classList.remove('tsr59-action-row--over');
            } else {
                limitBadge.textContent = limitText;
                limitBadge.className = 'tsr59-limit-badge tsr59-limit-badge--ok';
                row.classList.remove('tsr59-action-row--over');
            }
        }
        
        recalcReprieveTotal();
    };

    nameInput.addEventListener('input', () => {
        const query = nameInput.value.trim().toLowerCase();
        selectedAction = null;
        updatePointsDisplay();

        if (query.length < 1) {
            suggestions.style.display = 'none';
            return;
        }

        const matches = (window.TSR_ACTIONS_5_9 || []).filter(a => a.text.toLowerCase().includes(query)).slice(0, 8);
        
        if (matches.length === 0) {
            suggestions.style.display = 'none';
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
                nameInput.value = chosen.text;
                selectedAction = chosen;
                suggestions.style.display = 'none';
                qtyInput.value = 1;
                updatePointsDisplay();
            });
        });
    });

    nameInput.addEventListener('blur', () => {
        setTimeout(() => suggestions.style.display = 'none', 150);
    });

    qtyInput.addEventListener('input', updatePointsDisplay);

    row.querySelector('.tsr59-action-remove').addEventListener('click', () => {
        row.remove();
        renumberReprieveActions(container);
        recalcReprieveTotal();
    });

    updatePointsDisplay();
}

function renumberReprieveActions(container) {
    const rows = container.querySelectorAll('.tsr59-action-row');
    rows.forEach((row, i) => {
        row.dataset.index = i + 1;
        const num = row.querySelector('.tsr59-action-num');
        if (num) num.textContent = `${i + 1}.`;
    });
}

function recalcReprieveTotal() {
    let grandTotal = 0;

    document.querySelectorAll('#rep_days_container .tsr59-day').forEach(day => {
        let dayTotal = 0;
        
        day.querySelectorAll('.tsr59-action-row').forEach(row => {
            const pointsText = row.querySelector('.tsr59-action-points').textContent;
            const points = parseInt(pointsText.replace('Баллы: ', '')) || 0;
            dayTotal += points;
        });

        const dayTotalEl = day.querySelector('.tsr59-day__total-value');
        if (dayTotalEl) dayTotalEl.textContent = dayTotal;

        grandTotal += dayTotal;
    });

    const grandEl = document.getElementById('rep_total_points');
    const containerEl = document.getElementById('rep_total_container');
    
    if (grandEl) grandEl.textContent = grandTotal;

    if (containerEl) {
        if (grandTotal > 150) {
            containerEl.style.borderColor = 'var(--error)';
            containerEl.style.background = 'rgba(229, 62, 62, 0.1)';
            grandEl.style.color = 'var(--error)';
        } else {
            containerEl.style.borderColor = 'var(--vp-accent-hover)';
            containerEl.style.background = 'linear-gradient(135deg, rgba(168, 112, 60, 0.2), rgba(168, 112, 60, 0.08))';
            grandEl.style.color = 'var(--vp-accent-hover)';
        }
    }
}

function generateTSRReprieve() {
    const name = document.getElementById('rep_name').value.trim() || 'Имя_Фамилия';
    const reason = document.getElementById('rep_reason').value.trim() || 'Не указано';
    const cityhallLink = document.getElementById('rep_cityhall_link').value.trim() || 'https://imgur.com/a/...';
    const signature = document.getElementById('rep_signature').value.trim() || 'Вручную';
    
    const actions = [];
    let totalPoints = 0;
    let actionCounter = 1;
    const warnings = [];

    document.querySelectorAll('#rep_days_container .tsr59-action-row').forEach(row => {
        const actionName = row.querySelector('.rep-action-name').value.trim();
        const qty = parseInt(row.querySelector('.rep-action-qty').value) || 1;
        const link = row.querySelector('.rep-action-link').value.trim();
        const pointsText = row.querySelector('.tsr59-action-points').textContent;
        const points = parseInt(pointsText.replace('Баллы: ', '')) || 0;
        
        if (!actionName) return;
        
        const selectedAction = (window.TSR_ACTIONS_5_9 || []).find(a => a.text.toLowerCase() === actionName.toLowerCase());
        if (selectedAction && selectedAction.dailyLimit && selectedAction.dailyLimit < 999 && qty > selectedAction.dailyLimit) {
            warnings.push(`«${actionName}»: указано ${qty}, максимум ${selectedAction.dailyLimit} в день`);
        }

        totalPoints += points;
        
        let displayName = actionName;
        if (qty > 1) {
            displayName += ` (x${qty})`;
        }

        actions.push({
            num: actionCounter++,
            name: displayName,
            link: link || 'Тык'
        });
    });

    if (totalPoints > 150) {
        showError('Превышен лимит в 150 баллов! Уберите лишние пункты.');
        return;
    }

    if (warnings.length > 0) {
        const proceed = confirm(
            'Внимание! Превышены дневные лимиты:\n\n' + warnings.join('\n') + '\n\nПродолжить генерацию?'
        );
        if (!proceed) return;
    }

    if (actions.length === 0) {
        showError('Добавьте хотя бы один пункт работы');
        return;
    }

    const today = new Date().toLocaleDateString('ru-RU');

    const lineImg = `[IMG alt="bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]`;
    const extraImg = `[IMG size="2039x771"]https://media.discordapp.net/attachments/1410665560739676172/1565758686754906224/MakeMSPgreatAgain.png?ex=6ae611e9&is=6ae4c069&hm=0b4ef52350e37472d364c3ef07008cb77adac355847a058d4d579f1ba992a970&=&format=webp&quality=lossless[/IMG]`;

    let actionsHtml = '';
    actions.forEach((act) => {
        actionsHtml += `${act.num}) ${escapeBBCode(act.name)}: [URL='${act.link}']Тык[/URL]\n`;
    });

    const code =
`[CENTER]${lineImg}
[I][B][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]Руководству Министерства Обороны:[/SIZE][/COLOR][/FONT][/B][/I]
[FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][I][B]От сотрудника Тюрьмы Лас-Вентурас [/B][/I][/SIZE][/COLOR][COLOR=rgb(184, 49, 47)][SIZE=5][I][B]${escapeBBCode(name)}[/B][/I][/SIZE][/COLOR]
[COLOR=rgb(209, 213, 216)][SIZE=5][I][B]Прошу рассмотреть моё заявление на снятие служебного выговора
${lineImg}
Копия выписки из Мэрии: [URL='${cityhallLink}']Пакет документов[/URL]
Количество выговоров: Выше
Выписка из базы данных: Выше
За что был получен выговор: ${escapeBBCode(reason)}
${lineImg}
Количество набранных баллов: ${totalPoints}
Проделанная работа и доказательства выполнения:
${actionsHtml}
Дата: ${today}[/B][/I][/SIZE][/COLOR][/FONT]
[B][I][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]Подпись: ${escapeBBCode(signature)}
${lineImg}[/SIZE][/COLOR][/FONT]
[B][I]${extraImg}[/I][/B][/I][/B][/CENTER]
[B][I][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]${lineImg}[/SIZE][/COLOR][/FONT][/I][/B]`;

    document.getElementById('rep_result').style.display = 'block';
    document.getElementById('rep_code').textContent = code;
    showMessage(`Заявление сгенерировано. Всего баллов: ${totalPoints}`, 'success');
}

function copyTSRReprieve() {
    const code = document.getElementById('rep_code').textContent;
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

function downloadTSRReprieve() {
    const code = document.getElementById('rep_code').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `Снятие_выговора_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

window.renderTSRReprieve = renderTSRReprieve;