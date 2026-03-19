# SeaTrack — Seafarer Career App (Expo + Firebase)

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure env

- Copy `.env.example` → `.env`
- Fill in Firebase web config + API base URL

3) Run

```bash
npm run ios
# or
npm run android
# or
npm run web
```

## Routing (Expo Router)

Routes live under `src/app/`:

- Auth: `src/app/(auth)/login.tsx`, `src/app/(auth)/register.tsx`
- Tabs: `src/app/(tabs)/...`
  - Certificates: `src/app/(tabs)/certificates/*`
  - Training: `src/app/(tabs)/training/index.tsx`
  - AI: `src/app/(tabs)/ai/index.tsx`
  - Profile + Tips: `src/app/(tabs)/profile/*`

## Firestore data model

- `users/{uid}`
  - `fullName`, `rank`, `yearsOfExperience`, `vesselTypes[]`, `isPremium`, `expoPushToken?`
- `users/{uid}/certificates/{certificateId}`
  - `name`, `issueDate` (YYYY-MM-DD), `expiryDate` (YYYY-MM-DD), `fileUrl?`, `filePath?`
- `trainings/{trainingId}`
  - `title`, `provider`, `location`, `courseType?`
- `posts/{postId}`
  - `title`, `subtitle?`, `body`, `createdAt?`

## AI endpoint

- POST `/aiAdvisor`
  - body: `{ profile, certificates }`
  - response: `{ suggestions: string }`

