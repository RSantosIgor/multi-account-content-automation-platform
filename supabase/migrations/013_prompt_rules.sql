-- Create prompt_rules table for custom AI prompts per account
CREATE TABLE IF NOT EXISTS public.prompt_rules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id  UUID        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  rule_type     TEXT        NOT NULL CHECK (rule_type IN ('analysis', 'publication')),
  rule_name     TEXT        NOT NULL,
  prompt_text   TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  priority      INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prompt_rules_account ON public.prompt_rules(x_account_id);
CREATE INDEX IF NOT EXISTS idx_prompt_rules_type ON public.prompt_rules(x_account_id, rule_type, is_active);

-- Enable RLS
ALTER TABLE public.prompt_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own account's rules
CREATE POLICY "Users can view own prompt rules"
  ON public.prompt_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.x_accounts
      WHERE x_accounts.id = prompt_rules.x_account_id
        AND x_accounts.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert their own account's rules
CREATE POLICY "Users can insert own prompt rules"
  ON public.prompt_rules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.x_accounts
      WHERE x_accounts.id = prompt_rules.x_account_id
        AND x_accounts.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own account's rules
CREATE POLICY "Users can update own prompt rules"
  ON public.prompt_rules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.x_accounts
      WHERE x_accounts.id = prompt_rules.x_account_id
        AND x_accounts.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete their own account's rules
CREATE POLICY "Users can delete own prompt rules"
  ON public.prompt_rules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.x_accounts
      WHERE x_accounts.id = prompt_rules.x_account_id
        AND x_accounts.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_prompt_rules
  BEFORE UPDATE ON public.prompt_rules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
