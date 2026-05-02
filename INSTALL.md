# Hotfix v3.2 — BigInt JSON + scroll-behavior warning

## Что внутри (3 файла)

- `src/lib/prisma.ts` — добавил полифилл `BigInt.prototype.toJSON = String`. Теперь любые BigInt-поля (telegramId и пр.) автоматически сериализуются в JSON. Это решает фундаментальную проблему — больше не упадёт ни один API при возврате User.
- `src/app/api/users/me/route.ts` — явное преобразование telegramId в строку (двойная страховка).
- `src/app/layout.tsx` — `data-scroll-behavior="smooth"` на `<html>` подавляет warning Next.js про smooth-scroll при route transitions.

## Установка

```powershell
cd "C:\Users\Den\Desktop\LASTOFUS\Signal Trade GPT\1\signal-trade-gpt-"
Expand-Archive -Path "signal-trade-prokachka-v3.2-bigint.zip" -DestinationPath . -Force
```
HMR подхватит — но из-за изменения в `prisma.ts` лучше **перезапустить dev-server** (Ctrl+C → `npm run dev`).

## Что проверить

1. Зайди на `/dashboard/profile` — больше не должно быть 500 на `/api/users/me`.
2. В DevTools → Network — `/api/users/me` возвращает 200 с `telegramId: "5171369060"` (строкой, а не BigInt).
3. Warning `Detected scroll-behavior: smooth` пропал из консоли.
