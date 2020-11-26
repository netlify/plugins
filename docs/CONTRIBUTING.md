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
- `name` - a human-readable version of the plugin title, for display purposes
- `package` - the name of the published npm package
- `repo` - the complete URL to the source repository for the plugin, on GitHub, GitLab, or Bitbucket. All source code must be public, and the repository must allow public issue submissions.
- `version` - the exact version Netlify will use for all UI-installed instances of the plugin. To update the plugin version later, submit a new pull request to update this field.

## Update a plugin

You can submit a PR to update the entry for a plugin that you maintain. If you update the plugin `version`, please be sure to test the new version [locally](https://docs.netlify.com/cli/get-started/#run-builds-locally) and [on Netlify](https://docs.netlify.com/configure-builds/build-plugins/#install-a-plugin) before submitting.

## Request deactivation

As described in the [plugin author guidelines](/docs/guidelines.md#be-prepared-to-provide-support), authors of plugins listed in the Netlify plugins directory are expected to respond to issues submitted on the plugin repository within one week of submission. If they do not, a user may request that the plugin be removed from the directory by [submitting an issue](/issues/new) in this repository.

Netlify will try to reach the plugin author(s), and if that fails, we will add a status of `DEACTIVATED` to the plugin entry in the [`plugins.json` file](/site/plugins.json). Plugins marked `DEACTIVATED` are excluded from the plugins directory in the Netlify UI.

## Releasing

See the [documentation in the buildbot](https://github.com/netlify/buildbot/blob/master/docs/overview.md#build-plugins).
