# PointWave — Phase 2: Talent Matching

Phase 2 is a frontend-only hiring flow. No backend/database has been introduced yet.

## Included
- Dedicated `/matches` talent-matching workspace.
- Project selector for every client project saved in localStorage.
- Ranked freelancer recommendations using transparent frontend scoring.
- Match percentage based on skills, category fit, experience, availability and rating.
- Search and sort controls.
- Shortlist / remove shortlist state.
- Freelancer profile drawer with skills, evidence, previous work and match reasons.
- Invite-to-project interaction stored locally for the prototype.
- Dashboard links into matching for each client project.
- Publishing a project now hands off to the dedicated matching workspace.
- Dark mode styling, cursor spotlight, compact spacing and responsive layouts.

## Scoring prototype
Skills 55% · Category fit 20% · Experience 12% · Availability 8% · Rating 5%.
This is intentionally a transparent prototype score. Backend data and a more advanced matching service can replace it in a later phase.

## Run
npm install
npm run dev
