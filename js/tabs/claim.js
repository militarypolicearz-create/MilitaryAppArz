function renderClaim() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('claimArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Судебные иски']);
    } else if (typeof setBreadcrumb === 'function') {
        setBreadcrumb('Судебные иски');
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('claimArea');
    if (!area) return;

    area.innerHTML = `
        <div class="claim-container">
            <div class="claim-header">
                <h2 class="claim-header__title">Судебные иски</h2>
                <a href="https://forum.arizona-rp.com/forums/3401/" target="_blank" rel="noopener" class="claim-header__link">
                    Форум судебных исков
                </a>
            </div>
            <p class="claim-header__subtitle">Заполните форму для подачи искового заявления в Суд штата Red-Rock.</p>

            <div class="claim-form">
                <div class="claim-row">
                    <div class="claim-field">
                        <label>Ваше полное имя</label>
                        <input type="text" id="claim_plaintiff_name" placeholder="Имя Фамилия" list="claimPlaintiffsList">
                        <datalist id="claimPlaintiffsList"></datalist>
                        <div class="claim-hint">Формат: Имя Фамилия</div>
                    </div>

                    <div class="claim-field">
                        <label>Обвиняемый</label>
                        <input type="text" id="claim_defendant_name" placeholder="Имя Фамилия" list="claimDefendantsList">
                        <datalist id="claimDefendantsList"></datalist>
                    </div>
                </div>

                <div class="claim-row">
                    <div class="claim-field">
                        <label>Причина искового заявления</label>
                        <input type="text" id="claim_reason" value="Передача постановления" readonly class="claim-readonly">
                    </div>

                    <div class="claim-field">
                        <label>Контактные данные (Discord)</label>
                        <input type="text" id="claim_discord" placeholder="username#0000 или @username">
                    </div>
                </div>

                <div class="claim-row claim-row--full">
                    <div class="claim-field">
                        <label>Материалы дела (ссылка)</label>
                        <input type="url" id="claim_materials" placeholder="https://imgur.com/... или https://youtu.be/...">
                        <div class="claim-hint">Вставьте ссылку на материалы дела (видео/фото/документы)</div>
                    </div>
                </div>

                <div class="claim-row">
                    <div class="claim-field">
                        <label>Дата подачи</label>
                        <input type="date" id="claim_date">
                    </div>

                    <div class="claim-field">
                        <label>Подпись (расшифровка)</label>
                        <input type="text" id="claim_signature" placeholder="Подпись заявителя">
                    </div>
                </div>

                <div class="claim-actions">
                    <button class="btn claim-btn-generate" id="generateClaimBtn">Сгенерировать исковое заявление</button>
                    <button class="btn ghost" id="clearClaimBtn">Очистить форму</button>
                </div>
            </div>

            <div class="claim-result" id="claimResult" style="display: none;">
                <div class="claim-result__header">
                    <h3>Сгенерированное исковое заявление</h3>
                    <div class="claim-result__buttons">
                        <button class="btn small" id="copyClaimBtn">Скопировать</button>
                        <button class="btn small ghost" id="downloadClaimBtn">Скачать .txt</button>
                    </div>
                </div>
                <pre class="claim-result__code" id="claimCode"></pre>
            </div>
        </div>
    `;

    initClaimForm();
}

function initClaimForm() {
    let employees = [];
    if (typeof loadEmployeesData === 'function') {
        const employeesData = loadEmployeesData();
        employees = Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => emp.username);
    }

    const plaintiffList = document.getElementById('claimPlaintiffsList');
    const defendantList = document.getElementById('claimDefendantsList');

    if (plaintiffList) plaintiffList.innerHTML = employees.map(name => `<option value="${name}">`).join('');
    if (defendantList) defendantList.innerHTML = employees.map(name => `<option value="${name}">`).join('');

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateInput = document.getElementById('claim_date');
    if (dateInput) dateInput.value = `${year}-${month}-${day}`;

    const generateBtn = document.getElementById('generateClaimBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateClaim);

    const copyBtn = document.getElementById('copyClaimBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyClaim);

    const downloadBtn = document.getElementById('downloadClaimBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadClaim);

    const clearBtn = document.getElementById('clearClaimBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearClaimForm);

    const plaintiffInput = document.getElementById('claim_plaintiff_name');
    if (plaintiffInput) {
        plaintiffInput.addEventListener('change', () => {
            const name = plaintiffInput.value.trim();
            if (name) {
                const signatureInput = document.getElementById('claim_signature');
                if (signatureInput && !signatureInput.value) signatureInput.value = name;

                if (typeof loadEmployeesData === 'function') {
                    const employeesData = loadEmployeesData();
                    const emp = Object.values(employeesData).find(e => e.username === name);
                    if (emp && emp.discord) {
                        const discordInput = document.getElementById('claim_discord');
                        if (discordInput && !discordInput.value) discordInput.value = emp.discord;
                    }
                }
            }
        });
    }
}

function generateClaim() {
    const plaintiffName = document.getElementById('claim_plaintiff_name').value.trim();
    const reason = document.getElementById('claim_reason').value || 'Передача постановления';
    const defendantName = document.getElementById('claim_defendant_name').value.trim();
    const materials = document.getElementById('claim_materials').value.trim();
    const discord = document.getElementById('claim_discord').value.trim();
    const dateVal = document.getElementById('claim_date').value;
    const signature = document.getElementById('claim_signature').value.trim();

    if (!plaintiffName || !defendantName) {
        alert('Заполните имя заявителя и обвиняемого!');
        return;
    }

    let formattedDate = '08/10/25';
    if (dateVal) {
        const parts = dateVal.split('-');
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
    }

    const finalSignature = signature || plaintiffName;

    function escapeBBCode(str) {
        if (!str) return '';
        return str.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
    }

    let materialsText = 'не приложены';
    if (materials) {
        materialsText = `[URL="${materials}"]${materials}[/URL]`;
    }

    const resultText = `
[CENTER][IMG alt="qYchgfbIFzA.jpg"]https://pp.userapi.com/c856124/v856124000/9d99/qYchgfbIFzA.jpg[/IMG]
[FONT=courier new]Я гражданин штата Red-Rock ${escapeBBCode(plaintiffName)} обращаюсь в Суд штата

Причина искового заявления: ${escapeBBCode(reason)}
Кто является обвиняемым:

${escapeBBCode(defendantName)}

Материалы дела:
${materialsText}

Контактные данные(Discord): ${escapeBBCode(discord || 'не указаны')}
[/FONT]
[/CENTER]
[FONT=courier new]Дата: ${formattedDate}
Подпись: ${escapeBBCode(finalSignature)}[/FONT]
`;

    document.getElementById('claimResult').style.display = 'block';
    document.getElementById('claimCode').textContent = resultText;
}

function copyClaim() {
    const code = document.getElementById('claimCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Исковое заявление скопировано в буфер обмена!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        showMessage('Исковое заявление скопировано!', 'success');
    });
}

function downloadClaim() {
    const code = document.getElementById('claimCode').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `исковое_заявление_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

function clearClaimForm() {
    document.getElementById('claim_plaintiff_name').value = '';
    document.getElementById('claim_defendant_name').value = '';
    document.getElementById('claim_materials').value = '';
    document.getElementById('claim_discord').value = '';
    document.getElementById('claim_signature').value = '';
    document.getElementById('claimResult').style.display = 'none';

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('claim_date').value = `${year}-${month}-${day}`;

    showMessage('Форма очищена', 'info');
}

window.renderClaim = renderClaim;
window.generateClaim = generateClaim;
window.copyClaim = copyClaim;
window.downloadClaim = downloadClaim;
window.clearClaimForm = clearClaimForm;