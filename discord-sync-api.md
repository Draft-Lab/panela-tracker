# Discord Sync API

Reconcilia o estado das jogatinas com um **snapshot** de quem está jogando agora. Use no **startup do bot** (e opcionalmente em intervalos) para corrigir dessincronia após queda, reinício ou eventos perdidos.

## Endpoint

**POST** `/api/discord/sync`

## Autenticação

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

A chave deve ser a mesma variável `DISCORD_BOT_API_KEY` configurada no servidor.

---

## Request Body

```json
{
  "playing": [
    {
      "discord_id": "123456789012345678",
      "game_title": "ARC Raiders",
      "discord_name": "Natan",
      "discord_avatar": "https://cdn.discordapp.com/avatars/123/abc.png"
    },
    {
      "discord_id": "987654321098765432",
      "game_title": "TBH: Task Bar Hero",
      "discord_name": "Heizmen",
      "discord_avatar": "https://cdn.discordapp.com/avatars/987/def.png"
    }
  ]
}
```

### Campos

| Campo | Onde | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `playing` | raiz | sim | Lista de sessões ativas **no momento** |
| `discord_id` | item | sim | ID numérico do Discord do jogador |
| `game_title` | item | sim | Nome do jogo (como aparece no Discord) |
| `discord_name` | item | não | Nome/display name — atualiza `players.name` |
| `discord_avatar` | item | não | URL do avatar — atualiza `players.avatar_url` |

### Regras do payload

- **`playing` vazio (`[]`)** é válido: remove jogadores fantasmas e finaliza jogatinas ativas do bot que ficaram sem ninguém.
- **Um jogador em dois jogos** → envie **dois itens** no array (um por jogo).
- **Mesmo jogador + mesmo jogo duplicado** → o servidor deduplica pelo par `discord_id` + `game_title`.
- **`discord_id` e `game_title` vazios** → item ignorado.

---

## O que a API faz

Para cada jogo presente no snapshot **ou** com jogatina ativa no banco (`source: discord_bot`):

| Situação | Ação |
|----------|------|
| Jogando no Discord, inativo no banco | Ativa jogador + registra `player_joined` |
| Ativo no banco, ausente no snapshot | Desativa + registra `player_left` (remove fantasma) |
| Ativo nos dois | Nada muda (sem evento duplicado) |
| Jogo no banco, ninguém no snapshot | Desativa todos + finaliza jogatina |
| Jogo no snapshot, sem jogatina | Cria jogatina e adiciona jogadores |

Ao final, recalcula `active_players` e `session_type` a partir de `jogatina_players.is_active`.

---

## Response (200 OK)

```json
{
  "success": true,
  "message": "Playing snapshot reconciled",
  "games_reconciled": 2,
  "players_joined": 1,
  "players_left": 8,
  "jogatinas_finished": 0,
  "details": [
    {
      "game_title": "ARC Raiders",
      "active_players": 1,
      "joined": [],
      "left": ["João", "Maria"],
      "finished": false
    },
    {
      "game_title": "TBH: Task Bar Hero",
      "active_players": 3,
      "joined": ["Heizmen"],
      "left": [],
      "finished": false
    }
  ]
}
```

| Campo | Descrição |
|-------|-----------|
| `games_reconciled` | Quantos jogos foram processados |
| `players_joined` | Total de entradas registradas na sync |
| `players_left` | Total de saídas registradas (fantasmas removidos) |
| `jogatinas_finished` | Jogatinas encerradas por ficarem sem jogadores |
| `details` | Resumo por jogo |

---

## Erros

| Status | Motivo |
|--------|--------|
| `400` | `playing` ausente ou não é array |
| `401` | Token inválido ou ausente |
| `500` | Erro interno (mensagem em `error`) |

---

## Quando chamar

1. **`on_ready` / startup do bot** — obrigatório recomendado  
2. **Após reconectar** — se o bot caiu e voltou  
3. **Opcional: a cada 5–15 min** — heartbeat para manter estado alinhado  

Depois da sync, continue usando **`POST /api/discord/events`** para join/leave em tempo real.

---

## Exemplo — cURL

```bash
curl -X POST https://seu-dominio.com/api/discord/sync \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "playing": [
      {
        "discord_id": "123456789012345678",
        "game_title": "ARC Raiders",
        "discord_name": "Natan",
        "discord_avatar": "https://cdn.discordapp.com/avatars/123/abc.png"
      }
    ]
  }'
```

---

## Exemplo — Python (discord.py)

```python
import requests
from discord import ActivityType

API_URL = "https://seu-dominio.com"
API_KEY = "sua_chave"

def collect_playing_snapshot(guild) -> list[dict]:
    playing = []
    seen: set[tuple[str, str]] = set()

    for member in guild.members:
        if member.bot:
            continue
        for activity in member.activities or []:
            if activity.type != ActivityType.playing or not activity.name:
                continue
            key = (str(member.id), activity.name)
            if key in seen:
                continue
            seen.add(key)
            playing.append({
                "discord_id": str(member.id),
                "game_title": activity.name,
                "discord_name": member.display_name,
                "discord_avatar": str(member.display_avatar.url),
            })
    return playing

def sync_playing_state(guild):
    payload = {"playing": collect_playing_snapshot(guild)}
    response = requests.post(
        f"{API_URL}/api/discord/sync",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()

# No bot:
# @bot.event
# async def on_ready():
#     for guild in bot.guilds:
#         result = sync_playing_state(guild)
#         print("Sync OK:", result)
```

---

## Fluxo recomendado

```
Bot inicia (on_ready)
    │
    ▼
POST /api/discord/sync     ← snapshot completo de quem está jogando
    │
    ▼
Eventos em tempo real
    ├── POST /api/discord/events  (player_joined)
    ├── POST /api/discord/events  (player_left)
    └── POST /api/discord/player-offline  (opcional, Discord offline)
```

---

## Relacionado

- Eventos em tempo real: [`discord-bot-api.md`](discord-bot-api.md) — `POST /api/discord/events`
- Offline no Discord: `POST /api/discord/player-offline`
