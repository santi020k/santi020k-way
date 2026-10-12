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

1. A feature pull request includes a changeset for a user-visible change.
2. Merging to `main` creates or updates `changeset-release/main`.
3. The release pull request contains final versions, changelogs, lockfile updates, and consumed
   changesets.
4. Normal pull-request validation runs against those exact artifacts.
5. A maintainer merges the release pull request when the release is ready.
6. The workflow publishes packages and downstream artifacts.
7. The workflow verifies registry versions and creates immutable tags or GitHub Releases.

`changeset-release/main` is an ephemeral automation branch. Its absence after a release is normal.

### Required workflow properties

- Trigger on pushes to `main`.
- Provide `workflow_dispatch` for a controlled retry.
- Set `cancel-in-progress: false`.
- Grant `contents: write`, `pull-requests: write`, and `id-token: write` when npm provenance is used.
- Check out full history when tags or changelogs depend on it.
- Pass `version`, `commit`, and `title` to `changesets/action`.
- Use `NPM_CONFIG_PROVENANCE: "true"` for npm publication.
- Gate extension, documentation, or umbrella-tag steps on
  `steps.changesets.outputs.published == 'true'`.
- Make every publish script idempotent and skip an already-published version.

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
3. A maintainer creates an annotated semantic-version tag.
4. The release workflow checks out that exact tag.
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
