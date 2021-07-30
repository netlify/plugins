# Netlify Build Plugins

[Build Plugins](https://docs.netlify.com/configure-builds/build-plugins) are a new way to extend the functionality of your build on Netlify. The [`plugins.json` file](./site/plugins.json) in this repository is used to generate the [Netlify plugins directory](https://app.netlify.com/plugins). Plugins in this directory can be installed directly through the Netlify UI.

## Legacy branch

Do not remove this git branch.
It is used as the production branch of the Netlify site. This deploys [https://netlify-plugins.netlify.app/plugins.json](https://netlify-plugins.netlify.app/plugins.json) which is used by older versions of Netlify CLI.
New versions of Netlify CLI, Build and App use a versioned URL instead like [https://list-v1--netlify-plugins.netlify.app/plugins.json](https://list-v1--netlify-plugins.netlify.app/plugins.json). Those are created by branch deploys on the Netlify site triggered by git tags. This is automated by a GitHub action which is performed on any new commit on the `main` branch.

## Contributing

The Netlify Plugins directory is filled with plugins created by Netlify staff and members of the community like you. You can contribute to the directory in the following ways:

- [Add a plugin](./docs/CONTRIBUTING.md#add-a-plugin) you've written to the plugins directory.
- [Update a plugin](./docs/CONTRIBUTING.md#update-a-plugin) you maintain that's already in the directory.
- [Request directory deactivation](./docs/CONTRIBUTING.md#request-deactivation) for a plugin which is not being maintained.

Visit the repository [contributor guide](./docs/CONTRIBUTING.md) for details.

## Plugin review

If you're reviewing someone else's plugin, please check the following [document](docs/plugin_review.md).

## Code of Conduct

This project and everyone participating in it is governed by a [code of conduct](./docs/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@netlify.com.
