/**
 * Dashboard — Referrals page (rework v2).
 *
 * Layout:
 *   - Hero card: QR code + ref link + 5% revshare badge
 *   - 4 stat tiles
 *   - Recent referrals list with status (FTD / pending / no-deposit)
 *   - How-it-works strip
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { ReferralWidget } from "../_components/ReferralWidget";
import { Users, TrendingUp, CircleDollarSign, UserCheck, Send } from "lucide-react";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";
const BOT_URL =
  process.env["NEXT_PUBLIC_BOT_URL"] ?? "https://t.me/traitsignaltsest_bot";

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, tier: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            email: true,
            firstName: true,
            createdAt: true,
            tier: true,
            poAccount: {
              select: { totalDeposit: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) return null;

  const ftdRefs = referrals.filter(
    (r) => Number(r.referred.poAccount?.totalDeposit ?? 0) > 0,
  );
  const totalReferralDeposits = ftdRefs.reduce(
    (sum, r) =>
      sum + Number(r.referred.poAccount?.totalDeposit ?? 0),
    0,
  );
  const earned = totalReferralDeposits * 0.05;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--brand-gold)] mb-1">
          Реферальная программа
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">5% с каждого депозита</h1>
        <p className="text-[var(--t-2)] mt-2">
          Зови трейдеров — получай 5% от их депозитов на PocketOption
          вторым уровнем. Без потолка, навсегда.
        </p>
      </div>

      {/* Hero — QR + ref link */}
      <ReferralWidget
        code={user.referralCode}
        count={referrals.length}
        baseUrl={SITE_URL}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<Users size={18} />}
          label="Приглашено"
          value={referrals.length.toString()}
        />
        <Stat
          icon={<UserCheck size={18} />}
          label="С депозитом"
          value={ftdRefs.length.toString()}
        />
        <Stat
          icon={<CircleDollarSign size={18} />}
          label="Депозит рефералов"
          value={`$${Math.round(totalReferralDeposits).toLocaleString()}`}
        />
        <Stat
          icon={<TrendingUp size={18} />}
          label="Заработано"
          value={`$${Math.round(earned).toLocaleString()}`}
          delta={{ value: "5% revshare" }}
        />
      </div>

      {/* Recent referrals table */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Твои рефералы</h2>
          <span className="text-xs text-[var(--t-3)]">{referrals.length} всего</span>
        </div>
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Send size={32} className="mx-auto mb-4 text-[var(--brand-gold)] opacity-60" />
            <p className="text-[var(--t-2)] mb-1">Пока никого не пригласил</p>
            <p className="text-xs text-[var(--t-3)]">
              Поделись QR-кодом или ссылкой выше — каждый новый трейдер с депозитом
              даёт тебе 5% на всю жизнь.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--b-soft)]">
            {referrals.slice(0, 20).map((r) => {
              const dep = Number(r.referred.poAccount?.totalDeposit ?? 0);
              const hasFtd = dep > 0;
              const status = r.referred.poAccount?.status;
              const dispName =
                r.referred.firstName ??
                (r.referred.email ? r.referred.email.split("@")[0] : "Аноним");
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{dispName}</div>
                    <div className="text-xs text-[var(--t-3)]">
                      Зарегистрирован{" "}
                      {new Date(r.referred.createdAt).toLocaleDateString("ru")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {hasFtd ? (
                      <>
                        <div
                          className="text-sm font-bold text-[var(--brand-gold)]"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          ${Math.round(dep).toLocaleString()}
                        </div>
                        <div className="text-xs text-[var(--green)]">
                          +${Math.round(dep * 0.05).toLocaleString()} тебе
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[var(--t-3)]">
                        {status === "pending" ? "ждём депозит" : "без депозита"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {referrals.length > 20 && (
              <p className="text-xs text-[var(--t-3)] pt-3 text-center">
                + ещё {referrals.length - 20} рефералов
              </p>
            )}
          </div>
        )}
      </Card>

      {/* How it works */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold text-[var(--brand-gold)] mb-1">01</div>
            <p className="text-[var(--t-2)]">
              Делишься QR-кодом или ссылкой выше — друг открывает счёт
              PocketOption по твоему коду.
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--brand-gold)] mb-1">02</div>
            <p className="text-[var(--t-2)]">
              Друг вносит депозит. Мы автоматически фиксируем его как твоего
              реферала через postback PocketOption.
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--brand-gold)] mb-1">03</div>
            <p className="text-[var(--t-2)]">
              Получаешь 5% от каждого его депозита, навсегда. Снять или
              реинвестировать — без потолка.
            </p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[var(--b-soft)] flex items-center gap-3">
          <Link
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--brand-gold)] hover:underline"
          >
            Поделиться через Telegram-бота →
          </Link>
        </div>
      </Card>
    </div>
  );
}
