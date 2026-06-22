/**
 * Ukrainian (uk) UI string dictionary.
 *
 * Complete translation of all three Russian dictionary parts (ru-part1, ru-part2, ru-part3).
 * Brand names (SpaceSignal, PocketOption, Telegram, Signal Trade GPT) are kept as-is.
 * Technical terms (OTC, RSI, MACD, EMA, etc.) are kept as-is.
 */

const dict = {
  // ---------------------------------------------------------------------------
  // Common / shared across multiple pages
  // ---------------------------------------------------------------------------
  common: {
    backToHome: "← На головну",
    register: "Зареєструватися",
    login: "Увійти",
    dashboard: "Особистий кабінет",
    openBot: "Відкрити бота",
    howItWorks: "Як це працює",
    aboutUs: "Про нас",
    updatedOn: "Оновлено",
    allReviews: "Усі відгуки",
    faq: "FAQ",
    loading: "Завантаження…",
    save: "Зберегти",
  },

  // ---------------------------------------------------------------------------
  // Navigation (SiteHeader)
  // ---------------------------------------------------------------------------
  nav: {
    howItWorks: "Як це працює",
    aboutUs: "Про нас",
    login: "Увійти",
    register: "Зареєструватися",
    closeMenu: "Закрити меню",
    openMenu: "Відкрити меню",
    cabinetFallback: "Кабінет",
    avatarAlt: "Аватар",
  },

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  footer: {
    disclaimer:
      "SpaceSignal не є фінансовим радником. Сигнали надаються в " +
      "інформаційних цілях. Торгівля бінарними опціонами пов'язана з високим ризиком " +
      "втрати коштів.",
    sectionPlatform: "Платформа",
    sectionSupport: "Підтримка",
    links: {
      howItWorks: "Як це працює",
      aboutUs: "Про нас",
      register: "Реєстрація",
      login: "Увійти",
      faq: "FAQ",
      terms: "Правила використання",
      privacy: "Конфіденційність",
      dashboard: "Особистий кабінет",
    },
  },

  // ---------------------------------------------------------------------------
  // HeroCTA component
  // ---------------------------------------------------------------------------
  heroCta: {
    register: "Зареєструватися",
    dashboard: "Особистий кабінет",
  },

  // ---------------------------------------------------------------------------
  // Preloader
  // ---------------------------------------------------------------------------
  preloader: {
    brandText: "SPACE · SIGNAL",
  },

  // ---------------------------------------------------------------------------
  // Landing page
  // ---------------------------------------------------------------------------
  landing: {
    partnerBadge: "RevShare partnership · PocketOption",

    heroTitle: "Сигнали, відкриті\nтвоїм депозитом",
    heroSubtitle:
      "Реєструйся, відкрий рахунок PocketOption за нашим посиланням — і отримуй " +
      "AI-сигнали безлімітно. Чим вищий депозит — тим глибший аналіз.",
    heroCta: "Зареєструватися",
    heroSecondary: "Як це працює",

    signalMockup: {
      liveBadge: "Live сигнал",
      otcLabel: "OTC · 3m",
      directionUp: "ВГОРУ",
      confidenceLabel: "Впевненість",
      expiresLabel: "Закінчується через",
    },

    stats: [
      { value: "87.3%", label: "середня точність" },
      { value: "12 800+", label: "трейдерів у системі" },
      { value: "24/7", label: "OTC-сигнали" },
      { value: "5%", label: "реферальний дохід" },
    ],

    stepsLabel: "Процес",
    stepsTitle: "3 кроки до першого сигналу",
    steps: [
      {
        n: "01",
        title: "Зареєструйся на сайті",
        desc: "Email + пароль. 30 секунд. Без реєстрації в Telegram.",
      },
      {
        n: "02",
        title: "Відкрий рахунок PocketOption",
        desc: "За нашим реферальним посиланням. Внеси депозит — відкрий свій тір.",
      },
      {
        n: "03",
        title: "Отримуй сигнали",
        desc: "Сигнали надходять в особистий кабінет і в Telegram-бота, якщо прив'яжеш його.",
      },
    ],

    tiersLabel: "Перки за депозитом",
    tiersTitle: "3 рівні доступу",
    tiersSubtitle:
      "Безкоштовний — для всіх, хто зареєструвався на PocketOption " +
      "за нашим реф-посиланням. Базовий — від $20. Про — від $100.",
    tiers: [
      {
        tier: 0,
        deposit: "$0",
        name: "Безкоштовний",
        perks: [
          "Реєстрація на PocketOption за нашим посиланням",
          "3 OTC-сигнали на день",
          "Доступ до особистого кабінету та бота",
        ],
      },
      {
        tier: 1,
        deposit: "від $20",
        name: "Базовий",
        perks: [
          "10 сигналів на день",
          "OTC + біржові сигнали",
          "Доступ до особистого кабінету та бота",
        ],
      },
      {
        tier: 2,
        deposit: "від $100",
        name: "Про",
        perks: [
          "Безліміт сигналів 24/7",
          "Усі типи: OTC + біржа + Elite-пари",
          "Аналітика + індикатори + поглиблений розбір",
        ],
      },
    ],

    features: [
      {
        title: "AI Confidence на кожному сигналі",
        desc: "Впевненість 73–96%. Чим вище — тим сильніший сигнал.",
      },
      {
        title: "Доступ — через реєстрацію, не через підписку",
        desc:
          "Жодних щомісячних платежів. Реєструєшся на PocketOption за нашим посиланням — " +
          "отримуєш доступ до сигналів.",
      },
      {
        title: "Повний набір інструментів від $100",
        desc:
          "З депозитом від $100 відкривається Про: безліміт сигналів, усі типи, " +
          "графіки з RSI/MACD та аналітика.",
      },
      {
        title: "Прозоро та автоматично",
        desc:
          "PocketOption надсилає нам Postback — ми бачимо депозит і одразу оновлюємо тір.",
      },
    ],

    reviewsLabel: "Відгуки",
    reviewsTitle: "Що кажуть трейдери",

    faqLabel: "FAQ",
    faqTitle: "Часті запитання",
    faqAllLink: "Усі запитання",
    fallbackFaqs: [
      {
        q: "Це безкоштовно?",
        a: "Так. SpaceSignal не бере підписок. Доступ відкривається реєстрацією на PocketOption за нашим посиланням. Ми заробляємо на партнерці — тому зацікавлені в якості сигналів.",
      },
      {
        q: "Які рівні доступу?",
        a: "Free — 3 OTC-сигнали на день (після прив'язки PO). Basic (від $20) — 10 сигналів, OTC + біржові. Pro (від $100) — безліміт, усі типи + аналітика.",
      },
      {
        q: "У мене вже є акаунт PocketOption",
        a: "Якщо акаунт створений не за нашим посиланням — постбеки не надходять. Зареєструй новий акаунт за нашим реф-посиланням (можна на іншу пошту) та прив'яжи Trader ID.",
      },
      {
        q: "Де надходять сигнали?",
        a: "У Telegram-боті — кожен сигнал надходить у чат. На сайті в розділі «Сигнали» можна дивитися історію та стрічку.",
      },
      {
        q: "Як знайти свій PocketOption ID?",
        a: "На сайті PocketOption: правий верхній кут → аватарка → «Профіль». ID — це 6–9 цифр. Скопіюй та прив'яжи в особистому кабінеті або в боті командою /link.",
      },
      {
        q: "Це фінансова порада?",
        a: "Ні. SpaceSignal не є фінансовим радником. Усі сигнали — інформаційні. Торгівля бінарними опціонами пов'язана з високим ризиком.",
      },
    ],

    ctaTitle: "Готовий почати?",
    ctaSubtitle: "Реєстрація займає 30 секунд. Демо-сигнали доступні одразу.",
  },

  // ---------------------------------------------------------------------------
  // About page
  // ---------------------------------------------------------------------------
  about: {
    badge: "Про нас",
    title: "SpaceSignal",
    subtitle:
      "Платформа AI-сигналів для PocketOption. Ми не продаємо підписки і не " +
      "обіцяємо чарівних результатів. Ми даємо прозорий інструмент: " +
      "технічний аналіз + AI-confidence на кожному сигналі, прив'язаний " +
      "до твого реального депозиту на брокері.",
    values: [
      {
        title: "Жодних підписок",
        desc:
          "Доступ відкривається депозитом на PocketOption — не щомісячним платежем нам. " +
          "Ми заробляємо на партнерці (RevShare), не на тобі.",
      },
      {
        title: "Прозоро",
        desc:
          "Тіри та пороги депозиту публічні. Confidence на кожному сигналі. " +
          "Дисклеймер: торгівля бінарними опціонами ризикована.",
      },
      {
        title: "AI + реальні дані",
        desc:
          "Сигнали генеруються на основі технічного аналізу та історичних даних PocketOption. " +
          "Старші тіри бачать графіки з RSI / MACD / об'ємом.",
      },
      {
        title: "Реферальна програма",
        desc:
          "Запрошуй друзів за своїм посиланням — отримуй 5% від їхніх депозитів. " +
          "Жодних обмежень на кількість рефералів.",
      },
    ],
    howWeEarnTitle: "Як ми заробляємо",
    howWeEarnBody1:
      "Ми партнер PocketOption за програмою RevShare. Коли ти відкриваєш " +
      "у них рахунок за нашим посиланням і торгуєш — PocketOption платить нам " +
      "відсоток від їхньої комісії за тебе. Це відбувається автоматично, " +
      "жодних прихованих списань чи підписок.",
    howWeEarnBody2:
      "Тому нам вигідно, щоб ти торгував успішно — чим довше ти в " +
      "системі, тим довше PocketOption нам платить. Цей збіг " +
      "інтересів ми й закріпили в тір-системі: чим більший твій депозит, " +
      "тим більше ми вкладаємо в твій аналіз.",
    disclaimerTitle: "Дисклеймер",
    disclaimerBody:
      "SpaceSignal не є фінансовим радником. Усі сигнали " +
      "надаються в інформаційних цілях. Торгівля бінарними " +
      "опціонами пов'язана з високим ризиком втрати коштів. Минулі " +
      "результати не гарантують майбутньої дохідності. Рішення про відкриття " +
      "угоди приймаєш ти, на свій ризик.",
    ctaTitle: "Готовий спробувати?",
    ctaSubtitle: "Реєстрація — 30 секунд. Демо-сигнали доступні без депозиту.",
    ctaRegister: "Зареєструватися",
    ctaHowItWorks: "Як це працює",
  },

  // ---------------------------------------------------------------------------
  // How it works page
  // ---------------------------------------------------------------------------
  howItWorks: {
    badge: "Як це працює",
    title: "Від реєстрації до першого сигналу — 5 хвилин",
    subtitle: "Нижче — кожен крок по порядку. Без сюрпризів.",
    steps: [
      {
        n: "01",
        title: "Реєстрація на сайті",
        desc:
          "Email + пароль. 30 секунд. Жодних ботів і Telegram на старті — все на сайті. " +
          "Після реєстрації одразу потрапляєш на крок прив'язки PO.",
      },
      {
        n: "02",
        title: "Відкрий рахунок PocketOption за нашим посиланням",
        desc:
          "Реєстрація на PO безкоштовна і займає 1 хвилину. Це важливо: доступ до кабінету " +
          "відкривається лише тим, хто зареєструвався саме за нашим реф-посиланням. Свій Trader ID " +
          "вводиш у кабінеті — перевіряємо через PO Affiliate API.",
      },
      {
        n: "03",
        title: "Працюєш безкоштовно або підвищуй рівень",
        desc:
          "Одразу після прив'язки PO доступний Безкоштовний рівень: 3 OTC-сигнали на день. " +
          "Від $20 — Базовий (10 сигналів, OTC + біржа). Від $100 — Про (безліміт, усі типи + аналітика).",
      },
      {
        n: "04",
        title: "Прив'яжи Telegram-бота (необов'язково)",
        desc:
          "Якщо хочеш отримувати сигнали push-сповіщеннями в Telegram — прив'яжи акаунт " +
          "у /dashboard/settings. Без цього сигнали все одно надходять в особистий кабінет на сайті.",
      },
    ],
    tiersLabel: "Що відкривається на кожному тірі",
    tiersTitle: "3 рівні доступу",
    tiers: [
      {
        tier: 0,
        name: "Безкоштовний",
        deposit: "$0",
        desc:
          "Для всіх, хто зареєструвався на PocketOption за нашим посиланням. " +
          "3 OTC-сигнали на день, особистий кабінет і Telegram-бот — безкоштовно.",
      },
      {
        tier: 1,
        name: "Базовий",
        deposit: "від $20",
        desc: "Депозит від $20 — 10 сигналів на день, OTC + біржові. Доступ до кабінету та бота.",
      },
      {
        tier: 2,
        name: "Про",
        deposit: "від $100",
        desc:
          "Депозит від $100 — безліміт сигналів. Усі типи (OTC + біржа + Elite). " +
          "Графіки з RSI/MACD, поглиблений розбір та аналітика.",
      },
    ],
    features: [
      {
        title: "Сигнали з'являються автоматично",
        desc:
          "AI генерує 24/7. Ти отримуєш push у кабінет (і в Telegram, якщо прив'язав бота).",
      },
      {
        title: "Поглиблений аналіз у Про",
        desc:
          "Сигнал надходить із графіком: RSI, MACD, об'єм, рівні support/resistance. " +
          "Бачиш не просто 'вгору/вниз', а чому.",
      },
    ],
    ctaTitle: "Почни просто зараз",
    ctaSubtitle: "Реєстрація безкоштовна. Демо-режим доступний без депозиту.",
    ctaRegister: "Зареєструватися",
  },

  // ---------------------------------------------------------------------------
  // Login page
  // ---------------------------------------------------------------------------
  login: {
    title: "Увійти",
    subtitle: "Один клік через Telegram-бота — без номера, без пароля.",
    telegramNotConfigured:
      "Telegram Login поки не налаштований (потрібен NEXT_PUBLIC_TELEGRAM_LOGIN_BOT). Використовуй email/пароль нижче.",
    dividerOr: "або логін / пароль",
    noAccount: "Немає акаунту?",
    registerLink: "Зареєструватися",
    backToHome: "На головну",
    form: {
      loginLabel: "Логін",
      loginPlaceholder: "Твій логін",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Пароль",
      submitButton: "Увійти",
      submittingButton: "Входимо...",
      invalidCredentials: "Невірний логін або пароль",
    },
  },

  // ---------------------------------------------------------------------------
  // Register page
  // ---------------------------------------------------------------------------
  register: {
    title: "Реєстрація",
    subtitle: "Створи акаунт за 30 секунд. Потрібні лише логін, пароль і Telegram.",
    dividerTelegram: "або швидко через telegram",
    telegramRegisterButton: "Зареєструватися через Telegram",
    hasAccount: "Вже є акаунт?",
    loginLink: "Увійти",
    backToHome: "На головну",
    form: {
      loginLabel: "Логін",
      loginPlaceholder: "Придумай логін",
      telegramLabel: "Telegram",
      telegramPlaceholder: "@username в Telegram",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Мінімум 6 символів",
      confirmLabel: "Повтори пароль",
      confirmPlaceholder: "Ще раз",
      submitButton: "Створити акаунт",
      submittingButton: "Створюємо акаунт...",
      autoLoginButton: "Входимо в акаунт...",
      autoLoginError: "Акаунт створено, але автологін не вдався. Увійди вручну.",
    },
  },

  // ---------------------------------------------------------------------------
  // FAQ page
  // ---------------------------------------------------------------------------
  faq: {
    badge: "FAQ",
    title: "Часті запитання",
    subtitle:
      "Все що потрібно знати про SpaceSignal, тіри, прив'язку акаунту PocketOption та " +
      "реферальну програму.",
    emptyState: "FAQ ще не налаштовано. Завітай пізніше.",
    categories: {
      registration: "Реєстрація та депозит",
      promocode: "Промокоди та бонуси",
      signals: "Сигнали та робота бота",
      tiers: "Рівні доступу",
      referral: "Реферальна програма",
      giveaway: "Розіграші та призи",
      general: "Загальні питання",
    },
    ctaTitle: "Залишилися питання?",
    ctaSubtitle: "Напиши нам прямо в Telegram-бота — підтримка відповідає протягом години.",
    ctaButton: "Відкрити бота",
  },

  // ---------------------------------------------------------------------------
  // Reviews page
  // ---------------------------------------------------------------------------
  reviews: {
    badge: "Відгуки трейдерів",
    title: "Що кажуть трейдери",
    avgRatingLabel: "середній рейтинг",
    reviewsCountLabel: "відгуків",
    featuredLabel: "Featured",
    allReviewsLabel: "Усі відгуки",
    emptyState: "Відгуків поки немає — будь першим.",
    ctaTitle: "Готовий поділитися досвідом?",
    ctaSubtitle:
      "Напиши нам у боті після першого тижня — найкращі відгуки потраплять на головну.",
    ctaButton: "Відкрити бота",
  },

  // ---------------------------------------------------------------------------
  // Terms page
  // ---------------------------------------------------------------------------
  terms: {
    badge: "Legal",
    updatedPrefix: "Оновлено",
  },

  // ---------------------------------------------------------------------------
  // Privacy page
  // ---------------------------------------------------------------------------
  privacy: {
    badge: "Legal",
    updatedPrefix: "Оновлено",
  },

  // ---------------------------------------------------------------------------
  // Giveaway / Bonus program page
  // ---------------------------------------------------------------------------
  giveaway: {
    heroTitle: "Бонусна програма",
    heroSubtitle:
      "Кожен депозит на PocketOption підвищує твій рівень і відкриває " +
      "нові привілеї. Без підписок — лише результат.",
    progressLabel: "Твій прогрес",
    depositLabel: "депозит",
    maxLevelReached: "Максимальний рівень",
    tiersTitle: "Рівні доступу",
    tiersSubtitle: "Три рівні — від безкоштовного до безлімітного",
    prizesLabel: "Призи",
    tierUnlocked: "Доступно",
    tierLocked: "{deposit} для доступу",
    tierStart: "Почати",
    howItWorksTitle: "Як це працює",
    howItWorksSteps: [
      {
        num: "1",
        title: "Реєстрація",
        desc: "Створи акаунт на PocketOption за нашим реферальним посиланням і прив'яжи ID.",
      },
      {
        num: "2",
        title: "Депозит",
        desc: "Рівень підвищується автоматично при поповненні. Від $20 — Basic, від $100 — Pro.",
      },
      {
        num: "3",
        title: "Бонуси",
        desc: "Отримуй більше сигналів, аналітику та бонусні нагороди на кожному рівні.",
      },
    ],
    ctaTitle: "Готовий почати?",
    ctaSubtitle:
      "Приєднуйся до платформи та почни отримувати торгові сигнали безкоштовно. " +
      "Підвищуй рівень для доступу до преміум-аналітики.",
    ctaOpenBot: "Відкрити бота",
    ctaDashboard: "Особистий кабінет",
    tiers: [
      {
        tier: 0,
        name: "Free",
        deposit: "Реєстрація",
        perks: [
          "3 OTC-сигнали на день",
          "Доступ до дашборду",
          "Базові досягнення",
        ],
      },
      {
        tier: 1,
        name: "Basic",
        deposit: "від $20",
        perks: [
          "10 сигналів на день",
          "OTC + біржові сигнали",
          "Розширена аналітика",
        ],
      },
      {
        tier: 2,
        name: "Pro",
        deposit: "від $100",
        perks: [
          "Безлімітні сигнали",
          "OTC + біржа + Elite",
          "Пріоритетна підтримка",
        ],
      },
    ],
    progressUntil: (nextTierName: string, amount: number) =>
      `До ${nextTierName} — $${amount}`,
  },

  // ---------------------------------------------------------------------------
  // Onboarding — PO ID gate
  // ---------------------------------------------------------------------------
  onboarding: {
    poId: {
      pageTitle: "Прив'язка PocketOption — SpaceSignal",
      stepBadge: "Крок 2 з 2 — прив'язка акаунту",
      title: "Прив'яжи свій PocketOption",
      subtitle:
        "Щоб відкрити доступ до сигналів, зареєструйся на PocketOption за " +
        "нашим посиланням і прив'яжи свій ID. Це займає 1 хвилину.",
      step1Title: "Зареєструйся на PocketOption",
      step1Desc: "Використовуй саме наше посилання — без нього ID не пройде перевірку.",
      step1Button: "Відкрити PocketOption",
      step2Title: "Введи свій PO ID",
      step2Desc:
        "ID — числовий, зазвичай 7-9 цифр. Знайдеш його в Профіль → мій ID на PocketOption.",
      existingAccountNote:
        "Якщо у тебе вже є PocketOption-акаунт, не прив'язаний до нашої партнерки —",
      existingAccountLink: "що робити?",
    },

    poIdExisting: {
      pageTitle: "Потрібен новий акаунт PocketOption",
      title: "Потрібен новий акаунт PocketOption",
      body1:
        "Платформа SpaceSignal працює лише з трейдерами, " +
        "які зареєструвалися на PocketOption через наше " +
        "партнерське посилання. Існуючий акаунт прив'язати не " +
        "вдасться — ми не зможемо зіставити твою активність.",
      body2prefix: "Рішення: створи",
      body2new: "новий",
      body2suffix:
        " акаунт на PocketOption (на іншу пошту), перейди за " +
        "посиланням нижче і прив'яжи новий ID.",
      howToLabel: "Як це зробити",
      howToSteps: [
        "Відкрий PocketOption за нашим посиланням (кнопка нижче).",
        "Зареєструйся — бажано на інший email.",
        "У Профілі PO скопіюй свій числовий ID.",
        "Повернися і прив'яжи ID на попередньому кроці.",
      ],
      createAccountButton: "Створити новий акаунт PocketOption",
      backButton: "Назад до прив'язки ID",
      supportNote: "Питання? Напиши в підтримку",
      supportBotLink: "наш бот",
    },

    poIdForm: {
      placeholder: "Наприклад: 130769421",
      submitButton: "Прив'язати та увійти",
      submittingButton: "Перевіряємо…",
      existingAccountLink: "У мене вже є PO-акаунт →",
      errors: {
        invalid_trader_id:
          "ID має складатися з 6–12 цифр. Без пробілів та інших символів.",
        trader_id_taken:
          "Цей PO ID вже прив'язаний до іншого акаунту на нашій платформі.",
        not_in_our_network:
          "Цей ID не знайдено в нашій партнерській мережі. Зареєструйся ЗАНОВО за нашим посиланням вище — інакше сигнали не відкрити.",
        po_unreachable:
          "PocketOption тимчасово не відповідає. Спробуй ще раз через хвилину.",
        unauthorized: "Потрібно увійти знову.",
        missing_trader_id: "Введи свій PO ID.",
        fallback: "Не вдалося прив'язати ID. Спробуй пізніше.",
        invalidFallback: "Невірний ID",
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Part 2 — Dashboard
  // ---------------------------------------------------------------------------

  dashboardNav: {
    signals: "Сигнали",
    referrals: "Реферали",
    giveaway: "Розіграш",
    leaderboard: "Лідерборд",
    settings: "Налаштування",
    telegramBot: "Telegram-бот",
    profile: "Профіль",
    logout: "Вийти",
    avatar: "Аватар",
    menu: "Меню",
  },

  telegramBanner: {
    title: "Прив'яжи Telegram за 30 секунд",
    step1: "Крок 1",
    step2: "Крок 2",
    step3: "Крок 3",
    idleDescription:
      "Натисни кнопку нижче — відкриється наш Telegram-бот.\nТам потрібно натиснути лише «Запустити» (Start).",
    openBot: "Відкрити бота",
    creatingLink: "Створюємо посилання…",
    waitingDescription:
      "Чудово! Тепер перейди в Telegram і натисни\nкнопку «Запустити» внизу чату з ботом.",
    waitingConfirmation: "Очікуємо підтвердження...",
    reopenBot: "Відкрити бота знову",
    linked: "Telegram прив'язано! Сигнали надходитимуть прямо в чат.",
    retry: "Спробувати знову",
    dismiss: "Закрити",
    errorTimeout: "Час очікування вичерпано.",
    errorLinkExpired: "Термін дії посилання закінчився.",
    errorBotNotConfigured: "Telegram-бот не налаштований. Повідом адміну.",
    errorUnauthorized: "Увійди знову.",
    errorLinkFailed: "Не вдалося створити посилання.",
    errorNetwork: "Помилка мережі. Спробуй знову.",
  },

  profile: {
    memberSince: "З нами з",
    depositOnPO: "Депозит на PO",
    maxLevel: "Максимальний рівень",
    untilNextTier: "До",
    moreNeeded: "ще $",
    statSignals: "Сигналів",
    statReferrals: "Рефералів",
    personalData: "Особисті дані",
    pocketOption: "PocketOption",
    relink: "Переприв'язати",
    link: "Прив'язати →",
    accountNotLinked: "Акаунт не прив'язано.",
    linkAccount: "Прив'язати →",
    labelTraderId: "Trader ID",
    labelDeposit: "Депозит",
    labelStatus: "Статус",
    statusVerified: "Підтверджено",
    statusPending: "Очікування",
    statusRejected: "Відхилено",
    achievements: "Досягнення",
    achievementsSub: "Бейджі за активність",
    referrals: "Реферали",
    referralsSub: "запрошено",
    depositHistory: "Історія депозитів",
    depositHistorySub: "PocketOption акаунт",
    referralLink: "Реферальне посилання",
  },

  profileEdit: {
    fieldName: "Ім'я / Нікнейм",
    fieldNamePlaceholder: "Наприклад: Anton",
    fieldUsername: "Telegram username",
    fieldUsernamePlaceholder: "без @, наприклад: anton",
    fieldAvatar: "Аватар",
    avatarAlt: "Аватар",
    uploadAvatar: "Завантажити аватар",
    avatarHint: "JPG, PNG або WebP, до 2 МБ",
    fieldEmail: "Email (не можна змінити)",
    errorFormat: "Допустимі формати: JPG, PNG, WebP",
    errorSize: "Максимальний розмір файлу — 2 МБ",
    errorProcess: "Не вдалося обробити зображення",
    errorSave: "Не вдалося зберегти (HTTP",
    saving: "Зберігаємо...",
    save: "Зберегти",
    saved: "Збережено",
  },

  referralCopy: {
    copied: "Скопійовано",
    copy: "Копіювати",
    hint: "Натисни, щоб скопіювати посилання та поділитися з другом",
  },

  emailVerification: {
    notVerified: "Email не підтверджено",
    description: "Підтверди адресу",
    descriptionSuffix: ", щоб отримувати сповіщення та увімкнути 2FA.",
    sendCode: "Надіслати код",
    sending: "Надсилання...",
    verify: "Перевірити",
    resend: "надіслати ще раз",
    verified: "Email підтверджено",
    errorSend: "Не вдалося надіслати код",
    errorCode: "Код невірний",
  },

  signals: {
    pageLabel: "Торгові сигнали",
    pageTitle: "Сигнали",
    usedOf: "Використано",
    of: "з",
    signalsToday: "сигналів сьогодні",
    receivedToday: "Отримано сьогодні:",
    unlimited: "Безліміт",
    yourSignals: "Ваші сигнали",
    records: "записів",
    noSignalsTitle: "Сигналів поки немає",
    noSignalsDesc:
      "Натисніть кнопку вище, щоб отримати ваш перший торговий сигнал.",
    limitReached: "Ліміт вичерпано",
    limitResetAt: "Ліміт оновиться о 00:00 UTC.",
    upgradeHint: "Або підвищте рівень для збільшення ліміту.",
  },

  signalRequest: {
    limitReachedToday: "Ліміт вичерпано на сьогодні",
    upgradeLevel: "Підвищити рівень",
    bandOtcLabel: "OTC",
    bandOtcDesc: "Позабіржові пари",
    bandExchangeLabel: "Біржа",
    bandExchangeDesc: "Реальні котирування",
    bandEliteLabel: "Elite",
    bandEliteDesc: "Акції, крипто, сировина",
    groupCurrencies: "Валюти",
    groupCrypto: "Криптовалюти",
    groupCommodity: "Сировина",
    groupStocks: "Акції",
    groupIndices: "Індекси",
    groupForexPairs: "Валютні пари",
    colAsset: "Актив",
    colPayout: "Виплата",
    remaining: "залишилось",
    selectExpiration: "Оберіть час експірації",
    expirationLabel: "експірація",
    exp30s: "30 сек",
    exp1m: "1 хв",
    exp2m: "2 хв",
    exp5m: "5 хв",
    exp15m: "15 хв",
    analysisScanning: "Скануємо ринок",
    analysisIndicators: "Аналізуємо індикатори",
    analysisEntry: "Визначаємо точку входу",
    analysisRisk: "Оцінка ризиків",
    analysisForming: "Формуємо сигнал",
    analysisInProgress: "Аналіз у процесі",
    accuracy: "Точність",
    analytics: "Аналітика",
    entryTime: "Час входу:",
    entry: "Вхід:",
    getNewSignal: "Отримати новий сигнал",
    errorFetch: "Не вдалося отримати сигнал. Спробуйте пізніше.",
  },

  tierHero: {
    fullAccess: "Повний доступ до всіх сигналів",
    signalsToday: "сигналів сьогодні",
    unlimitedSignals: "Безліміт сигналів",
    poNotLinked: "PO-акаунт ще не прив'язано.",
    copyIdTitle: "Скопіювати",
    untilTier: "До",
    remaining: "залишилось",
    deposit: "депозиту",
    yourPersonalLink: "Твоє персональне посилання",
    copied: "Скопійовано",
    copy: "Копіювати",
    referralHint:
      "Кожен, хто зареєструється за цим посиланням, стане твоїм рефералом.",
    openPocketOption: "Відкрити PocketOption",
    depositToTier: "Поповнити →",
    tierBasic: "Базового",
    tierPro: "Про",
  },

  tierStrip: {
    fullAccess: "Повний доступ до всіх сигналів",
    account: "Акаунт",
    details: "Детальніше",
  },

  liveSignalHero: {
    noActiveSignals: "Активних сигналів немає",
    noActiveDesc:
      "Щойно з'явиться новий сигнал — він відобразиться тут миттєво.",
    signalExpired: "Сигнал закінчився",
    liveSignal: "Live сигнал",
    expiration: "експірація",
    directionUp: "ВГОРУ",
    directionDown: "ВНИЗ",
    confidence: "Впевненість",
    entryPrice: "Вхід",
    entryTime: "Час входу",
    expired: "Закінчився",
    expiresIn: "Закінчується через",
    tierExchange: "Біржа",
  },

  signalHistory: {
    accuracy: "Точність",
    signalBreakdown: "Розбір сигналу",
    entry: "Вхід:",
    shown: "Показано",
    of: "з",
    showMore: "Показати ще",
  },

  referrals: {
    pageLabel: "Реферальна програма",
    pageTitle: "% з кожного депозиту",
    pageDesc:
      "Приводь трейдерів на SpaceSignal — отримуй % від їхніх депозитів на PocketOption назавжди.",
    statRegistered: "Зареєструвалось",
    statConnectedPo: "Підключили PO",
    statReferralDeposits: "Депозити рефералів",
    statEarned: "Зароблено",
    availableWithdraw: "Доступно до виведення:",
    awaitingUnlock: "Очікує розблокування:",
    withdrawInfo:
      "Кошти доступні через {n} днів після першого депозиту реферала. Розрахуй дату в картках рефералів нижче.",
    yourReferrals: "Твої реферали",
    persons: "осіб",
    noReferralsTitle: "Поки нікого немає",
    noReferralsDesc:
      "Поділися QR-кодом або посиланням вище. Кожен новий трейдер із депозитом дає тобі % назавжди.",
    anon: "Анонім",
    poConnected: "PO підключено",
    poNotLinked: "PO не прив'язано",
    available: "доступно",
    daysLeft: "ще",
    daysLeftSuffix: "дн.",
    awaitDeposit: "чекаємо депозит",
    noPo: "немає PO",
    moreReferrals: "+ ще",
    moreReferralsSuffix: "рефералів",
    howItWorks: "Як це працює",
    step01Title: "Ділишся посиланням",
    step01Text:
      "Скопіюй реферальне посилання або QR-код і надішли другу.",
    step02Title: "Друг реєструється",
    step02Text: "Він створює акаунт і стає твоїм рефералом.",
    step03Title: "Друг робить депозит на PocketOption",
    step03Text: "Прив'язує PO-акаунт і вносить депозит.",
    step04TitleTemplate: "Ти отримуєш %",
    step04TextTemplate: "% від кожного його депозиту нараховуються тобі назавжди.",
    ruleDays: "Правило {n} днів:",
    ruleText:
      "винагорода стає доступною до виведення через {n} днів після першого депозиту реферала. Повторні депозити зараховуються одразу.",
  },

  referralWidget: {
    program: "Реф-програма",
    invite: "Запрошуй трейдерів — отримуй 5%",
    yourLink: "Твоє посилання",
    copyLabel: "Скопіювати",
    desc: "Реферал депонує — ти отримуєш 5% від його обороту, без обмежень.",
  },

  linkPoAccountForm: {
    placeholder: "Свій ID на PocketOption",
    checking: "Перевіряємо...",
    link: "Прив'язати",
    errorInvalidId: "Невірний формат ID — має бути 4–12 цифр.",
    errorIdTaken: "Цей ID вже прив'язано до іншого користувача.",
    errorUnauthorized: "Потрібно увійти.",
    errorFallback: "Не вдалося прив'язати ID.",
  },

  dashboardGiveaway: {
    title: "Розіграш призів",
    desc: "Розіграш для всіх учасників! Чим більше успішних угод на PocketOption — тим вищий шанс виграти.",
    placeLabel: "-е місце",
    rulesTitle: "Правила участі",
    rulesText:
      "Беруть участь усі користувачі з прив'язаним PocketOption акаунтом. Переможці визначаються за кількістю успішних угод за період розіграшу.",
  },

  leaderboard: {
    title: "Рейтинг трейдерів",
    desc: "Топ-10 найкращих трейдерів платформи. Оновлюється регулярно.",
    colTrader: "Трейдер",
    colTier: "Тір",
    colEarnings: "Заробили ($)",
    colSignals: "Сигнали",
    empty: "Поки немає трейдерів у рейтингу.",
  },

  achievements: {
    progressLabel: "Прогрес",
    title: "Досягнення",
    desc: "Відкривай нові ачівки за активність у боті та на платформі.",
    unlocked: "Відкрито",
    earned: "Отримано",
    locked: "Заблоковано",
    firstSignalTitle: "Перший сигнал",
    firstSignalDesc: "Отримай свій перший AI-сигнал у боті",
    tenSignalsTitle: "Десятка",
    tenSignalsDesc: "Отримай 10 сигналів",
    fiftySignalsTitle: "На потоці",
    fiftySignalsDesc: "Отримай 50 сигналів",
    hundredSignalsTitle: "Центуріон",
    hundredSignalsDesc: "Отримай 100 сигналів",
    firstDepositTitle: "Перший депозит",
    firstDepositDesc: "Внеси перший депозит на PocketOption",
    tier1Title: "Basic-доступ",
    tier1Desc: "Відкрив Basic — депозит від $20",
    firstReferralTitle: "Перший реферал",
    firstReferralDesc: "Запроси першого друга",
    fiveReferralsTitle: "П'ятірка",
    fiveReferralsDesc: "Запроси 5 друзів",
    tenReferralsTitle: "Лідер думок",
    tenReferralsDesc: "Запроси 10 друзів",
  },

  settings: {
    title: "Налаштування",
    desc: "Керування профілем, сповіщеннями та інтеграціями",
    groupAccount: "Акаунт",
    groupIntegrations: "Інтеграції",
    groupActivity: "Активність",
    groupOther: "Інше",
    appearance: "Зовнішній вигляд",
    appearanceDesc: "Мова та часовий пояс",
    appearanceDescSidebar: "Тема, мова, часовий пояс",
    notifications: "Сповіщення",
    notificationsDesc: "Telegram, браузерні push",
    notificationsDescSidebar: "Email, Telegram, браузер",
    security: "Безпека",
    securityDesc: "Пароль, журнал входів",
    securityDescSidebar: "Пароль, 2FA, сесії",
    telegram: "Telegram",
    telegramDesc: "Прив'язка для бота та Mini App",
    telegramDescSidebar: "Прив'язка акаунту",
    pocketOption: "PocketOption",
    pocketOptionDesc: "Акаунт, депозити, історія поповнень",
    pocketOptionDescSidebar: "ID, депозити, тір",
    achievementsLabel: "Досягнення",
    achievementsDesc: "Бейджі, серії, прогрес",
    achievementsDescSidebar: "Бейджі та streak",
    referralsLabel: "Реферали",
    referralsDesc: "Посилання та статистика",
    signalsCount: "сигналів",
    tgConnected: "Прив'язано",
    tgNotConnected: "Не прив'язано",
    poVerified: "Підтверджено",
    poReview: "На перевірці",
    poRejected: "Відхилено",
    poNotConnected: "Не прив'язано",
    backNav: "Налаштування",
    backNavFallback: "Назад",
  },

  appearance: {
    pageTitle: "Зовнішній вигляд",
    pageDesc: "Мова інтерфейсу та часовий пояс.",
    langLabel: "Мова інтерфейсу",
    langRu: "Русский",
    langEn: "English",
    langUk: "Українська",
    langPartialHint:
      "Підтримка {lang} у процесі — частина текстів поки російською.",
    timezoneLabel: "Часовий пояс",
    cityLondon: "Лондон",
    cityBerlin: "Берлін",
    cityWarsaw: "Варшава",
    cityKyiv: "Київ",
    cityMinsk: "Мінськ",
    cityMoscow: "Москва",
    cityDubai: "Дубай",
    cityTashkent: "Ташкент",
    cityAlmaty: "Алмати",
    cityBangkok: "Бангкок",
    cityTokyo: "Токіо",
    cityNewYork: "Нью-Йорк",
    cityLosAngeles: "Лос-Анджелес",
    saving: "Зберігаю...",
    saved: "Збережено",
    save: "Зберегти",
    errorSave: "Не вдалося зберегти. Спробуй ще раз.",
    settingsApplied: "Налаштування застосовано",
  },

  telegramSettings: {
    statusTitle: "Telegram",
    linked: "Прив'язано",
    notLinked: "Акаунт не прив'язано. Увійди через кнопку нижче.",
    openBot: "Відкрити бот",
    manageLink: "Керування прив'язкою",
    linkAccount: "Прив'язати акаунт",
    linkDesc:
      "Прив'язка дозволяє входити в бот і Mini App без пароля, отримувати сповіщення про сигнали та підвищення тіру безпосередньо в Telegram.",
    botNotConfigured:
      "Telegram-бот не налаштовано на сервері. Зв'яжися з адміністратором.",
    privacyNote:
      "Прив'язка не передає твій номер телефону. Ми отримуємо лише ID, ім'я та username з публічного профілю Telegram.",
    telegramLinked: "Telegram прив'язано",
    unlink: "Відв'язати",
    unlinking: "Відв'язуємо…",
    unlinkError: "Не вдалося відв'язати.",
    errorUnauthorized: "Увійди знову.",
    errorBotUnavailable: "Telegram-бот тимчасово недоступний. Спробуй пізніше.",
    errorBotNotConfigured: "Telegram-бот не налаштовано на сервері.",
    linkPrompt:
      "Прив'яжеш Telegram — отримуватимеш сигнали прямо в чат і зможеш відкрити Mini App. Без введення номера: натискаєш кнопку, відкриваєш чат із ботом, натискаєш «Запустити».",
  },

  pocketoption: {
    tierFreeLabel: "Безкоштовний",
    tierFullAccess: "Повний доступ: OTC, біржові та Elite сигнали",
    tierUntil: "До",
    tierDepositRequired: "депозит $",
    tierDepositOnPO: "на PocketOption",
    depositCredited: "Депозит зараховано",
    autoUpgrade:
      "Рівень підвищується автоматично при досягненні порогу депозиту.",
    accessLevels: "Рівні доступу",
    tierCurrentBadge: "Поточний",
    tierDepositFrom: "Депозит",
    freePerks1: "3 OTC-сигнали на день",
    freePerks2: "Рандомні сигнали за запитом",
    freePerks3: "Доступ до бота та кабінету",
    basicPerks1: "10 сигналів на день",
    basicPerks2: "OTC + біржові сигнали",
    basicPerks3: "Розширені графіки",
    basicPerks4: "Пріоритетна підтримка",
    proPerks1: "Безлімітні сигнали",
    proPerks2: "Усі типи: OTC + біржа + Elite",
    proPerks3: "Аналітика та індикатори",
    proPerks4: "Ранній доступ до функцій",
    proPerks5: "Повний розбір кожного сигналу",
    tierNote:
      "Депозит рахується за сумою поповнень на прив'язаному PocketOption акаунті. Рівень підвищується автоматично через постбеки від PocketOption. Чим вищий депозит — тим більше типів сигналів і вищий денний ліміт.",
    poAccountTitle: "PocketOption акаунт",
    poLink: "Прив'язати",
    labelTraderId: "Trader ID",
    labelStatus: "Статус",
    labelTotalDeposit: "Депозитів усього",
    statusVerified: "Підтверджено",
    statusReview: "На перевірці",
    statusRejected: "Відхилено",
    registeredAt: "Зареєстровано в PO:",
    poNotLinkedTitle: "PO ID не прив'язано",
    poNotLinkedDesc:
      "Прив'яжи PocketOption акаунт, щоб отримати доступ до торгових сигналів",
    linkAccountAction: "Прив'язати акаунт",
    depositHistory: "Історія депозитів",
    operations: "операцій",
    noDepositsTitle: "Поки депозитів немає",
    noDepositsDesc:
      "Вони з'являться тут після поповнення рахунку в PocketOption",
    depositTypeFirst: "Перший",
    depositTypeRepeat: "Повтор",
  },

  security: {
    passwordTitle: "Пароль",
    passwordDescHas:
      "Зміни пароль, якщо підозрюєш що ним міг заволодіти хтось інший.",
    passwordDescNoPass:
      "У твого акаунту ще немає пароля — ти входив через Telegram. Встанови пароль, щоб мати запасний спосіб входу.",
    logTitle: "Журнал безпеки",
    logDesc: "Останні 20 подій: входи, зміни пароля, невдалі спроби.",
    currentPassword: "Поточний пароль",
    newPassword: "Новий пароль",
    confirmPassword: "Підтверди пароль",
    saving: "Зберігаю...",
    saved: "Збережено",
    changePassword: "Змінити пароль",
    setPassword: "Встановити пароль",
    errorMinLength: "Новий пароль — мінімум 8 символів",
    errorMismatch: "Паролі не збігаються",
    errorSave: "Не вдалося зберегти",
    twoFaNoEmail: "Email не вказано",
    twoFaNoEmailDesc:
      "2FA через email вимагає адреси пошти. Додай його на сторінці",
    twoFaProfileLink: "Профілю",
    twoFaLabel: "2FA через email:",
    twoFaEnabled: "увімкнено",
    twoFaDisabled: "вимкнено",
    twoFaCodeHint: "Коди надходитимуть на",
    twoFaDisable: "Вимкнути",
    twoFaEnable: "Увімкнути",
    twoFaErrorNoEmail: "Спочатку додай email у профілі",
    twoFaErrorToggle: "Не вдалося перемкнути",
    logEmpty: "Історія подій порожня",
    eventLoginOk: "Успішний вхід",
    eventLoginFail: "Невдалий вхід",
    eventPasswordChange: "Зміна пароля",
    eventEmailChange: "Зміна email",
    eventOtpSent: "Код надіслано",
    eventOtpVerified: "Код підтверджено",
    eventOtpExpired: "Код прострочено",
    uaUnknown: "Невідомо",
    uaBrowser: "Браузер",
    uaMobile: "Мобільний браузер",
    timeJustNow: "Щойно",
    timeHoursAgo: "год. тому",
  },

  notifications: {
    pageTitle: "Сповіщення",
    pageDesc:
      "Обери, які події надсилати по кожному каналу: email, Telegram, браузерний push.",
    channelTelegram: "Telegram",
    channelBrowser: "Браузер",
    eventNewSignal: "Новий сигнал",
    eventNewSignalDesc: "Публікується свіжий сигнал",
    eventSignalResult: "Результат сигналу",
    eventSignalResultDesc: "Сигнал закрився (Win / Loss)",
    eventTierUpgrade: "Підвищення тіру",
    eventTierUpgradeDesc: "Депозит відкрив новий рівень",
    eventDeposit: "Депозит",
    eventDepositDesc: "Підтвердження з PocketOption",
    eventWeeklyDigest: "Щотижневий огляд",
    eventWeeklyDigestDesc: "Статистика за тиждень",
    pushTitle: "Браузерні push-сповіщення",
    pushDesc:
      "Браузер запитає дозвіл один раз. Без нього канал «Браузер» працювати не буде.",
    requestPermission: "Запросити дозвіл",
    saving: "Зберігаю...",
    saved: "Збережено",
    save: "Зберегти",
    errorSave: "Не вдалося зберегти.",
    settingsApplied: "Налаштування застосовано",
  },

  // ---------------------------------------------------------------------------
  // Part 3 — Admin, TMA, signal generation, etc.
  // ---------------------------------------------------------------------------

  admin: {
    sidebar: {
      groups: {
        main: "Головне",
        pocketOption: "PocketOption",
        content: "Контент",
        system: "Системне",
      },
      items: {
        overview: "Огляд",
        users: "Користувачі",
        signals: "Сигнали",
        poAccounts: "PO-акаунти",
        postbackLog: "Postback-лог",
        postbackSetup: "Налаштування постбеків",
        poApi: "API креди",
        botPerks: "Перки бота",
        assets: "Активи (пари)",
        deposits: "Депозити",
        faq: "FAQ",
        reviews: "Відгуки",
        leaderboard: "Лідерборд",
        giveaway: "Розіграш",
        achievements: "Досягнення",
        legal: "Правові",
        botConfig: "Конфіг бота",
        siteSettings: "Налаштування сайту",
      },
      backToDashboard: "Назад до кабінету",
    },

    dashboard: {
      title: "Admin · Огляд",
      stats: {
        users: "Користувачів",
        poAccounts: "PO-акаунтів",
        postbacks24h: "Postback-ів / 24г",
      },
      funnel: {
        title: "Воронка PocketOption",
        subtitle: "від ліда до Pro",
        stages: {
          leads: "Лідів усього",
          poRegistration: "Реєстрація в PO",
          emailConfirmed: "Підтвердили email",
          ftd: "Перший депозит",
          basicPlus: "Тір Basic+ (T1+)",
        },
        hint: "Конверсія — відношення до попереднього кроку. Кроки PO заповнюються по приходу постбеків (registration → email_confirm → ftd).",
      },
      tierDistribution: "Розподіл за тірами",
      revshare: {
        title: "RevShare статистика",
        earned: "Зароблено (усього)",
        avgDeposit: "Середній депозит на трейдера",
        signalsIssued: "Сигналів видано",
      },
      poAccounts: {
        all: "Усі PO-акаунти",
        recent: "Останні PO-акаунти",
        empty: "Поки немає прив'язаних PO-акаунтів.",
      },
    },

    signals: {
      title: "Сигнали",
      subtitle: "On-demand модель: користувачі запитують сигнали по кнопці.",
      stats: {
        todayTotal: "Сьогодні всього",
        uniqueUsers: "Унікальних юзерів",
      },
      history: "Історія сигналів",
      table: {
        pair: "Пара",
        direction: "Напр.",
        expiration: "Експ.",
        tier: "Тір",
        confidence: "Впевн.",
        result: "Результат",
        user: "Юзер",
        date: "Дата",
        actions: "Дії",
      },
      empty: "Сигналів поки немає. Вони з'являться, коли користувачі почнуть запитувати.",
      tierSettings: {
        title: "Налаштування за тірами",
        saved: "Збережено",
        saving: "Зберігаємо...",
        save: "Зберегти",
        description: "Денні ліміти та доступні типи сигналів для кожного тіру. Порожнє поле ліміту = безліміт.",
        dailyLimit: "Денний ліміт сигналів",
        unlimited: "Безліміт",
        availableTypes: "Доступні типи сигналів",
        proMinInterval: "Мінімальний інтервал між сигналами для Pro (секунди, 0 = без обмежень)",
        analysisDelay: "Затримка аналізу (секунди)",
        analysisDelayHint: "Час «аналізу» перед видачею сигналу. Рандомне значення між min і max.",
      },
      rowActions: {
        deleteConfirm: "Видалити сигнал безповоротно?",
        hide: "Приховати від користувачів",
        makeActive: "Зробити активним",
        active: "Активний",
        hidden: "Прихований",
      },
    },

    users: {
      title: "Керування користувачами",
      totalCount: "Усього: {n}",
      search: "Пошук за ім'ям, username, email...",
      filters: {
        allTiers: "Усі тіри",
        allStatuses: "Усі статуси",
        active: "Активні",
        blocked: "Заблоковані",
      },
      empty: "Користувачів не знайдено",
      status: {
        active: "Активний",
        blocked: "Заблокований",
        pending: "Очікування",
      },
      poStatus: {
        verified: "Верифік.",
        pending: "Очікування",
        rejected: "Відхилено",
      },
      loginEvents: {
        success: "Успішний вхід",
        failure: "Невдалий вхід",
        passwordChange: "Зміна пароля",
        emailChange: "Зміна email",
        otpSent: "OTP надіслано",
        otpConfirmed: "OTP підтверджено",
        otpExpired: "OTP закінчився",
      },
      sort: {
        registeredAt: "Дата реєстрації",
        lastLogin: "Останній вхід",
        depositAmount: "Сума депозиту",
        signalCount: "К-ть сигналів",
        tier: "Тір",
      },
      timeAgo: {
        never: "ніколи",
        justNow: "щойно",
        minutesAgo: "{n} хв. тому",
        hoursAgo: "{n} год. тому",
        daysAgo: "{n} дн. тому",
      },
      table: {
        user: "Користувач",
        tier: "Тір",
        deposit: "Депозит",
        signals: "Сигнали",
        winRate: "Win rate",
        po: "PO",
        status: "Статус",
        lastLogin: "Вхід",
        registeredAt: "Реєстр.",
      },
      detail: {
        tabs: {
          profile: "Профіль",
          activity: "Активність",
          logins: "Входи",
        },
        profile: {
          basicInfo: "Основна інформація",
          name: "Ім'я",
          role: "Роль",
          registeredAt: "Реєстрація",
          lastLogin: "Останній вхід",
          referralCode: "Реф. код",
          tradingStats: "Торгова статистика",
          signals: "Сигналів",
          winRate: "Win rate",
          wins: "Перемоги",
          losses: "Поразки",
          streakDays: "Серія днів",
          today: "Сьогодні",
          pocketOption: "PocketOption",
          poStatus: "Статус",
          poDeposit: "Депозит (PO)",
          revShare: "RevShare",
          ftd: "FTD",
          lastPostback: "Останній постбек",
          noPoAccount: "PO-акаунт не прив'язано",
        },
        roles: {
          admin: "Адмін",
          user: "Юзер",
        },
        empty: {
          activity: "Немає записів активності",
          logins: "Немає записів входу",
          notFound: "Користувача не знайдено",
        },
      },
    },

    deposits: {
      title: "ДЕПОЗИТИ",
      subtitle: "Депозити користувачів",
      stats: {
        confirmed: "Підтверджено",
        pending: "Очікують",
        total: "Усього",
      },
      table: {
        date: "Дата",
      },
      status: {
        confirmed: "Підтверджено",
        pending: "Очікує",
        rejected: "Відхилено",
      },
      empty: "Депозитів поки немає",
    },

    leads: {
      title: "ЛІДИ",
      subtitle: "Усі користувачі з детальною інформацією",
      stats: {
        total: "Усього",
        today: "Сьогодні",
      },
      table: {
        user: "Користувач",
        tier: "Тір",
        deposit: "Депозит",
        signals: "Сигналів",
        referrals: "Реферали",
        source: "Джерело",
        date: "Дата",
        status: "Статус",
      },
    },

    analytics: {
      title: "ПОВНА АНАЛІТИКА",
      subtitle: "Усі метрики платформи в одному місці",
      sections: {
        users: "КОРИСТУВАЧІ",
        tiers: "ТІРИ",
        signals: "СИГНАЛИ",
        results: "РЕЗУЛЬТАТИ",
        deposits: "ДЕПОЗИТИ",
        referrals: "РЕФЕРАЛИ",
      },
      items: {
        total: "Усього",
        today: "Сьогодні",
        week: "За тиждень",
        month: "За місяць",
        poAccounts: "PO акаунтів",
        exchange: "Біржові",
        pending: "Очікують",
        onVerification: "на верифікації",
        totalReferrals: "Усього рефералів",
      },
    },

    leaderboard: {
      title: "Лідерборд — Топ 10",
      reset: "Скинути (рандом)",
      saving: "Збереження...",
      save: "Зберегти",
      loading: "Завантаження...",
      saved: "Збережено",
      columns: {
        nick: "Нік",
        earned: "Заробили ($)",
        signals: "Сигнали",
      },
    },

    achievements: {
      title: "Досягнення",
      description: "Каталог бейджів задано в коді (lib/achievements.ts). Якщо змінив список у коді — натисни «Пересіяти».",
      stats: {
        totalBadges: "Усього бейджів",
        issuedToUsers: "Видано користувачам",
        totalUsers: "Усього юзерів",
      },
      catalogue: "Каталог",
      reseed: {
        error: "Не вдалося пересіяти",
        reseeding: "Пересіюю...",
        reseed: "Пересіяти",
      },
    },

    perks: {
      title: "Перки бота",
      active: "активних",
      create: "Створити перк",
      loading: "Завантажуємо…",
      empty: "Перків поки немає. Натисни «Створити перк» — опублікуй привілеї, які відкриє тір.",
      editTitle: "Редагувати перк",
      newTitle: "Новий перк",
      fields: {
        code: "Код (унікальний, A-Z_-)",
        minTier: "Мінімальний тір",
        name: "Назва",
        description: "Опис",
        active: "Активний",
      },
      buttons: {
        cancel: "Скасувати",
        saving: "Зберігаємо…",
        save: "Зберегти",
      },
      configError: "Config — невалідний JSON.",
    },

    settings: {
      tierThresholds: {
        title: "Пороги депозиту (USD)",
        description: "3-тірна модель: Free — реєстр, Basic — депозит ≥ T1, Pro — депозит ≥ T2. T3/T4 вимкнені.",
        t1: "T1 · Basic",
        t2: "T2 · Pro",
      },
      refLinkTemplate: {
        title: "PocketOption · шаблон реферального посилання",
        description: "Підтримується плейсхолдер {click_id} — він підставляється як user.id.",
      },
      partnerAccountId: {
        title: "PocketOption · partner account ID",
      },
      subAffiliate: {
        title: "Sub-affiliate (%)",
        description: "Скільки відсотків від FTD рефералів 2-го рівня ми виплачуємо нашому юзеру.",
      },
      disclaimer: "Дисклеймер",
      buttons: {
        saving: "Зберігаємо…",
        save: "Зберегти",
        savedAt: "Збережено о {time}",
      },
    },

    poApi: {
      errors: {
        notConfigured: "Не налаштовано: задай api token і partner id вище та збережи.",
        notFound: "PO повернув 404. Цього трейдера немає в нашій мережі — він не реєструвався за нашим посиланням.",
        unauthorized: "PO повернув 401/403. Перевір api token і partner id.",
        networkError: "Не додзвонилися до PO. Спробуй ще раз.",
        unexpectedFormat: "PO відповів, але в неочікуваному форматі. Можливо змінилася схема API.",
        invalidTraderId: "ID трейдера має бути числом 4–12 цифр.",
        emptyTraderId: "Введи ID трейдера.",
        nothingToSave: "Нічого зберігати — введи нове значення.",
      },
      sourceBadges: {
        fromDb: "з БД",
        fromEnv: "з .env",
        notSet: "не задано",
      },
      apiToken: {
        description: "Секретний токен, виданий сапортом PocketOption.",
        replace: "Замінити",
        cancel: "Скасувати",
      },
      partnerId: {
        description: "Числовий ID партнера з pocketpartners.com (вкладка «Профіль»).",
      },
      buttons: {
        saving: "Зберігаємо…",
        save: "Зберегти",
        savedAt: "Збережено о {time}",
        error: "Помилка: {msg}",
      },
      test: {
        title: "Перевірка API",
        description: "Введи ID реального трейдера з нашої мережі — сайт зробить запит до PocketOption Affiliate API з поточними кредами.",
        placeholder: "ID трейдера, напр. 1234567",
        requesting: "Запитуємо…",
        request: "Запросити",
        traderFound: "Трейдер знайдений у нашій мережі.",
        noFtd: "FTD не зафіксовано",
      },
    },

    botConfig: {
      sections: {
        welcome: "Привітальне повідомлення бота",
        signalTemplate: "Шаблон повідомлення сигналу",
        onDemandModel: "Модель сигналів: On-demand",
        tierThresholds: "Пороги депозиту для тірів (USD)",
        tierPerks: "Перки на тір",
        priceSource: "Джерело цін",
        faq: "FAQ бота ({n})",
        disclaimer: "Дисклеймер",
      },
      featureFlags: {
        chartWithIndicators: "Графік з RSI / MACD / об'ємом",
        earlyAccess: "Ранній доступ (сек)",
        elitePairs: "Elite-пари (≥90%)",
      },
      priceProvider: {
        provider: "Провайдер",
        disabled: "Вимк (генерувати випадково)",
        yahoo: "Yahoo Finance (15-хв затримка)",
        binance: "Binance (тільки крипта)",
        pocketOption: "PocketOption (коли дадуть API)",
        endpoint: "Endpoint (необов'язково)",
        apiKey: "API ключ (якщо потрібен)",
      },
      faqFields: {
        question: "Запитання",
        answer: "Відповідь",
        addQuestion: "Додати запитання",
      },
      buttons: {
        saving: "Зберігаємо…",
        save: "Зберегти весь конфіг",
        savedAt: "Збережено о {time}",
      },
    },

    postbacks: {
      title: "PocketOption · postbacks",
      table: {
        time: "Час",
        event: "Подія",
        poId: "PO ID",
        user: "Користувач",
        amount: "Сума",
        click: "Click",
      },
      empty: "Postback-ів ще не було.",
    },

    postbackSetup: {
      events: {
        registration: {
          name: "Реєстрація",
          description: "Трейдер зареєструвався за нашим посиланням.",
        },
        emailConfirm: {
          name: "Підтвердження email",
          description: "Трейдер підтвердив пошту на PocketOption.",
        },
        ftd: {
          name: "FTD — перший депозит",
        },
        redeposit: {
          name: "Повторний депозит",
          description: "Кожен наступний депозит. Сума — {sumdep}.",
        },
        commission: {
          name: "Комісія (RevShare)",
        },
        withdrawal: {
          name: "Виведення коштів",
        },
      },
      howTo: {
        title: "Як це вставити в Pocket Partners",
        steps: {
          step1: "Увійди в Pocket Partners → Офери → Постбеки",
          step2: "Натисни «Додати постбек»",
          step3: "Встав URL вище в поле «URL постбека»",
          step4: "Обери подію (реєстрація / FTD / депозит) та збережи",
        },
      },
      macroCrib: "Шпаргалка по макросах PO",
      urlTitle: "URL для вставки в Pocket Partners",
      secret: {
        title: "Секрет постбеків",
        placeholder: "ВСТАВ_СЕКРЕТ",
        confirmGenerate: "Згенерувати новий секрет? Це інвалідує всі поточні постбеки від PocketOption — потрібно оновити URL в Pocket Partners.",
        sources: {
          env: "Задано через змінну оточення POCKETOPTION_POSTBACK_SECRET (лише для читання).",
          db: "Задано та збережено в БД.",
          none: "Не задано. Постбеки будуть відхилені.",
        },
        status: {
          set: "задано · {source}",
          notSet: "не задано",
        },
        buttons: {
          hide: "Приховати",
          show: "Показати",
          copied: "Скопійовано",
          copy: "Копіювати",
          generateNew: "Згенерувати новий",
          generate: "Згенерувати секрет",
          showCurrent: "Показати поточний",
        },
      },
      errors: {
        copyFailed: "Не вдалося скопіювати. Скопіюй вручну.",
        generic: "Помилка: {error}",
      },
    },

    bindUnmatched: {
      errors: {
        noAccess: "Немає доступу.",
        noUserId: "Не вказано user_id.",
        postbackNotFound: "Postback не знайдено.",
        alreadyBound: "Цей postback вже прив'язано.",
        userNotFound: "Користувача не знайдено.",
        noTraderId: "Не вказано PocketOption trader id.",
        traderIdTaken: "Цей trader_id вже прив'язано до іншого користувача.",
      },
      ui: {
        bind: "Прив'язати",
        bound: "Прив'язано",
        title: "Прив'язати postback до користувача",
        close: "Закрити",
        noMatches: "Немає збігів.",
        searching: "Шукаю…",
        find: "Знайти",
        user: "Юзер:",
        change: "Змінити",
        binding: "Прив'язуємо…",
        searchError: "Не вдалося шукати користувачів.",
        networkError: "Помилка мережі, спробуй ще раз.",
        error: "Помилка",
      },
    },

    poAccounts: {
      title: "PocketOption · акаунти",
      columns: {
        user: "Користувач",
        poId: "PO ID",
        status: "Статус",
        tier: "Tier",
        deposit: "Депозит",
        revShare: "RevShare",
      },
      empty: "Немає прив'язаних акаунтів.",
    },

    faq: {
      title: "Керування FAQ",
      total: "Усього:",
      newQuestion: "Нове запитання",
      loading: "Завантаження…",
      deleteConfirm: "Видалити запитання?",
      edit: "Змінити",
      form: {
        editTitle: "Редагування",
        newTitle: "Нове запитання",
        question: "Запитання",
        answer: "Відповідь (підтримується перенос рядків)",
        category: "Категорія",
        position: "Позиція",
        visibility: "Видимість",
        save: "Зберегти",
        cancel: "Скасувати",
      },
    },

    reviews: {
      title: "Відгуки",
      total: "Усього:",
      newReview: "Новий відгук",
      loading: "Завантаження…",
      deleteConfirm: "Видалити відгук?",
      edit: "Змінити",
      form: {
        editTitle: "Редагування відгуку",
        newTitle: "Новий відгук",
        authorName: "Ім'я автора",
        authorRole: "Роль (наприклад \"Trader, T3\")",
        text: "Текст відгуку",
        rating: "Рейтинг (1-5)",
        position: "Позиція",
        featured: "На головній",
        visible: "Видимий",
        save: "Зберегти",
        cancel: "Скасувати",
      },
    },

    promo: {
      title: "ПРОМО-КОДИ",
      subtitle: "Керування промо-кодами та акціями",
      stats: {
        total: "Усього",
        active: "Активних",
      },
      badges: {
        trialDays: "{n} днів",
        discountPercent: "{n}%",
        bonus: "Бонус",
        disabled: "Вимкнено",
        expired: "Закінчився",
        exhausted: "Вичерпано",
      },
      usage: {
        used: "Використано",
        limit: "Ліміт",
        expires: "Термін",
      },
      empty: "Промо-кодів поки немає. Створіть через API: POST /api/admin/promo",
    },

    templates: {
      title: "ШАБЛОНИ БОТА",
      subtitle: "Керування шаблонами повідомлень для Telegram-бота",
      common: "Загальні шаблони",
      count: "Шаблонів",
      disabled: "Вимкнено",
      subject: "Тема:",
      empty: "Шаблонів немає. Створіть через API: POST /api/admin/templates",
    },

    giveaway: {
      title: "Розіграш — призи",
      description: "Налаштування 3 призових місць. Відображається на /dashboard/giveaway.",
      saving: "Збереження...",
      save: "Зберегти",
      loading: "Завантаження...",
      saved: "Збережено",
      places: {
        first: "1-е місце",
        second: "2-е місце",
        third: "3-є місце",
      },
      prizeLabel: "Назва призу",
    },

    legal: {
      title: "Правові сторінки",
      tabs: {
        terms: "Правила використання",
        privacy: "Конфіденційність",
      },
      hint: "Підтримується Markdown. Заголовки, списки, **жирний**, посилання.",
      viewPage: "Переглянути сторінку",
      loading: "Завантаження…",
      fields: {
        title: "Заголовок",
        content: "Вміст (Markdown)",
        editor: "Редактор",
        preview: "Попередній перегляд",
        published: "Опубліковано",
      },
      buttons: {
        saving: "Збереження…",
        save: "Зберегти",
      },
    },

    assets: {
      title: "Активи (PocketOption пари)",
      headerSummary: "Усього: {n} · {n} активних · OTC: {n} · Реал: {n}",
      buttons: {
        reseed: "Пересіяти зі списку",
        add: "Додати актив",
      },
      filter: {
        search: "Пошук за символом…",
        all: "Усі",
      },
      categories: {
        currencies: "Валюти",
        crypto: "Крипта",
        commodities: "Сировинні",
        stocks: "Акції",
        indices: "Індекси",
      },
      tiers: {
        otc: "OTC (T0+)",
        exchange: "Біржа (T1+)",
        elite: "Elite (T2+)",
      },
      table: {
        symbol: "Символ",
        name: "Назва",
        category: "Кат.",
        otc: "OTC",
        payout: "Виплата",
        sigTier: "Sig.tier",
        provider: "Провайдер",
        actions: "Дії",
      },
      loading: "Завантажуємо…",
      actions: {
        disable: "Вимкнути",
        enable: "Увімкнути",
        edit: "Редагувати",
        delete: "Видалити",
      },
      empty: "Нічого не знайдено.",
      real: "Реал",
      modal: {
        editTitle: "Редагувати актив",
        newTitle: "Новий актив",
        category: "Категорія",
        payout: "Виплата %",
        chartProvider: "Провайдер графіка",
        noChart: "none (немає графіка)",
        isOtc: "Це OTC (синтетика, без графіка)",
        isActive: "Активний (показується в публікаторі)",
        cancel: "Скасувати",
        save: "Зберегти",
      },
      alerts: {
        reseeded: "Пересіяно. Додано нових: {n}",
        deleteConfirm: "Видалити «{symbol}»? Сигнали по цьому ассету продовжать існувати, але нові створювати буде не можна.",
      },
    },
  },

  tma: {
    home: {
      greeting: "Привіт",
      level: "Рівень",
      tiers: {
        pro: "Про",
        basic: "Базовий",
        free: "Безкоштовний",
      },
      getSignal: "Отримати сигнал",
      choosePairExpiration: "Обери пару та експірацію",
      liveSignals: "Live · сигнали",
      loading: "Завантажуємо…",
      noSignals: "Сигналів поки немає",
      noSignalsHint: "Щойно з'являться нові сигнали — вони відобразяться тут і в боті.",
    },

    profile: {
      defaultName: "Трейдер",
      levelLabels: {
        pro: "Про",
        basic: "Базовий",
        free: "Безкоштовний",
      },
      level: "Рівень",
      maxLevel: "Макс. рівень",
      signals: "Сигналів",
      streak: "Стрік",
      referrals: "Реферали",
      pocketOption: {
        title: "PocketOption",
        deposit: "Депозит:",
        confirmed: "підтверджено",
        pending: "очікування",
      },
      linkPo: {
        label: "Прив'язати PocketOption ID",
        hint: "Потрібно для отримання сигналів",
      },
      bot: {
        label: "Відкрити Telegram-бот",
        hint: "Керування, налаштування, сповіщення",
      },
    },

    signals: {
      expirations: {
        sec30: "30 сек",
        min1: "1 хв",
        min2: "2 хв",
        min5: "5 хв",
        min15: "15 хв",
      },
      bands: {
        otc: "OTC",
        exchange: "Біржові",
        elite: "Elite",
      },
      categories: {
        all: "Усі",
        forex: "Форекс",
        crypto: "Крипто",
        stocks: "Акції",
        commodities: "Товари",
        indices: "Індекси",
      },
      analysisSteps: {
        connecting: "Підключення до ринку...",
        analyzingChart: "Аналіз графіка...",
        rsiMacd: "RSI + MACD перевірка...",
        calcEntry: "Розрахунок точки входу...",
        supportLevels: "Оцінка рівнів підтримки...",
        formingSignal: "Формування сигналу...",
      },
      analyzing: "Аналізуємо ринок",
      result: {
        accuracy: "Точність",
        expiration: "Експірація",
        payout: "Виплата",
        entryAt: "Вхід:",
        entryTime: "Час входу:",
        analysis: "Аналітика",
        nextSignal: "Ще сигнал",
      },
      picker: {
        title: "Сигнали",
        remaining: "Залишилось:",
        unlimited: "Безліміт",
        noPairsInCategory: "Немає пар у цій категорії",
        expiration: "Експірація",
      },
      errors: {
        dailyLimitExhausted: "Денний ліміт сигналів вичерпано",
        generationError: "Помилка генерації сигналу",
        networkError: "Помилка мережі. Спробуйте знову.",
      },
      buttons: {
        limitExhausted: "Ліміт вичерпано",
        getSignal: "Отримати сигнал",
      },
    },

    signalDetail: {
      loading: "Завантажуємо…",
      notFound: "Сигнал не знайдено",
      back: "До сигналів",
      direction: {
        buy: "BUY · Вгору",
        sell: "SELL · Вниз",
      },
      stats: {
        expiration: "Експірація",
        confidence: "Впевненість",
        payout: "Виплата",
        status: "Статус",
      },
      otcNotice: {
        entryPoint: "Точка входу: по ринку",
        description: "OTC-актив — синтетичний, графіка реального ринку немає. Відкривай позицію одразу за поточною ціною PocketOption.",
      },
      analysis: "Аналіз",
      openPo: "Відкрити PocketOption",
    },

    ref: {
      title: "Реферальна програма",
      subtitle: "Запроси друзів",
      stats: {
        invited: "Запрошено",
        subAffiliate: "Sub-affiliate",
      },
      howItWorks: {
        title: "Як це працює",
        steps: {
          step1: "Поділися своїм посиланням із другом",
          step2: "Він реєструється в PocketOption за ним",
          step3: "Ти отримуєш 5% з його першого депозиту (FTD)",
        },
      },
      yourLink: "Твоє посилання",
      copied: "Скопійовано",
      copy: "Копіювати",
      share: "Поділитися",
      shareText: "AI-сигнали для PocketOption — безкоштовно",
    },

    calc: {
      title: "Ризик-менеджмент",
      subtitle: "Калькулятор",
      deposit: "Депозит",
      tradeSize: "Розмір угоди",
      result: "Результат",
      profit: "Прибуток (WIN)",
      loss: "Збиток (LOSS)",
      rrBreakeven: "R/R = {n} · Беззбиток при {n}% лос-рейт",
      hint: "Рекомендований розмір угоди — 1–3% від депозиту. Не ризикуй більше, ніж готовий втратити.",
    },

    leaders: {
      levelMap: {
        free: "Безкоштовний",
        basic: "Базовий",
        pro: "Про",
      },
      community: "Спільнота",
      title: "Лідери",
      loading: "Завантажуємо…",
      empty: "Поки порожньо",
      playerHash: "Гравець #{n}",
      signals: "сигн.",
    },

    shell: {
      connecting: "Підключаємося до Telegram…",
      authError: "Помилка авторизації",
      external: {
        title: "Відкрий через Telegram",
        description: "Цей екран працює лише всередині Telegram. Відкрий Mini App через нашого бота.",
      },
      register: {
        title: "Увійди через Telegram",
        steps: {
          step1: "Натисни кнопку нижче — відкриється наш бот",
          step2: "Введи /start — отримаєш посилання для входу",
          step3: "Перейди за посиланням — і одразу потрапиш сюди",
        },
        waiting: "Очікуємо повернення…",
        loginButton: "Увійти через Telegram",
      },
      pending: {
        afterLogin: "Після входу повернися в Telegram — Mini App оновиться автоматично.",
        afterLoginAlt: "Після входу повернися в Telegram і знову відкрий Mini App.",
      },
      loginError: "Помилка під час входу. Спробуй ще раз.",
      openBotAgain: "Відкрити бота знову",
    },

    bottomNav: {
      home: "Головна",
      signals: "Сигнали",
      leaders: "Лідери",
      referrals: "Реферали",
      calc: "Калькул.",
      profile: "Профіль",
    },
  },

  tier: {
    labels: {
      0: "Безкоштовний",
      1: "Базовий",
      2: "Про",
    } as Record<number, string>,
  },

  signalGen: {
    errors: {
      dailyLimitExhausted: "Денний ліміт сигналів вичерпано",
      userNotFound: "Користувача не знайдено",
      pairNotAvailable: "Ця пара недоступна для вашого рівня",
    },
    direction: {
      ascending: "висхідне",
      descending: "низхідне",
      bullish: "бичаче",
      bearish: "ведмеже",
    },
    rsiZones: {
      oversold: "перепроданості",
      overbought: "перекупленості",
      neutral: "нейтральній зоні",
    },
    bbPositions: {
      nearLower: "біля нижньої межі",
      nearUpper: "біля верхньої межі",
      middle: "посередині каналу",
      breakoutUpper: "пробій верхньої межі",
      breakoutLower: "пробій нижньої межі",
    },
    analysis: {
      exchange: {
        movement: "Пара {pair} демонструє {dir} рух.",
        rsi: "RSI(14) = {rsi} ({rsiZone}).",
        ema: "EMA(20) = {ema20}, EMA(50) = {ema50} — перетин {emaSignal}.",
        levels: "Підтримка: {support}, опір: {resistance}",
        entryPrice: "Ціна входу: {price}",
        buyConclusion: "Очікується відскок від підтримки з продовженням зростання.",
        sellConclusion: "Очікується відкат від опору з продовженням зниження.",
      },
      elite: {
        header: "Мультитаймфреймовий аналіз {pair}:",
        m1: "M1: RSI = {rsi} ({rsiZone}), {dir} імпульс",
        ema: "EMA(20) {crossWord} EMA(50) — тренд {emaSignal}",
        emaAbove: "вище",
        emaBelow: "нижче",
        levels: "Ключові рівні: підтримка {support}, опір {resistance}",
        entry: "Вхід: {price}",
        buySignal: "Сигнал BUY: ціна біля підтримки, RSI підтверджує розворот вгору.",
        sellSignal: "Сигнал SELL: ціна біля опору, RSI підтверджує розворот вниз.",
        riskReward: "Risk/Reward: 1:{n}",
      },
    },
    otcTemplates: [
      "Короткостроковий аналіз OTC-пари {pair}. Поточна волатильність — {volatility}%. RSI({period}) = {rsi} ({rsiZone}). Актив торгується {bbPosition}. Момент входу: {entryPrice}. Очікуваний рух: {direction_word} на {expiration}.",
      "OTC-інструмент {pair}: синтетичне котирування з нейронною корекцією. Індекс сили тренду: {trendStrength}/10. EMA-коридор підтверджує {direction_word} вектор. Точка входу по ринку: {entryPrice}.",
      "Сигнал для {pair} (OTC). Патерн: {pattern}. Об'єм умовний (OTC-синтетика). RSI = {rsi}, зона {rsiZone}. Рівень впевненості: {confidence}%. Напрямок: {direction_word}. Експірація: {expiration}.",
      "Швидкий OTC-сигнал · {pair}. Алгоритм виявив розворотний патерн ({pattern}). Поточна ціна: {entryPrice}. Вектор: {direction_word}. RSI = {rsi} ({rsiZone}). Час експірації: {expiration}.",
      "Мультифакторний OTC-аналіз {pair}: RSI({period}) = {rsi} ({rsiZone}), BB-положення — {bbPosition}, волатильність {volatility}%. Сукупний сигнал вказує на {direction_word} рух. Рекомендована експірація: {expiration}.",
      "{pair} · OTC · експрес. Сила сигналу: {trendStrength}/10. Напрямок: {direction_word}. Ціна входу: {entryPrice}. Впевненість: {confidence}%.",
    ],
    patterns: [
      "Доджі",
      "Молот",
      "Поглинання",
      "Харамі",
      "Пінбар",
      "Внутрішній бар",
      "Подвійне дно",
      "Подвійна вершина",
    ],
  },

  achievementLabels: {
    first_signal: {
      name: "Перший сигнал",
      description: "Отримав свій перший сигнал",
    },
    po_verified: {
      name: "PocketOption прив'язано",
      description: "Підтвердив PocketOption ID через партнерку",
    },
    first_deposit: {
      name: "Перший депозит",
      description: "Відкрив Basic — депозит від $20",
    },
    streak_7: {
      name: "Тиждень поспіль",
      description: "Заходив у кабінет 7 днів поспіль",
    },
    streak_30: {
      name: "Місяць поспіль",
      description: "Заходив у кабінет 30 днів поспіль",
    },
    referral_1: {
      name: "Перший реферал",
      description: "Привів першого друга",
    },
    referral_10: {
      name: "Амбасадор",
      description: "Привів 10 друзів",
    },
  },

  emailTemplates: {
    purposes: {
      emailVerification: "Підтвердження email",
      emailChange: "Зміна email",
      passwordReset: "Скидання пароля",
      loginCode: "Код входу",
      confirmationCode: "Код підтвердження",
    },
    body: {
      yourCode: "Твій код: {code}",
      validity: "Код дійсний 10 хвилин. Якщо не запитував — просто проігноруй листа.",
      confirmationCode: "Твій код підтвердження:",
    },
  },

  botDefaults: {
    welcome: "Привіт, {first_name}! Це SpaceSignal.\n\nТвій поточний тір: T{tier}.\n\nКоманди:\n/signals — останні сигнали\n/stats — твоя статистика\n/link — прив'язати PocketOption\n/help — часті запитання",
    signalTemplate: "🎯 НОВИЙ СИГНАЛ\n\nПара: {pair}\nНапрямок: {direction_emoji} {direction_word}\nЕкспірація: {expiration}\nВпевненість: {confidence}%\n{entry_line}{analysis_line}",
    disclaimer: "Сигнали надаються в інформаційних цілях. Торгівля бінарними опціонами пов'язана з високим ризиком. Минулі результати не гарантують майбутньої дохідності.",
    faq: [
      {
        question: "Як відкривається доступ до сигналів?",
        answer: "Доступ прив'язаний до депозиту на PocketOption. Чим більший депозит — тим вищий тір і більше перків.",
      },
      {
        question: "Як прив'язати PocketOption?",
        answer: "Відкрий /link у боті або розділ «Кабінет → PocketOption» на сайті.",
      },
    ],
  },

  components: {
    telegramDeeplinkButton: {
      errors: {
        botNotConfigured: "Telegram-бот не налаштовано. Повідом адміну.",
        loginAgain: "Увійди знову.",
        timeout: "Час очікування вичерпано. Спробуй знову.",
        sessionError: "Не вдалося створити сесію. Спробуй ще раз.",
        linkExpired: "Термін дії посилання закінчився. Спробуй знову.",
        createLinkError: "Не вдалося створити посилання.",
      },
      waiting: {
        message: "Відкрили бота — підтверди вхід у Telegram.",
        reopenBot: "Відкрити бота знову",
      },
      buttons: {
        creating: "Створюємо посилання…",
        login: "Увійти через Telegram",
        link: "Прив'язати Telegram",
      },
    },
  },
} as const;

export default dict;
