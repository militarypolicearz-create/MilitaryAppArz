function hideAllMainAreas() {
    const ids = [
        'homeArea',
        'membersArea',
        'legendsArea',
        'mainArea',
        'adminArea',
        'decreeArea',
        'claimArea',
        'vpCharterArea',
        'contactsArea',
        'discordArea'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const userCard = document.getElementById('userCard');
    if (userCard) userCard.style.display = 'none';
}

function showMainArea(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function setBreadcrumb(label) {
    const el = document.getElementById('breadcrumbActive');
    if (el) el.textContent = label;
}

function setSidebarActive(tab) {
    document.querySelectorAll('.app-sidebar__item').forEach(item => {
        if (item.dataset.tab === tab) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function clearSidebarActive() {
    document.querySelectorAll('.app-sidebar__item').forEach(item => item.classList.remove('active'));
}

function setTopbarActive(tab) {
    document.querySelectorAll('.app-topbar__tabs .tab').forEach(t => {
        if (t.dataset.tab === tab) t.classList.add('active');
        else t.classList.remove('active');
    });
}

function clearTopbarActive() {
    document.querySelectorAll('.app-topbar__tabs .tab').forEach(t => t.classList.remove('active'));
}

function showWarningBanner() {
    const banner = document.getElementById('warningBanner');
    if (banner) banner.style.display = 'block';
}

function hideWarningBanner() {
    const banner = document.getElementById('warningBanner');
    if (banner) banner.style.display = 'none';
}

function updateWarningBannerVisibility() {
    const hasTest = (typeof test !== 'undefined') && test;
    const isBlocked = hasTest && test.blocked;
    const onExamTab = (typeof currentTestType !== 'undefined')
        && (currentTestType === 'exam' || currentTestType === 'retraining');

    if (hasTest && !isBlocked && onExamTab) {
        showWarningBanner();
    } else {
        hideWarningBanner();
    }
}

function openHome() {
    if (typeof renderHome === 'function') renderHome();
}

function openMembers() {
    if (typeof renderMembers === 'function') renderMembers();
}

function openLegends() {
    if (typeof renderLegends === 'function') renderLegends();
}

function openVPCharter() {
    if (typeof renderVP === 'function') renderVP();
}

function openContacts() {
    if (typeof renderContacts === 'function') renderContacts();
}

function openDiscord() {
    if (typeof renderDiscord === 'function') renderDiscord();
}

function openExamTab() {
    hideAllMainAreas();
    showMainArea('mainArea');
    const userCard = document.getElementById('userCard');
    if (userCard) userCard.style.display = 'block';
    setBreadcrumb('Экзамен');
    if (typeof currentTestType !== 'undefined') currentTestType = 'exam';
    if (typeof renderCurrentTest === 'function') renderCurrentTest();
    updateWarningBannerVisibility();
}

function openRetrainingTab() {
    hideAllMainAreas();
    showMainArea('mainArea');
    const userCard = document.getElementById('userCard');
    if (userCard) userCard.style.display = 'block';
    setBreadcrumb('Переаттестация');
    if (typeof currentTestType !== 'undefined') currentTestType = 'retraining';
    if (typeof renderCurrentTest === 'function') renderCurrentTest();
    updateWarningBannerVisibility();
}

function openDecreeTab() {
    hideAllMainAreas();
    showMainArea('decreeArea');
    setBreadcrumb('Постановления');
    if (typeof renderDecree === 'function') renderDecree();
    hideWarningBanner();
}

function openClaimTab() {
    hideAllMainAreas();
    setBreadcrumb('Судебные иски');
    if (typeof renderClaim === 'function') renderClaim();
    hideWarningBanner();
}

function openAdminTab() {
    if (typeof authenticateAdmin === 'function' && !authenticateAdmin()) {
        clearTopbarActive();
        openExamTab();
        setTopbarActive('exam');
        return;
    }
    hideAllMainAreas();
    showMainArea('adminArea');
    setBreadcrumb('Админ-панель');
    if (typeof renderAdmin === 'function') renderAdmin();
    hideWarningBanner();
}

function initSidebar() {
    document.querySelectorAll('.app-sidebar__item').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            clearTopbarActive();
            setSidebarActive(tab);

            if (tab === 'home') openHome();
            else if (tab === 'members') openMembers();
            else if (tab === 'legends') openLegends();
            else if (tab === 'vp') openVPCharter();
            else if (tab === 'contacts') openContacts();
            else if (tab === 'discord') openDiscord();
        });
    });
}

function initTopbarTabs() {
    document.querySelectorAll('.app-topbar__tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            clearSidebarActive();
            setTopbarActive(tabId);

            if (tabId === 'exam') openExamTab();
            else if (tabId === 'retraining') openRetrainingTab();
            else if (tabId === 'decree') openDecreeTab();
            else if (tabId === 'claim') openClaimTab();
            else if (tabId === 'admin') openAdminTab();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initTopbarTabs();
});

window.hideAllMainAreas = hideAllMainAreas;
window.showMainArea = showMainArea;
window.setBreadcrumb = setBreadcrumb;
window.setSidebarActive = setSidebarActive;
window.clearSidebarActive = clearSidebarActive;
window.setTopbarActive = setTopbarActive;
window.clearTopbarActive = clearTopbarActive;
window.showWarningBanner = showWarningBanner;
window.hideWarningBanner = hideWarningBanner;
window.updateWarningBannerVisibility = updateWarningBannerVisibility;
window.openHome = openHome;
window.openMembers = openMembers;
window.openLegends = openLegends;
window.openVPCharter = openVPCharter;
window.openContacts = openContacts;
window.openDiscord = openDiscord;
window.openExamTab = openExamTab;
window.openRetrainingTab = openRetrainingTab;
window.openDecreeTab = openDecreeTab;
window.openClaimTab = openClaimTab;
window.openAdminTab = openAdminTab;