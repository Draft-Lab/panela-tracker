# Discord Bot Events API - Documentação

API baseada em eventos para rastreamento de jogatinas via Discord Bot.

## Autenticação

Todas as requisições devem incluir o header de autenticação:

```
Authorization: Bearer YOUR_API_KEY
```

Configure a variável de ambiente `DISCORD_BOT_API_KEY` no servidor.

## Conceito de Eventos

O sistema funciona com eventos de entrada e saída de jogadores:

- **player_joined**: Registrado quando um jogador inicia um jogo
- **player_left**: Registrado quando um jogador fecha um jogo

### Como Funciona

1. **Primeiro jogador entra** → Cria jogatina (tipo: solo), marca jogador como ativo
2. **Segundo jogador entra no mesmo jogo** → Atualiza para grupo, marca jogador como ativo
3. **Jogador sai** → Marca jogador como inativo, mantém registro na jogatina
4. **Jogador volta** → Reativa jogador existente, adiciona novos eventos
5. **Último jogador sai** → Finaliza jogatina

### Estado dos Jogadores

- **is_active: true** → Jogador está atualmente jogando
- **is_active: false** → Jogador saiu, mas seu histórico permanece na jogatina
- Quando um jogador volta, seu `is_active` é atualizado para `true` novamente
- Todos os eventos (entrada/saída) são mantidos para cálculo de estatísticas

## Endpoints

### 1. Registrar Evento

**POST** `/api/discord/events`

Registra um evento de entrada ou saída de um jogador em um jogo.

#### Request Body

```json
{
  "discord_id": "@usuario1",
  "game_title": "Minecraft",
  "event_type": "player_joined"
}
```

#### Campos

- `discord_id` (string, obrigatório): ID do Discord do jogador
- `game_title` (string, obrigatório): Nome do jogo
- `event_type` (string, obrigatório): `"player_joined"` ou `"player_left"`

**Nota**: O timestamp é gerado automaticamente pelo servidor no momento do recebimento da requisição.

#### Response - Player Joined (200 OK)

```json
{
  "success": true,
  "message": "Player joined event registered",
  "jogatina_id": "uuid-da-jogatina",
  "game_title": "Minecraft",
  "active_players": 2,
  "session_type": "group"
}
```

#### Response - Player Left (200 OK)

```json
{
  "success": true,
  "message": "Player left event registered",
  "jogatina_id": "uuid-da-jogatina",
  "game_title": "Minecraft",
  "active_players": 1,
  "session_type": "solo",
  "session_finished": false
}
```

#### Response - Jogatina Finalizada (200 OK)

```json
{
  "success": true,
  "message": "Player left and jogatina finished",
  "jogatina_id": "uuid-da-jogatina",
  "game_title": "Minecraft",
  "active_players": 0,
  "session_finished": true,
  "total_duration_minutes": 135
}
```

#### Erros

- `400`: Dados inválidos ou jogador não está na jogatina
- `401`: Não autorizado
- `404`: Jogatina ativa não encontrada
- `500`: Erro interno

---

### 2. Consultar Eventos de uma Jogatina

**GET** `/api/jogatinas/{jogatina_id}/events`

Retorna todos os eventos e estatísticas de uma jogatina específica.

#### Response (200 OK)

```json
{
  "success": true,
  "jogatina_id": "uuid-da-jogatina",
  "total_events": 8,
  "timeline": [
    {
      "id": "event-uuid-1",
      "player_name": "Usuario1",
      "player_id": "player-uuid-1",
      "event_type": "player_joined",
      "timestamp": "2024-01-15T10:00:00Z",
      "formatted_time": "15/01/2024 10:00:00"
    },
    {
      "id": "event-uuid-2",
      "player_name": "Usuario2",
      "player_id": "player-uuid-2",
      "event_type": "player_joined",
      "timestamp": "2024-01-15T10:30:00Z",
      "formatted_time": "15/01/2024 10:30:00"
    }
  ],
  "player_stats": [
    {
      "player_id": "player-uuid-1",
      "player_name": "Usuario1",
      "total_time_minutes": 120,
      "solo_time_minutes": 30,
      "group_time_minutes": 90,
      "join_count": 1,
      "leave_count": 1,
      "sessions": [
        {
          "joined_at": "2024-01-15T10:00:00Z",
          "left_at": "2024-01-15T12:00:00Z",
          "duration_minutes": 120,
          "was_group": true
        }
      ]
    }
  ]
}
```

---

## Fluxo Completo de Eventos

### Cenário 1: Sessão Solo Simples

```
1. Usuario1 inicia Minecraft (10:00)
   → POST /api/discord/events
   {
     "discord_id": "@usuario1",
     "game_title": "Minecraft",
     "event_type": "player_joined",
     "timestamp": "2024-01-15T10:00:00Z"
   }
   
   Resposta: Jogatina criada (solo), 1 jogador ativo

2. Usuario1 fecha Minecraft (12:00)
   → POST /api/discord/events
   {
     "discord_id": "@usuario1",
     "game_title": "Minecraft",
     "event_type": "player_left",
     "timestamp": "2024-01-15T12:00:00Z"
   }
   
   Resposta: Jogatina finalizada
   - Total: 120 minutos
   - Solo: 120 minutos
   - Grupo: 0 minutos
```

### Cenário 2: Sessão em Grupo

```
1. Usuario1 inicia Minecraft (10:00)
   → POST /api/discord/events (player_joined)
   Resultado: Jogatina criada (solo)

2. Usuario2 inicia Minecraft (10:30)
   → POST /api/discord/events (player_joined)
   Resultado: Jogatina atualizada para grupo

3. Usuario3 inicia Minecraft (11:00)
   → POST /api/discord/events (player_joined)
   Resultado: 3 jogadores ativos (grupo)

4. Usuario2 fecha Minecraft (11:30)
   → POST /api/discord/events (player_left)
   Resultado: 2 jogadores ativos (grupo)

5. Usuario3 fecha Minecraft (11:45)
   → POST /api/discord/events (player_left)
   Resultado: 1 jogador ativo (solo)

6. Usuario1 fecha Minecraft (12:00)
   → POST /api/discord/events (player_left)
   Resultado: Jogatina finalizada
   
   Estatísticas finais:
   - Usuario1: 120min total (30min solo + 90min grupo)
   - Usuario2: 60min total (0min solo + 60min grupo)
   - Usuario3: 45min total (0min solo + 45min grupo)
```

### Cenário 3: Jogador Sai e Volta

```
1. Usuario1 inicia Minecraft (10:00)
   → player_joined
   is_active: true
   
2. Usuario2 inicia Minecraft (10:30)
   → player_joined
   is_active: true
   Sessão vira grupo

3. Usuario1 fecha Minecraft (11:00)
   → player_left
   is_active: false (Usuario1 marcado como inativo)
   Usuario2 continua jogando sozinho (sessão vira solo)

4. Usuario1 volta e abre Minecraft (11:30)
   → player_joined
   is_active: true (Usuario1 reativado)
   Sessão vira grupo novamente

5. Ambos fecham (12:00)
   → player_left (ambos)
   Jogatina finalizada
   
   Estatísticas Usuario1:
   - Sessão 1: 10:00 - 11:00 (60min, 30min solo + 30min grupo)
   - Sessão 2: 11:30 - 12:00 (30min grupo)
   - Total: 90min (30min solo + 60min grupo)
   
   Estatísticas Usuario2:
   - Sessão única: 10:30 - 12:00 (90min, 30min solo + 60min grupo)
```

## Cálculo de Estatísticas

### Durações Calculadas Automaticamente

Quando a jogatina é finalizada (último jogador sai), o sistema calcula automaticamente para cada jogador:

- **solo_duration_minutes**: Tempo jogado sozinho (sem outros jogadores ativos)
- **group_duration_minutes**: Tempo jogado em grupo (com pelo menos 1 outro jogador ativo)
- **total_duration_minutes**: Tempo total (solo + grupo)

O cálculo é feito analisando todos os eventos registrados e determinando em cada momento quantos jogadores estavam ativos.

### Status Manual

O campo `status` em `jogatina_players` deve ser definido **manualmente** pela interface web:
- **Dropo**: Jogador abandonou/dropou
- **Zero**: Jogador zerou o jogo
- **Dava pra jogar**: Jogador poderia continuar jogando

O status **não é calculado automaticamente** - é uma avaliação manual feita pelos administradores.

### Timestamps Automáticos

**IMPORTANTE**: Os timestamps são gerados automaticamente pelo servidor no momento do recebimento da requisição. 

- ✅ Não é necessário enviar `timestamp` no payload
- ✅ Garante sincronização correta entre eventos
- ✅ Evita problemas de fuso horário
- ✅ Timestamps sempre precisos e em ordem

### Exemplo de Cálculo

```
Timeline de eventos:
- 10:00 - Usuario1 joined
- 10:30 - Usuario2 joined  (Usuario1 agora está em grupo)
- 11:00 - Usuario2 left    (Usuario1 volta para solo)
- 11:30 - Usuario1 left

Resultado Usuario1:
- Solo: 30min (10:00-10:30) + 30min (11:00-11:30) = 60min
- Grupo: 30min (10:30-11:00) = 30min
- Total: 90min
```

## Testes

### Exemplo com cURL

```bash
# Registrar entrada
curl -X POST https://seu-dominio.com/api/discord/events \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_id": "@teste",
    "game_title": "Minecraft",
    "event_type": "player_joined"
  }'

# Registrar saída
curl -X POST https://seu-dominio.com/api/discord/events \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_id": "@teste",
    "game_title": "Minecraft",
    "event_type": "player_left"
  }'

# Consultar eventos
curl https://seu-dominio.com/api/jogatinas/{jogatina_id}/events
```

## Notas Importantes

1. **Jogadores Inativos**: Quando um jogador sai, ele é marcado como `is_active: false` mas permanece na jogatina
2. **Retorno de Jogadores**: Se um jogador volta, seu `is_active` é atualizado para `true` e novos eventos são registrados
3. **Múltiplas Sessões**: Um mesmo jogador pode ter várias sessões (entrar/sair/entrar) na mesma jogatina
4. **Timestamps Automáticos**: Não envie `timestamp` - ele é gerado automaticamente pelo servidor
5. **Cálculo Automático**: Durações são calculadas automaticamente quando a jogatina é finalizada
6. **Jogatinas Ativas**: Apenas uma jogatina ativa por jogo por vez
7. **Criação Automática**: Jogadores e jogos são criados automaticamente se não existirem
8. **Finalização**: Jogatina é finalizada automaticamente quando o último jogador ativo sai
9. **Status Manual**: O campo `status` deve ser atualizado manualmente via interface web, não é calculado automaticamente

## Implementação Recomendada no Bot

```python
# Pseudo-código
on_player_starts_game(player_id, game_name):
    send_event("player_joined", player_id, game_name)

on_player_stops_game(player_id, game_name):
    send_event("player_left", player_id, game_name)

def send_event(event_type, player_id, game_name):
    # Timestamp é gerado automaticamente pelo servidor
    requests.post(
        "https://api.seu-dominio.com/api/discord/events",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "discord_id": player_id,
            "game_title": game_name,
            "event_type": event_type
        }
    )
```
