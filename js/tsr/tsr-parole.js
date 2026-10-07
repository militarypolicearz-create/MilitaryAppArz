function renderTSRParole() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима', 'УДО']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="tsr-container">
            <div class="tsr-header">
                <h2 class="tsr-header__title">Условно-досрочное освобождение</h2>
                <div class="tsr-header__subtitle">Заполните форму — текст для Discord сгенерируется автоматически</div>
            </div>

            <div class="tsr-report-form">
                <div class="tsr-report-row">
                    <div class="tsr-report-field">
                        <label>Ваше имя и фамилия</label>
                        <input type="text" id="parole_officer_name" placeholder="Например: Jan_Abobbi" list="paroleOfficersList">
                        <datalist id="paroleOfficersList"></datalist>
                    </div>
                    <div class="tsr-report-field">
                        <label>Имя и фамилия заключенного</label>
                        <input type="text" id="parole_prisoner_name" placeholder="Например: John_Doe">
                    </div>
                </div>

                <div class="tsr-report-row">
                    <div class="tsr-report-field">
                        <label>Количество исправительных работ заключенного (/getjail id)</label>
                        <input type="text" id="parole_prisoner_works" placeholder="Например: 250">
                    </div>
                    <div class="tsr-report-field">
                        <label>Сумма проведения сделки</label>
                        <input type="text" id="parole_amount" value="80.000.000" placeholder="80.000.000">
                    </div>
                </div>

                <div class="tsr-report-row">
                    <div class="tsr-report-field" style="grid-column: 1 / -1;">
                        <label>Дата и время выпуска (авто)</label>
                        <input type="text" id="parole_datetime_display" readonly class="tsr-readonly">
                    </div>
                </div>

                <div class="tsr-report-row">
                    <div class="tsr-report-field">
                        <label>Скриншот выпуска заключенного</label>
                        <input type="text" id="parole_screenshot" value="Выше" readonly class="tsr-readonly">
                    </div>
                    <div class="tsr-report-field">
                        <label>История наказаний заключенного (/showpunish от игрока)</label>
                        <input type="text" id="parole_history" value="Выше" readonly class="tsr-readonly">
                    </div>
                </div>

                <div class="tsr-actions">
                    <button class="tsr-btn-primary" id="paroleGenerateBtn">Сгенерировать УДО</button>
                    <button class="btn ghost" id="paroleClearBtn">Очистить форму</button>
                </div>
            </div>

            <div class="tsr-result" id="paroleResult" style="display: none;">
                <div class="tsr-result__header">
                    <h3>Готовый текст для Discord</h3>
                    <div style="display: flex; gap: 0.625rem;">
                        <button class="btn small" id="paroleCopyBtn">Скопировать</button>
                        <button class="btn small ghost" id="paroleDownloadBtn">Скачать .txt</button>
                    </div>
                </div>
                <pre class="tsr-result__code" id="paroleCode"></pre>
            </div>
        </div>
    `;

    initTSRParole();
}

function initTSRParole() {
    if (typeof loadEmployeesData === 'function') {
        const data = loadEmployeesData();
        const names = Object.values(data)
            .filter(e => e.username && e.username !== 'Вакантно')
            .map(e => e.username);
        const list = document.getElementById('paroleOfficersList');
        if (list) list.innerHTML = names.map(n => `<option value="${n}">`).join('');
    }

    updateParoleDateTime();

    document.getElementById('paroleGenerateBtn')?.addEventListener('click', generateTSRParole);
    document.getElementById('paroleCopyBtn')?.addEventListener('click', copyTSRParole);
    document.getElementById('paroleDownloadBtn')?.addEventListener('click', downloadTSRParole);
    document.getElementById('paroleClearBtn')?.addEventListener('click', () => renderTSRParole());
}

function updateParoleDateTime() {
    const display = document.getElementById('parole_datetime_display');
    if (!display) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    display.value = `${day}.${month}.${year} ${hours}:${minutes}`;
}

function generateTSRParole() {
    const officerName = document.getElementById('parole_officer_name').value.trim() || 'Имя_Фамилия';
    const prisonerName = document.getElementById('parole_prisoner_name').value.trim() || 'Имя_Фамилия';
    const works = document.getElementById('parole_prisoner_works').value.trim() || '0';
    const amount = document.getElementById('parole_amount').value.trim() || '80.000.000';
    const datetime = document.getElementById('parole_datetime_display').value;
    const screenshot = document.getElementById('parole_screenshot').value;
    const history = document.getElementById('parole_history').value;

    const result =
`Ваше имя и фамилия: ${officerName}
Имя и фамилия заключенного: ${prisonerName}
Количество исправительных работ заключенного (/getjail id): ${works}
Сумма проведения сделки: ${amount}
Дата и время выпуска: ${datetime}
Скриншот выпуска заключенного: ${screenshot}
История наказаний заключенного (/showpunish от игрока): ${history}`;

    document.getElementById('paroleResult').style.display = 'block';
    document.getElementById('paroleCode').textContent = result;
    showMessage('УДО сгенерировано!', 'success');
}

function copyTSRParole() {
    const code = document.getElementById('paroleCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Текст скопирован в буфер обмена!', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showMessage('Текст скопирован!', 'success');
    });
}

function downloadTSRParole() {
    const code = document.getElementById('paroleCode').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `УДО_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

window.renderTSRParole = renderTSRParole;
window.generateTSRParole = generateTSRParole;
window.copyTSRParole = copyTSRParole;
window.downloadTSRParole = downloadTSRParole;