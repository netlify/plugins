/* eslint-disable max-lines */

/**
 * @typedef { import("../../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 */

import test from 'ava'

import { updatePlugins } from '../../bin/utils.js'

test('should update a plugin', (t) => {
  const changes = {
    compatibility: null,
    description: 'Require visual changes on production to be manually approved before going live!',
    packageName: 'netlify-plugin-visual-diff',
    repoUrl: 'https://github.com/applitools/netlify-plugin-visual-diff',
    status: 'active',
    title: 'Visual diff (Applitools)',
    version: '5.0.0',
  }

  const plugins = [
    {
      author: 'applitools',
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '2.0.0',
      compatibility: [
        {
          version: '2.0.0',
        },
        {
          version: '1.3.0',
          nodeVersion: '<12.0.0',
        },
      ],
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]
  const actual = updatePlugins(changes, plugins)
  const expected = [
    {
      author: 'applitools',
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '5.0.0',
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]

  t.deepEqual(actual, expected)
})

test('should add a new plugin', (t) => {
  const changes = {
    compatibility: null,
    description: 'Require visual changes on production to be manually approved before going live!',
    netlifyVerified: false,
    packageName: 'netlify-plugin-visual-diff',
    repoUrl: 'https://github.com/applitools/netlify-plugin-visual-diff',
    status: 'active',
    title: 'Visual diff (Applitools)',
    version: '5.0.0',
  }
  const plugins = [
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]
  const actual = updatePlugins(changes, plugins)
  const expected = [
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
    {
      description: 'Require visual changes on production to be manually approved before going live!',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      name: 'Visual diff (Applitools)',
      version: '5.0.0',
    },
  ]

  t.deepEqual(actual, expected)
})

test('should update compatibility', (t) => {
  const changes = {
    compatibility: [
      {
        version: '2.0.0',
      },
      {
        version: '1.3.0',
      },
    ],
    description: 'Require visual changes on production to be manually approved before going live!',
    netlifyVerified: false,
    packageName: 'netlify-plugin-visual-diff',
    repoUrl: 'https://github.com/applitools/netlify-plugin-visual-diff',
    status: 'active',
    title: 'Visual diff (Applitools)',
    version: '5.0.0',
  }
  const plugins = [
    {
      author: 'applitools',
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '5.0.0',
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]
  const actual = updatePlugins(changes, plugins)
  const expected = [
    {
      author: 'applitools',
      compatibility: [
        {
          version: '2.0.0',
        },
        {
          version: '1.3.0',
        },
      ],
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '5.0.0',
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]

  t.deepEqual(actual, expected)
})

test('should mark status as DEACTIVATED', (t) => {
  const changes = {
    compatibility: null,
    description: 'Require visual changes on production to be manually approved before going live!',
    netlifyVerified: false,
    packageName: 'netlify-plugin-visual-diff',
    repoUrl: 'https://github.com/applitools/netlify-plugin-visual-diff',
    status: 'deactivated',
    title: 'Visual diff (Applitools)',
    version: '5.0.0',
  }
  const plugins = [
    {
      author: 'applitools',
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '5.0.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]
  const actual = updatePlugins(changes, plugins)
  const expected = [
    {
      author: 'applitools',
      description: 'Require visual changes on production to be manually approved before going live!',
      name: 'Visual diff (Applitools)',
      package: 'netlify-plugin-visual-diff',
      repo: 'https://github.com/applitools/netlify-plugin-visual-diff',
      version: '5.0.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'pizzafox',
      description: 'This plugin is deprecated. The functionality is now built in',
      name: 'Next.js cache',
      package: 'netlify-plugin-cache-nextjs',
      repo: 'https://github.com/pizzafox/netlify-cache-nextjs',
      version: '1.4.0',
      status: 'DEACTIVATED',
    },
    {
      author: 'netlify-labs',
      description: 'Automatically generate a sitemap for your site on PostBuild in Netlify',
      name: 'Sitemap',
      package: '@netlify/plugin-sitemap',
      repo: 'https://github.com/netlify-labs/netlify-plugin-sitemap',
      version: '0.8.1',
    },
  ]

  t.deepEqual(actual, expected)
})

/* eslint-enable max-lines */
