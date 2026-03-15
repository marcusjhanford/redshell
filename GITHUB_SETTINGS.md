# GitHub Repository Settings for Open Source Launch

This document contains all the manual settings you need to configure on GitHub to prepare RedShell for open source launch. Since you're the sole maintainer who will review and merge PRs, these settings will enforce that workflow.

## Repository Settings

### 1. General Settings

Navigate to: `Settings` → `General`

**Repository Features:**
- [ ] **Wikis** - Disable (documentation should be in the repo)
- [x] **Issues** - Keep enabled
- [x] **Discussions** - Enable (for community Q&A)
- [ ] **Projects** - Disable (use GitHub Projects only if needed)
- [x] **Sponsorships** - Enable if you want GitHub Sponsors

**Pull Requests:**
- [x] **Allow merge commits** - Enable
- [ ] **Allow squash merging** - Your preference (recommended: enable)
- [ ] **Allow rebase merging** - Your preference (recommended: disable to keep history clean)
- [x] **Automatically delete head branches** - Enable (keeps repo clean)
- [x] **Always suggest updating pull request branches** - Enable
- [x] **Allow auto-merge** - Disable (you want to manually review all PRs)

### 2. Branch Protection Rules

Navigate to: `Settings` → `Branches` → `Add rule`

Create a rule for `main` branch with these settings:

**Branch name pattern:** `main`

**Protect matching branches:**
- [x] **Require a pull request before merging** - Enable
  - [x] **Require approvals** - Set to `1` (you as the maintainer)
  - [x] **Dismiss stale PR approvals when new commits are pushed** - Enable
  - [x] **Require review from code owners** - Enable (requires CODEOWNERS file)
  - [x] **Require approval of the most recent reviewable push** - Enable

- [x] **Require status checks to pass before merging** - Enable
  - [x] **Require branches to be up to date before merging** - Enable
  - Status checks that are required:
    - `typecheck` (after we add it to CI)
    - `test` (after we add tests to CI)
    - `lint` (after we add linting to CI)

- [x] **Require conversation resolution before merging** - Enable

- [ ] **Require signed commits** - Your choice (recommended: enable for security)

- [x] **Require linear history** - Enable (if you prefer squash merges)

- [x] **Require deployments to succeed before merging** - Disable for now

- [x] **Lock branch** - Do NOT enable (prevents you from pushing directly)

- [x] **Do not allow bypassing the above settings** - Enable (even for administrators)

- [x] **Restrict pushes that create files larger than 100MB** - Enable

- [x] **Require merge queue** - Disable for now (overkill for single maintainer)

### 3. Access Settings (CODEOWNERS)

Navigate to: `Settings` → `Access` → `Code and automation`

The `CODEOWNERS` file we'll create will:
- Make you the sole code owner of all files
- Require your approval on every PR
- Block anyone else from merging without your review

### 4. Security Settings

Navigate to: `Settings` → `Security` → `Security Overview`

**Private vulnerability reporting:**
- [x] **Enable vulnerability reporting** - Enable
  - This allows security researchers to report vulnerabilities privately

**Dependabot alerts:**
- [x] **Enable Dependabot alerts** - Enable
  - You'll get notified of security vulnerabilities in dependencies

**Dependabot security updates:**
- [x] **Enable Dependabot security updates** - Enable
  - Dependabot will automatically create PRs to fix vulnerabilities

**Secret scanning:**
- [x] **Secret scanning** - Enable
  - Alerts you if secrets are accidentally committed

**Push protection:**
- [x] **Push protection for repositories** - Enable
  - Blocks pushes that contain secrets

### 5. GitHub Pages Settings

Navigate to: `Settings` → `Pages`

Already configured via the deploy.yml workflow, but verify:
- **Source:** Deploy from a branch
- **Branch:** `gh-pages` /root (will be created by workflow)
- **Custom domain:** (Optional) Add `redshell.ai` if you have DNS configured

### 6. Notification Settings

Navigate to: `Settings` → `Notifications`

Set up notifications for:
- [x] **Issues** - Enable
- [x] **Pull requests** - Enable
- [x] **Discussions** - Enable
- [x] **Dependabot alerts** - Enable

Consider creating a dedicated email address like `security@redshell.ai` for vulnerability reports.

## Issue Labels Setup

Navigate to: `Issues` → `Labels`

Create or verify these labels exist:

**Priority labels:**
- `priority:high` - Red (#FF0000)
- `priority:medium` - Yellow (#FFCC00)
- `priority:low` - Green (#00CC00)

**Type labels:**
- `type:bug` - Something isn't working
- `type:feature` - New feature request
- `type:docs` - Documentation improvements
- `type:security` - Security-related
- `type:refactor` - Code restructuring

**Status labels:**
- `status:triage` - Needs review
- `status:accepted` - Accepted, ready to work
- `status:in-progress` - Being worked on
- `status:blocked` - Blocked by dependencies
- `status:completed` - Done

**Good first issues:**
- `good first issue` - For new contributors (green, #7057FF)

**Area labels:**
- `area:judges` - Related to judge logic
- `area:blockchain` - Smart contract interaction
- `area:api` - API endpoints
- `area:ui` - Landing page/UI

## Topics/Tags

Navigate to: Repository main page → `About` section → `Settings` icon

Add these topics:
- `agent-commerce`
- `acp` (Agent Commerce Protocol)
- `blockchain`
- `ethereum`
- `base`
- `cloudflare-workers`
- `open-source`
- `typescript`
- `ai-judge`
- `smart-contracts`
- `defi`

## Social Preview

Navigate to: `Settings` → `General` → `Social preview`

Upload an image (1280×640px recommended):
- Use your redshell_logo.png with text overlay
- Should say: "RedShell - Open Source Judge for Agent Commerce"
- Will show up when shared on social media

## Release Management

Set up a release workflow:

1. Use semantic versioning (v0.1.0, v0.2.0, etc.)
2. Create releases via GitHub UI with detailed notes
3. Use GitHub's "Generate release notes" feature
4. Tag releases to trigger any automated workflows

## Maintainer Communication

Consider setting up:

1. **Email:** security@redshell.ai (for vulnerability reports)
2. **Discord/Slack:** Create a community server for discussions
3. **Twitter/X:** @redshell for announcements
4. **Blog:** Add updates to your landing page or separate blog

## Pre-Launch Checklist

Before making the repository public:

- [ ] Remove all `.DS_Store` files (✅ Done)
- [ ] Add all documentation files (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY) (✅ Done)
- [ ] Add CODEOWNERS file with your GitHub username (✅ Done)
- [ ] Set up branch protection rules for `main`
- [ ] Configure Dependabot and security scanning
- [ ] Add issue templates (✅ Done)
- [ ] Add PR template (✅ Done)
- [ ] Set up topic tags
- [ ] Upload social preview image
- [ ] Add testing framework (✅ Done)
- [ ] Add ESLint configuration (✅ Done)
- [ ] Update CI/CD workflow (✅ Done)
- [ ] Create ARCHITECTURE.md (✅ Done)
- [ ] Verify no secrets in git history
- [ ] Clean up any sensitive data from commit history (if needed)
- [ ] Set repository to **Public** (Settings → General → Visibility)

## Post-Launch Actions

After making it public:

- [ ] Submit to Product Hunt
- [ ] Post on relevant subreddits (r/opensource, r/ethereum, r/web3)
- [ ] Share on Twitter/X, LinkedIn
- [ ] Submit to awesome-* lists (awesome-web3, awesome-blockchain)
- [ ] Reach out to Virtuals Protocol community
- [ ] Write a launch blog post
- [ ] Monitor issues and PRs closely in first week

## Important Notes

1. **Sole Maintainer Workflow:** As the only maintainer, all PRs require your approval. The CODEOWNERS file and branch protection ensure this.

2. **Response Time Expectations:** Consider adding an SLA to your CONTRIBUTING.md (e.g., "I'll review PRs within 3-5 business days")

3. **Vulnerability Disclosure:** The SECURITY.md provides a private way for researchers to report issues without publicly disclosing them first.

4. **License Compliance:** MIT license allows commercial use. Make sure you're comfortable with this before launching.

5. **Trademark:** Consider trademarking "RedShell" if this becomes successful, to prevent others from using your brand.

## Questions?

If any of these settings are unclear or you need help, refer to:
- [GitHub Docs on Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs on CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Open Source Guides](https://opensource.guide/)
