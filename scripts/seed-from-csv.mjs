import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { parse } from "csv-parse/sync"
import { join } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const csvPath = join(process.cwd(), "data", "jogatinas.csv")
const csvContent = readFileSync(csvPath, "utf-8")
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
})

// Nomes dos jogadores (colunas do CSV)
const playerNames = ["Saudades_Dela", "Heizmen", "Kiro", "Natan", "Rogerin"]

// Mapeamento de status
const statusMap = {
  Dropo: "Dropo",
  Zero: "Zero",
  "Dava pra joga": "Dava pra jogar",
  "Não jogo": "Não jogo", // Será ignorado
}

async function seedDatabase() {
  console.log("[v0] Iniciando população do banco de dados...")

  // 1. Criar jogadores
  console.log("[v0] Criando jogadores...")
  const playerIds = {}

  for (const playerName of playerNames) {
    const { data, error } = await supabase.from("players").insert({ name: playerName }).select().single()

    if (error) {
      console.error(`[v0] Erro ao criar jogador ${playerName}:`, error)
      continue
    }

    playerIds[playerName] = data.id
    console.log(`[v0] Jogador criado: ${playerName} (${data.id})`)
  }

  // 2. Processar cada linha do CSV (cada jogo)
  console.log("[v0] Processando jogos e jogatinas...")
  let gamesCreated = 0
  let jogatinaCreated = 0
  let playersAdded = 0

  for (const record of records) {
    const gameName = record.Jogo

    if (!gameName || gameName.trim() === "") {
      continue
    }

    // Criar o jogo
    const { data: game, error: gameError } = await supabase.from("games").insert({ title: gameName }).select().single()

    if (gameError) {
      console.error(`[v0] Erro ao criar jogo ${gameName}:`, gameError)
      continue
    }

    gamesCreated++
    console.log(`[v0] Jogo criado: ${gameName}`)

    // Criar uma jogatina para este jogo
    const { data: jogatina, error: jogatinaError } = await supabase
      .from("jogatinas")
      .insert({
        game_id: game.id,
        date: new Date().toISOString(),
        notes: "Importado do CSV",
      })
      .select()
      .single()

    if (jogatinaError) {
      console.error(`[v0] Erro ao criar jogatina para ${gameName}:`, jogatinaError)
      continue
    }

    jogatinaCreated++

    // Adicionar jogadores na jogatina com seus status
    for (const playerName of playerNames) {
      const status = record[playerName]
      const mappedStatus = statusMap[status]

      // Ignorar se o jogador não jogou
      if (!mappedStatus || mappedStatus === "Não jogo") {
        continue
      }

      const playerId = playerIds[playerName]
      if (!playerId) {
        console.error(`[v0] ID do jogador ${playerName} não encontrado`)
        continue
      }

      const { error: playerError } = await supabase.from("jogatina_players").insert({
        jogatina_id: jogatina.id,
        player_id: playerId,
        status: mappedStatus,
      })

      if (playerError) {
        console.error(`[v0] Erro ao adicionar jogador ${playerName} na jogatina:`, playerError)
        continue
      }

      playersAdded++
    }
  }

  console.log("[v0] ========================================")
  console.log("[v0] População do banco de dados concluída!")
  console.log(`[v0] Jogadores criados: ${playerNames.length}`)
  console.log(`[v0] Jogos criados: ${gamesCreated}`)
  console.log(`[v0] Jogatinas criadas: ${jogatinaCreated}`)
  console.log(`[v0] Participações adicionadas: ${playersAdded}`)
  console.log("[v0] ========================================")
}

seedDatabase().catch(console.error)
