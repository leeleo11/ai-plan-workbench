# AI Plan Workbench Product Design

## Overview

AI Plan Workbench is a planning application for exam preparation and structured personal goals. A user enters one sentence describing a goal, and the system generates a clear, attractive, editable plan visualization.

The first product focus is exam preparation. The app should work especially well for scenarios such as postgraduate entrance exams, IELTS, TOEFL, civil service exams, final exams, and similar study goals. It should also support structured professional goals such as learning Python, preparing for interviews, or completing a certification.

The first release should be a Web MVP. The mobile product comes later and focuses on daily execution, reminders, check-ins, and review.

## Product Positioning

This product is not a generic todo list and not a plain AI chat tool. It is an AI-assisted plan workbench:

> The user enters one goal, the system generates a validated visual plan, and the user can edit, execute, and optimize that plan over time.

Core value proposition:

> Generate a clear plan from one sentence, adjust it like a calendar, and understand progress like a roadmap.

## Target Users

Primary users:

- Students and exam candidates preparing for structured goals.
- Users with clear deadlines, limited daily time, and measurable target outcomes.

Secondary users:

- Professionals planning skill learning, interview preparation, certification study, or project-based self-improvement.

The first version should prioritize exam preparation because exam goals have clearer constraints: target date, current level, target score, subject modules, study stages, daily available time, practice, review, and mock tests.

### Initial Beachhead Segment

The first public prototype should not try to support every exam equally. The recommended beachhead is one highly structured exam-preparation category plus one generic fallback:

- Primary launch scenario: IELTS or postgraduate English preparation.
- Secondary fallback: general skill learning.

This keeps the first template set focused enough to review and test. Support for civil service exams, final exams, TOEFL, and broader workplace goals should come after the first planning loop has been validated with real users.

## Product Path

The product should evolve in two major stages:

1. AI Plan Workbench
   - One-sentence goal input.
   - Validated AI-generated plan.
   - Gantt/calendar workbench.
   - Manual editing.
   - Local AI optimization.
   - Check-ins and progress feedback.

2. AI Study and Goal Companion
   - Daily coaching.
   - Weekly reviews.
   - Long-term goal tracking.
   - Personalized adjustments.
   - Learning reports.
   - Optional integration with materials, notes, or mistake review.

The first stage should avoid becoming a full study management platform too early. The MVP should prove the core loop: generate, edit, execute, and adjust.

## Core User Flow

1. Goal input
   - The user enters a natural language goal.
   - Example: "I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day."

2. AI follow-up
   - The system asks only the most important missing questions.
   - Examples: exam date, current level, daily available time, weak areas.
   - The user can skip and generate with defaults.

3. Plan generation
   - The system generates three levels:
     - Phases, such as foundation, strengthening, mock test, and final review.
     - Weekly themes and milestones.
     - Daily executable tasks.

4. Correctness validation
   - The generated plan is checked by a rules engine before becoming the final plan.
   - Risks and unrealistic assumptions are surfaced to the user.

5. Visual workbench
   - The user views the plan through a Gantt/calendar hybrid.
   - Supporting views include outline, mind map, today's tasks, and risk report.

6. Manual editing
   - The user can rename tasks, change dates, adjust durations, add or delete tasks, change priority, and mark completion.
   - The user can drag tasks on the calendar or timeline.

7. Local AI optimization
   - The user selects a week, phase, or group of tasks and asks AI to adjust only that range.
   - Example: "I only have time on Wednesday and Saturday this week. Please reschedule this week."

8. Execution feedback
   - The user checks off daily tasks.
   - The system tracks progress and identifies delay or overload risks.
   - The user can rebalance the remaining plan.

## Product Trust Boundaries

The product should be careful about what "correct" means. For this product, correctness means:

- The plan is internally consistent.
- The plan fits the user's stated time constraints.
- The plan follows a reasonable stage order for the selected goal type.
- The tasks are specific enough to execute.
- Risks and assumptions are visible to the user.

Correctness does not mean the product guarantees exam results, score improvement, admission, certification success, or professional outcomes. The UI should communicate the plan as an assisted planning recommendation, not as a guaranteed result.

## Key Product Modules

### Goal Input Module

The entry experience should be centered around one large input field. The user should not start with a long form.

The system extracts:

- Goal type.
- Deadline.
- Current level.
- Target level.
- Daily available time.
- Weak areas.
- Preferred intensity.

### AI Follow-up Module

The system should ask 2 to 4 high-value questions only when required fields are missing. It should not feel like filling out a questionnaire.

The user should always have a "generate with defaults" option.

### Plan Generation and Validation Module

The plan generation backend should use this flow:

```text
User goal
-> Goal parsing
-> Missing information follow-up
-> Template matching
-> Structured plan generation
-> Schema validation
-> Rules validation
-> AI correction if needed
-> Final plan and risk report
```

The model output should not be treated as final until it passes schema and rule checks.

The validation layer should produce both blocking errors and non-blocking warnings:

- Blocking errors prevent the plan from being shown as final.
- Warnings are shown to the user as risk notes while still allowing the plan to be used.

### Plan Workbench Module

The Web workbench should use a three-area layout:

- Left: phase and week outline.
- Center: Gantt/calendar hybrid.
- Right: task detail editor.

Expected actions:

- Drag task dates.
- Edit task title.
- Edit duration.
- Add or delete tasks.
- Set priority.
- Mark completion.
- View risk warnings.
- Switch between Gantt, calendar, outline, today's tasks, and risk report.

### Local AI Optimization Module

The user should be able to select a local plan range and request a targeted adjustment.

Examples:

- "Compress this phase to 10 days."
- "Increase reading practice in this week."
- "Do not change the first two weeks. Only adjust later tasks."
- "I missed three days. Rebalance the rest."

The system should return a change preview before applying:

- Tasks added.
- Tasks removed.
- Task dates changed.
- Duration changed.
- Risk level changed.

The user confirms before the plan is updated.

Every AI optimization should create a version snapshot so the user can undo changes. This is important because plan editing is a trust-sensitive workflow: users need to feel safe trying AI adjustments.

### Execution Feedback Module

The first version should support:

- Daily task list.
- Complete, skip, or delay task.
- Progress percentage.
- Overdue and overload warnings.
- One-click rebalance for future tasks.

The mobile version should later make this module the primary experience.

## Page Structure

### Web MVP Pages

1. New Plan
   - One goal input field.
   - Example prompts.
   - Generate button.

2. Information Follow-up
   - AI asks missing questions.
   - User can answer or skip with defaults.

3. Generating
   - Shows progress states:
     - Analyzing goal.
     - Matching template.
     - Splitting phases.
     - Validating feasibility.
     - Creating visual plan.

4. Plan Workbench
   - Main product page.
   - Gantt/calendar hybrid as default.
   - Switchable outline, mind map, today's tasks, and risk report.

5. Task Detail Panel
   - Side panel rather than separate page.
   - Used for editing task fields.

6. Plan List
   - User manages multiple plans.
   - Example: IELTS, postgraduate English, Python learning, interview preparation.

### Future Mobile Pages

Mobile should not fully replicate the complex Web workbench. It should focus on execution:

- Today's tasks.
- Check-in.
- Reminder.
- Progress.
- Simple adjustments.
- AI review and suggestions.

## Plan Data Model

Plans should be stored as structured data rather than natural language text. The same data should drive Web visualization, mobile daily tasks, AI optimization, and progress analytics.

Example structure:

```json
{
  "goal": {
    "title": "90-day IELTS plan to reach 7.0",
    "type": "exam",
    "targetDate": "2026-09-01",
    "currentLevel": "5.5",
    "targetLevel": "7.0",
    "dailyAvailableMinutes": 120
  },
  "phases": [
    {
      "id": "phase_1",
      "title": "Foundation",
      "startDate": "2026-06-01",
      "endDate": "2026-06-30",
      "objective": "Strengthen vocabulary, grammar, listening, and reading foundations",
      "tasks": ["task_1", "task_2"]
    }
  ],
  "tasks": [
    {
      "id": "task_1",
      "title": "Memorize 80 core vocabulary words",
      "date": "2026-06-01",
      "durationMinutes": 40,
      "category": "vocabulary",
      "priority": "high",
      "status": "todo",
      "dependsOn": [],
      "source": "ai_generated"
    }
  ],
  "risks": [
    {
      "type": "overload",
      "message": "Week 3 exceeds the user's available daily study time.",
      "severity": "medium",
      "relatedTaskIds": ["task_12", "task_13"]
    }
  ]
}
```

The production schema should be stricter than this example and include versioning so plans can evolve safely over time.

The production data model should also include:

- Plan version number.
- Change history.
- Source of each task, such as template, AI generated, user edited, or AI optimized.
- Validation status.
- User confirmation status for AI-generated changes.

## Correctness Requirements

Plan correctness is a core product requirement. The system should not simply display whatever the model generates.

### Correctness Strategy

1. Use domain templates.
   - Exam and learning categories should have reusable templates.
   - The model selects and adapts a template rather than inventing the entire structure from scratch.
   - Templates should have an owner, version, review date, and supported goal type.

2. Force structured output.
   - The model must return JSON matching a schema.
   - Invalid structure should trigger repair or regeneration.

3. Run deterministic validation.
   - The backend checks time, stage order, task size, and intensity.

4. Show risk feedback.
   - The user should see warnings when the plan is aggressive or uncertain.

5. Learn from execution.
   - Completion data should be used to rebalance future tasks.

### Initial Rule Checks

The MVP should include these checks:

- Daily capacity: total task minutes should not exceed the user's available time.
- Stage order: plans should follow reasonable learning order, such as foundation before mock tests.
- Buffer time: long plans should include buffer or lighter review days.
- Task granularity: tasks should be specific enough to execute.
- Realistic intensity: extreme goals or high daily loads should be flagged.
- Dependency order: dependent tasks should not appear before prerequisites.
- Goal-type structure: IELTS, postgraduate English, civil service exams, final exams, and skill learning should each have different planning templates.
- Completion feedback: repeated unfinished tasks should trigger a suggestion to reduce intensity or extend the timeline.

### Template Quality Control

Because the product relies on templates for trust, each template should include:

- Goal type and supported use cases.
- Required user inputs.
- Default assumptions.
- Stage structure.
- Task category mix.
- Validation rules specific to the template.
- Review notes or source rationale.

The first prototype can start with simple internal templates, but before commercial launch the most important exam templates should be reviewed by someone familiar with the exam.

### Risk Examples

- "Current plan is aggressive because the target improvement is large and the deadline is close."
- "This week exceeds your available time by 180 minutes."
- "The plan has too few review days before the exam."
- "Several tasks are too broad and may be hard to complete."

## AI Generation Flow

### Full Plan Generation

```text
1. Parse user goal.
2. Extract goal type, deadline, current level, target level, daily time, and constraints.
3. Ask for missing critical fields.
4. Match a planning template.
5. Generate structured plan JSON.
6. Validate schema.
7. Run rule checks.
8. Send validation errors back to AI for targeted repair.
9. Return final plan, explanation, and risk report.
```

### Local Optimization

```text
1. User selects a local range.
2. User enters an adjustment request.
3. Backend extracts the relevant plan slice and adjacent dependencies.
4. AI proposes changes only for the selected range.
5. Rules engine validates local and global impact.
6. Backend returns a diff preview.
7. User confirms.
8. System applies the change and records history.
```

Local optimization should never silently rewrite the entire plan.

## Mobile Large Model Integration

Mobile clients should not call large model APIs directly. The correct architecture is:

```text
Web / Mobile / Mini Program
-> Backend API
-> Plan generation service
-> Large model API + template library + validation engine
-> Structured plan response
```

Reasons:

- API keys must not be exposed in mobile apps.
- Authentication, rate limits, billing, and logging belong on the backend.
- Web and mobile can share the same AI capabilities.
- Templates, validation, and data storage are server-side responsibilities.
- The model provider can be changed later without app releases.

Suggested API shape:

```text
POST /api/plans/generate
POST /api/plans/{id}/optimize
POST /api/plans/{id}/tasks/{taskId}/complete
GET  /api/plans/{id}/today
GET  /api/plans/{id}/risks
```

## Technical Architecture

Recommended stack:

- Web frontend: React or Next.js.
- Mobile: React Native or Flutter in a later phase.
- Backend API: Node.js or Python.
- Database: PostgreSQL.
- AI orchestration: backend service calling model APIs.
- Rules engine: backend validation module.
- Optional future cache and queue: Redis.

Suggested frontend libraries:

- Calendar: FullCalendar.
- Drag and drop: dnd-kit.
- Mind map or node graph: React Flow in a later phase.
- Gantt/timeline: evaluate Frappe Gantt, dhtmlxGantt, or a custom lightweight timeline.

The Web MVP should avoid over-investing in a fully custom diagram editor. Use proven libraries where possible.

## MVP Scope

The Web MVP must include:

- One-sentence plan creation.
- AI follow-up for missing fields.
- Structured plan generation.
- Domain template matching for at least 2 to 3 exam or learning categories.
- Gantt/calendar plan workbench.
- Manual task editing.
- Drag-to-reschedule.
- Basic check-in and progress tracking.
- Local AI optimization.
- Correctness validation and risk warnings.

To keep the first MVP realistic, the initial implementation should ship in two slices:

1. Prototype slice
   - One primary template.
   - Generate structured plan.
   - Show plan as timeline/calendar.
   - Allow basic editing.
   - Show basic risk warnings.

2. MVP slice
   - Add local AI optimization.
   - Add plan list and persistence.
   - Add progress tracking.
   - Add additional templates.
   - Add version history and undo for AI changes.

The MVP should not include:

- Social community.
- Full course marketplace.
- Complete mistake notebook.
- Complex collaborative editing.
- Full mobile app.
- Highly customizable graphic design editor.

## Development Milestones

### Phase 0: Prototype Validation, 1-2 Weeks

Goal: test whether users like the one-sentence-to-plan experience.

Deliverables:

- Goal input page.
- Generated result page.
- Static or semi-dynamic plan visualization.
- 1 primary template and 1 generic fallback.
- Basic validation rules.
- Lightweight user feedback collection.

### Phase 1: Web MVP, 4-6 Weeks

Goal: complete the core product loop.

Deliverables:

- Account or anonymous plan persistence.
- Plan list.
- AI plan generation.
- Structured JSON schema.
- Gantt/calendar workbench.
- Manual editing.
- Drag date adjustment.
- Basic validation rules.
- Local AI optimization.
- Check-in and progress.
- Version history and undo for AI-applied changes.

### Phase 2: Exam Scenario Enhancement, 4-8 Weeks

Goal: improve correctness, trust, and retention.

Deliverables:

- Templates for postgraduate English, IELTS, civil service exams, and final exams.
- Risk report.
- Auto-rebalance.
- Weekly review.
- Study intensity analysis.
- Export to image or PDF.

### Phase 3: Mobile Release

Goal: support daily execution.

Deliverables:

- Today's tasks.
- Check-in.
- Reminders.
- Progress.
- Simple adjustment.
- AI review suggestions.

### Phase 4: AI Companion

Goal: evolve from planning tool to long-term learning and goal companion.

Deliverables:

- Daily AI coaching.
- Learning review.
- Personalized plan adjustment.
- Long-term tracking.
- Optional notes, materials, or mistake review integration.

## Business Model

Recommended model: freemium.

Free tier:

- Limited monthly plan generations.
- Basic editing.
- Basic check-ins.

Paid tier:

- More or unlimited plan generation.
- Advanced templates.
- Local AI optimization.
- Risk report.
- Auto-rebalance.
- Export to PDF or image.
- Mobile reminders.
- Weekly AI review.

Potential vertical packages:

- IELTS plan package.
- Postgraduate English package.
- Civil service exam package.
- Final exam package.
- Interview preparation package.

## Success Metrics

Prototype metrics:

- Percentage of users who generate a plan after entering a goal.
- Percentage of users who say the plan feels useful or realistic.
- Time from goal input to first useful plan.

MVP metrics:

- Plan generation completion rate.
- Manual edit rate.
- Local optimization usage rate.
- Daily check-in retention.
- Plans with validation warnings resolved.
- Week 1 retention.

Correctness metrics:

- Percentage of generated plans passing validation on first attempt.
- Average number of validation repairs per plan.
- User-reported unrealistic task rate.
- Completion rate by plan intensity.

## Open Decisions

The following decisions can be made during implementation planning:

- Whether the first backend should be Node.js or Python.
- Which Gantt/timeline library is best after quick technical evaluation.
- Whether the first prototype needs login or can use local/anonymous persistence.
- Which 2 to 3 templates should be included in the first prototype.

Recommended initial templates:

- IELTS or TOEFL.
- Postgraduate English.
- General skill learning.

## Final Recommendation

Build the first version as a Web AI Plan Workbench:

- Start with exam preparation users.
- Generate structured plans from one sentence.
- Use domain templates and validation rules to improve correctness.
- Render plans as a Gantt/calendar workbench.
- Support practical manual editing and local AI optimization.
- Save mobile for the execution-focused second stage.

This path keeps the first product focused while leaving room to grow into a broader AI study and goal companion.
