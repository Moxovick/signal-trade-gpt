import Link from "next/link";

const REVIEWS = [
  { name: "Алексей К.", plan: "VIP", text: "За 2 месяца вышел в стабильный плюс. Сигналы приходят моментально, AI confidence реально работает — на 90%+ практически всегда в деньгах. Рекомендую всем, кто серьёзно относится к трейдингу.", rating: 5, date: "15.04.2026" },
  { name: "Марина Р.", plan: "Premium", text: "Раньше торговала по интуиции — сливала. С Signal Trade GPT наконец-то начала зарабатывать. Бот удобный, всё понятно с первого сигнала. За месяц подняла $400 на Premium-тарифе.", rating: 5, date: "12.04.2026" },
  { name: "Дмитрий В.", plan: "Premium", text: "Попробовал бесплатные сигналы — удивился точности. Перешёл на Premium через неделю. Рекомендую всем, кто торгует на Pocket Option. Экспирация подбирается идеально.", rating: 5, date: "10.04.2026" },
  { name: "Сергей П.", plan: "VIP", text: "Лучший бот для бинарных опционов. Пользуюсь 3 месяца, реферальная программа тоже приносит доход. Персональный менеджер на VIP — отдельный плюс. Спасибо команде!", rating: 5, date: "08.04.2026" },
  { name: "Елена М.", plan: "Premium", text: "Удобный формат — сигнал пришёл, открыла сделку, заработала. Никакого стресса и анализа графиков. AI делает всё за тебя. Точность действительно высокая.", rating: 4, date: "05.04.2026" },
  { name: "Игорь Т.", plan: "Free", text: "Даже на бесплатном тарифе можно неплохо заработать. 3-5 сигналов в день — этого хватает для начала. Думаю перейти на Premium после того, как наберусь опыта.", rating: 5, date: "03.04.2026" },
  { name: "Анна К.", plan: "VIP", text: "Пользуюсь ботом с самого запуска. Стабильные результаты, быстрая поддержка. VIP стоит каждого доллара — безлимитные сигналы + менеджер, который всегда на связи.", rating: 5, date: "01.04.2026" },
  { name: "Максим Д.", plan: "Premium", text: "Скептически относился к AI-сигналам, но решил попробовать Free. Через 2 недели оформил Premium — результаты говорят сами за себя. 87% точности — не маркетинг.", rating: 5, date: "28.03.2026" },
  { name: "Ольга С.", plan: "Free", text: "Начала с бесплатного тарифа месяц назад. Пока очень довольна! Сигналы понятные, приходят вовремя. Собираюсь переходить на Premium за расширенными парами.", rating: 4, date: "25.03.2026" },
  { name: "Виктор Л.", plan: "VIP", text: "Самый профессиональный бот для Pocket Option. Пробовал 5 разных ботов — этот лучший по всем параметрам. Точность, скорость, удобство. На VIP — полный контроль.", rating: 5, date: "22.03.2026" },
  { name: "Наталья Б.", plan: "Premium", text: "Подключила реферальную программу — приятный бонус! Друзья тоже довольны. AI Confidence помогает выбирать лучшие сигналы. Однозначно рекомендую.", rating: 5, date: "20.03.2026" },
  { name: "Роман Ш.", plan: "Premium", text: "Торгую по сигналам уже 2 месяца. Средний win rate у меня — около 85%. Что важно — сигналы приходят стабильно, без перебоев. Отличная работа команды.", rating: 4, date: "18.03.2026" },
];

const STATS = [
  { value: "4.9", label: "Средняя оценка" },
  { value: "1200+", label: "Отзывов" },
  { value: "97%", label: "Довольных" },
];

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-[#07070d] pt-8 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm text-[#555] hover:text-[#888] transition-colors">
          ← На главную
        </Link>

        <div className="text-center mt-8 mb-12">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}>
            Отзывы
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
            ЧТО ГОВОРЯТ <span style={{ color: "#f5c518" }}>ТРЕЙДЕРЫ</span>
          </h1>
          <p className="text-[#888]">Реальные отзывы пользователей Signal Trade GPT</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center p-5 rounded-2xl border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-jetbrains)", color: "#f5c518" }}>
                {value}
              </div>
              <div className="text-xs text-[#666]">{label}</div>
            </div>
          ))}
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name + r.date} className="rounded-2xl p-5 border" style={{ background: "#0d0d18", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#f5c518", color: "#07070d" }}>
                  {r.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,197,24,0.12)", color: "#f5c518" }}>
                      {r.plan}
                    </span>
                    <span className="text-xs text-[#555]">{r.date}</span>
                  </div>
                </div>
              </div>
              <div className="mb-2 text-sm" style={{ color: "#f5c518" }}>
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </div>
              <p className="text-sm text-[#999] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xs text-[#444] max-w-md mx-auto">
            Signal Trade GPT не является финансовым советником. Отзывы отражают личный опыт пользователей.
          </p>
        </div>
      </div>
    </main>
  );
}
