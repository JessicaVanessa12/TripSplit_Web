# GitHub Projects setup (TripSplit)

## 1. Run the script (once, from Jessica's account)
1. Install GitHub CLI: https://cli.github.com
2. `gh auth login` then `gh auth refresh -s project`
3. Edit `DANNA=` in `setup-github.sh` with Danna's GitHub username (and add her as collaborator: Settings > Collaborators).
4. `bash setup-github.sh`

## 2. Copy the `.github/` folder into the repo
Commit it on a `feature/github-templates` branch and open a PR to `develop`.

## 3. Board columns (manual, 2 minutes)
Open the project > Status field > edit options to: **Backlog, Sprint Backlog, In Progress, In Review, Done**.
Then in the project create views:
- **Board** (layout Board, group by Status)
- **Sprint table** (layout Table, group by Milestone, show Assignees, Labels)
- **Roadmap** (layout Roadmap, by milestone dates)

## 4. Automations (Project > Workflows)
Enable: "Item closed -> Done", "Pull request merged -> Done", "Item added -> Backlog".

## 5. Sprint 2 status
Move HU-01..HU-05 and the Sprint 2 tasks to **Done** (or close them from PRs with "Closes #N") and add the link to the PRs/commits.

## 6. Branch protection (Settings > Branches)
`main` and `develop`: require pull request, 1 approval, no direct pushes.

## 7. Daily workflow
Issue -> branch `feature/<name>` -> commits `feat: ... (#12)` -> PR to `develop` (use the template) -> review by partner -> merge -> issue Done.
