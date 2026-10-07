function renderTSR() {
    if (typeof hideAllMainAreas === 'function') hideAllMainAreas();
    if (typeof showMainArea === 'function') showMainArea('tsrArea');
    if (typeof setBreadcrumbPath === 'function') {
        setBreadcrumbPath(['Главная', 'Тюрьма Строгого Режима']);
    }
    if (typeof hideWarningBanner === 'function') hideWarningBanner();

    const area = document.getElementById('tsrArea');
    if (!area) return;

    area.innerHTML = `
        <div class="tsr-container">
            <div class="tsr-header">
                <h2 class="tsr-header__title">Тюрьма Строгого Режима</h2>
                <div class="tsr-header__subtitle">Внутренние инструменты для сотрудников и руководства ТСР</div>
            </div>

            <div class="tsr-report-form">
                <div class="tsr-report-field">
                    <label>Разделы</label>
                    <div style="font-size: 0.95em; color: var(--text-muted); line-height: 1.7;">
                        Слева выберите раздел в подменю «Тюрьма Строгого Режима»:
                        <br>• <strong>Отчёты</strong> — генератор недельного отчёта о проделанной работе.
                        <br>• <strong>УДО</strong> — условно-досрочное освобождение.
                        <br>• <strong>Устав</strong> — вопросы и ответы по уставу.
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.renderTSR = renderTSR;