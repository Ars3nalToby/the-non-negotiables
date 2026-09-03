# LAUNCH.md — brief for Claude Code

You are shipping this site to production. Everything you need is in this
directory. Read `CLAUDE.md` first — it contains hard rules that must not
be broken, including a legal one about ticket resale.

Do not ask me to confirm each step. Work through the list, stop only if
something fails or if a decision is genuinely ambiguous, and report back
with the live URL at the end.

---

## 0. Preflight

```bash
node audit.mjs index.html
```

Expect exit code 1 with one TODO about Instagram handles. That is
expected and does not block launch. **Stop and tell me** if anything
comes back as `CRITICAL`, `BUG`, or `ERROR`.

Also confirm:

```bash
gh auth status
node --version          # needs 18+
```

---

## 1. Create the repo and push

Repo name: `the-non-negotiables` unless I've told you otherwise.
Public. Description: *An independent Arsenal fan site — fixtures, away
days, and what time kick-off is in Australia.*

```bash
git init
git add .
git commit -m "The Non-Negotiables — launch"
git branch -M main
gh repo create the-non-negotiables \
  --public \
  --description "An independent Arsenal fan site — fixtures, away days, and what time kick-off is in Australia." \
  --source=. --remote=origin --push
```

---

## 2. Grant the workflow write access

The weekly audit opens a GitHub issue with its findings. Without this it
runs and then fails at the reporting step.

```bash
gh api -X PUT repos/{owner}/{repo}/actions/permissions/workflow \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=true
```

---

## 3. Turn on GitHub Pages

```bash
gh api -X POST repos/{owner}/{repo}/pages \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

Then poll until it builds and give me the URL:

```bash
gh api repos/{owner}/{repo}/pages --jq '.html_url, .status'
```

If the API route errors, fall back to telling me to set it manually at
**Settings → Pages → Deploy from a branch → main → / (root)**.

---

## 4. Smoke test the live site

```bash
URL=$(gh api repos/{owner}/{repo}/pages --jq '.html_url')
curl -sSI "$URL" | head -1                       # expect 200
curl -sS "$URL" | grep -c "Non-Negotiables"      # expect > 0
curl -sSI "${URL}404.html" | head -1             # expect 200
```

Confirm the page contains the compliance strings — if any are missing,
something served the wrong file:

```bash
curl -sS "$URL" | grep -o "section 166" | head -1
curl -sS "$URL" | grep -o "Not affiliated with" | head -1
```

---

## 5. Trigger the audit once so I can see it work

```bash
gh workflow run "Weekly audit"
sleep 45
gh run list --workflow="Weekly audit" --limit 1
gh issue list --label audit
```

---

## 6. Deploy the news wire (optional, do it if wrangler is available)

```bash
cd wire
npx wrangler deploy
```

Take the `*.workers.dev` URL it prints and set it in `index.html`:

```js
const WIRE_ENDPOINT = 'https://nn-wire.<subdomain>.workers.dev/';
```

Then verify the wire actually returns something before committing:

```bash
curl -sS "https://nn-wire.<subdomain>.workers.dev/" | head -40
```

It should be JSON with an `items` array. If it's empty or errors, leave
`WIRE_ENDPOINT` as an empty string — the site falls back to static
source links and looks fine. Do not ship a broken wire.

```bash
cd .. && node audit.mjs index.html && git commit -am "Wire up live news feed" && git push
```

---

## 7. Report back

Give me:

- the live URL
- the repo URL
- whether the audit workflow ran and what the issue says
- whether the wire is live or still on fallback
- anything you noticed that the audit didn't catch

---

## Things you must not do

Read `CLAUDE.md` for the full set. The short version:

- **Never add ticket listings, a ticket noticeboard, or any "spare
  ticket" feature.** Unauthorised football ticket resale is a criminal
  offence in England and Wales under s.166 CJPOA 1994, and the wording
  covers advertising and listing, not just selling. The Away Crew board
  is for people, not tickets, and must never get a price field.
- **Never make the Junior Gunners section interactive.** No accounts, no
  submissions, no messaging, no contact forms.
- **Never commit an API key.** `index.html` is public. Keys go in the
  Worker via `wrangler secret put`.
- **Never reproduce text from Arseblog or any other outlet.** The
  Required Reading section links out. That is the entire point of it.
- **Do not add a build step, a bundler, or a dependency** unless
  `index.html` passes 150KB. The audit will tell you when.

## Known follow-ups, none blocking

1. 20 of 24 `SQUAD` entries have `ig: null`. They need manual
   verification on Instagram — **do not guess handles.** A wrong handle
   sends a reader to a stranger's account.
2. Premier League fixtures move for TV. The audit flags any fixture
   inside 21 days that hasn't been re-verified; when it does, check
   arsenal.com/fixtures and update `ko`, `tv`, `moved` and `checked`.
