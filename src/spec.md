# Specification

## Summary
**Goal:** Add a new `role` text field to each backend `Player` record (defaulting to `""`) while keeping app behavior and UI unchanged.

**Planned changes:**
- Update `backend/main.mo` `type Player` to include `role : Text`.
- Initialize `role = ""` for players created via `createRoom` and `joinRoom`.
- Regenerate/update frontend/backend type bindings as needed so the frontend compiles with the updated `Player` type, without introducing any UI changes.

**User-visible outcome:** No visible UI changes; the app behaves the same, with player data now including an additional `role` field (empty by default).
