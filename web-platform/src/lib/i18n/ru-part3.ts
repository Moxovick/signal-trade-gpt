const dict = {
  admin: {
    sidebar: {
      groups: {
        main: "Главное",
        pocketOption: "PocketOption",
        content: "Контент",
        system: "Системное",
      },
      items: {
        overview: "Обзор",
        users: "Пользователи",
        signals: "Сигналы",
        poAccounts: "PO-аккаунты",
        postbackLog: "Postback-лог",
        postbackSetup: "Настройка постбэков",
        poApi: "API креды",
        botPerks: "Перки бота",
        assets: "Активы (пары)",
        deposits: "Депозиты",
        faq: "FAQ",
        reviews: "Отзывы",
        leaderboard: "Лидерборд",
        giveaway: "Розыгрыш",
        achievements: "Достижения",
        legal: "Правовые",
        botConfig: "Конфиг бота",
        siteSettings: "Настройки сайта",
      },
      backToDashboard: "Назад к кабинету",
    },

    dashboard: {
      title: "Admin · Обзор",
      stats: {
        users: "Пользователей",
        poAccounts: "PO-аккаунтов",
        postbacks24h: "Postback-ов / 24ч",
      },
      funnel: {
        title: "Воронка PocketOption",
        subtitle: "от лида до Pro",
        stages: {
          leads: "Лидов всего",
          poRegistration: "Регистрация в PO",
          emailConfirmed: "Подтвердили email",
          ftd: "Первый депозит",
          basicPlus: "Тир Basic+ (T1+)",
        },
        hint: "Конверсия — отношение к предыдущему шагу. Шаги PO заполняются по приходу постбэков (registration → email_confirm → ftd).",
      },
      tierDistribution: "Распределение по тирам",
      revshare: {
        title: "RevShare статистика",
        earned: "Заработано (всего)",
        avgDeposit: "Средний депозит на трейдера",
        signalsIssued: "Сигналов выдано",
      },
      poAccounts: {
        all: "Все PO-аккаунты",
        recent: "Последние PO-аккаунты",
        empty: "Пока нет привязанных PO-аккаунтов.",
      },
    },

    signals: {
      title: "Сигналы",
      subtitle: "On-demand модель: пользователи запрашивают сигналы по кнопке.",
      stats: {
        todayTotal: "Сегодня всего",
        uniqueUsers: "Уникальных юзеров",
      },
      history: "История сигналов",
      table: {
        pair: "Пара",
        direction: "Напр.",
        expiration: "Эксп.",
        tier: "Тир",
        confidence: "Уверен.",
        result: "Результат",
        user: "Юзер",
        date: "Дата",
        actions: "Действия",
      },
      empty: "Сигналов пока нет. Они появятся, когда пользователи начнут запрашивать.",
      tierSettings: {
        title: "Настройки по тирам",
        saved: "Сохранено",
        saving: "Сохраняем...",
        save: "Сохранить",
        description: "Дневные лимиты и доступные типы сигналов для каждого тира. Пустое поле лимита = безлимит.",
        dailyLimit: "Дневной лимит сигналов",
        unlimited: "Безлимит",
        availableTypes: "Доступные типы сигналов",
        proMinInterval: "Минимальный интервал между сигналами для Pro (секунды, 0 = без ограничений)",
        analysisDelay: "Задержка анализа (секунды)",
        analysisDelayHint: "Время «анализа» перед выдачей сигнала. Рандомное значение между min и max.",
      },
      rowActions: {
        deleteConfirm: "Удалить сигнал безвозвратно?",
        hide: "Скрыть от пользователей",
        makeActive: "Сделать активным",
        active: "Активен",
        hidden: "Скрыт",
      },
    },

    users: {
      title: "Управление пользователями",
      totalCount: "Всего: {n}",
      search: "Поиск по имени, username, email...",
      filters: {
        allTiers: "Все тиры",
        allStatuses: "Все статусы",
        active: "Активные",
        blocked: "Заблокированные",
      },
      empty: "Пользователи не найдены",
      status: {
        active: "Активен",
        blocked: "Заблокирован",
        pending: "Ожидание",
      },
      poStatus: {
        verified: "Верифиц.",
        pending: "Ожидание",
        rejected: "Отклонён",
      },
      loginEvents: {
        success: "Успешный вход",
        failure: "Неудачный вход",
        passwordChange: "Смена пароля",
        emailChange: "Смена email",
        otpSent: "OTP отправлен",
        otpConfirmed: "OTP подтверждён",
        otpExpired: "OTP истёк",
      },
      sort: {
        registeredAt: "Дата регистрации",
        lastLogin: "Последний вход",
        depositAmount: "Сумма депозита",
        signalCount: "Кол-во сигналов",
        tier: "Тир",
      },
      timeAgo: {
        never: "никогда",
        justNow: "только что",
        minutesAgo: "{n} мин. назад",
        hoursAgo: "{n} ч. назад",
        daysAgo: "{n} дн. назад",
      },
      table: {
        user: "Пользователь",
        tier: "Тир",
        deposit: "Депозит",
        signals: "Сигналы",
        winRate: "Win rate",
        po: "PO",
        status: "Статус",
        lastLogin: "Вход",
        registeredAt: "Рег-ция",
      },
      detail: {
        tabs: {
          profile: "Профиль",
          activity: "Активность",
          logins: "Входы",
        },
        profile: {
          basicInfo: "Основная информация",
          name: "Имя",
          role: "Роль",
          registeredAt: "Регистрация",
          lastLogin: "Последний вход",
          referralCode: "Реф. код",
          tradingStats: "Торговая статистика",
          signals: "Сигналов",
          winRate: "Win rate",
          wins: "Победы",
          losses: "Поражения",
          streakDays: "Серия дней",
          today: "Сегодня",
          pocketOption: "PocketOption",
          poStatus: "Статус",
          poDeposit: "Депозит (PO)",
          revShare: "RevShare",
          ftd: "FTD",
          lastPostback: "Последний постбэк",
          noPoAccount: "PO-аккаунт не привязан",
        },
        roles: {
          admin: "Админ",
          user: "Юзер",
        },
        empty: {
          activity: "Нет записей активности",
          logins: "Нет записей входа",
          notFound: "Пользователь не найден",
        },
      },
    },

    deposits: {
      title: "ДЕПОЗИТЫ",
      subtitle: "Депозиты пользователей",
      stats: {
        confirmed: "Подтверждено",
        pending: "Ожидают",
        total: "Всего",
      },
      table: {
        date: "Дата",
      },
      status: {
        confirmed: "Подтверждён",
        pending: "Ожидает",
        rejected: "Отклонён",
      },
      empty: "Депозитов пока нет",
    },

    leads: {
      title: "ЛИДЫ",
      subtitle: "Все пользователи с детальной информацией",
      stats: {
        total: "Всего",
        today: "Сегодня",
      },
      table: {
        user: "Пользователь",
        tier: "Тир",
        deposit: "Депозит",
        signals: "Сигналов",
        referrals: "Рефералы",
        source: "Источник",
        date: "Дата",
        status: "Статус",
      },
    },

    analytics: {
      title: "ПОЛНАЯ АНАЛИТИКА",
      subtitle: "Все метрики платформы в одном месте",
      sections: {
        users: "ПОЛЬЗОВАТЕЛИ",
        tiers: "ТИРЫ",
        signals: "СИГНАЛЫ",
        results: "РЕЗУЛЬТАТЫ",
        deposits: "ДЕПОЗИТЫ",
        referrals: "РЕФЕРАЛЫ",
      },
      items: {
        total: "Всего",
        today: "Сегодня",
        week: "За неделю",
        month: "За месяц",
        poAccounts: "PO аккаунтов",
        exchange: "Биржевые",
        pending: "Ожидают",
        onVerification: "на верификации",
        totalReferrals: "Всего рефералов",
      },
    },

    leaderboard: {
      title: "Лидерборд — Топ 10",
      reset: "Сбросить (рандом)",
      saving: "Сохранение...",
      save: "Сохранить",
      loading: "Загрузка...",
      saved: "Сохранено",
      columns: {
        nick: "Ник",
        earned: "Заработали ($)",
        signals: "Сигналы",
      },
    },

    achievements: {
      title: "Достижения",
      description: "Каталог бейджей задан в коде (lib/achievements.ts). Если изменил список в коде — нажми «Пересеять».",
      stats: {
        totalBadges: "Всего бейджей",
        issuedToUsers: "Выдано пользователям",
        totalUsers: "Всего юзеров",
      },
      catalogue: "Каталог",
      reseed: {
        error: "Не получилось пересеять",
        reseeding: "Пересеиваю...",
        reseed: "Пересеять",
      },
    },

    perks: {
      title: "Перки бота",
      active: "активных",
      create: "Создать перк",
      loading: "Загружаем…",
      empty: "Перков пока нет. Нажми «Создать перк» — опубликуй привилегии, которые откроет тир.",
      editTitle: "Редактировать перк",
      newTitle: "Новый перк",
      fields: {
        code: "Код (уникальный, A-Z_-)",
        minTier: "Минимальный тир",
        name: "Название",
        description: "Описание",
        active: "Активен",
      },
      buttons: {
        cancel: "Отмена",
        saving: "Сохраняем…",
        save: "Сохранить",
      },
      configError: "Config — невалидный JSON.",
    },

    settings: {
      tierThresholds: {
        title: "Пороги депозита (USD)",
        description: "3-тирная модель: Free — рег, Basic — депозит ≥ T1, Pro — депозит ≥ T2. T3/T4 выключены.",
        t1: "T1 · Basic",
        t2: "T2 · Pro",
      },
      refLinkTemplate: {
        title: "PocketOption · шаблон реферальной ссылки",
        description: "Поддерживается плейсхолдер {click_id} — он подставляется как user.id.",
      },
      partnerAccountId: {
        title: "PocketOption · partner account ID",
      },
      subAffiliate: {
        title: "Sub-affiliate (%)",
        description: "Сколько процентов от FTD рефералов 2-го уровня мы выплачиваем нашему юзеру.",
      },
      disclaimer: "Дисклеймер",
      buttons: {
        saving: "Сохраняем…",
        save: "Сохранить",
        savedAt: "Сохранено в {time}",
      },
    },

    poApi: {
      errors: {
        notConfigured: "Не настроено: задай api token и partner id выше и сохрани.",
        notFound: "PO вернул 404. Этого трейдера нет в нашей сети — он не регался по нашей ссылке.",
        unauthorized: "PO вернул 401/403. Проверь api token и partner id.",
        networkError: "Не дозвонились до PO. Попробуй ещё раз.",
        unexpectedFormat: "PO ответил, но в неожиданном формате. Возможно изменилась схема API.",
        invalidTraderId: "ID трейдера должен быть числом 4–12 цифр.",
        emptyTraderId: "Введи ID трейдера.",
        nothingToSave: "Нечего сохранять — введи новое значение.",
      },
      sourceBadges: {
        fromDb: "из БД",
        fromEnv: "из .env",
        notSet: "не задано",
      },
      apiToken: {
        description: "Секретный токен, выданный сапортом PocketOption.",
        replace: "Заменить",
        cancel: "Отмена",
      },
      partnerId: {
        description: "Числовой ID партнёра с pocketpartners.com (вкладка «Профиль»).",
      },
      buttons: {
        saving: "Сохраняем…",
        save: "Сохранить",
        savedAt: "Сохранено в {time}",
        error: "Ошибка: {msg}",
      },
      test: {
        title: "Проверка API",
        description: "Введи ID реального трейдера из нашей сети — сайт сделает запрос к PocketOption Affiliate API с текущими кредами.",
        placeholder: "ID трейдера, напр. 1234567",
        requesting: "Запрашиваем…",
        request: "Запросить",
        traderFound: "Трейдер найден в нашей сети.",
        noFtd: "FTD не зафиксирован",
      },
    },

    botConfig: {
      sections: {
        welcome: "Приветственное сообщение бота",
        signalTemplate: "Шаблон сообщения сигнала",
        onDemandModel: "Модель сигналов: On-demand",
        tierThresholds: "Пороги депозита для тиров (USD)",
        tierPerks: "Перки на тир",
        priceSource: "Источник цен",
        faq: "FAQ бота ({n})",
        disclaimer: "Дисклеймер",
      },
      featureFlags: {
        chartWithIndicators: "График с RSI / MACD / объёмом",
        earlyAccess: "Ранний доступ (сек)",
        elitePairs: "Elite-пары (≥90%)",
      },
      priceProvider: {
        provider: "Провайдер",
        disabled: "Выкл (генерировать случайно)",
        yahoo: "Yahoo Finance (15-min задержка)",
        binance: "Binance (только крипта)",
        pocketOption: "PocketOption (когда дадут API)",
        endpoint: "Endpoint (необязательно)",
        apiKey: "API ключ (если требуется)",
      },
      faqFields: {
        question: "Вопрос",
        answer: "Ответ",
        addQuestion: "Добавить вопрос",
      },
      buttons: {
        saving: "Сохраняем…",
        save: "Сохранить весь конфиг",
        savedAt: "Сохранено в {time}",
      },
    },

    postbacks: {
      title: "PocketOption · postbacks",
      table: {
        time: "Время",
        event: "Событие",
        poId: "PO ID",
        user: "Пользователь",
        amount: "Сумма",
        click: "Click",
      },
      empty: "Postback-ов ещё не было.",
    },

    postbackSetup: {
      events: {
        registration: {
          name: "Регистрация",
          description: "Трейдер зарегистрировался по нашей ссылке.",
        },
        emailConfirm: {
          name: "Подтверждение email",
          description: "Трейдер подтвердил почту на PocketOption.",
        },
        ftd: {
          name: "FTD — первый депозит",
        },
        redeposit: {
          name: "Повторный депозит",
          description: "Каждый последующий депозит. Сумма — {sumdep}.",
        },
        commission: {
          name: "Комиссия (RevShare)",
        },
        withdrawal: {
          name: "Вывод средств",
        },
      },
      howTo: {
        title: "Как это вставить в Pocket Partners",
        steps: {
          step1: "Войди в Pocket Partners → Офферы → Постбэки",
          step2: "Нажми «Добавить постбэк»",
          step3: "Вставь URL выше в поле «URL постбэка»",
          step4: "Выбери событие (регистрация / FTD / депозит) и сохрани",
        },
      },
      macroCrib: "Шпаргалка по макросам PO",
      urlTitle: "URL для вставки в Pocket Partners",
      secret: {
        title: "Секрет постбэков",
        placeholder: "ВСТАВЬ_СЕКРЕТ",
        confirmGenerate: "Сгенерировать новый секрет? Это инвалидирует все текущие постбэки от PocketOption — нужно обновить URL в Pocket Partners.",
        sources: {
          env: "Задан через переменную окружения POCKETOPTION_POSTBACK_SECRET (только для чтения).",
          db: "Задан и сохранён в БД.",
          none: "Не задан. Постбэки будут отклонены.",
        },
        status: {
          set: "задан · {source}",
          notSet: "не задан",
        },
        buttons: {
          hide: "Скрыть",
          show: "Показать",
          copied: "Скопировано",
          copy: "Копировать",
          generateNew: "Сгенерировать новый",
          generate: "Сгенерировать секрет",
          showCurrent: "Показать текущий",
        },
      },
      errors: {
        copyFailed: "Не удалось скопировать. Скопируй вручную.",
        generic: "Ошибка: {error}",
      },
    },

    bindUnmatched: {
      errors: {
        noAccess: "Нет доступа.",
        noUserId: "Не указан user_id.",
        postbackNotFound: "Postback не найден.",
        alreadyBound: "Этот postback уже привязан.",
        userNotFound: "Пользователь не найден.",
        noTraderId: "Не указан PocketOption trader id.",
        traderIdTaken: "Этот trader_id уже привязан к другому пользователю.",
      },
      ui: {
        bind: "Привязать",
        bound: "Привязано",
        title: "Привязать postback к пользователю",
        close: "Закрыть",
        noMatches: "Нет совпадений.",
        searching: "Ищу…",
        find: "Найти",
        user: "Юзер:",
        change: "Сменить",
        binding: "Привязываем…",
        searchError: "Не удалось искать пользователей.",
        networkError: "Сетевая ошибка, попробуй ещё раз.",
        error: "Ошибка",
      },
    },

    poAccounts: {
      title: "PocketOption · аккаунты",
      columns: {
        user: "Пользователь",
        poId: "PO ID",
        status: "Статус",
        tier: "Tier",
        deposit: "Депозит",
        revShare: "RevShare",
      },
      empty: "Нет привязанных аккаунтов.",
    },

    faq: {
      title: "Управление FAQ",
      total: "Всего:",
      newQuestion: "Новый вопрос",
      loading: "Загрузка…",
      deleteConfirm: "Удалить вопрос?",
      edit: "Изменить",
      form: {
        editTitle: "Редактирование",
        newTitle: "Новый вопрос",
        question: "Вопрос",
        answer: "Ответ (поддерживается перенос строк)",
        category: "Категория",
        position: "Позиция",
        visibility: "Видимость",
        save: "Сохранить",
        cancel: "Отмена",
      },
    },

    reviews: {
      title: "Отзывы",
      total: "Всего:",
      newReview: "Новый отзыв",
      loading: "Загрузка…",
      deleteConfirm: "Удалить отзыв?",
      edit: "Изменить",
      form: {
        editTitle: "Редактирование отзыва",
        newTitle: "Новый отзыв",
        authorName: "Имя автора",
        authorRole: "Роль (например \"Trader, T3\")",
        text: "Текст отзыва",
        rating: "Рейтинг (1-5)",
        position: "Позиция",
        featured: "На главной",
        visible: "Видим",
        save: "Сохранить",
        cancel: "Отмена",
      },
    },

    promo: {
      title: "ПРОМО-КОДЫ",
      subtitle: "Управление промо-кодами и акциями",
      stats: {
        total: "Всего",
        active: "Активных",
      },
      badges: {
        trialDays: "{n} дней",
        discountPercent: "{n}%",
        bonus: "Бонус",
        disabled: "Отключён",
        expired: "Истёк",
        exhausted: "Исчерпан",
      },
      usage: {
        used: "Использован",
        limit: "Лимит",
        expires: "Срок",
      },
      empty: "Промо-кодов пока нет. Создайте через API: POST /api/admin/promo",
    },

    templates: {
      title: "ШАБЛОНЫ БОТА",
      subtitle: "Управление шаблонами сообщений для Telegram-бота",
      common: "Общие шаблоны",
      count: "Шаблонов",
      disabled: "Отключён",
      subject: "Тема:",
      empty: "Шаблонов нет. Создайте через API: POST /api/admin/templates",
    },

    giveaway: {
      title: "Розыгрыш — призы",
      description: "Настройка 3 призовых мест. Отображается на /dashboard/giveaway.",
      saving: "Сохранение...",
      save: "Сохранить",
      loading: "Загрузка...",
      saved: "Сохранено",
      places: {
        first: "1-е место",
        second: "2-е место",
        third: "3-е место",
      },
      prizeLabel: "Название приза",
    },

    legal: {
      title: "Правовые страницы",
      tabs: {
        terms: "Правила использования",
        privacy: "Конфиденциальность",
      },
      hint: "Поддерживается Markdown. Заголовки, списки, **жирный**, ссылки.",
      viewPage: "Посмотреть страницу",
      loading: "Загрузка…",
      fields: {
        title: "Заголовок",
        content: "Содержимое (Markdown)",
        editor: "Редактор",
        preview: "Превью",
        published: "Опубликовано",
      },
      buttons: {
        saving: "Сохранение…",
        save: "Сохранить",
      },
    },

    assets: {
      title: "Активы (PocketOption пары)",
      headerSummary: "Всего: {n} · {n} активных · OTC: {n} · Реал: {n}",
      buttons: {
        reseed: "Пересеять из списка",
        add: "Добавить актив",
      },
      filter: {
        search: "Поиск по символу…",
        all: "Все",
      },
      categories: {
        currencies: "Валюты",
        crypto: "Крипта",
        commodities: "Сырьевые",
        stocks: "Акции",
        indices: "Индексы",
      },
      tiers: {
        otc: "OTC (T0+)",
        exchange: "Биржа (T1+)",
        elite: "Elite (T2+)",
      },
      table: {
        symbol: "Символ",
        name: "Имя",
        category: "Кат.",
        otc: "OTC",
        sigTier: "Sig.tier",
        provider: "Провайдер",
        actions: "Действия",
      },
      loading: "Загружаем…",
      actions: {
        disable: "Выключить",
        enable: "Включить",
        edit: "Редактировать",
        delete: "Удалить",
      },
      empty: "Ничего не найдено.",
      real: "Реал",
      modal: {
        editTitle: "Редактировать актив",
        newTitle: "Новый актив",
        category: "Категория",
        chartProvider: "Провайдер графика",
        noChart: "none (нет графика)",
        isOtc: "Это OTC (синтетика, без графика)",
        isActive: "Активен (показывается в публикаторе)",
        cancel: "Отмена",
        save: "Сохранить",
      },
      alerts: {
        reseeded: "Пересеяно. Добавлено новых: {n}",
        deleteConfirm: "Удалить «{symbol}»? Сигналы по этому ассету продолжат существовать, но новые создавать будет нельзя.",
      },
    },
  },

  tma: {
    home: {
      greeting: "Привет",
      level: "Уровень",
      tiers: {
        pro: "Про",
        basic: "Базовый",
        free: "Бесплатный",
      },
      getSignal: "Получить сигнал",
      choosePairExpiration: "Выбери пару и экспирацию",
      liveSignals: "Live · сигналы",
      loading: "Загружаем…",
      noSignals: "Сигналов пока нет",
      noSignalsHint: "Как только появятся новые сигналы — они отобразятся здесь и в боте.",
    },

    profile: {
      defaultName: "Трейдер",
      levelLabels: {
        pro: "Про",
        basic: "Базовый",
        free: "Бесплатный",
      },
      level: "Уровень",
      maxLevel: "Макс. уровень",
      signals: "Сигналов",
      streak: "Стрик",
      referrals: "Рефералы",
      pocketOption: {
        title: "PocketOption",
        deposit: "Депозит:",
        confirmed: "подтверждён",
        pending: "ожидание",
      },
      linkPo: {
        label: "Привязать PocketOption ID",
        hint: "Нужно для получения сигналов",
      },
      bot: {
        label: "Открыть Telegram-бот",
        hint: "Управление, настройки, уведомления",
      },
    },

    signals: {
      expirations: {
        sec30: "30 сек",
        min1: "1 мин",
        min2: "2 мин",
        min5: "5 мин",
        min15: "15 мин",
      },
      bands: {
        otc: "OTC",
        exchange: "Биржевые",
        elite: "Elite",
      },
      categories: {
        all: "Все",
        forex: "Форекс",
        crypto: "Крипто",
        stocks: "Акции",
        commodities: "Товары",
        indices: "Индексы",
      },
      analysisSteps: {
        connecting: "Подключение к рынку...",
        analyzingChart: "Анализ графика...",
        rsiMacd: "RSI + MACD проверка...",
        calcEntry: "Расчёт точки входа...",
        supportLevels: "Оценка уровней поддержки...",
        formingSignal: "Формирование сигнала...",
      },
      analyzing: "Анализируем рынок",
      result: {
        accuracy: "Точность",
        expiration: "Экспирация",
        entryAt: "Вход:",
        entryTime: "Время входа:",
        analysis: "Аналитика",
        nextSignal: "Ещё сигнал",
      },
      picker: {
        title: "Сигналы",
        remaining: "Осталось:",
        unlimited: "Безлимит",
        noPairsInCategory: "Нет пар в этой категории",
        expiration: "Экспирация",
      },
      errors: {
        dailyLimitExhausted: "Дневной лимит сигналов исчерпан",
        generationError: "Ошибка генерации сигнала",
        networkError: "Ошибка сети. Попробуйте снова.",
      },
      buttons: {
        limitExhausted: "Лимит исчерпан",
        getSignal: "Получить сигнал",
      },
    },

    signalDetail: {
      loading: "Загружаем…",
      notFound: "Сигнал не найден",
      back: "К сигналам",
      direction: {
        buy: "BUY · Вверх",
        sell: "SELL · Вниз",
      },
      stats: {
        expiration: "Экспирация",
        confidence: "Уверенность",
        status: "Статус",
      },
      otcNotice: {
        entryPoint: "Точка входа: по рынку",
        description: "OTC-актив — синтетический, графика реального рынка нет. Открывай позицию сразу по текущей цене PocketOption.",
      },
      analysis: "Анализ",
      openPo: "Открыть PocketOption",
    },

    ref: {
      title: "Реферальная программа",
      subtitle: "Пригласи друзей",
      stats: {
        invited: "Приглашено",
        subAffiliate: "Sub-affiliate",
      },
      howItWorks: {
        title: "Как это работает",
        steps: {
          step1: "Поделись своей ссылкой с другом",
          step2: "Он регистрируется в PocketOption по ней",
          step3: "Ты получаешь 5% с его первого депозита (FTD)",
        },
      },
      yourLink: "Твоя ссылка",
      copied: "Скопировано",
      copy: "Копировать",
      share: "Поделиться",
      shareText: "AI-сигналы для PocketOption — бесплатно",
    },

    calc: {
      title: "Риск-менеджмент",
      subtitle: "Калькулятор",
      deposit: "Депозит",
      tradeSize: "Размер сделки",
      result: "Результат",
      profit: "Прибыль (WIN)",
      loss: "Убыток (LOSS)",
      rrBreakeven: "R/R = {n} · Безубыток при {n}% лосс-рейт",
      hint: "Рекомендуемый размер сделки — 1–3% от депозита. Не рискуй больше, чем готов потерять.",
    },

    leaders: {
      levelMap: {
        free: "Бесплатный",
        basic: "Базовый",
        pro: "Про",
      },
      community: "Сообщество",
      title: "Лидеры",
      loading: "Загружаем…",
      empty: "Пока пусто",
      playerHash: "Игрок #{n}",
      signals: "сигн.",
    },

    shell: {
      connecting: "Подключаемся к Telegram…",
      authError: "Ошибка авторизации",
      external: {
        title: "Открой через Telegram",
        description: "Этот экран работает только внутри Telegram. Открой Mini App через нашего бота.",
      },
      register: {
        title: "Войди через Telegram",
        steps: {
          step1: "Нажми кнопку ниже — откроется наш бот",
          step2: "Введи /start — получишь ссылку для входа",
          step3: "Перейди по ссылке — и сразу попадёшь сюда",
        },
        waiting: "Ожидаем возврата…",
        loginButton: "Войти через Telegram",
      },
      pending: {
        afterLogin: "После входа вернись в Telegram — Mini App обновится автоматически.",
        afterLoginAlt: "После входа вернись в Telegram и снова открой Mini App.",
      },
      loginError: "Ошибка при входе. Попробуй ещё раз.",
      openBotAgain: "Открыть бота заново",
    },

    bottomNav: {
      home: "Главная",
      signals: "Сигналы",
      leaders: "Лидеры",
      referrals: "Рефералы",
      calc: "Калькул.",
      profile: "Профиль",
    },
  },

  tier: {
    labels: {
      0: "Бесплатный",
      1: "Базовый",
      2: "Про",
    } as Record<number, string>,
  },

  signalGen: {
    errors: {
      dailyLimitExhausted: "Дневной лимит сигналов исчерпан",
      userNotFound: "Пользователь не найден",
      pairNotAvailable: "Эта пара недоступна для вашего уровня",
    },
    direction: {
      ascending: "восходящее",
      descending: "нисходящее",
      bullish: "бычье",
      bearish: "медвежье",
    },
    rsiZones: {
      oversold: "перепроданности",
      overbought: "перекупленности",
      neutral: "нейтральной зоне",
    },
    bbPositions: {
      nearLower: "у нижней границы",
      nearUpper: "у верхней границы",
      middle: "в середине канала",
      breakoutUpper: "пробой верхней границы",
      breakoutLower: "пробой нижней границы",
    },
    analysis: {
      exchange: {
        movement: "Пара {pair} демонстрирует {dir} движение.",
        rsi: "RSI(14) = {rsi} ({rsiZone}).",
        ema: "EMA(20) = {ema20}, EMA(50) = {ema50} — пересечение {emaSignal}.",
        levels: "Поддержка: {support}, сопротивление: {resistance}",
        entryPrice: "Цена входа: {price}",
        buyConclusion: "Ожидается отбой от поддержки с продолжением роста.",
        sellConclusion: "Ожидается откат от сопротивления с продолжением снижения.",
      },
      elite: {
        header: "Мультитаймфреймовый анализ {pair}:",
        m1: "M1: RSI = {rsi} ({rsiZone}), {dir} импульс",
        ema: "EMA(20) {crossWord} EMA(50) — тренд {emaSignal}",
        emaAbove: "выше",
        emaBelow: "ниже",
        levels: "Ключевые уровни: поддержка {support}, сопротивление {resistance}",
        entry: "Вход: {price}",
        buySignal: "Сигнал BUY: цена у поддержки, RSI подтверждает разворот вверх.",
        sellSignal: "Сигнал SELL: цена у сопротивления, RSI подтверждает разворот вниз.",
        riskReward: "Risk/Reward: 1:{n}",
      },
    },
    otcTemplates: [
      "Краткосрочный анализ OTC-пары {pair}. Текущая волатильность — {volatility}%. RSI({period}) = {rsi} ({rsiZone}). Актив торгуется {bbPosition}. Момент входа: {entryPrice}. Ожидаемое движение: {direction_word} на {expiration}.",
      "OTC-инструмент {pair}: синтетическая котировка с нейронной коррекцией. Индекс силы тренда: {trendStrength}/10. EMA-коридор подтверждает {direction_word} вектор. Точка входа по рынку: {entryPrice}.",
      "Сигнал для {pair} (OTC). Паттерн: {pattern}. Объём условный (OTC-синтетика). RSI = {rsi}, зона {rsiZone}. Уровень уверенности: {confidence}%. Направление: {direction_word}. Экспирация: {expiration}.",
      "Быстрый OTC-сигнал · {pair}. Алгоритм обнаружил разворотный паттерн ({pattern}). Текущая цена: {entryPrice}. Вектор: {direction_word}. RSI = {rsi} ({rsiZone}). Время экспирации: {expiration}.",
      "Мультифакторный OTC-анализ {pair}: RSI({period}) = {rsi} ({rsiZone}), BB-положение — {bbPosition}, волатильность {volatility}%. Совокупный сигнал указывает на {direction_word} движение. Рекомендуемая экспирация: {expiration}.",
      "{pair} · OTC · экспресс. Сила сигнала: {trendStrength}/10. Направление: {direction_word}. Цена входа: {entryPrice}. Уверенность: {confidence}%.",
    ],
    patterns: [
      "Доджи",
      "Молот",
      "Поглощение",
      "Харами",
      "Пинбар",
      "Внутренний бар",
      "Двойное дно",
      "Двойная вершина",
    ],
  },

  achievementLabels: {
    first_signal: {
      name: "Первый сигнал",
      description: "Получил свой первый сигнал",
    },
    po_verified: {
      name: "PocketOption привязан",
      description: "Подтвердил PocketOption ID через партнёрку",
    },
    first_deposit: {
      name: "Первый депозит",
      description: "Открыл Basic — депозит от $20",
    },
    streak_7: {
      name: "Неделя подряд",
      description: "Заходил в кабинет 7 дней подряд",
    },
    streak_30: {
      name: "Месяц подряд",
      description: "Заходил в кабинет 30 дней подряд",
    },
    referral_1: {
      name: "Первый реферал",
      description: "Привёл первого друга",
    },
    referral_10: {
      name: "Амбассадор",
      description: "Привёл 10 друзей",
    },
  },

  emailTemplates: {
    purposes: {
      emailVerification: "Подтверждение email",
      emailChange: "Смена email",
      passwordReset: "Сброс пароля",
      loginCode: "Код входа",
      confirmationCode: "Код подтверждения",
    },
    body: {
      yourCode: "Твой код: {code}",
      validity: "Код действителен 10 минут. Если не запрашивал — просто проигнорируй письмо.",
      confirmationCode: "Твой код подтверждения:",
    },
  },

  botDefaults: {
    welcome: "Привет, {first_name}! Это SpaceSignal.\n\nТвой текущий тир: T{tier}.\n\nКоманды:\n/signals — последние сигналы\n/stats — твоя статистика\n/link — привязать PocketOption\n/help — частые вопросы",
    signalTemplate: "🎯 НОВЫЙ СИГНАЛ\n\nПара: {pair}\nНаправление: {direction_emoji} {direction_word}\nЭкспирация: {expiration}\nУверенность: {confidence}%\n{entry_line}{analysis_line}",
    disclaimer: "Сигналы предоставляются в информационных целях. Торговля бинарными опционами сопряжена с высоким риском. Прошлые результаты не гарантируют будущей доходности.",
    faq: [
      {
        question: "Как открывается доступ к сигналам?",
        answer: "Доступ привязан к депозиту на PocketOption. Чем больше депозит — тем выше тир и больше перков.",
      },
      {
        question: "Как привязать PocketOption?",
        answer: "Открой /link в боте или раздел «Кабинет → PocketOption» на сайте.",
      },
    ],
  },

  components: {
    telegramDeeplinkButton: {
      errors: {
        botNotConfigured: "Telegram-бот не настроен. Сообщи админу.",
        loginAgain: "Войди заново.",
        timeout: "Время ожидания истекло. Попробуй снова.",
        sessionError: "Не удалось создать сессию. Попробуй ещё раз.",
        linkExpired: "Срок действия ссылки истёк. Попробуй снова.",
        createLinkError: "Не удалось создать ссылку.",
      },
      waiting: {
        message: "Открыли бота — подтверди вход в Telegram.",
        reopenBot: "Открыть бота заново",
      },
      buttons: {
        creating: "Создаём ссылку…",
        login: "Войти через Telegram",
        link: "Привязать Telegram",
      },
    },
  },
} as const;

export default dict;
