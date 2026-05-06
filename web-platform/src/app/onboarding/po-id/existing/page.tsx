/**
 * Onboarding · existing PocketOption account dead-end.
 *
 * Per supervisor decision: if the user already has a PO account that's NOT
 * tied to our partner network, we don't admit them. They must create a NEW
 * account via our referral link.
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPoReferralUrl } from "@/lib/pocketoption";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Нужен новый аккаунт PocketOption" };

export default async function ExistingPoAccountInfoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const referralUrl = await getPoReferralUrl();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 size-12 rounded-full bg-[var(--brand-gold)]/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-[var(--brand-gold)]" />
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                Нужен новый аккаунт PocketOption
              </h1>
              <p className="text-[var(--t-2)] leading-relaxed">
                Платформа Signal Trade GPT работает только с трейдерами,
                которые зарегистрировались на PocketOption через нашу
                партнёрскую ссылку. Существующий аккаунт привязать не
                получится — мы не сможем сопоставить твою активность.
              </p>
              <p className="text-[var(--t-2)] leading-relaxed">
                Решение: создай <span className="text-[var(--t-1)] font-semibold">новый</span>
                {" "}аккаунт на PocketOption (на другую почту), пройди по
                ссылке ниже и привяжи новый ID.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--b-soft)] bg-[var(--bg-2)] p-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--t-3)]">
              Как это сделать
            </div>
            <ol className="space-y-1.5 text-sm text-[var(--t-2)] list-decimal list-inside">
              <li>Открой PocketOption по нашей ссылке (кнопка ниже).</li>
              <li>Зарегистрируйся — желательно на другой email.</li>
              <li>В Профиле PO скопируй свой числовой ID.</li>
              <li>Вернись и привяжи ID на предыдущем шаге.</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ButtonLink
              href={referralUrl}
              external
              variant="primary"
              iconRight={<ExternalLink size={16} />}
            >
              Создать новый аккаунт PocketOption
            </ButtonLink>
            <ButtonLink
              href="/onboarding/po-id"
              variant="secondary"
              iconLeft={<ArrowLeft size={16} />}
            >
              Назад к привязке ID
            </ButtonLink>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--t-3)]">
          Вопрос? Напиши в поддержку{" "}
          <a
            href="https://t.me/traitsignaltsest_bot"
            className="text-[var(--brand-gold)] hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            @traitsignaltsest_bot
          </a>
          .
        </p>
      </div>
    </div>
  );
}
