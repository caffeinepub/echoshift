# Specification

## Summary
**Goal:** Assign a random non-Anchor role to every non-Anchor player when a game starts, and persist those roles in the room state.

**Planned changes:**
- Update backend `startGame(roomCode, hostId)` so that after the existing Anchor assignment, each other player is assigned exactly one random role from: `Overly Dramatic`, `Suspicious`, `Motivational`, `Alien`, `Villain`, `Emotional`, `Reporter`, `Conspiracy`.
- Persist the assigned non-Anchor roles so `getRoomState(roomCode)` returns updated `players[].role` values.
- Ensure the Anchor’s `role` is not modified and no other room/player fields are changed beyond what `startGame` already changes.

**User-visible outcome:** Starting a game results in one Anchor and all other players automatically having a saved random role from the provided list (reflected in subsequent room state reads).
