#!/usr/bin/env bash
# Creates labels, milestones, issues and the GitHub Project for TripSplit.
# Requirements: GitHub CLI (https://cli.github.com), then run:
#   gh auth login && gh auth refresh -s project
#   bash setup-github.sh
set -euo pipefail

REPO="JessicaVanessa12/TripSplit_Web"
JESSICA="JessicaVanessa12"
DANNA="Danna103"  

echo "== Labels"
lbl() { gh label create "$1" --color "$2" --description "$3" --repo "$REPO" --force >/dev/null; }
lbl user-story 4648c8 "User story"
lbl task 0e8a16 "Technical task"
lbl bug d73a4a "Something is broken"
lbl security b60205 "Security related"
lbl documentation 0075ca "Documentation"
lbl testing fbca04 "Automated tests"
lbl devops 5319e7 "Infrastructure / CI/CD"
lbl backend 1d76db "Backend"
lbl frontend f9a8d4 "Frontend"
lbl database c5def5 "Database"
lbl sprint-1 ededed "Sprint 1"; lbl sprint-2 ededed "Sprint 2"; lbl sprint-3 ededed "Sprint 3"
lbl sprint-4 ededed "Sprint 4"; lbl final ededed "Final delivery"
lbl priority-high b60205 "High priority"; lbl priority-medium fbca04 "Medium priority"

echo "== Milestones"
ms() { gh api "repos/$REPO/milestones" -f title="$1" -f due_on="$2" -f description="$3" >/dev/null 2>&1 || echo "  (milestone '$1' already exists)"; }
ms "Sprint 1 - Planning" "2026-10-13T23:59:59Z" "Requirements, use cases, ER model, user stories, security requirements"
ms "Sprint 2 - Initial implementation" "2026-10-27T23:59:59Z" "Auth, trips and participants with MySQL persistence, validations, integration tests"
ms "Sprint 3 - Integration and deployment" "2026-11-10T23:59:59Z" "Itinerary, expenses, balances, E2E tests, deployment, CI/CD"
ms "Sprint 4 - Consolidation" "2026-11-24T23:59:59Z" "Settlements, checklist, budget charts, vulnerabilities and tech debt"
ms "Final delivery" "2026-12-11T23:59:59Z" "Deployed app, 90% coverage, docs, report, defense"

echo "== Project board"
PNUM=$(gh project create --owner "@me" --title "TripSplit Board" --format json -q .number)
gh project link "$PNUM" --owner "@me" --repo "$REPO" >/dev/null || true

mk() { # title | labels | milestone | assignees | due-text ; body from stdin
  local body; body="$(cat)"
  local url
  url=$(gh issue create --repo "$REPO" --title "$1" --label "$2" --milestone "$3" --assignee "$4" --body "$body")
  gh project item-add "$PNUM" --owner "@me" --url "$url" >/dev/null
  echo "  $url"
}
S2="Sprint 2 - Initial implementation"; S3="Sprint 3 - Integration and deployment"
S4="Sprint 4 - Consolidation"; FIN="Final delivery"

echo "== User stories"
mk "HU-01: User registration" "user-story,sprint-2,backend,priority-high" "$S2" "$JESSICA" <<'B'
**As a** visitor, **I want** to create an account, **so that** I can use the application.

## Acceptance criteria
- [ ] Given an unregistered email and a password of at least 8 characters, the account is created and the API returns 201.
- [ ] If the email already exists, the API returns 409 without revealing other accounts' data.
- [ ] The password is stored hashed (bcrypt); it never appears in responses or logs.

**Points:** 3 | **Sprint:** 2 | **Responsible:** Jessica | **Due:** 2026-10-27
B
mk "HU-02: User login" "user-story,sprint-2,backend,priority-high" "$S2" "$JESSICA" <<'B'
**As a** user, **I want** to log in, **so that** I can access my trips.

## Acceptance criteria
- [ ] With correct credentials a token is issued and the API returns 200.
- [ ] With wrong credentials the API returns 401 with a generic message.
- [ ] Protected routes without a session return 401.

**Points:** 3 | **Sprint:** 2 | **Responsible:** Jessica | **Due:** 2026-10-27
B
mk "HU-03: Create trip" "user-story,sprint-2,backend,frontend,priority-high" "$S2" "$DANNA" <<'B'
**As a** user, **I want** to create a trip with destination, dates and budget, **so that** I can organize my getaway.

## Acceptance criteria
- [ ] With valid data the trip is created and the creator becomes the organizer.
- [ ] End date before start date, or a negative budget, returns 400 with error details.

**Points:** 3 | **Sprint:** 2 | **Responsible:** Danna | **Due:** 2026-10-27
B
mk "HU-04: View my trips" "user-story,sprint-2,backend,frontend,priority-high" "$S2" "$DANNA" <<'B'
**As a** participant, **I want** to see the list of my trips, **so that** I can quickly open each one.

## Acceptance criteria
- [ ] Only trips where I am a participant are listed.
- [ ] Opening a trip I do not belong to returns 403.

**Points:** 2 | **Sprint:** 2 | **Responsible:** Danna | **Due:** 2026-10-27
B
mk "HU-05: Add and remove participants" "user-story,sprint-2,backend,priority-high" "$S2" "$JESSICA" <<'B'
**As an** organizer, **I want** to add friends and colleagues to the trip, **so that** they can collaborate.

## Acceptance criteria
- [ ] Only the organizer can add or remove participants; others receive 403.
- [ ] Adding someone already included returns 409; an unregistered email returns 404.
- [ ] The added person sees the trip in their list.

**Points:** 3 | **Sprint:** 2 | **Responsible:** Jessica | **Due:** 2026-10-27
B
mk "HU-06: Edit or delete trip" "user-story,sprint-3,backend,frontend" "$S3" "$DANNA" <<'B'
**As an** organizer, **I want** to edit or delete the trip, **so that** I can fix changes of plans.

## Acceptance criteria
- [ ] Only the organizer can edit or delete.
- [ ] Deleting asks for confirmation and removes related data.

**Points:** 3 | **Sprint:** 3 | **Responsible:** Danna | **Due:** 2026-11-10
B
mk "HU-07: Add itinerary activities" "user-story,sprint-3,backend,frontend,priority-high" "$S3" "$DANNA" <<'B'
**As a** participant, **I want** to register activities with day, date and time, **so that** everyone knows the plan.

## Acceptance criteria
- [ ] The date must be inside the trip date range.
- [ ] Title is required; time has a valid format.

**Points:** 3 | **Sprint:** 3 | **Responsible:** Danna | **Due:** 2026-11-10
B
mk "HU-08: View ordered itinerary" "user-story,sprint-3,frontend" "$S3" "$DANNA" <<'B'
**As a** participant, **I want** activities grouped by day and ordered by time, **so that** I can follow the plan.

## Acceptance criteria
- [ ] Activities are grouped by date and sorted chronologically.

**Points:** 2 | **Sprint:** 3 | **Responsible:** Danna | **Due:** 2026-11-10
B
mk "HU-09: Edit and delete activities" "user-story,sprint-3,backend" "$S3" "$JESSICA" <<'B'
**As a** participant, **I want** to modify or remove activities, **so that** I can adjust the itinerary.

## Acceptance criteria
- [ ] Only trip participants can modify; outsiders receive 403.

**Points:** 2 | **Sprint:** 3 | **Responsible:** Jessica | **Due:** 2026-11-10
B
mk "HU-10: Register shared expense" "user-story,sprint-3,backend,priority-high" "$S3" "$JESSICA" <<'B'
**As a** participant, **I want** to register an expense stating who paid and who shares it, **so that** the accounts are fair.

## Acceptance criteria
- [ ] Amount greater than 0, valid category, at least one participant involved.
- [ ] The sum of the shares equals the total amount.
- [ ] Involved users must belong to the trip.

**Points:** 5 | **Sprint:** 3 | **Responsible:** Jessica | **Due:** 2026-11-10
B
mk "HU-11: View balances" "user-story,sprint-3,backend,frontend,priority-high" "$S3" "$JESSICA" <<'B'
**As a** participant, **I want** to see who owes whom, **so that** we can settle up at the end.

## Acceptance criteria
- [ ] Each person's balance is amount paid minus amount owed.
- [ ] The sum of all balances is 0.
- [ ] The minimum list of transfers is shown.

**Points:** 5 | **Sprint:** 3 | **Responsible:** Jessica | **Due:** 2026-11-10
B
mk "HU-12: Register settlement payment" "user-story,sprint-4,backend,frontend" "$S4" "$DANNA" <<'B'
**As a** participant, **I want** to record that I paid a debt, **so that** the balance updates.

## Acceptance criteria
- [ ] After registering the payment, both people's balances are adjusted.
- [ ] Payments greater than the debt, or to oneself, are rejected.

**Points:** 3 | **Sprint:** 4 | **Responsible:** Danna | **Due:** 2026-11-24
B
mk "HU-13: Packing checklist" "user-story,sprint-4,backend,frontend" "$S4" "$DANNA" <<'B'
**As a** participant, **I want** an interactive packing list, **so that** I do not forget anything.

## Acceptance criteria
- [ ] I can add, mark as ready and delete items.
- [ ] The state persists after reloading the page.

**Points:** 3 | **Sprint:** 4 | **Responsible:** Danna | **Due:** 2026-11-24
B
mk "HU-14: Budget and charts" "user-story,sprint-4,frontend,backend" "$S4" "$JESSICA,$DANNA" <<'B'
**As a** participant, **I want** charts of spent vs. available budget, **so that** I can control spending.

## Acceptance criteria
- [ ] Total spent, remaining and breakdown by category are shown.
- [ ] Charts update when an expense is added or modified.
- [ ] A visual alert appears if spending exceeds the budget.

**Points:** 5 | **Sprint:** 4 | **Responsible:** Jessica and Danna | **Due:** 2026-11-24
B

echo "== Technical tasks"
mk "TASK: Integration tests for auth, trips and participants" "task,testing,sprint-2" "$S2" "$JESSICA" <<'B'
Write Jest + Supertest integration tests for HU-01 to HU-05.
## Acceptance criteria
- [ ] Successful flows, invalid inputs and access restrictions are covered.
- [ ] Test instructions are in the README.
**Due:** 2026-10-27
B
mk "TASK: Address Sprint 1 review feedback" "task,documentation,sprint-2" "$S2" "$DANNA" <<'B'
Convert every observation from the Sprint 1 review into issues and resolve them.
## Acceptance criteria
- [ ] Each observation has an issue, an owner and a due date.
**Due:** 2026-10-27
B
mk "TASK: Configure GitHub Actions CI pipeline" "task,devops,sprint-3" "$S3" "$JESSICA" <<'B'
## Acceptance criteria
- [ ] Pipeline installs dependencies, runs tests and reports coverage on every PR.
- [ ] No secrets in the configuration (GitHub Secrets only).
**Due:** 2026-11-10
B
mk "TASK: Deploy application and document setup" "task,devops,sprint-3" "$S3" "$DANNA" <<'B'
## Acceptance criteria
- [ ] Public URL available; reproducible deployment instructions in the README.
**Due:** 2026-11-10
B
mk "TASK: End-to-end (E2E) tests" "task,testing,sprint-3" "$S3" "$JESSICA,$DANNA" <<'B'
## Acceptance criteria
- [ ] E2E tests cover register, login, create trip, add expense.
**Due:** 2026-11-10
B
mk "TASK: Security review and tech-debt cleanup" "task,security,sprint-4" "$S4" "$JESSICA" <<'B'
## Acceptance criteria
- [ ] Vulnerabilities fixed, duplicated code removed, review notes addressed.
**Due:** 2026-11-24
B
mk "TASK: Reach 90% test coverage" "task,testing,final" "$FIN" "$JESSICA,$DANNA" <<'B'
## Acceptance criteria
- [ ] Coverage report shows at least 90%.
**Due:** 2026-12-11
B
mk "TASK: Final documentation, report and presentation" "task,documentation,final" "$FIN" "$JESSICA,$DANNA" <<'B'
## Acceptance criteria
- [ ] Installation/usage docs, project report, results, CI/CD evidence, slides.
**Due:** 2026-12-11
B

echo "Done. Project number: $PNUM  ->  https://github.com/users/$JESSICA/projects/$PNUM"
