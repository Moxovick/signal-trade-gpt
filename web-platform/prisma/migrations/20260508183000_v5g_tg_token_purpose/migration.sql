-- Allow login-purpose tokens whose userId is filled in only at redemption.
ALTER TABLE "telegram_link_tokens"
  ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'link',
  ALTER COLUMN "userId" DROP NOT NULL;
