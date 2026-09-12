# Ausbildung Tracker

A local, single-user web app for managing applications for an IT Ausbildung
(German vocational training). Every application, its status, deadlines and the
related email correspondence live in one place, and job listings can be pulled
in directly from the Bundesagentur für Arbeit.

The interface and code comments are in Russian; identifiers and file names are
in English.

## Why

Applying for an Ausbildung as Fachinformatiker means dozens of applications
across many companies over about a year. Who has received what, who has invited,
who has declined and which deadline runs out next gets messy fast in a
spreadsheet plus an inbox. This app is built for my own application round
(training start in August 2027) and is meant to grow with it: once the training
starts, it will also keep the weekly Berichtsheft.

## Features

- **Applications.** Company, profession, city, listing URL, sent date, status
  (`draft → sent → invitation → offer / rejected`), deadline, commute time and
  notes. Status can be changed straight from the list.
- **Job search.** Searches Ausbildung listings through the public
  Bundesagentur für Arbeit job API, filters by earliest start date and imports a
  listing as a draft application in one click. The listing's reference number
  is unique, so nothing is imported twice. The search layer is written for
  several sources; one is implemented so far.
- **Profile.** Personal data, school, grades from the last two report cards,
  languages, internships and PDF certificates, as the basis for generating
  cover letters (Anschreiben) later.
- **Gmail, read-only.** Connects a Gmail account with the `gmail.readonly`
  scope, matches mail from the last 60 days to applications by sender domain
  and company name, and classifies it by keywords (invitation, rejection,
  confirmation of receipt). Every suggestion needs an explicit click; the app
  never changes a status on its own and never sends, labels or deletes mail.
  Message bodies are not stored, only sender, subject and date.
- **Berichtsheft.** Planned: weekly training reports once the Ausbildung starts.

## Stack

- Next.js 16 (App Router, Server Components, Server Actions), React 19,
  TypeScript in `strict` mode
- Tailwind CSS 4
- SQLite via better-sqlite3, Drizzle ORM, migrations generated with drizzle-kit
- Zod for server-side validation of every form and action input
- Google OAuth 2.0 and the Gmail REST API called with plain `fetch`, no client
  library

## Getting started

Requires Node.js 24 and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. The SQLite database is created under `data/` and
migrations are applied automatically on first start.

### Gmail (optional)

The Gmail module needs an OAuth client in Google Cloud Console:

1. Create a project and enable the Gmail API.
2. Create OAuth credentials of type "Web application" with the redirect URI
   `http://localhost:3000/api/gmail/callback`.
3. Put client ID, client secret and redirect URI into `.env` (see
   `.env.example`) and restart the dev server.
4. Open `/gmail` and connect the account.

While the Google app is in "Testing" mode, refresh tokens expire after about a
week. The page detects this and offers to reconnect; nothing is lost.

## Scripts

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | development server on port 3000                     |
| `npm run build`       | production build                                    |
| `npm run typecheck`   | route type generation plus `tsc --noEmit`           |
| `npm run lint`        | ESLint                                              |
| `npm run db:generate` | generate a migration from schema changes            |
| `npm run db:studio`   | Drizzle Studio, browse the database in the browser  |

## Project structure

```
src/app/          routes (App Router); pages only assemble components from features
src/features/     one folder per module: queries, actions, validation, labels, components
  applications/   application list, form, status changes, dated note lines
  jobsearch/      job source contract, Arbeitsagentur source, search page, import
  profile/        profile form, grades, languages, internships, PDF storage
  gmail/          OAuth, Gmail client, matching, classification, sync, suggestions
src/db/           Drizzle client and schema, one schema file per module
src/lib/          shared helpers: dates, form schema building blocks, pluralization
drizzle/          generated SQL migrations
```

Conventions: database reads live in `queries.ts`, mutations are Server Actions
in `actions.ts` validated with Zod, UI strings sit in `labels.ts`. Calendar
dates are stored as ISO strings, enumerations as text with CHECK constraints.

## Scope: local and single-user

There is no authentication and no multi-user support. This is a deliberate
decision, not an oversight: the app runs on its owner's machine, keeps all data
in a local SQLite file, and Gmail tokens stay in that file too. Deploying it
as-is to a public server would expose that data. Authentication stays out of
scope until there is a reason to host the app somewhere.

## Built with Claude Code

This project is developed with Claude Code, Anthropic's coding agent, as a
pair-programming tool. The architecture, module boundaries, data model and the
individual tasks are mine; the code is written together with the assistant, and
each commit carries a `Co-Authored-By` line. The working agreement for the
agent lives in `CLAUDE.md` (in Russian).

## Next steps

- Filters and search on the application list, deadline reminders
- Cover letter generation from the profile
- Commute time from a public transport API instead of manual entry
- Berichtsheft module
