# Contributing to the plugins directory

To make your Netlify plugin installable via the Netlify UI, you can submit a pull request to this repository, adding an entry for your plugin to the [`plugins.json` file](/plugins.json) with the following fields:

- `author` - the plugin author's name
- `description` - plugin description
- `name` - a human-readable version of the plugin title, for display purposes
- `package` - the name of the published npm package
- `repo` - the complete URL to the source repository for the plugin, on GitHub, GitLab, or Bitbucket. All source code must be public, and the repository must allow public issue submissions.
- `version` - the exact version Netlify will use for all UI-installed instances of the plugin. To update this version later, submit a new pull request to update the plugins.json entry.
