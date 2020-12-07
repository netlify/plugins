# Plugin Author Guidelines

Netlify plugins listed in the plugins.json file of this repository can be installed directly within the Netlify UI from the plugins directory. To help ensure a consistent user experience, we've prepared the following guidelines for authors submitting plugins to the directory.

Before submitting a plugin for the plugins directory, please read and follow the guidelines below.

## Provide a zero-config default.

Plugins with required `inputs` cannot be installed via the Netlify UI. Wherever possible, a plugin should include default options that allow the plugin to run without configuration. In cases where a plugin requires a unique value (such as an API key for a third-party service), configure the plugin to accept this value from a [build environment variable](https://docs.netlify.com/configure-builds/environment-variables). For more complex or customized configuration, users can install the plugin via the `netlify.toml` configuration file.

## Provide a README.

Every plugin in the Netlify plugins directory includes a link to the plugin README. This file should include:

- A description of what the plugin does and why that might be useful.
- UI-based installation instructions. 
    - Include a direct installation link using the format `https://app.netlify.com/plugins/{plugin-package-name}/install`.
    - Point to the [plugins directory](https://app.netlify.com/plugins) in the Netlify UI.

  > **Note:** You can include UI-based installation instructions in a separate, follow-up pull request. The PR will be merged when your plugin is approved for inclusion in the plugins directory.
- File-based installation instructions. Visit our [Next.js Build Plugin README](https://github.com/netlify/netlify-plugin-nextjs/blob/main/README.md) for an example.
    - Include sample code for declaring the plugin in the `netlify.toml` configuration file.
    - Include a step instructing developers to use npm, yarn or another Node.js package manager to add the plugin to  `devDependencies` in the base directory's `package.json`.
- Any required environment variables.
- Details regarding any optional environment variables or `inputs`.
- Ideally, a link to a demo site with [public deploy logs](https://docs.netlify.com/configure-builds/get-started/#basic-build-settings) and a [Deploy to Netlify button](https://docs.netlify.com/site-deploys/create-deploys/#deploy-to-netlify-button), so users can find out how the plugin works before installing.

## Follow best practices for plugin code and metadata.

Consistency across plugins makes plugins easier to find, easier to debug, and easier to review for inclusion in the Netlify plugins directory. Review the docs for [creating](https://docs.netlify.app/configure-builds/build-plugins/create-plugins) and [sharing](https://docs.netlify.app/configure-builds/build-plugins/share-plugins) plugins to learn about recommended practices. This [issue comment](https://github.com/netlify/build/issues/1068#issuecomment-605276244) describes some common pitfalls to avoid.

## Test the plugin.

Before submitting a pull request to add or update a plugin, test it locally and in the Netlify UI to make sure it works as expected, and isn't using any [deprecated methods](https://github.com/netlify/build/issues/1303). Automated tests can help with this, and providing a demo site with [public deploy logs](https://docs.netlify.com/configure-builds/get-started/#basic-build-settings) will make it easier to review your pull request.

## Keep it open.

All plugin source code must be public and generally human-readable. Plugin users and pull request reviewers must be able to read the plugin code and evaluate it for potential risks. The plugin must also a license listed on the [Open Source Initiative approved license list](https://opensource.org/licenses) or a [Creative Commons license](https://creativecommons.org/choose/) that includes “attribution” or places the work in the [public domain](https://creativecommons.org/publicdomain/).

## Understand required agreements.

When you publish a plugin to the npm Public Registry, you agree to npm's [Open Source Terms](https://www.npmjs.com/policies/open-source-terms). When you use a plugin on Netlify, you agree to Netlify's [Terms of Use Agreement](https://www.netlify.com/legal/terms-of-use/). When you make that plugin available to other Netlify users, you agree to interact with those users in accordance with the [Netlify Community Code of Conduct](https://community-docs.netlify.com/code-of-conduct.html).

In general, this means that you agree to be kind, to be honest, and to not do anything illegal, but you should read these documents to know exactly what they mean in detail.

## Be prepared to provide support.

When a Netlify user needs help with a plugin, they'll be directed to submit an issue in the plugin repository. If issues don't receive a response within one week, the plugin may be deactivated from the Netlify plugins directory.

You don't need to debug users' code or support unintended configurations (similar to Netlify's own [Scope of Support](https://www.netlify.com/support-scope/)), but if an error or failure is caused by the plugin itself, you should commit to fixing it in a timely manner.

To provide clear guidelines for user interactions, we recommend adding an [issue template](https://help.github.com/en/github/building-a-strong-community/configuring-issue-templates-for-your-repository), a [code of conduct](https://help.github.com/en/github/building-a-strong-community/adding-a-code-of-conduct-to-your-project), and other [community health files](https://help.github.com/en/github/building-a-strong-community/creating-a-default-community-health-file) to the plugin repository.
