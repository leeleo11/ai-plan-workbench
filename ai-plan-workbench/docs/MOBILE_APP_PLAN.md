# Mobile App Plan

## Product Direction

The mobile app is not a full copy of the web workbench. The web app is better for complex plan generation, large-screen editing, and debugging AI output. The mobile app should focus on daily execution:

- See today's task cards quickly.
- Check in with one tap.
- Delay or adjust a task with low friction.
- Review progress and plan quality.
- Generate or optimize plans through the backend, not directly from the device.

The core mobile loop is:

```text
Open app -> see today's task -> check in / adjust -> keep streak -> review plan health
```

## Recommended Stack

Use `React Native + Expo` for the first mobile version.

Reasons:

- The current web project already uses React and TypeScript.
- Expo gives a fast path to Android/iOS builds through EAS Build.
- The app can share types and API contracts with the current plan schema.
- Mobile iteration can start before introducing a full native team workflow.

The mobile app should call the existing backend APIs. It must not embed the MiMo API key.

```text
Expo App
  -> App Backend API
    -> MiMo / model provider
    -> source matching
    -> validation
    -> plan quality scoring
  <- structured plan
```

## MVP Screens

### Today

Primary mobile screen.

- Today's tasks.
- One-tap check-in.
- Delay task.
- Edit task.
- Today's progress.
- Next task card.

### Plan

Compact overview of the whole plan.

- Phase outline.
- Timeline grouped by date.
- Filters: all, todo, done, delayed.
- Task detail entry.

### Generate

Mobile-friendly generation form.

- Goal.
- Current level.
- Target level.
- Start date.
- Daily available time.
- Fixed duration or uncertain duration.

When duration is uncertain, generate a 30-day rolling plan first.

### Task Detail

Edit one task card.

- Title.
- Description.
- Date.
- Duration.
- Status.
- AI optimization instruction.

### Review

Mobile version of teacher comments.

- Quality score.
- AI task ratio.
- Daily workload.
- Risks.
- Traceable sources.
- Suggested next actions.

## Backend API Reuse

The first mobile app should reuse these current APIs:

- `POST /api/plans/generate`
- `POST /api/plans/optimize`

Recommended future APIs:

- `GET /api/plans/latest`
- `POST /api/plans/sync`
- `POST /api/tasks/:id/check-in`
- `POST /api/tasks/:id/delay`

## Shared Data Model

The mobile app should reuse the current `Plan` shape:

- `goal`
- `brief`
- `phases`
- `tasks`
- `risks`
- `history`

Important fields for mobile:

- `task.title`
- `task.description`
- `task.date`
- `task.durationMinutes`
- `task.status`
- `task.source`
- `goal.durationUncertain`
- `brief.sources[].url`
- `brief.sources[].verificationStatus`

## Local Storage

MVP:

- Store latest plan locally on device.
- Allow offline viewing of the latest plan.
- Queue check-ins if backend sync is not available yet.

Later:

- Account login.
- Cloud sync.
- Cross-device plan history.

## AI Integration Rules

Mobile must never call MiMo directly.

The mobile app sends user intent to the backend. The backend handles:

- API key.
- Provider selection.
- Timeout.
- Retry.
- Source matching.
- Plan validation.
- Quality scoring.
- Safe fallback when model output is incomplete.

## Visual Direction

Keep the original cute comic planning direction, but make it mobile-first:

- Large task cards.
- Fewer dense panels.
- Clear action buttons.
- Friendly labels: check in, delay, teacher comments, next card.
- Reduce dashboard feeling.
- Make the first screen feel like a daily planning notebook.

Avoid:

- SaaS admin layout.
- Tiny table-like task rows.
- Multi-column desktop patterns.
- Overly decorative elements that slow daily use.

## Development Phases

### Phase 1: Mobile Shell

- Create Expo app.
- Set up TypeScript.
- Add navigation.
- Add theme tokens matching the web app.
- Connect to local backend.

### Phase 2: Daily Execution MVP

- Today screen.
- Task cards.
- Check-in.
- Delay.
- Local latest plan storage.

### Phase 3: Plan Generation

- Mobile generation form.
- Fixed duration and uncertain duration support.
- Loading state.
- Error state.
- Result save.

### Phase 4: Review And Optimization

- Teacher comments screen.
- Quality score.
- Source cards.
- AI task optimization.
- Quality action to optimization instruction.

### Phase 5: Test Build

- Android internal build.
- iOS TestFlight build.
- Real-device layout checks.
- Network error checks.
- Notification prototype.

## Not In MVP

Do not add these to the first mobile version:

- Social/community features.
- Payments.
- Complex account system.
- Team collaboration.
- Full drag-and-drop calendar.
- Native widgets.

## Success Criteria

The mobile app is ready for first user testing when:

- A user can generate a plan from mobile.
- A user can open the app and know today's task within 3 seconds.
- A user can check in with one tap.
- A user can edit a task.
- A user can see plan quality and sources.
- A user can recover the latest plan after closing and reopening the app.
