# AI Plan Workbench

AI-assisted planning workbench for turning one goal into a structured, editable plan with a timeline, daily task cards, check-ins, quality review, and traceable sources.

## Project Docs

- [Mobile App Plan](docs/MOBILE_APP_PLAN.md)

## Getting Started

First, run the development server:

```bash
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Current Core Flow

- Goal input
- MiMo-assisted plan generation
- Timeline execution
- Daily check-in
- Task editing
- AI task optimization
- Plan quality review
- Traceable planning sources
- Markdown export

## Verification

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Environment

Copy `.env.local.example` to `.env.local` and set the MiMo credentials for real model generation.
