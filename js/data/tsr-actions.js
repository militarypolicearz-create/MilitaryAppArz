const TSR_ACTIONS_5_9 = [
    { group: 'ВП', text: 'Один одобренный надзор', points: 10, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ВП', text: 'Проверка военной базы', points: 15, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ВП', text: '10 минут наземного патруля с МЮ', points: 15, ranks: '5-9', limit: 'Максимум 30 минут в день', dailyLimit: 3 },
    { group: 'ВП', text: 'Проверка личного состава', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ВП', text: 'Устранение крупного ЧС на базах МО (3+ нападающих)', points: 15, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ВП', text: 'Организовать проверку на реагирование для спец. отряда Delta', points: 10, ranks: '5-9', limit: 'Максимум 1 раз в день', dailyLimit: 1 },
    { group: 'ВП', text: 'Участие в спец.операции (Захват мэрии, ЧП, отбитый конвой ГРП, облава на "укроп"притон и т.п)', points: 20, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ВП', text: 'Сдать проверку на вызова подкрепление от Министра Обороны', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },

    { group: 'ТСР', text: 'Организация работы склада', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Поставки на фуре (за 1 ящик)', points: 1, ranks: '5-9', limit: 'Максимум 40 баллов в день', dailyLimit: 40 },
    { group: 'ТСР', text: 'Организация поставок боеприпасов', points: 15, ranks: '5-9', limit: 'Максимум 2 раза в день', dailyLimit: 2 },
    { group: 'ТСР', text: 'Участие в тренировке любого типа', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Организация совместной тренировки с другими организациями', points: 15, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Проведение выездной тренировки', points: 15, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Проведение 1-й лекции', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Погрузка ингредиентов в фуру (за 1 ящик)', points: 1, ranks: '3-9', limit: 'Максимум 25 баллов в день', dailyLimit: 25 },
    { group: 'ТСР', text: 'Проведение тренировки на базе', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'РП Ситуация с составом', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Скриншот Ситуации', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Одобренный отчёт на 5/5 у командиров взводов', points: 100, ranks: 'Командир Взвода', limit: '1 раз в неделю', dailyLimit: 1 },
    { group: 'ТСР', text: 'Одобренный отчёт на 4/5 у командиров взводов', points: 50, ranks: 'Командир Взвода', limit: '1 раз в неделю', dailyLimit: 1 },
    { group: 'ТСР', text: 'Участие в битве за завод', points: 20, ranks: '5-9', limit: 'Максимум 1 раз в день', dailyLimit: 1 },
    { group: 'ТСР', text: 'Принять успешную сдачу устава, договора МО - МЮ, КМБ, Правила Военных зон, Маршрут, ПМП и регламента грузоперевозок у мл.состава', points: 5, ranks: '5-9', limit: 'Максимум в день: 10 раз', dailyLimit: 10 },
    { group: 'ТСР', text: 'Принять успешную сдачу правила рации департамента у мл.состава', points: 5, ranks: '7-9', limit: 'Максимум в день: 5 раз', dailyLimit: 5 },
    { group: 'ТСР', text: 'Пройти 1 круг пешего патруля на посту', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: '10 минут наземного патруля', points: 10, ranks: '5-9', limit: 'Максимум 30 минут в день', dailyLimit: 3 },
    { group: 'ТСР', text: '1 патруль на дроне (ЛСа)', points: 15, ranks: '5-9', limit: 'Максимум 2 раза в день', dailyLimit: 2 },
    { group: 'ТСР', text: '1 патруль на дроне (СФа / ТСР)', points: 30, ranks: '5-9', limit: 'Максимум 2 раза в день', dailyLimit: 2 },
    { group: 'ТСР', text: 'Проведение мероприятие с призом', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Провести экскурсию для младшего состава', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: '1 Водный патруль ЛСа/СФа', points: 20, ranks: '5-9', limit: 'Максимум 3 патруля в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Сопровождение на хаммере (за 1 заезд)', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Сопровождение на вертолете "Маверик" (за 1 заезд)', points: 5, ranks: '5-9', limit: 'Максимум 3 раз в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Изготовление 10 мешков на заводе', points: 4, ranks: '5-9', limit: 'Максимум 100 мешков в день', dailyLimit: 10 },
    { group: 'ТСР', text: '10 минут воздушного патруля', points: 10, ranks: '5-9', limit: 'Максимум 30 минут в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Помощь в собеседовании', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Участие в ГРП/ГМП', points: 20, ranks: '5-9', limit: 'Максимум 2 раза в день', dailyLimit: 2 },
    { group: 'ТСР', text: 'Организация ГРП/ГМП', points: 0, ranks: '5-9', limit: 'На усмотрение следящих', dailyLimit: 999 },
    { group: 'ТСР', text: 'Выдать 1 повестку', points: 15, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Доставить 1 ящик в разгрузочную фуру в Битве за завод', points: 5, ranks: '5-9', limit: 'Максимум 10 раз за отчёт', dailyLimit: 10 },
    { group: 'ТСР', text: 'Организация работы блокпоста', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Организация работы мобильного блокпоста', points: 20, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Проверка людей на блокпосту', points: 5, ranks: '5-9', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Участие в тренировке/мероприятии от Министра Обороны', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Участие в РП ситуации от Министра Обороны', points: 10, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Участие в ГРП/ГМП от Министра Обороны', points: 15, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Сдать проверку на реагирование от Министра Обороны', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Участие в поставках боеприпасов с Министерством Здравоохранения (за 1 заезд)', points: 5, ranks: '5-9', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'РП с заключенными (ТСР)', points: 9, ranks: 'ТСР', limit: 'Максимум 3 раза в день', dailyLimit: 3 },
    { group: 'ТСР', text: 'Повысить срок заключенным за нарушения правил (ТСР)', points: 5, ranks: 'ТСР', limit: 'Максимум 5 раз в день', dailyLimit: 5 },
    { group: 'ТСР', text: 'Посадить заключенного в карцер за нарушение правил (ТСР)', points: 5, ranks: 'ТСР', limit: 'Максимум 5 раз в день', dailyLimit: 5 }
];

TSR_ACTIONS_5_9.forEach(a => {
    if (a.dailyLimit && a.dailyLimit < 900) {
        a.dailyLimitPoints = a.dailyLimit * a.points;
    }
});

window.TSR_ACTIONS_5_9 = TSR_ACTIONS_5_9;