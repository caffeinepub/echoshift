export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function getOrCreatePlayerId(): string {
  const stored = localStorage.getItem('echoshift-player-id');
  if (stored) return stored;
  
  const newId = generatePlayerId();
  localStorage.setItem('echoshift-player-id', newId);
  return newId;
}
