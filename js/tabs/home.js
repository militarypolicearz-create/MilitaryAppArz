const HOME_FAQ = [
    {
        q: "Что такое Военная Полиция?",
        a: "Военная Полиция — это отдельное подразделение Министерства Обороны, осуществляющее надзор за соблюдением устава и дисциплины внутри вооружённых сил и Тюрьмы Строгого Режима. Сотрудники ВП проверяют состав МО, фиксируют нарушения, оформляют постановления и взаимодействуют с другими государственными структурами."
    },
    {
        q: "Как проходит экзамен для курсантов?",
        a: "Экзамен состоит из 15 вопросов по Уставу МО, Уставу ВП, Федеральному постановлению, Уголовному и Административному кодексам. Тест длится ограниченное время, а при бездействии более 20 секунд блокируется до разблокировки администратором."
    },
    {
        q: "Что такое переаттестация?",
        a: "Переаттестация — это тест для действующих офицеров и старшего состава. Он содержит расширенный список вопросов и проводится для подтверждения квалификации, а также для проверки знаний после обновлений устава и регламентов."
    },
    {
        q: "Кто такие легенды?",
        a: "Легенды — это сотрудники, оставившие значительный след в истории Военной Полиции. Это не обязательно текущий состав. Список легенд ведётся вручную и доступен в разделе Пользователи."
    },
    {
        q: "Что делать при блокировке теста?",
        a: "При блокировке система сформирует файл с кодом разблокировки и скачает его. Отправьте файл администратору. После получения кода введите его в поле разблокировки — тест продолжится с того места, где остановился."
    }
];

function renderHome() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('homeArea');
    if (typeof setBreadcrumb === 'function') setBreadcrumb('Главная');
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('homeArea');
    if (!area) return;

    area.innerHTML = `
        <div class="home-container">
            <section class="home-hero">
                <h1 class="home-hero__title">Военная Полиция</h1>
                <p class="home-hero__subtitle">Система тестирования и внутренней отчётности штата Red-Rock</p>
                <p class="home-hero__desc">
                    Это внутренний портал Военной Полиции. Здесь проводится экзамен для курсантов,
                    переаттестация для офицеров, оформляются постановления и судебные иски,
                    а также ведётся учёт сотрудников и истории организации.
                </p>
                <div class="home-hero__actions">
                    <button class="btn" id="homeStartWorkBtn">Перейти к работе</button>
                </div>
            </section>

            <section class="home-faq">
                <h2 class="home-faq__title">Часто задаваемые вопросы</h2>
                <div class="home-faq__list">
                    ${HOME_FAQ.map((item, index) => `
                        <div class="home-faq__item" data-index="${index}">
                            <div class="home-faq__question">
                                <span class="home-faq__q-text">${escapeHtml(item.q)}</span>
                                <span class="home-faq__arrow">+</span>
                            </div>
                            <div class="home-faq__answer">
                                <div class="home-faq__answer-inner">${escapeHtml(item.a)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;

    document.querySelectorAll('.home-faq__item').forEach(item => {
        item.querySelector('.home-faq__question').addEventListener('click', () => {
            item.classList.toggle('open');
            const arrow = item.querySelector('.home-faq__arrow');
            if (arrow) arrow.textContent = item.classList.contains('open') ? '−' : '+';
        });
    });

    const startBtn = document.getElementById('homeStartWorkBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (typeof openExamTab === 'function') openExamTab();
            if (typeof setTopbarActive === 'function') setTopbarActive('exam');
            if (typeof clearSidebarActive === 'function') clearSidebarActive();
        });
    }
}

window.renderHome = renderHome;