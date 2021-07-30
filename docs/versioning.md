# Versioning

## Deploying `plugins.json`

Each new commit pushed to the `main` branch is deployed to [https://list-v1--netlify-plugins.netlify.app/plugins.json](https://list-v1--netlify-plugins.netlify.app/plugins.json) thanks to [this repository's Netlify site](https://app.netlify.com/sites/netlify-plugins/deploys).

This is done in a branch deploy triggered by updating the `list-v1` git tag to reference each new commit on the `main` branch. This is performed automatically by a [GitHub action](/.github/workflows/versioning.yml).

That URL is fetched by:

- [Netlify Build](https://github.com/netlify/build/blob/24d15419e64b5d7b291b154fd9363660e468416d/packages/build/src/plugins/list.js#L56) to list the latest versions of each plugin during builds.
- [Netlify CLI](https://github.com/netlify/cli/blob/2235280d338af60c6c7b9fbe4a07d7ac040d796e/src/utils/init/plugins.js#L5) command `netlify init` to recommend plugins on new sites.
- [Netlify App](https://github.com/netlify/netlify-react-ui/blob/ac29b020d109e069366bfb5a92bdf6635cf4db89/src/actions/plugins.js#L11) to list all available plugins in the UI.

## Plugins versioning

Versioning of the [`plugins.json`](/site/plugins.json)'s contents is documented [here](CONTRIBUTING.md#versioning).

## Syntax versioning

This section explains how the `plugins.json`'s syntax is versioned. This relates to the `plugins.json` file's shape (e.g. property names), not its contents.

### Breaking changes

To introduce a breaking change to the syntax of `plugins.json`:

- Update `plugins.json` with that breaking change.
- Increment every reference of `list-v1` in this repository (including this file).
- Make a new commit to `main`.
- Wait for the new versioned URL to be built and ensure it can be accessed and looks normal.
- Update the URL in Netlify Build, CLI and App.

### Legacy URL

Old versions of Netlify CLI are fetching the legacy URL used before versioning was introduced: [https://netlify-plugins.netlify.app/plugins.json](https://netlify-plugins.netlify.app/plugins.json). This URL reflects the `legacy` git branch of this repository. Since some users rely on those older versions of Netlify CLI:

- The `legacy` git branch should not be deleted.
- No new commits should be added to the `legacy` branch.
- The Netlify site's production branch should remain `legacy`.
