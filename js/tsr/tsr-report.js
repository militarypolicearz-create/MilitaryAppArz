function renderTSRReport() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима', 'Отчёты']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="tsr-container">
            <div class="tsr-header">
                <h2 class="tsr-header__title">Отчёты ТСР</h2>
                <div class="tsr-header__subtitle">Выберите конец периода — система сама отсчитает неделю назад и подставит начало</div>
            </div>

            <div class="tsr-report-form">
                <div class="tsr-report-row">
                    <div class="tsr-report-field">
                        <label>Имя (Имя_Фамилия)</label>
                        <input type="text" id="tsr_officer_name" placeholder="Например: Jan_Abobbi" list="tsrOfficersList">
                        <datalist id="tsrOfficersList"></datalist>
                    </div>
                    <div class="tsr-report-field">
                        <label>Должность</label>
                        <input type="text" id="tsr_officer_position" value="Начальник Тюрьмы">
                    </div>
                </div>

                <div class="tsr-report-row">
                    <div class="tsr-report-field" style="grid-column: 1 / -1;">
                        <label>Подпись</label>
                        <input type="text" id="tsr_officer_signature" placeholder="Оставьте пустым — подставится автоматически">
                    </div>
                </div>

                <div class="tsr-report-row">
                    <div class="tsr-report-field">
                        <label>Начало периода (авто)</label>
                        <input type="text" id="tsr_period_start_display" readonly class="tsr-readonly" placeholder="—">
                    </div>
                    <div class="tsr-report-field">
                        <label>Конец периода</label>
                        <input type="date" id="tsr_period_end">
                    </div>
                </div>

                <div class="tsr-days" id="tsrDaysContainer">
                    <div class="tsr-days__title">Дни отчёта</div>
                    <div class="tsr-days__hint" id="tsrDaysHint">Нажмите «+ Добавить день», даты подставятся автоматически от начала периода.</div>
                </div>

                <div class="tsr-actions">
                    <button class="btn ghost" id="tsrAddDayBtn">+ Добавить день</button>
                </div>

                <div class="tsr-actions">
                    <button class="tsr-btn-primary" id="tsrGenerateBtn">Сгенерировать отчёт</button>
                    <button class="btn ghost" id="tsrClearBtn">Очистить форму</button>
                </div>
            </div>

            <div class="tsr-result" id="tsrResult" style="display: none;">
                <div class="tsr-result__header">
                    <h3>Готовый код отчёта</h3>
                    <div style="display: flex; gap: 0.625rem;">
                        <button class="btn small" id="tsrCopyBtn">Скопировать</button>
                        <button class="btn small ghost" id="tsrDownloadBtn">Скачать .txt</button>
                    </div>
                </div>
                <pre class="tsr-result__code" id="tsrCode"></pre>
            </div>
        </div>
    `;

    initTSRReport();
}

function initTSRReport() {
    const nameInput = document.getElementById('tsr_officer_name');
    const endInput = document.getElementById('tsr_period_end');

    if (typeof loadEmployeesData === 'function') {
        const data = loadEmployeesData();
        const names = Object.values(data)
            .filter(e => e.username && e.username !== 'Вакантно')
            .map(e => e.username);
        const list = document.getElementById('tsrOfficersList');
        if (list) list.innerHTML = names.map(n => `<option value="${n}">`).join('');
    }

    const today = new Date();
    if (endInput && !endInput.value) endInput.value = toISODate(today);

    updateStartDisplay();

    if (nameInput) {
        nameInput.addEventListener('change', () => {
            if (typeof loadEmployeesData !== 'function') return;
            const data = loadEmployeesData();
            const emp = Object.values(data).find(e => e.username === nameInput.value.trim());
            const positionInput = document.getElementById('tsr_officer_position');
            if (emp && positionInput) positionInput.value = emp.position || 'Начальник Тюрьмы';
        });
    }

    if (endInput) {
        endInput.addEventListener('change', () => {
            updateStartDisplay();
            recalcDaysDates();
        });

        endInput.addEventListener('click', () => {
            if (typeof endInput.showPicker === 'function') {
                try { endInput.showPicker(); } catch (err) {}
            }
        });
    }

    const addDayBtn = document.getElementById('tsrAddDayBtn');
    if (addDayBtn) addDayBtn.addEventListener('click', addTSRDay);

    const generateBtn = document.getElementById('tsrGenerateBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateTSRReport);

    const copyBtn = document.getElementById('tsrCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyTSRReport);

    const downloadBtn = document.getElementById('tsrDownloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadTSRReport);

    const clearBtn = document.getElementById('tsrClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => renderTSRReport());
}

function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseISODate(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDateDMY(str) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return `${d}.${m}.${y.slice(-2)}`;
}

function getPeriodFromEnd(endStr) {
    const end = parseISODate(endStr) || new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return {
        startISO: toISODate(start),
        endISO: toISODate(end)
    };
}

function updateStartDisplay() {
    const endInput = document.getElementById('tsr_period_end');
    const startDisplay = document.getElementById('tsr_period_start_display');
    if (!endInput || !startDisplay) return;
    const endISO = endInput.value;
    if (!endISO) {
        startDisplay.value = '';
        return;
    }
    const { startISO } = getPeriodFromEnd(endISO);
    startDisplay.value = formatDateDMY(startISO);
}

function addDaysISO(iso, offset) {
    const d = parseISODate(iso);
    if (!d) return '';
    d.setDate(d.getDate() + offset);
    return toISODate(d);
}

function addTSRDay() {
    const container = document.getElementById('tsrDaysContainer');
    const endInput = document.getElementById('tsr_period_end');
    if (!container || !endInput) return;

    const endISO = endInput.value;
    if (!endISO) {
        showError('Выберите конец периода');
        return;
    }

    const { startISO } = getPeriodFromEnd(endISO);
    const existing = container.querySelectorAll('.tsr-day').length;
    const dayISO = addDaysISO(startISO, existing);

    if (parseISODate(dayISO) > parseISODate(endISO)) {
        showError('Нельзя добавить больше 7 дней');
        return;
    }

    const day = document.createElement('div');
    day.className = 'tsr-day';
    day.dataset.date = dayISO;

    day.innerHTML = `
        <div class="tsr-day__header">
            <div class="tsr-day__date-label">${formatDateDMY(dayISO)}</div>
            <button class="tsr-day__remove-day" type="button">Удалить день</button>
        </div>
        <div class="tsr-day__entries"></div>
        <div class="tsr-day__actions">
            <button class="btn small" type="button" data-add-entry>+ Добавить действие</button>
        </div>
    `;

    const entries = day.querySelector('.tsr-day__entries');

    const addEntry = () => {
        const entry = document.createElement('div');
        entry.className = 'tsr-day__entry';
        entry.innerHTML = `
            <input type="text" class="tsr-entry-action" placeholder="Название действия">
            <input type="url" class="tsr-entry-url" placeholder="https://imgur.com/a/...">
            <button class="tsr-day__remove" type="button">×</button>
        `;
        entry.querySelector('.tsr-day__remove').addEventListener('click', () => entry.remove());
        entries.appendChild(entry);
    };

    addEntry();

    day.querySelector('[data-add-entry]').addEventListener('click', addEntry);
    day.querySelector('.tsr-day__remove-day').addEventListener('click', () => {
        day.remove();
        recalcDaysDates();
    });

    container.appendChild(day);
}

function recalcDaysDates() {
    const container = document.getElementById('tsrDaysContainer');
    const endInput = document.getElementById('tsr_period_end');
    if (!container || !endInput) return;

    const endISO = endInput.value;
    if (!endISO) return;

    const { startISO } = getPeriodFromEnd(endISO);
    const days = container.querySelectorAll('.tsr-day');

    days.forEach((day, index) => {
        const iso = addDaysISO(startISO, index);
        day.dataset.date = iso;
        const label = day.querySelector('.tsr-day__date-label');
        if (label) label.textContent = formatDateDMY(iso);
    });
}

function generateTSRReport() {
    const name = document.getElementById('tsr_officer_name').value.trim() || 'Имя_Фамилия';
    const position = document.getElementById('tsr_officer_position').value.trim() || 'Начальник Тюрьмы';
    const signatureInput = document.getElementById('tsr_officer_signature').value.trim();
    const signature = signatureInput || getInitials(name);
    const endISO = document.getElementById('tsr_period_end').value;

    if (!endISO) {
        showError('Выберите конец периода');
        return;
    }

    const { startISO } = getPeriodFromEnd(endISO);
    const days = document.querySelectorAll('#tsrDaysContainer .tsr-day');

    if (days.length === 0) {
        showError('Добавьте хотя бы один день отчёта');
        return;
    }

    let daysBlock = '';

    days.forEach(day => {
        const iso = day.dataset.date;
        const lines = [];

        day.querySelectorAll('.tsr-day__entry').forEach(entry => {
            const action = entry.querySelector('.tsr-entry-action').value.trim();
            const url = entry.querySelector('.tsr-entry-url').value.trim();
            if (!action) return;
            if (url) {
                lines.push(`[COLOR=rgb(209, 213, 216)][SIZE=5][B][I]${action}: [URL='${url}']Тык[/URL][/I][/B][/SIZE][/COLOR]`);
            } else {
                lines.push(`[COLOR=rgb(209, 213, 216)][SIZE=5][B][I]${action}[/I][/B][/SIZE][/COLOR]`);
            }
        });

        if (lines.length === 0) {
            lines.push('[COLOR=rgb(209, 213, 216)][SIZE=5][B][I]-[/I][/B][/SIZE][/COLOR]');
        }

        daysBlock += `
[FONT=courier new][COLOR=rgb(250, 197, 28)][SIZE=5][B][I]${formatDateDMY(iso)}[/I][/B][/SIZE][/COLOR]
${lines.join('\n')}
[/FONT]`;
    });

    const result = `[SIZE=5][B][I][FONT=courier new][COLOR=rgb(209, 213, 216)]Я, ${position} [/COLOR][/FONT][/I][/B][/SIZE][FONT=courier new][COLOR=rgb(184, 49, 47)][SIZE=5][B][I]${name}[/I][/B][/SIZE][/COLOR][COLOR=rgb(209, 213, 216)][SIZE=5][B][I], прилагаю свою работу в период с [/I][/B][/SIZE][/COLOR][COLOR=rgb(250, 197, 28)][SIZE=5][B][I]${formatDateDMY(startISO)} - ${formatDateDMY(endISO)}[/I][/B][/SIZE][/COLOR]
[COLOR=rgb(209, 213, 216)][SIZE=5][B][I]Доказательства:[/I][/B][/SIZE][/COLOR]
${daysBlock}

[FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][B][I]Дата: [/I][/B][/SIZE][/COLOR][COLOR=rgb(250, 197, 28)][SIZE=5][B][I]${formatDateDMY(endISO)}[/I][/B][/SIZE][/COLOR][/FONT]
[SIZE=5][I][B][FONT=courier new][COLOR=rgb(209, 213, 216)]Подпись: ${signature}[/COLOR][/FONT][/B][/I][/SIZE]`;

    document.getElementById('tsrResult').style.display = 'block';
    document.getElementById('tsrCode').textContent = result;
}

function copyTSRReport() {
    const code = document.getElementById('tsrCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Отчёт скопирован в буфер обмена!', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showMessage('Отчёт скопирован!', 'success');
    });
}

function downloadTSRReport() {
    const code = document.getElementById('tsrCode').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `отчет_ТСР_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

window.renderTSRReport = renderTSRReport;
window.generateTSRReport = generateTSRReport;
window.copyTSRReport = copyTSRReport;
window.downloadTSRReport = downloadTSRReport;