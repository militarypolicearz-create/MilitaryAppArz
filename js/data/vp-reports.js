const VP_REPORT_TYPES = {
    delta: {
        id: 'delta',
        title: 'Проверка Дельты на реагирование',
        shortTitle: 'Проверка Дельты',
        fields: [
            { key: 'officer_name', label: 'Ваше имя и фамилия', type: 'text', placeholder: 'Имя_Фамилия' },
            { key: 'unit', label: 'Какой военной части состав Дельты был проверен', type: 'unit-select' },
            { key: 'evidence', label: 'Док-ва', type: 'textarea', placeholder: 'Ссылки на видео / фото' },
            { key: 'evaluation', label: 'Оценка и комментарии реагирования', type: 'textarea', placeholder: 'Оценка по 5-балльной шкале + комментарий' },
            { key: 'date', label: 'Дата', type: 'date' }
        ]
    },
    chs: {
        id: 'chs',
        title: 'Проверка ВЧ на ЧС',
        shortTitle: 'Проверка ЧС',
        fields: [
            { key: 'officer_name', label: 'Ваше имя и фамилия', type: 'text', placeholder: 'Имя_Фамилия' },
            { key: 'unit', label: 'Какая ВЧ была проверена', type: 'unit-select' },
            { key: 'state', label: 'Состояние ВЧ', type: 'textarea', placeholder: 'Описание состояния' },
            { key: 'evidence', label: 'Док-ва', type: 'textarea', placeholder: 'Ссылки на видео / фото' },
            { key: 'date', label: 'Дата', type: 'date' }
        ]
    },
    staff: {
        id: 'staff',
        title: 'Проверка личного состава армии',
        shortTitle: 'Проверка состава',
        fields: [
            { key: 'officer_name', label: 'Ваше Имя и Фамилия', type: 'text', placeholder: 'Имя_Фамилия' },
            { key: 'unit', label: 'Какой состав был проверен (ТСР/СФа/ЛСа)', type: 'unit-select' },
            { key: 'evidence', label: 'Доказательства', type: 'textarea', placeholder: 'Ссылки на видео / фото' },
            { key: 'evaluation', label: 'Оценка и комментарии проверки', type: 'textarea', placeholder: 'Оценка + комментарий' },
            { key: 'date', label: 'Дата', type: 'date' }
        ]
    },
    decrees: {
        id: 'decrees',
        title: 'Постановления ВП',
        shortTitle: 'Постановления',
        fields: [
            { key: 'officer_name', label: 'Ваше Имя и Фамилия', type: 'text', placeholder: 'Имя_Фамилия' },
            { key: 'violator', label: 'Имя Фамилия нарушителя', type: 'text', placeholder: 'Имя_Фамилия' },
            { key: 'unit', label: 'Военная часть нарушителя', type: 'unit-select' },
            { key: 'position', label: 'Должность', type: 'position-select', dependsOn: 'unit' },
            { key: 'violation', label: 'Что было нарушено?', type: 'textarea', placeholder: 'Пункты устава / статьи' },
            { key: 'evidence', label: 'Док-ва (ссылка на постановление)', type: 'textarea', placeholder: 'Ссылка на постановление' },
            { key: 'date', label: 'Дата', type: 'date' }
        ]
    }
};

const VP_REPORTS_STORAGE_KEY = 'vpReportsData';

function loadVPReports() {
    try {
        const raw = localStorage.getItem(VP_REPORTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveVPReports(reports) {
    localStorage.setItem(VP_REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

function addVPReport(typeId, data) {
    const reports = loadVPReports();
    const now = new Date();
    const report = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        type: typeId,
        data: data,
        createdAt: now.toISOString(),
        createdAtLocal: now.toLocaleString('ru-RU')
    };
    reports.push(report);
    saveVPReports(reports);
    return report;
}

function deleteVPReport(id) {
    let reports = loadVPReports();
    reports = reports.filter(r => r.id !== id);
    saveVPReports(reports);
}

function getReportsByType(typeId) {
    return loadVPReports().filter(r => r.type === typeId);
}

function getReportsLastDays(days) {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    return loadVPReports().filter(r => new Date(r.createdAt).getTime() >= since);
}

function getVPReportType(typeId) {
    return VP_REPORT_TYPES[typeId] || null;
}

window.VP_REPORT_TYPES = VP_REPORT_TYPES;
window.loadVPReports = loadVPReports;
window.saveVPReports = saveVPReports;
window.addVPReport = addVPReport;
window.deleteVPReport = deleteVPReport;
window.getReportsByType = getReportsByType;
window.getReportsLastDays = getReportsLastDays;
window.getVPReportType = getVPReportType;