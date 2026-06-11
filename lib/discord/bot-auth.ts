const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY;

export function verifyDiscordBotAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === DISCORD_BOT_API_KEY;
}
