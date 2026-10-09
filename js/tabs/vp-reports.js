let vpReportsCurrentType = 'delta';
let vpReportsShowStorage = false;

function renderVPReports() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('vpReportsArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Отчёты ВП');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('vpReportsArea');
    if (!area) return;

    area.innerHTML = `
        <div class="vpr-container">
            <div class="vpr-header">
                <div class="vpr-header__titles">
                    <h2 class="vpr-header__title">Отчёты Военной Полиции</h2>
                    <div class="vpr-header__subtitle">Заполняй формы, отчёты копятся в хранилище, в конце недели можно скачать</div>
                </div>
            </div>

            <div class="vpr-stats" id="vprStats"></div>

            <div class="vpr-tabs" id="vprTabs"></div>

            <div class="vpr-body" id="vprBody"></div>

            <div class="vpr-storage-bar">
                <button class="btn small ghost" id="vprToggleStorageBtn">Показать хранилище</button>
                <button class="btn small" id="vprDownloadWeekBtn">Скачать отчёты за неделю</button>
                <button class="btn small ghost danger" id="vprClearAllBtn">Очистить всё хранилище</button>
            </div>

            <div class="vpr-storage" id="vprStorage" style="display:none;"></div>
        </div>
    `;

    renderVPReportsStats();
    renderVPReportsTabs();
    renderVPReportsForm();
    renderVPReportsStorage();

    document.getElementById('vprToggleStorageBtn')?.addEventListener('click', () => {
        vpReportsShowStorage = !vpReportsShowStorage;
        const storage = document.getElementById('vprStorage');
        const btn = document.getElementById('vprToggleStorageBtn');
        if (storage) storage.style.display = vpReportsShowStorage ? 'block' : 'none';
        if (btn) btn.textContent = vpReportsShowStorage ? 'Скрыть хранилище' : 'Показать хранилище';
    });

    document.getElementById('vprDownloadWeekBtn')?.addEventListener('click', downloadWeekReports);
    document.getElementById('vprClearAllBtn')?.addEventListener('click', clearAllReports);
}

function renderVPReportsStats() {
    const stats = document.getElementById('vprStats');
    if (!stats) return;

    const types = Object.values(VP_REPORT_TYPES);
    const all = loadVPReports();
    const week = getReportsLastDays(7);

    stats.innerHTML = types.map(t => {
        const total = all.filter(r => r.type === t.id).length;
        const weekCount = week.filter(r => r.type === t.id).length;
        return `
            <div class="vpr-stat">
                <div class="vpr-stat__value">${total}</div>
                <div class="vpr-stat__label">${escapeHtml(t.shortTitle)}</div>
                <div class="vpr-stat__week">за неделю: ${weekCount}</div>
            </div>
        `;
    }).join('') + `
        <div class="vpr-stat vpr-stat--total">
            <div class="vpr-stat__value">${all.length}</div>
            <div class="vpr-stat__label">Всего отчётов</div>
            <div class="vpr-stat__week">за неделю: ${week.length}</div>
        </div>
    `;
}

function renderVPReportsTabs() {
    const tabs = document.getElementById('vprTabs');
    if (!tabs) return;

    const types = Object.values(VP_REPORT_TYPES);

    tabs.innerHTML = types.map(t => `
        <div class="vpr-tab ${vpReportsCurrentType === t.id ? 'active' : ''}" data-type="${t.id}">
            ${escapeHtml(t.shortTitle)}
        </div>
    `).join('');

    tabs.querySelectorAll('.vpr-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            vpReportsCurrentType = tab.dataset.type;
            renderVPReportsTabs();
            renderVPReportsForm();
        });
    });
}

function renderVPReportsForm() {
    const body = document.getElementById('vprBody');
    if (!body) return;

    const type = VP_REPORT_TYPES[vpReportsCurrentType];
    if (!type) return;

    const officerNameValue = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : '';
    const todayValue = new Date().toISOString().slice(0, 10);

    body.innerHTML = `
        <div class="vpr-form">
            <h3 class="vpr-form__title">${escapeHtml(type.title)}</h3>

            <div class="vpr-form__grid">
                ${type.fields.map(field => renderVPReportField(field, officerNameValue, todayValue)).join('')}
            </div>

            <div class="vpr-form__actions">
                <button class="btn" id="vprSaveBtn">Сохранить отчёт</button>
                <button class="btn ghost" id="vprClearFormBtn">Очистить форму</button>
                <button class="btn ghost" id="vprCopyFormBtn">Скопировать в Discord</button>
            </div>
        </div>
    `;

    initVPReportDependencies(type);

    document.getElementById('vprSaveBtn')?.addEventListener('click', saveCurrentVPReport);
    document.getElementById('vprClearFormBtn')?.addEventListener('click', () => {
        renderVPReportsForm();
        showMessage('Форма очищена', 'info');
    });
    document.getElementById('vprCopyFormBtn')?.addEventListener('click', copyCurrentVPReport);
}

function renderVPReportField(field, officerNameValue, todayValue) {
    let value = '';
    if (field.key === 'officer_name' && officerNameValue) value = officerNameValue;
    if (field.key === 'date' && !value) value = todayValue;

    if (field.type === 'unit-select') {
        const units = (typeof POSITIONS_BY_UNIT !== 'undefined')
            ? Object.keys(POSITIONS_BY_UNIT)
            : ['ТСР', 'ЛСа', 'СФа'];

        return `
            <div class="vpr-field">
                <label>${escapeHtml(field.label)}</label>
                <select data-key="${field.key}" data-type="unit">
                    <option value="">— Выберите организацию —</option>
                    ${units.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('')}
                </select>
            </div>
        `;
    }

    if (field.type === 'position-select') {
        return `
            <div class="vpr-field">
                <label>${escapeHtml(field.label)}</label>
                <select data-key="${field.key}" data-type="position" data-depends-on="${field.dependsOn || ''}">
                    <option value="не имеется">не имеется</option>
                </select>
            </div>
        `;
    }

    if (field.type === 'textarea') {
        return `
            <div class="vpr-field vpr-field--full">
                <label>${escapeHtml(field.label)}</label>
                <textarea data-key="${field.key}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(value)}</textarea>
            </div>
        `;
    }

    return `
        <div class="vpr-field ${field.key === 'evidence' || field.key === 'violation' ? 'vpr-field--full' : ''}">
            <label>${escapeHtml(field.label)}</label>
            <input type="${field.type}" data-key="${field.key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || '')}">
        </div>
    `;
}

function initVPReportDependencies(type) {
    const positionSelects = document.querySelectorAll('#vprBody [data-type="position"]');

    positionSelects.forEach(posSelect => {
        const dependsOnKey = posSelect.dataset.dependsOn;
        if (!dependsOnKey) return;

        const unitSelect = document.querySelector(`#vprBody [data-key="${dependsOnKey}"]`);
        if (!unitSelect) return;

        const rebuildPositions = () => {
            const unit = unitSelect.value;
            posSelect.innerHTML = '';

            if (unit && typeof POSITIONS_BY_UNIT !== 'undefined' && POSITIONS_BY_UNIT[unit]) {
                const defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.textContent = '— Выберите должность —';
                posSelect.appendChild(defaultOpt);

                POSITIONS_BY_UNIT[unit].forEach(pos => {
                    const opt = document.createElement('option');
                    opt.value = pos;
                    opt.textContent = pos;
                    posSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.value = 'не имеется';
                opt.textContent = 'не имеется';
                posSelect.appendChild(opt);
            }
        };

        unitSelect.addEventListener('change', rebuildPositions);
        rebuildPositions();
    });
}

function collectVPFormData() {
    const type = VP_REPORT_TYPES[vpReportsCurrentType];
    if (!type) return null;

    const data = {};
    let hasEmpty = false;

    type.fields.forEach(field => {
        const el = document.querySelector(`#vprBody [data-key="${field.key}"]`);
        const value = el ? el.value.trim() : '';
        data[field.key] = value;
        if (!value) hasEmpty = true;
    });

    return { data, hasEmpty };
}

function saveCurrentVPReport() {
    const collected = collectVPFormData();
    if (!collected) return;

    const { data, hasEmpty } = collected;

    if (hasEmpty) {
        if (!confirm('Некоторые поля пустые. Всё равно сохранить?')) return;
    }

    addVPReport(vpReportsCurrentType, data);
    showMessage('Отчёт сохранён в хранилище', 'success');

    renderVPReportsStats();
    renderVPReportsStorage();
}

function copyCurrentVPReport() {
    const type = VP_REPORT_TYPES[vpReportsCurrentType];
    const collected = collectVPFormData();
    if (!type || !collected) return;

    const lines = type.fields.map(f => {
        const value = collected.data[f.key] || '—';
        return `${f.label}:\n${value}`;
    });

    const text = lines.join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
        showMessage('Отчёт скопирован в буфер обмена', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showMessage('Отчёт скопирован', 'success');
    });
}

function renderVPReportsStorage() {
    const container = document.getElementById('vprStorage');
    if (!container) return;

    const reports = loadVPReports().slice().reverse();

    if (reports.length === 0) {
        container.innerHTML = `
            <div class="vpr-storage__empty">
                <div class="vpr-storage__empty-title">Хранилище пусто</div>
                <div class="vpr-storage__empty-text">Сохрани первый отчёт — он появится здесь</div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="vpr-storage__head">
            <h3 class="vpr-storage__title">Хранилище отчётов</h3>
            <div class="vpr-storage__count">${reports.length}</div>
        </div>
        <div class="vpr-storage__list">
            ${reports.map(r => {
                const type = VP_REPORT_TYPES[r.type];
                if (!type) return '';
                return `
                    <div class="vpr-storage-item" data-id="${r.id}">
                        <div class="vpr-storage-item__head">
                            <div class="vpr-storage-item__type">${escapeHtml(type.shortTitle)}</div>
                            <div class="vpr-storage-item__date">${escapeHtml(r.createdAtLocal)}</div>
                            <button class="vpr-storage-item__del" data-id="${r.id}" title="Удалить">×</button>
                        </div>
                        <div class="vpr-storage-item__body">
                            ${type.fields.map(f => `
                                <div class="vpr-storage-item__row">
                                    <span class="vpr-storage-item__label">${escapeHtml(f.label)}:</span>
                                    <span class="vpr-storage-item__value">${escapeHtml(r.data[f.key] || '—')}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.querySelectorAll('.vpr-storage-item__del').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (!confirm('Удалить этот отчёт?')) return;
            deleteVPReport(id);
            renderVPReportsStats();
            renderVPReportsStorage();
            showMessage('Отчёт удалён', 'success');
        });
    });
}

function downloadWeekReports() {
    const reports = getReportsLastDays(7);

    if (reports.length === 0) {
        showError('За последние 7 дней отчётов нет');
        return;
    }

    const grouped = {};
    Object.keys(VP_REPORT_TYPES).forEach(typeId => {
        grouped[typeId] = [];
    });

    reports.forEach(r => {
        if (grouped[r.type]) {
            grouped[r.type].push(r);
        }
    });

    const today = new Date();
    const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let text = `ОТЧЁТЫ ВОЕННОЙ ПОЛИЦИИ ЗА НЕДЕЛЮ\n`;
    text += `Период: ${periodStart.toLocaleDateString('ru-RU')} — ${today.toLocaleDateString('ru-RU')}\n`;
    text += `Всего отчётов: ${reports.length}\n`;
    text += `\n=================================\n\n`;

    Object.keys(VP_REPORT_TYPES).forEach(typeId => {
        const type = VP_REPORT_TYPES[typeId];
        const list = grouped[typeId] || [];

        text += `\n${type.title.toUpperCase()} (${list.length})\n`;
        text += `---------------------------------\n`;

        if (list.length === 0) {
            text += `Отчётов нет.\n\n`;
            return;
        }

        list.forEach((r, i) => {
            text += `\n[${i + 1}] ${r.createdAtLocal}\n`;
            type.fields.forEach(f => {
                text += `${f.label}: ${r.data[f.key] || '—'}\n`;
            });
            text += `\n`;
        });
    });

    text += `\n=================================\nArizona RP | Военная Полиция\n`;

    const nickname = (typeof currentUser !== 'undefined' && currentUser && currentUser.username)
        ? currentUser.username
        : 'Неизвестный';

    const dateStr = today.toLocaleDateString('ru-RU').replace(/\./g, '-');

    const fileName = `Отчёт_${nickname}_ВП_${dateStr}.txt`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
    showMessage(`Выгружено отчётов: ${reports.length}`, 'success');
}

function clearAllReports() {
    if (!confirm('Удалить ВСЕ отчёты из хранилища? Это действие нельзя отменить.')) return;
    saveVPReports([]);
    renderVPReportsStats();
    renderVPReportsStorage();
    showMessage('Хранилище очищено', 'success');
}

window.renderVPReports = renderVPReports;
window.renderVPReportsStats = renderVPReportsStats;
window.renderVPReportsTabs = renderVPReportsTabs;
window.renderVPReportsForm = renderVPReportsForm;
window.renderVPReportsStorage = renderVPReportsStorage;
window.renderVPReportField = renderVPReportField;
window.initVPReportDependencies = initVPReportDependencies;
window.downloadWeekReports = downloadWeekReports;
window.clearAllReports = clearAllReports;
window.saveCurrentVPReport = saveCurrentVPReport;
window.copyCurrentVPReport = copyCurrentVPReport;
window.collectVPFormData = collectVPFormData;