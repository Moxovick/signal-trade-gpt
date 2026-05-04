/**
 * /about — "Про нас". Static content explaining what the platform is and
 * how the partnership flow with PocketOption works.
 */
import { ArrowRight, Target, Shield, Users, BarChart3 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteHeader, SiteFooter } from "@/components/shared/SiteHeader";

const VALUES = [
  {
    icon: Target,
    title: "Никаких подписок",
    desc: "Доступ открывается депозитом на PocketOption — не ежемесячным платежом нам. Мы зарабатываем на партнёрке (RevShare), не на тебе.",
  },
  {
    icon: Shield,
    title: "Прозрачно",
    desc: "Тиры и пороги депозита публичны. Confidence на каждом сигнале. Дисклеймер: торговля бинарными опционами рискованная.",
  },
  {
    icon: BarChart3,
    title: "AI + реальные данные",
    desc: "Сигналы генерируются на основе технического анализа и исторических данных PocketOption. Старшие тиры видят графики с RSI / MACD / объёмом.",
  },
  {
    icon: Users,
    title: "Реферальная программа",
    desc: "Приглашай друзей по своей ссылке — получай 5% от их депозитов. Никаких ограничений на число рефералов.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full text-xs uppercase tracking-widest border border-[var(--b-soft)] text-[var(--brand-gold)] bg-[var(--bg-1)]">
            Про нас
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-[1.05]">
            Signal Trade GPT
          </h1>
          <p className="mt-6 text-lg text-[var(--t-2)] leading-relaxed">
            Платформа AI-сигналов для PocketOption. Мы не продаём подписки и не
            обещаем волшебных результатов. Мы даём прозрачный инструмент:
            технический анализ + AI-confidence на каждом сигнале, привязанный
            к твоему реальному депозиту на брокере.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <Card key={v.title} padding="lg" hover>
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{
                      background: "rgba(212, 160, 23, 0.08)",
                      border: "1px solid var(--b-soft)",
                    }}
                  >
                    <v.icon size={22} className="text-[var(--brand-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{v.title}</h3>
                    <p className="text-[var(--t-2)] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-6">Как мы зарабатываем</h2>
          <div className="space-y-4 text-[var(--t-2)] leading-relaxed">
            <p>
              Мы партнёр PocketOption по программе RevShare. Когда ты открываешь
              у них счёт по нашей ссылке и торгуешь — PocketOption платит нам
              процент от их комиссии за тебя. Это происходит автоматически,
              никаких скрытых списаний или подписок.
            </p>
            <p>
              Поэтому нам выгодно, чтобы ты торговал успешно — чем дольше ты в
              системе, тем дольше PocketOption нам платит. Это совпадение
              интересов мы и закрепили в тир-системе: чем больше твой депозит,
              тем больше мы вкладываем в твой анализ.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-6">Дисклеймер</h2>
          <div className="rounded-2xl border border-[var(--b-soft)] bg-[var(--bg-1)] p-6 text-sm text-[var(--t-2)] leading-relaxed">
            <p>
              Signal Trade GPT не является финансовым советником. Все сигналы
              предоставляются в информационных целях. Торговля бинарными
              опционами сопряжена с высоким риском потери средств. Прошлые
              результаты не гарантируют будущей доходности. Решение об открытии
              сделки принимаешь ты, на свой риск.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Card variant="highlight" padding="lg">
            <h2 className="text-3xl font-bold">Готов попробовать?</h2>
            <p className="mt-4 text-[var(--t-2)]">
              Регистрация — 30 секунд. Демо-сигналы доступны без депозита.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink
                href="/register"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                Зарегистрироваться
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary" size="lg">
                Как это работает
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
