# Reviewing plugins

## Goal

Build plugins can be installed either from [the UI](https://docs.netlify.com/configure-builds/build-plugins/#ui-installation) or [from npm](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation). Netlify ensures the quality and security of the plugins available in the UI.

## Process for plugin authors

Plugin authors must submit a PR when they want to either:

- Add a new plugin.
- Update the patch/minor/major version of their plugin.

This only applies to plugins installed from the UI, not from npm. However, the UI installation flow is the recommended approach because it is simpler.

## Process for reviewers

A thorough code review is especially important when plugins are added since it is quite common for plugins not to be updated often after the initial release.

The reviewer should submit a new issue on the plugin's repository for each review comment. If there is a bigger problem which might require a big refactoring or might reject the plugin, this should be communicated as a comment in the PR instead before proceeding to a full review.

The plugin author has the best knowledge of their plugin's code and purpose.
Any review comment should be worded as a friendly recommendation open for feedback from the plugin author.

The reviewer should not give feedback on code styling nor programming patterns, unless they introduce a bug or a big performance penalty.

## User documentation

The plugin should follow:

- the guidelines from the [Build plugins user documentation](https://docs.netlify.com/configure-builds/build-plugins).
- the [guidelines](guidelines.md) in this repository.

## Common pitfalls

This is a non-exhaustive list of common pitfalls

### General

- [ ] The plugin's purpose must be in the best interest of Netlify and its users.
- [ ] The functionality must not be already provided by Netlify or another well-maintained plugin.
- [ ] The code [must be open source](guidelines.md#keep-it-open).
- [ ] Breaking changes are not allowed at the moment.
- [ ] The plugin should work [without any configuration](guidelines.md#provide-a-zero-config-default). Exceptions can be made when there is no way around it, such as for an API token. In that case, environment variables should be used instead of `inputs`.

### Documentation

- [ ] The `README.md` [should describe](guidelines.md#provide-a-readme) both UI-based and file-based installation instructions.
- [ ] The `README.md` [should describe](guidelines.md#provide-a-readme) any inputs and environment variables.

### Metadata

- [ ] A [`manifest.yml`](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#anatomy-of-a-plugin) should be present.
- [ ] The `name` in `manifest.yml` should match the npm package `name`.
- [ ] The `package.json` `keywords` [should include `netlify` and `netlify-plugin`](https://docs.netlify.com/configure-builds/build-plugins/share-plugins/#publish-to-npm).
- [ ] The `package.json` should include [the `repository` and `bugs` properties](https://docs.netlify.com/configure-builds/build-plugins/share-plugins/#publish-to-npm).
- [ ] The npm package `name` should start either with `netlify-plugin-` or `@scope/netlify-plugin-`.
- [ ] The npm package should not omit some files by mistakes, including the `manifest.yml`. Notably, the `.npmignore` file and the `package.json` `files` and `main` properties should be checked.

### Inputs

- [ ] Inputs should have a [`name` and a `description`](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#inputs).
- [ ] Every optional input (including environment variable) [should have a default value](guidelines.md#provide-a-zero-config-default).

### Events

- [ ] The [right events](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#plug-in-to-build-events) must be used.
- [ ] `onSuccess` and `onEnd` should not be used to fail the build. Notably, `utils.build.failPlugin()` should be used instead of `utils.build.failBuild()`. If the build must be failed, `onPostBuild` should be used instead.
- [ ] `onPostBuild` should not be used to run post-deploy logic. `onSuccess` and `onEnd` should be used instead.
- [ ] `try`/`catch`/`finally` blocks should be preferred to using the `onError` and `onEnd` events, when possible.

### Constants

- [ ] The [right constants](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#constants) must be used and be correctly spelled.
- [ ] `constants.CONFIG_PATH`, `constants.FUNCTIONS_SRC` and `constants.EDGE_HANDLERS_SRC` can be `undefined` when not used by the site.
- [ ] `constants.PUBLISH_DIR` and `constants.FUNCTIONS_DIST` are always defined, but their target might not exist yet. If used, they should be created by the plugin they do not exist.
- [ ] [`netlifyConfig`](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#netlifyconfig) should be used instead of manually loading the configuration file.
- [ ] [`packageJson`](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#packagejson) should be used instead of manually loading the site's `package.json`.

## Error handling

- [ ] Errors should not be thrown since those are reported as plugin bugs, not user errors. Instead, a `try`/`catch` block combined with [one of the `utils.build.*` methods](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#error-reporting) should be used.
- [ ] The `try`/`catch` block should be as close to the potentially throwing code as possible. In particular, top-level catch-all `try`/`catch` should not be used because they prevent distinguishing plugin bugs from user errors.
- [ ] The [`error` argument](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#error-reporting) in `utils.build.*` should be used when possible to keep the inner stack trace.

## Logging

- [ ] Any successful information (not errors) that should be highlighted to users, such as the plugin's output summary, [should use `utils.status.show()`](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#logging) instead of `console.log()`.

## Utilities

- [ ] The [`cache` utility](https://github.com/netlify/build/blob/main/packages/cache-utils/README.md) should be used to cache files.
- [ ] The [`git` utility](https://github.com/netlify/build/blob/main/packages/git-utils/README.md) should be used for git-related logic.

## Control flow

- [ ] Asynchronous code should use `async`/`await`.
- [ ] Plugin methods [should not end until all their asynchronous code has completed](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#asynchronous-code). Also, asychronous should propagate to the upper scopes. When mixing callbacks, events and promises, it is common to miss this. Using promise-friendly libraries and `util.promisify()` are common solutions.
- [ ] `process.exit()` should not be used.
- [ ] While a top-level function [is allowed in the plugin main file](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#dynamic-events), it should only be used when absolutely necessary.
