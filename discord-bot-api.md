# Discord Bot API - Documentação

API para integração do bot do Discord com o sistema de rastreamento de jogatinas.

## Autenticação

Todas as requisições devem incluir o header de autenticação:

```
Authorization: Bearer YOUR_API_KEY
```

Configure a variável de ambiente `DISCORD_BOT_API_KEY` no servidor.

## Endpoints

### 1. Iniciar Sessão

**POST** `/api/discord/session/start`

Inicia uma nova sessão de jogo (solo ou em grupo).

#### Request Body

```json
{
  "discord_ids": ["@usuario1", "@usuario2"],
  "game_title": "Minecraft",
  "session_type": "group",
  "started_at": "2024-01-15T10:30:00Z"
}
```

#### Campos

- `discord_ids` (array, obrigatório): Lista de IDs do Discord dos jogadores
  - Para sessões solo: exatamente 1 jogador
  - Para sessões em grupo: 2 ou mais jogadores
- `game_title` (string, obrigatório): Nome do jogo
- `session_type` (string, obrigatório): `"solo"` ou `"group"`
- `started_at` (string ISO 8601, opcional): Timestamp de início (padrão: agora)

#### Response (200 OK)

```json
{
  "success": true,
  "session": {
    "id": "uuid-da-sessao",
    "game_title": "Minecraft",
    "session_type": "group",
    "player_count": 2,
    "started_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Erros

- `400`: Dados inválidos
- `401`: Não autorizado
- `500`: Erro interno

---

### 2. Finalizar Sessão

**PUT** `/api/discord/session/end`

Finaliza uma sessão ativa.

#### Request Body

```json
{
  "discord_ids": ["@usuario1", "@usuario2"],
  "game_title": "Minecraft",
  "session_type": "group",
  "started_at": "2024-01-15T10:30:00Z",
  "ended_at": "2024-01-15T12:45:00Z",
  "duration_minutes": 135
}
```

#### Campos

- `discord_ids` (array, obrigatório): Lista de IDs do Discord dos jogadores
- `game_title` (string, obrigatório): Nome do jogo
- `session_type` (string, obrigatório): `"solo"` ou `"group"`
- `started_at` (string ISO 8601, obrigatório): Timestamp de início (para encontrar a sessão correta)
- `ended_at` (string ISO 8601, obrigatório): Timestamp de fim
- `duration_minutes` (number, opcional): Duração em minutos (será calculado se não fornecido)

#### Response (200 OK)

```json
{
  "success": true,
  "session": {
    "id": "uuid-da-sessao",
    "game_title": "Minecraft",
    "session_type": "group",
    "duration_minutes": 135,
    "ended_at": "2024-01-15T12:45:00Z"
  }
}
```

#### Erros

- `400`: Dados inválidos
- `401`: Não autorizado
- `404`: Sessão não encontrada
- `500`: Erro interno

---

## Fluxo de Trabalho

### Cenário 1: Sessão Solo

```
1. Usuario1 inicia Minecraft
   → POST /api/discord/session/start
   {
     "discord_ids": ["@usuario1"],
     "game_title": "Minecraft",
     "session_type": "solo",
     "started_at": "2024-01-15T10:00:00Z"
   }

2. Usuario1 fecha Minecraft
   → PUT /api/discord/session/end
   {
     "discord_ids": ["@usuario1"],
     "game_title": "Minecraft",
     "session_type": "solo",
     "started_at": "2024-01-15T10:00:00Z",
     "ended_at": "2024-01-15T12:00:00Z",
     "duration_minutes": 120
   }
```

### Cenário 2: Sessão em Grupo

```
1. Usuario1 inicia Minecraft (sessão solo)
   → POST /api/discord/session/start
   {
     "discord_ids": ["@usuario1"],
     "game_title": "Minecraft",
     "session_type": "solo",
     "started_at": "2024-01-15T10:00:00Z"
   }

2. Usuario2 inicia Minecraft (criar sessão em grupo)
   → POST /api/discord/session/start
   {
     "discord_ids": ["@usuario1", "@usuario2"],
     "game_title": "Minecraft",
     "session_type": "group",
     "started_at": "2024-01-15T10:30:00Z"
   }

3. Usuario2 fecha Minecraft (finalizar sessão em grupo)
   → PUT /api/discord/session/end
   {
     "discord_ids": ["@usuario1", "@usuario2"],
     "game_title": "Minecraft",
     "session_type": "group",
     "started_at": "2024-01-15T10:30:00Z",
     "ended_at": "2024-01-15T11:30:00Z",
     "duration_minutes": 60
   }

4. Usuario1 fecha Minecraft (finalizar sessão solo)
   → PUT /api/discord/session/end
   {
     "discord_ids": ["@usuario1"],
     "game_title": "Minecraft",
     "session_type": "solo",
     "started_at": "2024-01-15T10:00:00Z",
     "ended_at": "2024-01-15T12:00:00Z",
     "duration_minutes": 120
   }
```

## Criação Automática

- Se um jogador (discord_id) não existe, será criado automaticamente com o nome igual ao discord_id
- Se um jogo não existe, será criado automaticamente
- Jogadores podem atualizar seus perfis posteriormente na interface web

## Testes

### Exemplo com cURL

```bash
# Iniciar sessão
curl -X POST https://seu-dominio.com/api/discord/session/start \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_ids": ["@teste"],
    "game_title": "Minecraft",
    "session_type": "solo",
    "started_at": "2024-01-15T10:00:00Z"
  }'

# Finalizar sessão
curl -X PUT https://seu-dominio.com/api/discord/session/end \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_ids": ["@teste"],
    "game_title": "Minecraft",
    "session_type": "solo",
    "started_at": "2024-01-15T10:00:00Z",
    "ended_at": "2024-01-15T12:00:00Z",
    "duration_minutes": 120
  }'
```

## Notas Importantes

1. **Gerenciamento de Estado**: O bot deve rastrear as sessões ativas para saber quando criar/finalizar sessões em grupo
2. **IDs do Discord**: Use um formato consistente (ex: sempre `@username` ou sempre ID numérico)
3. **Timestamps**: Use sempre formato ISO 8601 com timezone
4. **Segurança**: Mantenha a API key segura e nunca exponha em código público
5. **Rate Limiting**: Implemente rate limiting no bot para evitar sobrecarga da API
