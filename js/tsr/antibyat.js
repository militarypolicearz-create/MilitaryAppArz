function renderAntiByat() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима', 'Анти-Блат']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="antibyat-container">
            <div class="antibyat-header">
                <h2 class="antibyat-header__title">Анти-Блат</h2>
                <div class="antibyat-header__subtitle">Форма повышения сотрудника с обоснованием</div>
            </div>

            <div class="antibyat-form">
                <div class="antibyat-row">
                    <div class="antibyat-field">
                        <label>Ваше имя и фамилия</label>
                        <input type="text" id="ab_officer_name" placeholder="Имя_Фамилия">
                    </div>
                    <div class="antibyat-field">
                        <label>Ник того, кого хотите повысить</label>
                        <input type="text" id="ab_target_name" placeholder="Имя_Фамилия" list="abEmployeesList">
                        <datalist id="abEmployeesList"></datalist>
                    </div>
                </div>

                <div class="antibyat-row">
                    <div class="antibyat-field">
                        <label>Фракция</label>
                        <input type="text" id="ab_faction" value="ТСР" readonly class="antibyat-readonly">
                    </div>
                    <div class="antibyat-field">
                        <label>Дата</label>
                        <input type="date" id="ab_date">
                    </div>
                </div>

                <div class="antibyat-row antibyat-row--full">
                    <div class="antibyat-field">
                        <label>Чем он отличился и почему именно его хотите повысить (ссылка на отчёт / проделанная работа)</label>
                        <textarea id="ab_achievements" placeholder="Опишите заслуги, приложите ссылки на отчёты"></textarea>
                    </div>
                </div>

                <div class="antibyat-row antibyat-row--three">
                    <div class="antibyat-field">
                        <label>Выписка из базы данных сотрудников (/members)</label>
                        <input type="text" id="ab_members" value="в отчете" readonly class="antibyat-readonly">
                    </div>
                    <div class="antibyat-field">
                        <label>Копия мед.карты (/showmc)</label>
                        <input type="text" id="ab_medcard" value="в отчете" readonly class="antibyat-readonly">
                    </div>
                    <div class="antibyat-field">
                        <label>Когда повышали в последний раз (/jobprogress)</label>
                        <input type="text" id="ab_jobprogress" value="в отчете" readonly class="antibyat-readonly">
                    </div>
                </div>

                <div class="antibyat-row antibyat-row--three">
                    <div class="antibyat-field">
                        <label>Скриншот нахождения в Discord</label>
                        <input type="text" id="ab_discord" value="в отчете" readonly class="antibyat-readonly">
                    </div>
                    <div class="antibyat-field">
                        <label>На каком он звании сейчас (5–9)</label>
                        <input type="number" id="ab_rank_current" min="5" max="9" placeholder="5–9">
                    </div>
                    <div class="antibyat-field">
                        <label>На какое звание будет повышен</label>
                        <input type="number" id="ab_rank_next" readonly class="antibyat-readonly">
                    </div>
                </div>

                <div class="antibyat-actions">
                    <button class="btn" id="abGenerateBtn">Сгенерировать</button>
                    <button class="btn ghost" id="abClearBtn">Очистить</button>
                </div>
            </div>

            <div class="antibyat-result" id="abResult" style="display: none;">
                <div class="antibyat-result__header">
                    <h3>Готовый BBCode</h3>
                    <div class="antibyat-result__buttons">
                        <button class="btn small" id="abCopyBtn">Скопировать</button>
                        <button class="btn small ghost" id="abDownloadBtn">Скачать .txt</button>
                    </div>
                </div>
                <pre class="antibyat-result__code" id="abCode"></pre>
            </div>
        </div>
    `;

    initAntiByatForm();
}

function initAntiByatForm() {
    if (typeof loadEmployeesData === 'function') {
        const data = loadEmployeesData();
        const names = Object.values(data)
            .filter(e => e.username && e.username !== 'Вакантно')
            .map(e => e.username);

        const employeesList = document.getElementById('abEmployeesList');
        if (employeesList) employeesList.innerHTML = names.map(n => `<option value="${n}">`).join('');
    }

    const today = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('ab_date');
    if (dateInput) dateInput.value = today;

    const currentInput = document.getElementById('ab_rank_current');
    const nextInput = document.getElementById('ab_rank_next');

    const updateNext = () => {
        const val = parseInt(currentInput.value);
        if (!isNaN(val) && val >= 5 && val <= 9) {
            nextInput.value = val + 1;
        } else {
            nextInput.value = '';
        }
    };

    if (currentInput) {
        currentInput.addEventListener('input', updateNext);
        currentInput.addEventListener('change', updateNext);
    }

    const generateBtn = document.getElementById('abGenerateBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateAntiByat);

    const copyBtn = document.getElementById('abCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyAntiByat);

    const downloadBtn = document.getElementById('abDownloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadAntiByat);

    const clearBtn = document.getElementById('abClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => renderAntiByat());
}

function generateAntiByat() {
    const officerName = document.getElementById('ab_officer_name').value.trim() || '—';
    const targetName = document.getElementById('ab_target_name').value.trim() || '—';
    const faction = document.getElementById('ab_faction').value || 'ТСР';
    const achievements = document.getElementById('ab_achievements').value.trim() || '—';
    const members = document.getElementById('ab_members').value || 'в отчете';
    const medcard = document.getElementById('ab_medcard').value || 'в отчете';
    const jobprogress = document.getElementById('ab_jobprogress').value || 'в отчете';
    const discord = document.getElementById('ab_discord').value || 'в отчете';
    const rankCurrent = document.getElementById('ab_rank_current').value || '—';
    const rankNext = document.getElementById('ab_rank_next').value || '—';
    const date = document.getElementById('ab_date').value || '';

    let formattedDate = date;
    if (date) {
        const parts = date.split('-');
        formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    const code =
`[I][B][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]1. Ваше имя и фамилия: [/SIZE][/COLOR][COLOR=rgb(184, 49, 47)][SIZE=5]${officerName}[/SIZE][/COLOR][/FONT][/B][/I]
[FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5][I][B]2. Ник того, кого хотите повысить: [/B][/I][/SIZE][/COLOR][COLOR=rgb(184, 49, 47)][SIZE=5][I][B]${targetName}[/B][/I][/SIZE][/COLOR]
[COLOR=rgb(209, 213, 216)][SIZE=5][I][B]3. Фракция: ${faction}
4. Чем он отличился от всех и почему именно его хотите повысить [ссылку на отчёт/проделанная работа]: [URL='${achievements}']Тык[/URL]
5. Выписка из базы данных сотрудников: (/members) ${members}
6. Копия мед.карты: (/showmc)${medcard}
7. На каком он звании сейчас: ${rankCurrent}
8. На какое звание будет повышен: ${rankNext}
9. Когда его повышали в последний раз ( /jobprogress ): ${jobprogress}
10. Скриншот нахождения в Discord: ${discord}[/B][/I][/SIZE][/COLOR][/FONT]
[B][I][FONT=courier new][COLOR=rgb(209, 213, 216)][SIZE=5]11. Дата: ${formattedDate}[/SIZE][/COLOR][/FONT][/I][/B]`;

    document.getElementById('abResult').style.display = 'block';
    document.getElementById('abCode').textContent = code;
    showMessage('Анти-Блат сгенерирован', 'success');
}

function copyAntiByat() {
    const code = document.getElementById('abCode').textContent;
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

function downloadAntiByat() {
    const code = document.getElementById('abCode').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `АнтиБлат_${dateStr}.txt`);
    showMessage('Файл скачан', 'success');
}

window.renderAntiByat = renderAntiByat;
window.generateAntiByat = generateAntiByat;
window.copyAntiByat = copyAntiByat;
window.downloadAntiByat = downloadAntiByat;