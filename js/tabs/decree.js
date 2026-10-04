function renderDecree() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('decreeArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Постановления');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById("decreeArea");
    if (!area) return;

    area.innerHTML = `
        <div class="decree-container">
            <h2 class="decree-header__title">Умное составление постановления</h2>
            <p class="decree-header__subtitle">Заполните поля, выберите пункты нарушений и сгенерируйте код для вставки на форум.</p>

            <div class="decree-form">
                <div>
                    <label>Офицер Военной Полиции (Имя Фамилия)</label>
                    <input type="text" id="decree_officer_name" placeholder="Например: Jan_Abobbi" list="officersList">
                    <datalist id="officersList"></datalist>
                </div>
                <div>
                    <label>Должность офицера</label>
                    <input type="text" id="decree_officer_position" placeholder="Например: Куратор ВП">
                </div>

                <div class="defendant-row">
                    <div>
                        <label>Обвиняемый (Имя Фамилия)</label>
                        <input type="text" id="decree_defendant_name" placeholder="Имя Фамилия">
                    </div>
                    <div>
                        <label>Место службы обвиняемого</label>
                        <select id="decree_defendant_unit" class="decree-select">
                            <option value="">Выберите место службы</option>
                            <option value="ТСР">ТСР</option>
                            <option value="ЛСа">ЛСа</option>
                            <option value="СФа">СФа</option>
                        </select>
                    </div>
                    <div>
                        <label>Должность обвиняемого</label>
                        <select id="decree_defendant_position" class="decree-select">
                            <option value="не имеется">не имеется</option>
                        </select>
                    </div>
                </div>

                <div class="full-width">
                    <label>Дата составления постановления</label>
                    <input type="datetime-local" id="decree_date" step="1">
                </div>

                <div class="full-width">
                    <label>Описание обстоятельств</label>
                    <textarea id="decree_circumstances" placeholder="Текст описания обстоятельств правонарушения, дата, место, задействованные лица, суть нарушения."></textarea>
                </div>

                <div class="full-width decree-articles-row">
                    <button class="btn" id="selectArticlesBtn">Выбрать пункты нарушений</button>
                    <span id="selectedArticlesCount" class="decree-counter">Выбрано: 0</span>
                </div>

                <div class="full-width">
                    <div id="selectedArticlesPreview" class="decree-preview">
                        <div class="decree-preview__empty">Пункты не выбраны</div>
                    </div>
                </div>

                <div class="full-width">
                    <label>Материалы к постановлению</label>
                    <div class="decree-materials-actions">
                        <button class="btn small" id="addVideoBtn">Добавить видео</button>
                        <button class="btn small" id="addPhotoBtn">Добавить фото</button>
                    </div>
                    <div id="materialsContainer" class="decree-materials-grid"></div>
                </div>

                <div class="full-width decree-actions">
                    <button class="btn" id="generateDecreeBtn">Сгенерировать постановление</button>
                    <button class="btn ghost" id="clearDecreeBtn">Очистить форму</button>
                </div>
            </div>

            <div class="decree-result" id="decreeResult" style="display: none;">
                <div class="decree-result__header">
                    <h3>Сгенерированный код</h3>
                    <div class="decree-result__buttons">
                        <button class="btn small" id="copyDecreeBtn">Скопировать код</button>
                        <button class="btn small ghost" id="downloadDecreeBtn">Скачать .txt</button>
                    </div>
                </div>
                <pre class="decree-result__code" id="decreeCode"></pre>
            </div>
        </div>
    `;

    initDecreeForm();
}

function initDecreeForm() {
    let selectedArticles = [];

    const materialsContainer = document.getElementById('materialsContainer');
    addMaterialField('materialsContainer', 'video');
    addMaterialField('materialsContainer', 'photo');

    document.getElementById('addVideoBtn').addEventListener('click', () => addMaterialField('materialsContainer', 'video'));
    document.getElementById('addPhotoBtn').addEventListener('click', () => addMaterialField('materialsContainer', 'photo'));

    let officers = [];
    if (typeof loadEmployeesData === 'function') {
        const employeesData = loadEmployeesData();
        officers = Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => emp.username);
    }
    const datalist = document.getElementById('officersList');
    if (datalist) datalist.innerHTML = officers.map(name => `<option value="${name}">`).join('');

    document.getElementById('decree_defendant_unit').addEventListener('change', function() {
        const unit = this.value;
        const positionSelect = document.getElementById('decree_defendant_position');
        positionSelect.innerHTML = '';
        if (unit && typeof POSITIONS_BY_UNIT !== 'undefined' && POSITIONS_BY_UNIT[unit]) {
            POSITIONS_BY_UNIT[unit].forEach(pos => {
                const option = document.createElement('option');
                option.value = pos;
                option.textContent = pos;
                positionSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = 'не имеется';
            option.textContent = 'не имеется';
            positionSelect.appendChild(option);
        }
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateInput = document.getElementById('decree_date');
    if (dateInput) dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

    document.getElementById('selectArticlesBtn').addEventListener('click', async function() {
        const result = await openArticlesModal();
        if (result !== null) {
            selectedArticles = result;
            const countSpan = document.getElementById('selectedArticlesCount');
            const preview = document.getElementById('selectedArticlesPreview');
            if (selectedArticles.length === 0) {
                countSpan.textContent = 'Выбрано: 0';
                preview.innerHTML = '<div class="decree-preview__empty">Пункты не выбраны</div>';
            } else {
                countSpan.textContent = `Выбрано: ${selectedArticles.length}`;
                preview.innerHTML = selectedArticles.map(art =>
                    `<div class="decree-preview__item"><strong>${escapeHtml(art.law)}</strong> — ${escapeHtml(art.chapter)}, п.${escapeHtml(art.point)}</div>`
                ).join('');
            }
        }
    });

    document.getElementById('generateDecreeBtn').addEventListener('click', () => generateDecree(selectedArticles));
    document.getElementById('copyDecreeBtn').addEventListener('click', copyDecree);
    document.getElementById('downloadDecreeBtn').addEventListener('click', downloadDecree);
    document.getElementById('clearDecreeBtn').addEventListener('click', clearDecreeForm);

    document.getElementById('decree_officer_name').addEventListener('change', function() {
        const name = this.value.trim();
        if (!name || typeof loadEmployeesData !== 'function') return;
        const employeesData = loadEmployeesData();
        const emp = Object.values(employeesData).find(e => e.username === name);
        if (emp) document.getElementById('decree_officer_position').value = emp.position;
    });
}

function addMaterialField(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const index = container.children.length;
    const label = type === 'video' ? 'Видео-материал' : 'Фото-материал';
    const placeholder = type === 'video' ? 'https://youtu.be/...' : 'https://imgur.com/...';

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'material-field';
    fieldDiv.innerHTML = `
        <label>${label} #${index + 1}</label>
        <input type="text" class="material-link" placeholder="${placeholder}">
        <button class="remove-material-btn" type="button">×</button>
        <div class="material-hint">Вставьте ссылку</div>
    `;

    container.appendChild(fieldDiv);

    fieldDiv.querySelector('.remove-material-btn').addEventListener('click', function() {
        if (container.children.length > 1) fieldDiv.remove();
        else alert('Должно остаться хотя бы одно поле');
    });
}

function generateDecree(selectedArticles) {
    const officerName = document.getElementById('decree_officer_name').value.trim();
    const officerPos = document.getElementById('decree_officer_position').value.trim();
    const defName = document.getElementById('decree_defendant_name').value.trim();
    const defUnit = document.getElementById('decree_defendant_unit').value;
    const defPos = document.getElementById('decree_defendant_position').value || 'не имеется';
    const dateVal = document.getElementById('decree_date').value;
    const circumstances = document.getElementById('decree_circumstances').value.trim();

    const videoLinks = [];
    const photoLinks = [];
    document.querySelectorAll('#materialsContainer .material-field').forEach(field => {
        const input = field.querySelector('.material-link');
        const value = input.value.trim();
        if (value) {
            const label = field.querySelector('label').textContent;
            if (label.includes('Видео')) videoLinks.push(value);
            else if (label.includes('Фото')) photoLinks.push(value);
        }
    });

    let materialsHtml = '';
    if (videoLinks.length > 0 || photoLinks.length > 0) {
        materialsHtml = '\n[TABLE width="100%"]\n';

        if (videoLinks.length > 0) {
            materialsHtml += `[TR]\n[TD width="50%"][CENTER][FONT=courier new]Видеофиксация:[/FONT][/CENTER][/TD]\n[TD width="50%"][CENTER][FONT=courier new]`;
            materialsHtml += videoLinks.map((link, i) => {
                const label = videoLinks.length > 1 ? `Видео-материал ${i + 1}` : 'Видео-материал';
                return `[URL="${link}"]${label}[/URL]`;
            }).join('; ');
            materialsHtml += `[/FONT][/CENTER][/TD]\n[/TR]\n`;
        }

        if (photoLinks.length > 0) {
            materialsHtml += `[TR]\n[TD width="50%"][CENTER][FONT=courier new]Фотофиксация:[/FONT][/CENTER][/TD]\n[TD width="50%"][CENTER][FONT=courier new]`;
            materialsHtml += photoLinks.map((link, i) => {
                const label = photoLinks.length > 1 ? `Фото-материал ${i + 1}` : 'Фото-материал';
                return `[URL="${link}"]${label}[/URL]`;
            }).join('; ');
            materialsHtml += `[/FONT][/CENTER][/TD]\n[/TR]\n`;
        }

        materialsHtml += '[/TABLE]\n';
    } else {
        materialsHtml = `
[TABLE width="100%"]
[TR]
[TD width="50%"][CENTER][FONT=courier new]Видеофиксация:[/FONT][/CENTER][/TD]
[TD width="50%"][CENTER][FONT=courier new]не приложено[/FONT][/CENTER][/TD]
[/TR]
[TR]
[TD width="50%"][CENTER][FONT=courier new]Фотофиксация:[/FONT][/CENTER][/TD]
[TD width="50%"][CENTER][FONT=courier new]не приложено[/FONT][/CENTER][/TD]
[/TR]
[/TABLE]
`;
    }

    if (!officerName || !defName) {
        alert('Заполните хотя бы имя офицера и обвиняемого.');
        return;
    }

    const now = new Date(dateVal || Date.now());
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear()).slice(-2);
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const decreeNumber = `${d}${m}${y}${h}${min}`;

    let articlesHtml = '';
    if (!selectedArticles || selectedArticles.length === 0) {
        articlesHtml = '[COLOR=rgb(255,255,255)]Нарушения не указаны.[/COLOR]';
    } else {
        const grouped = {};
        selectedArticles.forEach(art => {
            if (!grouped[art.law]) grouped[art.law] = [];
            grouped[art.law].push(art);
        });
        let lawBlocks = [];
        for (const [law, arts] of Object.entries(grouped)) {
            const points = arts.map(a => `[COLOR=rgb(250,197,28)]Пункт №${a.point}:[/COLOR] [COLOR=rgb(255,255,255)]${a.text}[/COLOR]`).join('\n');
            lawBlocks.push(`
[COLOR=rgb(250,197,28)][B]${law}:[/B][/COLOR]
${points}
`);
        }
        articlesHtml = lawBlocks.join('\n');
    }

    function escapeBBCode(str) {
        return str.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
    }

    const resultText = `
[CENTER]
[IMG width="300px"]https://cdn11.bigcommerce.com/s-jbg7mp3qyd/images/stencil/1280x1280/products/2515/1041/dep_army_police_badge__84795.1464722242.jpg?c=2&imbypass=on[/IMG]

[FONT=courier new][SIZE=7]П О С Т А Н О В Л Е Н И Е №[COLOR=rgb(250,197,28)] ${decreeNumber} [/COLOR][/SIZE][/FONT]

[IMG width="660px" height="20px"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]
[/CENTER]

[TABLE width="100%"]
[TR]
[TD][CENTER][FONT=courier new][SIZE=5][COLOR=rgb(250,197,28)]С В Е Д Е Н И Я[/COLOR] о постановлении[/SIZE][/FONT][/CENTER][/TD]
[/TR]
[/TABLE]

[TABLE width="100%"]
[TR]
[TD width="50%"][CENTER][FONT=courier new]
Офицер Военной Полиции: [COLOR=rgb(41,105,176)]${escapeBBCode(officerName)}[/COLOR] — ${escapeBBCode(officerPos)}.
Обвиняемый: [COLOR=rgb(41,105,176)]${escapeBBCode(defName)}[/COLOR] — ${escapeBBCode(defPos)}.
[/FONT][/CENTER][/TD]

[TD width="50%"][CENTER][FONT=courier new]
Дата составления постановления: ${now.toLocaleDateString('ru-RU')}.
Статус документа: [COLOR=rgb(65,168,95)]ДЕЙСТВУЕТ[/COLOR].
[/FONT][/CENTER][/TD]
[/TR]
[/TABLE]


[TABLE width="100%"]
[TR]
[TD][CENTER][FONT=courier new][SIZE=5][COLOR=rgb(250,197,28)]С О Д Е Р Ж А Н И Е[/COLOR] постановления[/SIZE][/FONT][/CENTER][/TD]
[/TR]
[/TABLE]


[CENTER]
[IMG width="660px" height="20px"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]
[FONT=courier new][SIZE=4][B]Описание обстоятельств:[/B]

${escapeBBCode(circumstances || 'Не указано.')}
[/SIZE][/FONT]
[IMG width="660px" height="20px"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]



[FONT=courier new][SIZE=5][COLOR=rgb(250,197,28)]Д О С Ь Е[/COLOR] обвиняемого[/SIZE][/FONT][/CENTER]

[TABLE width="100%"]
[TR]
[TD width="50%"][CENTER][FONT=courier new]
Имя, фамилия:
Место службы:
Должность:
[/FONT][/CENTER][/TD]
[TD width="50%"][CENTER][FONT=courier new]
${escapeBBCode(defName)}.
${escapeBBCode(defUnit || 'Не указано.')}.
${escapeBBCode(defPos || 'не имеется')}.
[/FONT][/CENTER][/TD]
[/TR]
[/TABLE]


[TABLE width="100%"]
[TR]
[TD][CENTER][FONT=courier new][SIZE=5][COLOR=rgb(250,197,28)]О Б В И Н Е Н И Я[/COLOR][/SIZE][/FONT][/CENTER][/TD]
[/TR]
[/TABLE]

[CENTER]
[IMG width="660px" height="20px"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]

${articlesHtml}

[IMG width="660px" height="20px"]https://lh6.googleusercontent.com/bfkuOzG0e4kH5IKPsuBGLbGP9LBWXsD886Dvwkf-RquzpshIle3LHwid8n6mKaEFBFiNxyWCgjisr1eB-KCUC91WFQa910RvY0vMmV_i4_U7O7kaL3sYaJuIbkLN_0V4aCjvZCj1[/IMG]
[/CENTER]


[TABLE width="100%"]
[TR]
[TD][CENTER][FONT=courier new][SIZE=5][COLOR=rgb(250,197,28)]М А Т Е Р И А Л Ы[/COLOR] к постановлению[/SIZE][/FONT][/CENTER][/TD]
[/TR]
[/TABLE]

${materialsHtml}
`;

    document.getElementById('decreeResult').style.display = 'block';
    document.getElementById('decreeCode').textContent = resultText;
    showMessage('Постановление сгенерировано!', 'success');
}

function copyDecree() {
    const code = document.getElementById('decreeCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Код скопирован в буфер обмена!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        showMessage('Код скопирован!', 'success');
    });
}

function downloadDecree() {
    const code = document.getElementById('decreeCode').textContent;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `постановление_${new Date().toISOString().slice(0, 10)}.txt`);
    showMessage('Файл скачан', 'success');
}

function clearDecreeForm() {
    document.querySelectorAll('#decreeArea input, #decreeArea textarea').forEach(el => {
        if (el.id !== 'decree_date') el.value = '';
    });
    document.getElementById('decree_defendant_unit').value = '';
    document.getElementById('decree_defendant_position').innerHTML = '<option value="не имеется">не имеется</option>';

    const container = document.getElementById('materialsContainer');
    container.innerHTML = '';
    addMaterialField('materialsContainer', 'video');
    addMaterialField('materialsContainer', 'photo');

    document.getElementById('selectedArticlesCount').textContent = 'Выбрано: 0';
    document.getElementById('selectedArticlesPreview').innerHTML = '<div class="decree-preview__empty">Пункты не выбраны</div>';
    document.getElementById('decreeResult').style.display = 'none';
    showMessage('Форма очищена', 'info');
}

function openArticlesModal() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'articlesModal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1600px; max-height: 98vh; width: 98vw; display: flex; gap: 30px; padding: 30px;">
                <div class="articles-sidebar">
                    <h3 class="articles-sidebar__title">Популярные пункты</h3>
                    <p class="articles-sidebar__hint">Нажмите на пункт чтобы добавить или убрать</p>
                    <div id="popularArticlesList"></div>
                </div>

                <div class="articles-main">
                    <div class="articles-main__header">
                        <h2 class="articles-main__title">Все пункты нарушений</h2>
                        <button class="btn small ghost articles-clear" id="clearAllBtn">Очистить всё</button>
                    </div>
                    <p class="articles-main__subtitle">Поиск по всем категориям: Устав МО, Устав ВП, Федеральное постановление, Уголовный кодекс</p>

                    <input type="text" id="articlesSearchInput" placeholder="Поиск по тексту..." class="articles-search">

                    <div id="articlesListContainer" class="articles-list-container">
                        <div id="articlesList"></div>
                    </div>

                    <div class="articles-actions">
                        <button class="btn" id="confirmArticlesBtn">Подтвердить выбор (0)</button>
                        <button class="btn ghost" id="cancelArticlesBtn">Отмена</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        let selectedArticles = [];

        const popularArticles = [
            { id: 23, law: "Устав МО", chapter: "Глава II. Основные обязанности", point: "2.1", text: "Каждый военнослужащий обязан знать и соблюдать Конституцию, Федеральное постановление, воинский устав, трудовой, административный кодексы. Незнание устава не освобождает Вас от ответственности.", category: "устав" },
            { id: 24, law: "Устав МО", chapter: "Глава II. Основные обязанности", point: "2.2", text: "Каждый военнослужащий/сотрудник обязан выполнять законные приказы старшего по должности/званию.", category: "устав" },
            { id: 114, law: "Устав МО", chapter: "Глава VIII. Запреты для военнослужащих", point: "8.12", text: "Нарушать Конституцию, Федеральное постановление, воинский устав, трудовой, уголовный и административный кодексы.", category: "устав" },
            { id: 95, law: "Устав МО", chapter: "Глава VIII. Запреты для военнослужащих", point: "8.1", text: "Во время рабочего дня использовать личный транспорт (Исключение: сотрудники спец. отряда Delta, сотрудники Военной Полиции, Руководство МО).", category: "устав" },
            { id: 58, law: "Устав МО", chapter: "Глава IV. Субординация и общение военнослужащих Министерства Обороны", point: "4.1", text: "Стиль общения в Министерстве обороны - деловой.", category: "устав" },
            { id: 111, law: "Устав МО", chapter: "Глава VIII. Запреты для военнослужащих", point: "8.9", text: "Снимать военную форму во время рабочего времени.", category: "устав" },
            { id: 304, law: "Федеральное постановление", chapter: "Раздел 2", point: "2.1", text: "Запрещено использовать служебное положение в личных целях. (Увольнение/Понижение)", category: "фп" },
            { id: 305, law: "Федеральное постановление", chapter: "Раздел 2", point: "2.2", text: "Запрещено использовать нецензурную брань, а также оскорблять кого либо. (Предупреждение/Выговор/Понижение/Увольнение)", category: "фп" },
            { id: 306, law: "Федеральное постановление", chapter: "Раздел 2", point: "2.3", text: "Запрещено открывать огонь из огнестрельного оружия без видимой на то причины. (Понижение/Выговор)", category: "фп" },
            { id: 318, law: "Федеральное постановление", chapter: "Раздел 2", point: "2.15", text: "Служащим армий/сотрудникам ТСР запрещено находится за пределами мест постоянной дислокации своей воинской части. Иск: Разрешение руководства, тренировка, спец.Операция, поставка БП, деятельность Военной Полиции/Спец.Отряда 'Delta', участие в 'Битва за завод'. (Увольнение)", category: "фп" },
            { id: 247, law: "Уголовный кодекс", chapter: "Раздел 1. Общие положения", point: "1", text: "Уголовный кодекс штата Ред-Рок — письменный нормативно-правовой акт, который определяет уголовно-противоправность деяния.", category: "ук" }
        ];

        const categoryColor = {
            'устав': '#4fc3f7',
            'устав ВП': '#a8703c',
            'фп': '#ffb74d',
            'ук': '#ef5350'
        };

        const categoryLabel = {
            'устав': 'Устав МО',
            'устав ВП': 'Устав ВП',
            'фп': 'ФП',
            'ук': 'УК'
        };

        function renderPopularArticles() {
            const container = document.getElementById('popularArticlesList');
            if (!container) return;

            const sortedPopular = [...popularArticles].sort((a, b) => {
                const order = { 'устав': 0, 'устав ВП': 1, 'фп': 2, 'ук': 3 };
                return (order[a.category] ?? 99) - (order[b.category] ?? 99);
            });

            container.innerHTML = sortedPopular.map(art => {
                const isSelected = selectedArticles.some(a => a.id === art.id);
                return `
                    <div class="popular-article-item category-${art.category === 'устав' ? 'ustav' : art.category === 'устав ВП' ? 'ustav-vp' : art.category === 'фп' ? 'fp' : art.category === 'ук' ? 'uk' : 'other'} ${isSelected ? 'selected' : ''}" data-id="${art.id}">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                        <div class="popular-article-body">
                            <div class="popular-article-head">
                                <span class="popular-article-title">${escapeHtml(art.law)} — ${escapeHtml(art.chapter)}, п.${escapeHtml(art.point)}</span>
                                <span class="popular-article-badge" style="background:${categoryColor[art.category]}22;color:${categoryColor[art.category]};border-color:${categoryColor[art.category]}44;">${categoryLabel[art.category]}</span>
                            </div>
                            <div class="popular-article-text">${escapeHtml(art.text)}</div>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.popular-article-item').forEach(el => {
                el.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    const article = popularArticles.find(a => a.id === id);
                    if (!article) return;

                    const index = selectedArticles.findIndex(a => a.id === id);
                    if (index === -1) selectedArticles.push(article);
                    else selectedArticles.splice(index, 1);

                    renderPopularArticles();
                    renderArticles();
                });
            });
        }

        function renderArticles() {
            const container = document.getElementById('articlesList');
            const searchInput = document.getElementById('articlesSearchInput');
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

            let list = (typeof articlesDB !== 'undefined') ? [...articlesDB] : [];

            if (query.length > 0) {
                list = list.filter(art => {
                    const searchText = `${art.law} ${art.chapter} ${art.point} ${art.text}`.toLowerCase();
                    return searchText.includes(query);
                });
            }

            const categoryOrder = { 'устав': 0, 'устав ВП': 1, 'фп': 2, 'ук': 3 };
            list.sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));

            if (list.length === 0) {
                container.innerHTML = `<div class="articles-empty">Ничего не найдено по запросу: <strong>${escapeHtml(query)}</strong></div>`;
                return;
            }

            container.innerHTML = list.map(art => {
                const isSelected = selectedArticles.some(a => a.id === art.id);
                let displayText = art.text;
                if (query.length > 0) {
                    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    displayText = art.text.replace(regex, '<mark>$1</mark>');
                }

                return `
                    <div class="article-select-item ${isSelected ? 'selected' : ''}" data-id="${art.id}">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                        <div class="article-select-body">
                            <div class="article-select-head">
                                <span class="article-select-title">${escapeHtml(art.law)} — ${escapeHtml(art.chapter)}, п.${escapeHtml(art.point)}</span>
                                <span class="article-select-badge" style="background:${categoryColor[art.category] || '#666'}22;color:${categoryColor[art.category] || '#666'};border-color:${categoryColor[art.category] || '#666'}44;">${categoryLabel[art.category] || art.category}</span>
                            </div>
                            <div class="article-select-text">${displayText}</div>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('confirmArticlesBtn').textContent = `Подтвердить выбор (${selectedArticles.length})`;

            container.querySelectorAll('.article-select-item').forEach(el => {
                el.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    const article = (typeof articlesDB !== 'undefined') ? articlesDB.find(a => a.id === id) : null;
                    if (!article) return;

                    const index = selectedArticles.findIndex(a => a.id === id);
                    if (index === -1) selectedArticles.push(article);
                    else selectedArticles.splice(index, 1);

                    renderPopularArticles();
                    renderArticles();
                });
            });
        }

        document.getElementById('articlesSearchInput').addEventListener('input', renderArticles);

        document.getElementById('clearAllBtn').addEventListener('click', function() {
            if (selectedArticles.length === 0) {
                showMessage('Нет выбранных пунктов для очистки', 'info');
                return;
            }
            if (confirm(`Очистить все выбранные пункты (${selectedArticles.length} шт.)?`)) {
                selectedArticles = [];
                renderPopularArticles();
                renderArticles();
                showMessage('Все выбранные пункты очищены', 'success');
            }
        });

        document.getElementById('confirmArticlesBtn').addEventListener('click', function() {
            modal.remove();
            resolve(selectedArticles);
        });

        document.getElementById('cancelArticlesBtn').addEventListener('click', function() {
            modal.remove();
            resolve(null);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(null);
            }
        });

        renderPopularArticles();
        renderArticles();
    });
}

window.renderDecree = renderDecree;
window.addMaterialField = addMaterialField;
window.generateDecree = generateDecree;
window.copyDecree = copyDecree;
window.downloadDecree = downloadDecree;
window.clearDecreeForm = clearDecreeForm;
window.openArticlesModal = openArticlesModal;