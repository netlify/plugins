# Contributing to the Netlify plugins directory

The [Netlify plugins directory](https://app.netlify.com/plugins) is filled with plugins created by Netlify staff and members of the community like you. This guide explains how you can contribute to the directory in the following ways:

- [Add a plugin](#add-a-plugin) you've written to the plugins directory.
- [Update a plugin](#update-a-plugin) you maintain that's already in the directory.
- [Request directory deactivation](#request-deactivation) for a plugin which is not being maintained.

## Add a plugin

If you've written a plugin that you'd like to add to the Netlify plugins directory, first read and follow the [plugin author guidelines](/docs/guidelines.md). Then you can submit a pull request adding your plugin to the [`plugins.json` file](/site/plugins.json) with the required fields.

### Required fields

The following fields are required for all plugins included in the `plugins.json` file:

- `author` - the plugin author's name
- `description` - plugin description
- `name` - a human-readable [sentence cased](https://en.wikipedia.org/wiki/Letter_case#Sentence_case) version of the plugin title, for display purposes
- `package` - the name of the published npm package
- `repo` - the complete URL to the source repository for the plugin, on GitHub, GitLab, or Bitbucket. All source code must be public, and the repository must allow public issue submissions.
- `version` - the [latest version](#versioning) of the plugin.

## Update a plugin

You can submit a PR to update the entry for a plugin that you maintain.

### Versioning

The latest version of a Build Plugin must be specified in the `version` field in `plugins.json`. When updating a plugin, be sure to test the new version [locally](https://docs.netlify.com/cli/get-started/#run-builds-locally) and [on Netlify](https://docs.netlify.com/configure-builds/build-plugins/#install-a-plugin) before submitting.

When a user installs a plugin from the  [Netlify plugins directory](https://docs.netlify.com/configure-builds/build-plugins/#ui-installation), the `version` and `compatibility` fields are used to determine the plugin version that's installed. When a user installs a plugin in a [site's `package.json`](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation), they can specify a plugin version manually instead.

### Major releases

If a plugin has several major releases, the latest version of each major release must be specified in a `compatibility` array. The major releases must be sorted from most to least recent. The first `compatibility` item's `version` must be the same as the top-level `version` field.

```json
"version": "1.3.0"
"compatibility": [
  { "version": "1.3.0" },
  { "version": "0.3.0" },
  { "version": "0.2.0" }
]
```

As a way to encourage plugin users to upgrade, you can include a `migrationGuide` URL that refers plugin users to a migration guide, GitHub release, or a list of breaking changes.

```json
"version": "1.0.0"
"compatibility": [
  {
    "version": "1.0.0",
    "migrationGuide": "https://github.com/oliverroick/netlify-plugin-html-validate/releases/tag/v1.0.0"
  },
  { "version": "0.1.1" }
]
```

When a new major release drops support for a specific Node.js version range, a `nodeVersion` field must be added to previous major releases.

```json
"version": "1.3.0"
"compatibility": [
  { "version": "1.3.0" },
  { "version": "0.3.0", "nodeVersion": "<12.0.0" },
  { "version": "0.2.0", "nodeVersion": "<10.0.0" }
]
```

When a new major release drops support for a specific version range of a Node.js module used by the plugin but installed in the site's `package.json` (not the plugin's `package.json`), you must add a `siteDependencies` field.

```json
"version": "1.3.0"
"compatibility": [
  { "version": "1.3.0" },
  { "version": "0.3.0", "siteDependencies": { "next": "<11.0.0" } },
  { "version": "0.2.0", "siteDependencies": { "next": "<10.0.6" } }
]
```

## Request deactivation

As described in the [plugin author guidelines](/docs/guidelines.md#be-prepared-to-provide-support), authors of plugins listed in the Netlify plugins directory are expected to respond to issues submitted on the plugin repository within one week of submission. If they do not, a user may request that the plugin be removed from the directory by [submitting an issue](/issues/new) in this repository.

Netlify will try to reach the plugin author(s), and if that fails, we will add a status of `DEACTIVATED` to the plugin entry in the [`plugins.json` file](/site/plugins.json). Plugins marked `DEACTIVATED` are excluded from the plugins directory in the Netlify UI.

## Releasing

Plugins are available to users as soon as the build of the Netlify site hosting `site/plugins.json` has completed. That build is triggered automatically each time a pull request is merged, and typically takes less than a minute.

We still publish the list of plugins to `npm` to use it as a fallback in case that Netlify site is down. To publish the list of plugins simply merge the release PR.
