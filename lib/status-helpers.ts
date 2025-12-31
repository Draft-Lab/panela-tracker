/**
 * Helpers para determinar a fonte correta de status
 *
 * Regra:
 * - Se jogatina tem season_id: usar season_participants.status
 * - Se jogatina NÃO tem season_id: usar jogatina_players.status
 *
 * Isso mantém compatibilidade com sistema antigo (pré-temporadas)
 */

import { JogatinaWithDetails, JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types";

/**
 * Agrupa jogatinaPlayers por fonte de status
 */
export function groupJogatinaPlayersByStatusSource(jogatinaPlayers: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[]) {
  const withSeason: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[] = [];
  const withoutSeason: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[] = [];

  jogatinaPlayers.forEach((jp) => {
    if (jp.jogatina?.season_id) {
      withSeason.push(jp);
    } else {
      withoutSeason.push(jp);
    }
  });

  return { withSeason, withoutSeason };
}

/**
 * Calcula estatísticas considerando ambas as fontes
 */
export function calculateStatusStats(
  jogatinaPlayers: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[],
  seasonParticipants: (SeasonParticipant & { player?: Player })[] = [],
) {
  const { withoutSeason } = groupJogatinaPlayersByStatusSource(jogatinaPlayers);

  // Estatísticas de jogatinas antigas (sem temporada)
  const oldSystemStats = {
    dropos: withoutSeason.filter((jp) => jp.status === "Dropo").length,
    zeros: withoutSeason.filter((jp) => jp.status === "Zero").length,
    davaJogar: withoutSeason.filter((jp) => jp.status === "Dava pra jogar")
      .length,
    total: withoutSeason.length,
  };

  // Estatísticas de temporadas
  const seasonStats = {
    dropos: seasonParticipants.filter((sp) => sp.status === "Dropo").length,
    zeros: seasonParticipants.filter((sp) => sp.status === "Zero").length,
    davaJogar: seasonParticipants.filter((sp) => sp.status === "Dava pra jogar")
      .length,
    emAndamento: seasonParticipants.filter((sp) => sp.status === "Em andamento")
      .length,
    total: seasonParticipants.length,
  };

  // Combinar ambos
  return {
    dropos: oldSystemStats.dropos + seasonStats.dropos,
    zeros: oldSystemStats.zeros + seasonStats.zeros,
    davaJogar: oldSystemStats.davaJogar + seasonStats.davaJogar,
    emAndamento: seasonStats.emAndamento,
    totalParticipations: oldSystemStats.total + seasonStats.total,
    dropRate:
      oldSystemStats.total + seasonStats.total > 0
        ? (
            ((oldSystemStats.dropos + seasonStats.dropos) /
              (oldSystemStats.total + seasonStats.total)) *
            100
          ).toFixed(1)
        : "0",
    oldSystem: oldSystemStats,
    newSystem: seasonStats,
  };
}

/**
 * Calcula estatísticas por jogador considerando ambas fontes
 */
export function calculatePlayerStats(
  jogatinaPlayers: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[],
  seasonParticipants: (SeasonParticipant & { player?: Player })[] = [],
) {
  const playerMap = new Map<
    string,
    {
      playerId: string;
      playerName: string;
      avatarUrl: string | null;
      totalJogatinas: number;
      dropos: number;
      zeros: number;
      davaPraJogar: number;
      emAndamento: number;
      dropoPercentage: number;
    }
  >();

  // Processar jogatinas antigas (sem temporada)
  const { withoutSeason } = groupJogatinaPlayersByStatusSource(jogatinaPlayers);

  withoutSeason.forEach((jp) => {
    const playerId = jp.player.id;

    if (!playerMap.has(playerId)) {
      playerMap.set(playerId, {
        playerId,
        playerName: jp.player.name,
        avatarUrl: jp.player.avatar_url,
        totalJogatinas: 0,
        dropos: 0,
        zeros: 0,
        davaPraJogar: 0,
        emAndamento: 0,
        dropoPercentage: 0,
      });
    }

    const stats = playerMap.get(playerId)!;
    stats.totalJogatinas++;

    if (jp.status === "Dropo") stats.dropos++;
    else if (jp.status === "Zero") stats.zeros++;
    else if (jp.status === "Dava pra jogar") stats.davaPraJogar++;
  });

  // Processar temporadas
  seasonParticipants.forEach((sp) => {
    const playerId = sp.player_id;
    const player = sp.player;

    if (!playerMap.has(playerId)) {
      playerMap.set(playerId, {
        playerId,
        playerName: player?.name || "Unknown",
        avatarUrl: player?.avatar_url || null,
        totalJogatinas: 0,
        dropos: 0,
        zeros: 0,
        davaPraJogar: 0,
        emAndamento: 0,
        dropoPercentage: 0,
      });
    }

    const stats = playerMap.get(playerId)!;

    // Contar temporadas como participações
    if (sp.total_sessions > 0) {
      stats.totalJogatinas += sp.total_sessions;
    }

    if (sp.status === "Dropo") stats.dropos++;
    else if (sp.status === "Zero") stats.zeros++;
    else if (sp.status === "Dava pra jogar") stats.davaPraJogar++;
    else if (sp.status === "Em andamento") stats.emAndamento++;
  });

  // Calcular percentuais
  const statsArray = Array.from(playerMap.values()).map((stat) => ({
    ...stat,
    dropoPercentage:
      stat.totalJogatinas > 0 ? (stat.dropos / stat.totalJogatinas) * 100 : 0,
  }));

  return statsArray.sort((a, b) => b.dropos - a.dropos);
}

/**
 * Retorna o status correto para uma jogatina_player
 */
export function getPlayerStatusForJogatina(
  jogatinaPlayer: JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails },
  seasonParticipants: SeasonParticipant[] = [],
): string {
  // Se a jogatina tem season_id, buscar status de season_participants
  if (jogatinaPlayer.jogatina?.season_id) {
    const seasonParticipant = seasonParticipants.find(
      (sp) =>
        sp.season_id === jogatinaPlayer.jogatina!.season_id &&
        sp.player_id === jogatinaPlayer.player_id,
    );
    return seasonParticipant?.status || "Em andamento";
  }

  // Caso contrário, usar status de jogatina_players (sistema antigo)
  return jogatinaPlayer.status;
}
