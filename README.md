# Netlify Plugins (Beta)

Netlify plugins are a new way to extend the functionality of your build on Netlify.

For more information see the [@Netlify/build](https://github.com/netlify/build) project.

## Community Plugins

Below are plugins created by some awesome people! ❤️

To add a plugin, add informations to the [plugins.json file]('./plugins.json').

<!-- AUTO-GENERATED-CONTENT:START (GENERATE_PLUGIN_TABLE)-->
Plugin count: **18** 🎉

| Plugin | Author |
|:---------------------------|:-----------:|
| **[A11y - `netlify-plugin-a11y`](https://github.com/sw-yx/netlify-plugin-a11y)** <br/>  Build a more accessible web! Run your critical pages through pa11y and fail build if accessibility failures are found. | [sw-yx](https://github.com/sw-yx) |
| **[Build Plugin Speedcurve - `netlify-build-plugin-speedcurve`](https://github.com/tkadlec/netlify-build-plugin-speedcurve)** <br/>  After a successful build, tell SpeedCurve you've deployed and trigger a round of testing | [tkadlec](https://github.com/tkadlec) |
| **[Cache Next.js - `netlify-plugin-cache-nextjs`](https://github.com/pizzafox/netlify-cache-nextjs)** <br/>  Cache the .next build folder between builds | [pizzafox](https://github.com/pizzafox) |
| **[Checklinks - `netlify-plugin-checklinks`](https://github.com/munter/netlify-plugin-checklinks)** <br/>  Checklinks helps you keep all your asset references correct and avoid embarrassing broken links to your internal pages, or even to external pages you link out to. | [munter](https://github.com/munter) |
| **[Contextual ENV - `netlify-plugin-contextual-env`](https://github.com/cball/netlify-plugin-contextual-env)** <br/>  Replaces ENV vars with ENV vars that are prefixed/suffixed with the context or branch name | [cball](https://github.com/cball) |
| **[Cypress - `netlify-plugin-cypress`](https://github.com/cypress-io/netlify-plugin-cypress)** <br/>  Runs Cypress end-to-end tests after Netlify builds the site | [bahmutov](https://github.com/bahmutov) |
| **[Debug Cache - `netlify-plugin-debug-cache`](https://github.com/netlify-labs/netlify-plugin-debug-cache)** <br/>  Debug & verify the contents of your Netlify build cache | [netlify-labs](https://github.com/netlify-labs) |
| **[Deployment Hours - `netlify-deployment-hours-plugin`](https://github.com/neverendingqs/netlify-deployment-hours-plugin)** <br/>  A Netlify build plugin that blocks deployment if it is outside of deployment hours. | [neverendingqs](https://github.com/neverendingqs) |
| **[Encrypted Files - `netlify-plugin-encrypted-files`](https://github.com/sw-yx/netlify-plugin-encrypted-files)** <br/>  Netlify Build Plugin to partially obscure files (names and contents) in git repos! This enables you to partially open source your site, while still being able to work as normal on your local machine and in your Netlify builds. | [sw-yx](https://github.com/sw-yx) |
| **[Gatsby Cache - `netlify-plugin-gatsby-cache`](https://github.com/jlengstorf/netlify-plugin-gatsby-cache)** <br/>  Persist the Gatsby cache between Netlify builds for huge build speed improvements! ⚡️ | [jlengstorf](https://github.com/jlengstorf) |
| **[Ghost Markdown - `netlify-plugin-ghost-markdown`](https://github.com/daviddarnes/netlify-plugin-ghost-markdown)** <br/>  Generates posts and pages from a Ghost publication as markdown files, using the Ghost Content API. | [daviddarnes](https://github.com/daviddarnes) |
| **[Hashfiles - `netlify-plugin-hashfiles`](https://github.com/munter/netlify-plugin-hashfiles)** <br/>  Hashfiles sets you up with an optimal caching strategy for static sites, where static assets across pages are cached for as long as possible in the visitors browser and never have to be re-requested. | [munter](https://github.com/munter) |
| **[Next.js Cache - `netlify-plugin-cache-nextjs`](https://github.com/pizzafox/netlify-cache-nextjs)** <br/>  Cache the Next.js build folder in your Netlify builds | [pizzafox](https://github.com/pizzafox) |
| **[No More 404 - `netlify-plugin-no-more-404`](https://github.com/sw-yx/netlify-plugin-no-more-404)** <br/>  Check that you preserve your own internal URL structure between builds, accounting for Netlify Redirects. Don't break the web! | [sw-yx](https://github.com/sw-yx) |
| **[Prisma Provider - `netlify-plugin-prisma-provider`](https://github.com/redwoodjs/netlify-plugin-prisma-provider)** <br/>  Replaces the database provider in Prisma's schema.prisma at build time | [cannikin](https://github.com/cannikin) |
| **[RSS - `netlify-plugin-rss`](https://github.com/sw-yx/netlify-plugin-rss)** <br/>  Generate an RSS feed from your static html files, agnostic of static site generator! | [sw-yx](https://github.com/sw-yx) |
| **[Search Index - `netlify-plugin-search-index`](https://github.com/sw-yx/netlify-plugin-search-index)** <br/>  Generate a Search Index of your site you can query via JavaScript or a Netlify Function | [sw-yx](https://github.com/sw-yx) |
| **[Sitemap plugin - `@netlify/plugin-sitemap`](https://github.com/netlify-labs/netlify-plugin-sitemap)** <br/>  Automatically generate a sitemap for your site on PostBuild in Netlify | [netlify-labs](https://github.com/netlify-labs) |
| **[Subfont - `netlify-plugin-subfont`](https://github.com/munter/netlify-plugin-subfont)** <br/>  Subfont post-processes your web page to analyse you usage of web fonts, then reworks your webpage to use an optimal font loading strategy for the best performance. | [munter](https://github.com/munter) |
<!-- AUTO-GENERATED-CONTENT:END -->

To add a plugin, add informations to the [plugins.json file]('./plugins.json').

## Contributing

1. To add a plugin, add informations to the [plugins.json file]('./plugins.json').

2. Then run `npm run docs` to regenerate the plugins table!

3. Continue being super cool, awesome, & fun. 😎
