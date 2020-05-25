# Netlify Build Plugins

[Build Plugins](https://docs.netlify.com/configure-builds/build-plugins) are a new way to extend the functionality of your build on Netlify. The [`plugins.json` file](./plugins.json) in this repository is used to generate the [Netlify plugins directory](https://app.netlify.com/plugins). Plugins in this directory can be installed directly through the Netlify UI.


## Contributing

To make your Netlify plugin installable via the Netlify UI, you can submit a pull request to this repository, adding an entry for your plugin to the [`plugins.json` file](./plugins.json) with the following fields:

- `author` - the plugin author's name
- `description` - plugin description
- `name` - a human-readable version of the plugin title, for display purposes
- `package` - the name of the published npm package
- `repo` - the complete URL to the source repository for the plugin, on GitHub, GitLab, or Bitbucket. All source code must be public, and the repository must allow public issue submissions.
- `version` - the exact version Netlify will use for all UI-installed instances of the plugin. To update this version later, submit a new pull request to update the plugins.json entry.

## Plugin Author Guidelines

Netlify plugins listed in the plugins.json file of this repository can be installed directly within the Netlify UI from the plugins directory. To help ensure a consistent user experience, we've prepared the following guidelines for authors submitting plugins to the directory.

### Provide a zero-config default.

Plugins with required `inputs` cannot be installed via the Netlify UI. Wherever possible, a plugin should include default options that allow the plugin to run without configuration. In cases where a plugin requires a unique value (such as an API key for a third-party service), configure the plugin to accept this value from a [build environment variable](https://docs.netlify.com/configure-builds/environment-variables). For more complex or customized configuration, users can install the plugin via the `netlify.toml` configuration file.

### Provide a README.

Every plugin in the Netlify plugins directory includes a link to the plugin README. This file should include:
    - A description of what the plugin does and why that might be useful.
    - Any required environment variables.
    - Instructions for installing via `netlify.toml` configuration file, including any optional `inputs`.
    - Ideally, a link to a demo site with [public deploy logs](https://docs.netlify.com/configure-builds/get-started/#basic-build-settings) and a [Deploy to Netlify button](https://docs.netlify.com/site-deploys/create-deploys/#deploy-to-netlify-button), so users can find out how the plugin works before installing.

### Follow best practices for plugin code and metadata.

Consistency across plugins makes plugins easier to find, easier to debug, and easier to review for inclusion in the Netlify plugins directory. This [issue comment](https://github.com/netlify/build/issues/1068#issuecomment-605276244) describes common pitfalls to avoid.

### Test the plugin.

Before submitting a pull request to add or update a plugin, test it locally and in the Netlify UI to make sure it works as expected, and isn't using any [deprecated methods](https://github.com/netlify/build/issues/1303). Automated tests can help with this, and providing a demo site with [public deploy logs](https://docs.netlify.com/configure-builds/get-started/#basic-build-settings) will make it easier to review your pull request.

### Keep it open.

All plugin source code must be public and generally human-readable. Plugin users and pull request reviewers must be able to read the plugin code and evaluate it for potential risks. The plugin must also a license listed on the [Open Source Initiative approved license list](https://opensource.org/licenses) or a [Creative Commons license](https://creativecommons.org/choose/) that includes “attribution” or places the work in the [public domain](https://creativecommons.org/publicdomain/).

### Understand required agreements.

When you publish a plugin to the npm Public Registry, you agree to npm's [Open Source Terms](https://www.npmjs.com/policies/open-source-terms). When you use a plugin on Netlify, you agree to Netlify's [Terms of Use Agreement](https://www.netlify.com/legal/terms-of-use/). When you make that plugin available to other Netlify users, you agree to interact with those users in accordance with the [Netlify Community Code of Conduct](https://community-docs.netlify.com/code-of-conduct.html). 

In general, this means that you agree to be kind, to be honest, and to not do anything illegal, but you should read these documents to know exactly what they mean in detail.

### Be prepared to provide support.

When a Netlify user needs help with a plugin, they'll be directed to submit an issue in the plugin repository. If issues don't receive a response within one week, the plugin may be deactivated from the Netlify plugins directory.

You don't need to debug users' code or support unintended configurations (similar to Netlify's own [Scope of Support](https://www.netlify.com/support-scope/)), but if an error or failure is caused by the plugin itself, you should commit to fixing it in a timely manner.

To provide clear guidelines for user interactions, we recommend adding an [issue template](https://help.github.com/en/github/building-a-strong-community/configuring-issue-templates-for-your-repository), a [code of conduct](https://help.github.com/en/github/building-a-strong-community/adding-a-code-of-conduct-to-your-project), and other [community health files](https://help.github.com/en/github/building-a-strong-community/creating-a-default-community-health-file) to the plugin repository.