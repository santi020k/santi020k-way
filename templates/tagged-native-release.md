# Tagged native release checklist

Use this checklist for signed macOS, iOS, TestFlight, Sparkle, and Homebrew releases.

## Trigger

- GitHub Actions creates semantic-version tags such as `v1.2.3` from reviewed, merged `main`.
- Route public Apple builds through standard GitHub-hosted macOS runners and private Apple builds through Xcode Cloud.
- Provide a manual dispatch input for retrying an existing tag.
- Use non-cancelling release concurrency.
- Check out the exact requested tag with full history.

## Preflight

- Confirm the tag version matches application metadata.
- Run the repository's complete validation command.
- Require every signing and publishing credential before starting an expensive build.
- Use a protected GitHub Environment for production signing or store publication when appropriate.

## Artifact production

- Build from the tagged commit.
- Sign with the expected identity.
- Notarize and staple macOS artifacts.
- Verify signatures, notarization, archives, and checksums locally in the runner.
- Pin downloaded signing/update tools by version and reviewed checksum.

## Publication

- Use versioned asset names.
- Never overwrite an existing versioned asset.
- If retrying, verify an existing asset is byte-identical before reusing it.
- Create the GitHub Release only for the existing reviewed tag.
- Publish appcasts, Homebrew casks, or store builds only after the primary artifact succeeds.
- Make every downstream step safely resumable.
