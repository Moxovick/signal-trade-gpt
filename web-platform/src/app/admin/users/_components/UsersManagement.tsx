"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  User as UserIcon,
  Shield,
  Clock,
  Activity,
  Globe,
  Wallet,
  TrendingUp,
  Calendar,
  Hash,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { TierBadge } from "@/components/ui/TierBadge";

/* ---------- types ---------- */

interface POAccountSummary {
  poTraderId: string;
  status: string;
  totalDeposit: number;
}

interface UserRow {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  telegramId: string | null;
  avatar: string | null;
  role: string;
  status: string;
  tier: number;
  depositTotal: number;
  signalsReceived: number;
  wins: number;
  losses: number;
  createdAt: string;
  lastLogin: string | null;
  poAccount: POAccountSummary | null;
}

interface POAccountDetail {
  id: string;
  poTraderId: string;
  status: string;
  source: string;
  totalDeposit: number;
  totalRevShare: number;
  ftdAt: string | null;
  ftdAmount: number | null;
  registeredAt: string | null;
  emailConfirmedAt: string | null;
  lastPostbackAt: string | null;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

interface LoginEventEntry {
  id: string;
  kind: string;
  ip: string | null;
  createdAt: string;
}

interface UserDetail extends UserRow {
  lastName: string | null;
  dailySignalsUsed: number;
  streakDays: number;
  referralCode: string;
  poAccount: POAccountDetail | null;
  activityLogs: ActivityLogEntry[];
  loginEvents: LoginEventEntry[];
}

type SortField = "createdAt" | "lastLogin" | "depositTotal" | "signalsReceived" | "tier";

const STATUS_COLOR: Record<string, string> = {
  active: "var(--green, #00e5a0)",
  banned: "var(--red, #ef4444)",
  pending: "var(--brand-gold, #C8A55C)",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  banned: "Заблокирован",
  pending: "Ожидание",
};

const PO_STATUS_LABEL: Record<string, string> = {
  verified: "Верифицирован",
  pending: "Ожидание",
  rejected: "Отклонён",
};

const LOGIN_EVENT_LABEL: Record<string, string> = {
  login_ok: "Успешный вход",
  login_fail: "Неудачный вход",
  password_change: "Смена пароля",
  email_change: "Смена email",
  otp_sent: "OTP отправлен",
  otp_verified: "OTP подтверждён",
  otp_expired: "OTP истёк",
};

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Дата регистрации" },
  { value: "lastLogin", label: "Последний вход" },
  { value: "depositTotal", label: "Сумма депозита" },
  { value: "signalsReceived", label: "Кол-во сигналов" },
  { value: "tier", label: "Тир" },
];

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date: string | null): string {
  if (!date) return "никогда";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} дн. назад`;
  return formatDate(date);
}

function winRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return "—";
  return `${Math.round((wins / total) * 100)}%`;
}

function UserInitials({ user }: { user: UserRow }) {
  const letter = (user.firstName?.[0] ?? user.username?.[0] ?? "U").toUpperCase();
  const tierColors: Record<number, string> = {
    0: "#6e604c",
    1: "#6495ed",
    2: "#C8A55C",
  };
  const bg = tierColors[user.tier] ?? tierColors[0];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
      style={{ background: `${bg}22`, color: bg, border: `1px solid ${bg}44` }}
    >
      {letter}
    </div>
  );
}

/* ---------- Detail Panel ---------- */

function UserDetailPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "activity" | "logins">("profile");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { signal: controller.signal });
        const d = (await res.json()) as UserDetail;
        setDetail(d);
      } catch {
        // aborted or error
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[var(--brand-gold)]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--t-3)]">
        <AlertCircle size={16} className="mr-2" /> Пользователь не найден
      </div>
    );
  }

  const tabs = [
    { key: "profile" as const, label: "Профиль", icon: UserIcon },
    { key: "activity" as const, label: "Активность", icon: Activity },
    { key: "logins" as const, label: "Входы", icon: Shield },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--bg-1, #0d0d18)",
        borderColor: "var(--b-soft, rgba(255,255,255,0.07))",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--b-soft, rgba(255,255,255,0.07))" }}
      >
        <div className="flex items-center gap-3">
          <UserInitials user={detail} />
          <div>
            <div className="font-semibold text-sm">
              {detail.firstName ?? detail.username ?? "—"}
            </div>
            <div className="text-xs text-[var(--t-3)]">
              {detail.username ? `@${detail.username}` : detail.email ?? "—"}
            </div>
          </div>
          <TierBadge tier={detail.tier} size="sm" />
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: STATUS_COLOR[detail.status] ?? "#888",
              background: `${STATUS_COLOR[detail.status] ?? "#888"}15`,
            }}
          >
            {STATUS_LABEL[detail.status] ?? detail.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={16} className="text-[var(--t-3)]" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b px-5"
        style={{ borderColor: "var(--b-soft, rgba(255,255,255,0.07))" }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors relative"
              style={{
                color: active ? "var(--brand-gold, #C8A55C)" : "var(--t-3, #666)",
              }}
            >
              <Icon size={14} />
              {t.label}
              {active && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--brand-gold, #C8A55C)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === "profile" && <ProfileTab detail={detail} />}
        {tab === "activity" && <ActivityTab logs={detail.activityLogs} />}
        {tab === "logins" && <LoginsTab events={detail.loginEvents} />}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={14} className="text-[var(--brand-gold)] shrink-0 opacity-70" />
      <span className="text-xs text-[var(--t-3)] w-36 shrink-0">{label}</span>
      <span className="text-sm text-[var(--t-1)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
        {value}
      </span>
    </div>
  );
}

function ProfileTab({ detail }: { detail: UserDetail }) {
  const wr = winRate(detail.wins, detail.losses);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xs font-semibold text-[var(--t-3)] uppercase tracking-wider mb-3">
          Основная информация
        </h3>
        <div className="space-y-0.5">
          <InfoRow icon={UserIcon} label="Имя" value={`${detail.firstName ?? "—"} ${detail.lastName ?? ""}`.trim()} />
          <InfoRow icon={Hash} label="Telegram ID" value={detail.telegramId ?? "—"} />
          <InfoRow icon={UserIcon} label="Username" value={detail.username ? `@${detail.username}` : "—"} />
          <InfoRow icon={Shield} label="Роль" value={detail.role === "admin" ? "Админ" : "Юзер"} />
          <InfoRow icon={Calendar} label="Регистрация" value={formatDateTime(detail.createdAt)} />
          <InfoRow icon={Clock} label="Последний вход" value={formatDateTime(detail.lastLogin)} />
          <InfoRow icon={Hash} label="Реф. код" value={detail.referralCode} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[var(--t-3)] uppercase tracking-wider mb-3">
          Торговая статистика
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatMini label="Сигналов" value={String(detail.signalsReceived)} />
          <StatMini label="Win rate" value={wr} highlight={wr !== "—"} />
          <StatMini label="Победы" value={String(detail.wins)} />
          <StatMini label="Поражения" value={String(detail.losses)} />
          <StatMini label="Серия дней" value={String(detail.streakDays)} />
          <StatMini label="Сегодня" value={String(detail.dailySignalsUsed)} />
        </div>

        <h3 className="text-xs font-semibold text-[var(--t-3)] uppercase tracking-wider mb-3 mt-6">
          PocketOption
        </h3>
        {detail.poAccount ? (
          <div className="space-y-0.5">
            <InfoRow icon={Hash} label="Trader ID" value={`#${detail.poAccount.poTraderId}`} />
            <InfoRow icon={Shield} label="Статус" value={PO_STATUS_LABEL[detail.poAccount.status] ?? detail.poAccount.status} />
            <InfoRow icon={Wallet} label="Депозит (PO)" value={`$${detail.poAccount.totalDeposit.toLocaleString("en-US")}`} />
            <InfoRow icon={TrendingUp} label="RevShare" value={`$${detail.poAccount.totalRevShare.toLocaleString("en-US")}`} />
            <InfoRow icon={Calendar} label="FTD" value={detail.poAccount.ftdAt ? `${formatDate(detail.poAccount.ftdAt)} ($${detail.poAccount.ftdAmount ?? 0})` : "—"} />
            <InfoRow icon={Clock} label="Последний постбэк" value={formatDateTime(detail.poAccount.lastPostbackAt)} />
          </div>
        ) : (
          <div className="text-xs text-[var(--t-3)] py-3">PO-аккаунт не привязан</div>
        )}
      </div>
    </div>
  );
}

function StatMini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 border"
      style={{
        background: "var(--bg-2, #111)",
        borderColor: "var(--b-soft, rgba(255,255,255,0.05))",
      }}
    >
      <div className="text-[10px] text-[var(--t-3)] mb-0.5">{label}</div>
      <div
        className="text-sm font-bold"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: highlight ? "var(--brand-gold, #C8A55C)" : "var(--t-1)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityTab({ logs }: { logs: ActivityLogEntry[] }) {
  if (logs.length === 0) {
    return <div className="text-sm text-[var(--t-3)] py-6 text-center">Нет записей активности</div>;
  }
  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
        >
          <Activity size={14} className="text-[var(--brand-gold)] mt-0.5 shrink-0 opacity-60" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--t-1)]">{log.action}</div>
            {Object.keys(log.details).length > 0 && (
              <div className="text-xs text-[var(--t-3)] mt-0.5 truncate">
                {JSON.stringify(log.details)}
              </div>
            )}
          </div>
          <div className="text-xs text-[var(--t-3)] shrink-0 text-right">
            <div>{formatDateTime(log.createdAt)}</div>
            {log.ip && (
              <div className="flex items-center gap-1 justify-end mt-0.5 opacity-60">
                <Globe size={10} /> {log.ip}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginsTab({ events }: { events: LoginEventEntry[] }) {
  if (events.length === 0) {
    return <div className="text-sm text-[var(--t-3)] py-6 text-center">Нет записей входа</div>;
  }
  return (
    <div className="space-y-2">
      {events.map((ev) => {
        const isOk = ev.kind === "login_ok" || ev.kind === "otp_verified";
        return (
          <div
            key={ev.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: isOk ? "var(--green, #00e5a0)" : "var(--red, #ef4444)",
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[var(--t-1)]">
                {LOGIN_EVENT_LABEL[ev.kind] ?? ev.kind}
              </span>
            </div>
            {ev.ip && (
              <span className="text-xs text-[var(--t-3)] flex items-center gap-1">
                <Globe size={10} /> {ev.ip}
              </span>
            )}
            <span className="text-xs text-[var(--t-3)] shrink-0">
              {formatDateTime(ev.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Main component ---------- */

export function UsersManagement({ initialTotal }: { initialTotal: number }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const limit = 20;
  const pages = Math.ceil(total / limit);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      tier: tierFilter,
      status: statusFilter,
      sortBy,
      sortDir,
    });
    void (async () => {
      try {
        const res = await fetch(`/api/admin/users?${params}`, { signal: controller.signal });
        const data = (await res.json()) as { users: UserRow[]; total: number };
        setUsers(data.users);
        setTotal(data.total);
      } catch {
        // aborted or error
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [page, search, tierFilter, statusFilter, sortBy, sortDir]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const toggleExpand = (userId: string) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Управление пользователями
        </h1>
        <span
          className="text-sm tabular-nums"
          style={{ fontFamily: "var(--font-jetbrains)", color: "var(--t-3)" }}
        >
          Всего: {total}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[240px]"
          style={{
            background: "var(--bg-1, #0d0d18)",
            border: "1px solid var(--b-soft, rgba(255,255,255,0.08))",
          }}
        >
          <Search size={14} className="text-[var(--t-3)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по имени, username, email..."
            className="bg-transparent outline-none text-sm text-[var(--t-1)] w-full placeholder:text-[var(--t-3)]"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="shrink-0">
              <X size={14} className="text-[var(--t-3)]" />
            </button>
          )}
        </div>

        {/* Tier filter */}
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
          style={{
            background: "var(--bg-1, #0d0d18)",
            border: "1px solid var(--b-soft, rgba(255,255,255,0.08))",
            color: "var(--t-1)",
          }}
        >
          <option value="all">Все тиры</option>
          <option value="0">Free</option>
          <option value="1">Basic</option>
          <option value="2">Pro</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
          style={{
            background: "var(--bg-1, #0d0d18)",
            border: "1px solid var(--b-soft, rgba(255,255,255,0.08))",
            color: "var(--t-1)",
          }}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="banned">Заблокированные</option>
          <option value="pending">Ожидание</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as SortField); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
          style={{
            background: "var(--bg-1, #0d0d18)",
            border: "1px solid var(--b-soft, rgba(255,255,255,0.08))",
            color: "var(--t-1)",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="px-3 py-2 rounded-xl transition-colors hover:bg-white/5"
          style={{
            background: "var(--bg-1, #0d0d18)",
            border: "1px solid var(--b-soft, rgba(255,255,255,0.08))",
            color: "var(--t-2)",
          }}
          title={sortDir === "asc" ? "По возрастанию" : "По убыванию"}
        >
          {sortDir === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Table header */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--bg-1, #0d0d18)",
          borderColor: "var(--b-soft, rgba(255,255,255,0.07))",
        }}
      >
        <div
          className="hidden md:grid grid-cols-12 px-5 py-3 text-xs text-[var(--t-3)] border-b gap-2"
          style={{ borderColor: "var(--b-soft, rgba(255,255,255,0.06))" }}
        >
          <span className="col-span-3">Пользователь</span>
          <SortHeader label="Тир" field="tier" current={sortBy} dir={sortDir} onClick={handleSort} className="col-span-1" />
          <SortHeader label="Депозит" field="depositTotal" current={sortBy} dir={sortDir} onClick={handleSort} className="col-span-2" />
          <SortHeader label="Сигналы" field="signalsReceived" current={sortBy} dir={sortDir} onClick={handleSort} className="col-span-1" />
          <span className="col-span-1">Win rate</span>
          <span className="col-span-1">PO</span>
          <span className="col-span-1">Статус</span>
          <SortHeader label="Вход" field="lastLogin" current={sortBy} dir={sortDir} onClick={handleSort} className="col-span-1" />
          <SortHeader label="Рег-ция" field="createdAt" current={sortBy} dir={sortDir} onClick={handleSort} className="col-span-1" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[var(--brand-gold)]" />
          </div>
        )}

        {/* Rows */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--t-3)]">
            Пользователи не найдены
          </div>
        )}

        {!loading &&
          users.map((u) => (
            <div key={u.id}>
              <button
                type="button"
                onClick={() => toggleExpand(u.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 px-5 py-3 items-center border-b text-sm gap-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
                style={{ borderColor: "var(--b-soft, rgba(255,255,255,0.04))" }}
              >
                {/* User */}
                <div className="col-span-3 flex items-center gap-3">
                  <UserInitials user={u} />
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--t-1)] truncate text-sm">
                      {u.firstName ?? u.username ?? "—"}
                    </div>
                    <div className="text-xs text-[var(--t-3)] truncate">
                      {u.username ? `@${u.username}` : u.email ?? `TG: ${u.telegramId ?? "—"}`}
                    </div>
                  </div>
                </div>

                {/* Tier */}
                <div className="col-span-1">
                  <TierBadge tier={u.tier} size="sm" />
                </div>

                {/* Deposit */}
                <div
                  className="col-span-2 tabular-nums text-[var(--t-1)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  ${u.depositTotal.toLocaleString("en-US")}
                </div>

                {/* Signals */}
                <div
                  className="col-span-1 tabular-nums text-[var(--t-2)]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {u.signalsReceived}
                </div>

                {/* Win rate */}
                <div className="col-span-1">
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      color:
                        u.wins + u.losses > 0
                          ? (u.wins / (u.wins + u.losses)) >= 0.5
                            ? "var(--green, #00e5a0)"
                            : "var(--red, #ef4444)"
                          : "var(--t-3)",
                    }}
                  >
                    {winRate(u.wins, u.losses)}
                  </span>
                </div>

                {/* PO status */}
                <div className="col-span-1">
                  {u.poAccount ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background:
                          u.poAccount.status === "verified"
                            ? "rgba(0,229,160,0.1)"
                            : "rgba(200,165,92,0.1)",
                        color:
                          u.poAccount.status === "verified"
                            ? "var(--green, #00e5a0)"
                            : "var(--brand-gold, #C8A55C)",
                      }}
                    >
                      {PO_STATUS_LABEL[u.poAccount.status] ?? u.poAccount.status}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--t-3)]">—</span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: STATUS_COLOR[u.status] ?? "#888" }}
                  >
                    {STATUS_LABEL[u.status] ?? u.status}
                  </span>
                </div>

                {/* Last login */}
                <div className="col-span-1 text-xs text-[var(--t-3)]">
                  {timeAgo(u.lastLogin)}
                </div>

                {/* Created */}
                <div className="col-span-1 text-xs text-[var(--t-3)]">
                  {formatDate(u.createdAt)}
                </div>
              </button>

              {/* Expanded detail */}
              {expandedUser === u.id && (
                <div className="px-3 py-3">
                  <UserDetailPanel
                    userId={u.id}
                    onClose={() => setExpandedUser(null)}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ background: "var(--bg-1, #0d0d18)", color: "var(--t-2)" }}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            let p: number;
            if (pages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= pages - 3) {
              p = pages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
                style={{
                  background: p === page ? "var(--brand-gold, #C8A55C)" : "var(--bg-1, #0d0d18)",
                  color: p === page ? "#07070d" : "var(--t-3)",
                  fontWeight: p === page ? 700 : 400,
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ background: "var(--bg-1, #0d0d18)", color: "var(--t-2)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Sort header helper ---------- */

function SortHeader({
  label,
  field,
  current,
  dir,
  onClick,
  className,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: "asc" | "desc";
  onClick: (f: SortField) => void;
  className?: string;
}) {
  const active = current === field;
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className={`flex items-center gap-1 hover:text-[var(--t-1)] transition-colors cursor-pointer ${className ?? ""}`}
      style={{ color: active ? "var(--brand-gold, #C8A55C)" : undefined }}
    >
      {label}
      {active ? (
        dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <ArrowUpDown size={10} className="opacity-40" />
      )}
    </button>
  );
}
