import { getIgdbAccessToken } from "./auth";

const IGDB_BASE_URL = "https://api.igdb.com/v4";

export async function igdbPost<T>(endpoint: string, body: string): Promise<T[]> {
  const clientId = process.env.IGDB_CLIENT_ID;

  if (!clientId) {
    throw new Error("IGDB_CLIENT_ID deve estar configurado");
  }

  const accessToken = await getIgdbAccessToken();

  const response = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  if (response.status === 429) {
    throw new Error("Limite de requisições IGDB atingido. Tente novamente em instantes.");
  }

  if (!response.ok) {
    throw new Error(`Erro na API IGDB: ${response.status}`);
  }

  return (await response.json()) as T[];
}
