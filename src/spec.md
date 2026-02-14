# Specification

## Summary
**Goal:** Enhance the Results screen with role reveals, guess highlighting, scoring, summary messages, and a Play Again flow that returns the room to the Lobby.

**Planned changes:**
- Update the Results screen to render all players and reveal roles: show the exact label "Anchor" for the Anchor, otherwise show the player.role as the Personality Card name.
- Visually highlight which players were selected in roomState.guesses and differentiate correct vs incorrect selections based on whether the selected player is non-Anchor.
- Compute and display per-player points on the Results screen (Anchor: 1 per correct guess; each non-Anchor: 1 if not guessed), computed client-side from roomState.
- Add Results summary messaging: "Anchor guessed X/Y correctly!" and per-player survival messages for non-Anchor players not guessed.
- Add a "Play Again" button that calls a backend reset to set the room back to lobby-ready state (phase #waiting and per-round state cleared), then refetch room state so all clients transition to Lobby via existing phase-based routing; show an English toast on failure.
- Fix backend submitGuesses correctCount calculation to count guesses that target non-Anchor players, independent of any guess text.

**User-visible outcome:** After a round ends, players see a clearer Results screen with revealed roles, highlighted guesses and correctness, points and summary messages, and can press "Play Again" to reset the room back to the Lobby for everyone.
