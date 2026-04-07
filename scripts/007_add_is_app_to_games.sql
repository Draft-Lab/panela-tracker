-- Adicionar coluna is_app para distinguir aplicativos de jogos
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_app boolean DEFAULT false;

-- Marcar aplicativos conhecidos automaticamente
UPDATE games SET is_app = true WHERE title ILIKE ANY(ARRAY[
  '%Spotify%', '%Visual Studio Code%', '%VSCode%', '%Code%',
  '%Chrome%', '%Firefox%', '%Brave%', '%Edge%', '%Opera%', '%Safari%',
  '%Discord%', '%OBS%', '%OBS Studio%', '%Streamlabs%',
  '%YouTube%', '%Twitch%', '%Netflix%', '%Prime Video%', '%Disney+%', '%Crunchyroll%',
  '%Slack%', '%Telegram%', '%WhatsApp%', '%Teams%',
  '%Steam%', '%Epic Games Launcher%', '%Battle.net%', '%Xbox App%', '%GeForce%', '%AMD Software%',
  '%Windows%', '%File Explorer%', '%Task Manager%',
  '%Figma%', '%Photoshop%', '%Illustrator%', '%Premiere%', '%After Effects%',
  '%Word%', '%Excel%', '%PowerPoint%', '%Notion%', '%Obsidian%',
  '%Terminal%', '%PowerShell%', '%Git%', '%GitHub Desktop%',
  '%VLC%', '%foobar%', '%Tidal%', '%Deezer%', '%Apple Music%'
]);
