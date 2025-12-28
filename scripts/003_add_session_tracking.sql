-- Adicionar coluna discord_id aos jogadores
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_players_discord_id ON public.players(discord_id);

-- Adicionar novas colunas à tabela jogatinas
ALTER TABLE public.jogatinas 
  ADD COLUMN IF NOT EXISTS session_type TEXT CHECK (session_type IN ('solo', 'group')),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'discord_bot'));

-- Atualizar jogatinas existentes para tipo 'group' e source 'manual'
UPDATE public.jogatinas 
SET session_type = 'group', 
    source = 'manual'
WHERE session_type IS NULL;

-- Tornar session_type obrigatório
ALTER TABLE public.jogatinas 
  ALTER COLUMN session_type SET NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_jogatinas_session_type ON public.jogatinas(session_type);
CREATE INDEX IF NOT EXISTS idx_jogatinas_started_at ON public.jogatinas(started_at);
CREATE INDEX IF NOT EXISTS idx_jogatinas_ended_at ON public.jogatinas(ended_at);
CREATE INDEX IF NOT EXISTS idx_jogatinas_source ON public.jogatinas(source);

-- Comentários para documentação
COMMENT ON COLUMN public.players.discord_id IS 'ID único do Discord do jogador (ex: @jogador)';
COMMENT ON COLUMN public.jogatinas.session_type IS 'Tipo de sessão: solo (um jogador) ou group (múltiplos jogadores)';
COMMENT ON COLUMN public.jogatinas.duration_minutes IS 'Duração da sessão em minutos';
COMMENT ON COLUMN public.jogatinas.started_at IS 'Timestamp de início da sessão';
COMMENT ON COLUMN public.jogatinas.ended_at IS 'Timestamp de fim da sessão';
COMMENT ON COLUMN public.jogatinas.source IS 'Origem do registro: manual (interface web) ou discord_bot';
