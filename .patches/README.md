# FIO module patch

`fio-module.patch` adds the Figuring It Out (Call 2) module to
`packages/genius-mining`, for applying to
`github.com/AdamBond1776/campusquest-landing-page`.

Verified against that repo's `main` (commit `1b4de7a`): the patch applies with no
conflicts, `npm run gm:prompts` registers three prompts, and all 302 tests pass.

## Option A — cherry-pick (recommended)

The two repositories have unrelated histories but identical `main` trees, so the
FIO commit applies cleanly as-is.

```bash
git clone https://github.com/AdamBond1776/campusquest-landing-page
cd campusquest-landing-page
git remote add cmd https://github.com/adambond1776-cmd/campusquest-landingpage
git fetch cmd cursor/add-fio-module-1aac
git checkout -b add-fio-module
git cherry-pick 4e6f007
npm install
npm run gm:prompts
npm test
git push -u origin add-fio-module
```

## Option B — apply the patch file

```bash
curl -O https://raw.githubusercontent.com/adambond1776-cmd/campusquest-landingpage/cursor/fio-patch-for-real-repo-1aac/.patches/fio-module.patch
git checkout -b add-fio-module
git apply fio-module.patch
npm install
npm run gm:prompts
npm test
git add -A && git commit -m "Add Figuring It Out (FIO) module to Genius Mining"
git push -u origin add-fio-module
```

## What the patch contains

New:

- `assets/prompts/fio_analysis_prompt_v1_0.txt`
- `assets/fio_output_contract.schema.json`
- `assets/pathways/cip.json` — empty by design; `cipCoverage()` reports
  `readyForCohort: false` until the CIP edition is pinned
- `assets/fixtures/gm001_responses.json` — transcribed from the handwritten pages
- `src/fio-types.ts`, `src/fio-validate.ts`, `src/fio-engine.ts`,
  `src/cip-pathways.ts`
- `src/__tests__/fio.test.ts`

Modified:

- `src/index.ts` — exports the four new modules
- `src/prompts.generated.ts` — regenerated from `assets/prompts`
- `assets/fixtures/gm001_expected.json` — D1 corrected to a clean `BUILT` modal
  against the handwritten original; it is not the tiebreak case
- `src/__tests__/validate.test.ts`, `src/__tests__/resolve-d1.test.ts` — updated
  to the corrected fixture

Delete this directory after the patch is applied; it is delivery scaffolding, not
part of the app.
