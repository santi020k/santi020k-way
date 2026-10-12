# Release standard

## Decision

Use a reviewable release pull request for versioned packages and extensions. Use an immutable,
reviewed tag for signed native applications. Treat hosted application deployment as a separate
continuous-delivery concern.

The goal is not identical YAML. The goal is consistent safety:

1. The released source is reviewed.
2. The exact release metadata is validated.
3. Publication is serialized and safely retryable.
4. Published artifacts are immutable.
5. Registry or distribution state is verified after publication.
6. Secrets have the narrowest practical permissions.

## Package and extension releases

Use Changesets for npm packages, VS Code extensions, and other repositories that accumulate
versioned changes.

### Lifecycle

1. Select the intended `release/v<semver>` from current repository evidence before branching.
2. Feature work includes a Changeset for each user-visible package change and is validated and
   integrated locally into that selected release.
3. Run Changesets versioning on the release branch. Commit final versions, changelogs, lockfile
   updates, migration notes, and consumed Changesets together.
4. Obtain an independent review before the first release push or PR. Resolve findings and rerun
   affected gates. Remote actions require explicit authorization.
5. Open the release pull request into `main`. Normal validation and current review feedback must
   pass against the exact final artifacts before an authorized merge.
6. GitHub Actions publishes packages and downstream artifacts from that merged commit, creates
   immutable version tags/releases, and verifies the published result.

Some existing repositories use `changesets/action` with `changeset-release/main`. Preserve their
explicit local workflow when applicable; it is not the branch convention for new Santiago-owned
projects. The reusable template below assumes package-specific `check` and `release` scripts and
a protected release environment. Version preparation belongs to the reviewed release branch.

### Required workflow properties

- Run from merged `main`, through an explicit GitHub dispatch or the repository's approved trigger.
- Provide a controlled retry and non-cancelling release concurrency.
- Grant only required permissions; use `id-token: write` for npm Trusted Publishing/provenance.
- Check out full history when tags or changelogs depend on it.
- Keep hooks enabled and run the complete preflight before publication.
- Prefer npm Trusted Publishing. Bootstrap the initial package or a provider identity only through
  a separately authorized, documented one-time step.
- Make publication idempotent. Reuse an existing version only after verifying its source commit
  and artifacts. A mismatched or incomplete release is a failure, not an excuse to overwrite it.
- Verify registry metadata, immutable tags/artifacts, deployed versions, and public smoke checks.

### Automation token

Use the repository's established secret name when `.env.example` documents a GitHub personal
access token and the same name exists in GitHub Actions. For example:

```yaml
GITHUB_TOKEN: ${{ secrets.PA_TOKEN || github.token }}
```

Do not replace `PA_TOKEN`, `GH_TOKEN`, or another documented name when a project already uses it.
When no dedicated token exists, expose the optional standard name and fall back to the built-in
token:

```yaml
GITHUB_TOKEN: ${{ secrets.CHANGESETS_TOKEN || github.token }}
```

A dedicated token should be a narrowly scoped GitHub App or fine-grained token that can write
repository contents and pull requests. It allows the generated release pull request to participate
in the repository's normal CI behavior. Repositories without one continue to work with the built-in
token, so `CHANGESETS_TOKEN` is optional rather than a deployment requirement.

Never place the token value in workflow files, logs, examples, or local configuration.

### Retry behavior

A failed publish must be safe to rerun. Publication commands should query the destination first or
use supported skip-duplicate behavior. A partial multi-registry release should resume missing
destinations without replacing immutable assets.

## Tagged native releases

Signed macOS and iOS artifacts use reviewed semantic-version tags because signing, notarization,
TestFlight, Sparkle, Homebrew, and store publication are not Changesets package publication.

### Lifecycle

1. Version and release metadata change through a reviewed pull request.
2. CI validates the candidate commit.
3. GitHub Actions creates the immutable semantic-version tag from the reviewed, merged `main` commit.
4. The delivery workflow checks out that exact merged commit and verifies the tag points to it.
5. The workflow validates tag-to-metadata consistency before signing.
6. It builds, signs, notarizes, and verifies the artifact.
7. It publishes immutable versioned assets.
8. It updates secondary channels only after primary publication succeeds.

Use a protected GitHub Environment when a store upload or production signing operation needs an
additional approval gate.

## Deployments

Cloudflare Pages, Workers, and similar hosted applications may deploy continuously from `main`.
They do not need artificial package versions or a Changesets release branch.

Deployment workflows should still:

- validate the deployable target;
- use environment-scoped secrets;
- serialize or cancel superseded deployments intentionally;
- expose `workflow_dispatch` for recovery;
- run migrations before dependent application code when compatibility requires it;
- report the production environment and URL.

## Practices adopted from the project audit

- ESLint Config Basic's existing `PA_TOKEN` and Dep Beacon's `GH_TOKEN`, preserving established
  project-specific names.
- Astro Doctor's optional `CHANGESETS_TOKEN` contract with `github.token` as the working default.
- Astro Doctor's post-publish CLI verification and floating major action tag.
- ESLint Config Basic's retrying verification of every published npm package.
- Coolstead's checksum-pinned Sparkle tooling and immutable asset comparison.
- Workspace Organizer's refusal to overwrite an existing release asset.
- PostLens's protected `app-store` environment and release preflight.
- Aaronmgz's changed-target deployment detection and pre-deploy secret checks.

## Practices to avoid

- Versioning and pushing release artifacts directly to `main`.
- Using `[skip ci]` on the only commit containing final release metadata.
- Publishing from an unreviewed working tree.
- Treating a long-lived `release` branch as the source of truth.
- Force-replacing immutable versioned tags or assets.
- Making downstream publication run when no package was published.
- Requiring every hosted application deployment to imitate an npm release.

## Agent release integration

Before a first release push or PR, obtain an independent review and disposition every finding. Prepare non-initial releases on `release/v<semver>` into `main`; never bypass hooks or failed gates. GitHub Actions creates tags and releases from merged `main`. Use GitHub-hosted standard macOS runners for public Apple projects, and Xcode Cloud for private Apple projects. See the full global instruction reference for approval, recovery, integration, and post-release requirements. Local implementation authorization does not authorize publication.
