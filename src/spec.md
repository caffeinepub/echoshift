# Specification

## Summary
**Goal:** Build the EchoShift MVP for a room-based multiplayer chat game with a full lobby-to-results flow, anonymous usernames, and polling-based multiplayer updates.

**Planned changes:**
- Create frontend app structure with screens and state-driven navigation: Home (Create/Join), Lobby (room code, players, host controls), Game Chat, Guessing, Results.
- Generate anonymous client-side usernames in the format AdjectiveAnimalNumber and persist locally with an explicit reset option.
- Implement a single Motoko backend actor for room management: create/join/leave rooms, track players, host, and current phase/status.
- Implement polling-based near-real-time updates (React Query refetch intervals) for lobby state and chat messages, with reduced/paused polling when not in an active room/game screen.
- Add backend game flow: host can start (3–6 players), assign exactly one Anchor and Personality Cards to others, with per-player secret retrieval that doesn’t leak in public room state.
- Implement chat APIs (post/list per room) and a Game Chat UI with scrolling message list and message input (optimistic UI allowed).
- Implement guessing and results: only Anchor can submit one guess; results reveal Anchor, all Personality Cards (non-Anchor), guessed player, and correctness.
- Apply a modern, clean, minimal, mobile-responsive UI theme with rounded cards, consistent typography/spacing, and a coherent non-blue/purple palette.
- Add guardrails and clear English errors for invalid room code, full room (>6), start with <3 players, and phase/permission violations; enforce these rules in backend and reflect in UI button states.

**User-visible outcome:** Users can create or join a room via code, see live-updating players in the lobby, start a game (host), chat during the game, let the Anchor submit a guess, and view results revealing roles/cards and whether the guess was correct—without logging in.
