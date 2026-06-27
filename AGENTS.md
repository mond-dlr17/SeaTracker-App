# AGENTS.md — SeaTrack

Engineering guide for humans and AI agents working in this repo. Detailed, enforceable rules live in `.cursor/rules/*.mdc`; this file is the quick orientation.

## Stack

Expo SDK 55 · React 19 · React Native 0.83 · Expo Router · TypeScript (strict) · Firebase (Auth/Firestore/Storage) · TanStack Query · Zustand · axios.

## Commands

```bash
yarn ios            # build + run on iOS device (dev client)
yarn android        # build + run on Android device (dev client)
yarn start          # Metro / dev server
yarn web            # run on web

yarn lint           # ESLint
yarn lint:fix       # ESLint with autofix
yarn format         # Prettier write
yarn format:check   # Prettier check (CI)
yarn typecheck      # tsc --noEmit
```

Use **yarn** (a `yarn.lock` is committed). Install Expo-managed packages with `npx expo install <pkg>` to stay SDK-aligned.

## Architecture (layered, in `src/`)

```
app/       Expo Router routes ONLY — thin screens, no data logic
core/      App-wide providers / composition
features/  Self-contained modules: <feature>Service.ts (data) + <feature>Hooks.ts (Query)
domain/    Pure types/models — no React, no Firebase
shared/    components/ · services/ (api, env, firebase) · utils/ (colors, theme, ...)
```

Dependency direction (never violate): `app → features/core → shared → domain`.

## Golden rules

- Routes are thin: render UI + call feature hooks. No Firebase/axios in `src/app`.
- Data access lives in `features/<feature>/<feature>Service.ts`; UI consumes `*Hooks.ts` (TanStack Query) — never the service directly.
- Server state → TanStack Query. Session → `AuthProvider`/`useAuth`. Global UI → Zustand. Local → `useState`. Don't duplicate server data into stores.
- Read config only via `shared/services/env.ts` (`Env.*`), backed by `EXPO_PUBLIC_*` vars + `app.config.ts` `extra`. Never touch `process.env`/`Constants` elsewhere.
- Firebase initializes once in `shared/services/firebase.ts`; import `firebaseAuth`/`firestore`/`storage` from there.
- No hardcoded colors/spacing/radii — use `shared/utils/colors.ts` + `theme.ts`. Styles via `StyleSheet.create`.
- Native config goes in `app.config.ts` plugins; `/ios` and `/android` are generated — don't hand-edit. Adding native deps/plugins requires a dev-client rebuild.
- Keep `strict` TypeScript green; narrow untrusted external data with `satisfies`.

## Before opening a PR

Run `yarn typecheck && yarn lint && yarn format:check` and make sure they pass.
