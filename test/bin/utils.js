/* eslint-disable max-lines */

/**
 * @typedef { import("../../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 */

import test from 'ava'

import { getPluginDiffsForSanity, getSanityPluginLookup } from '../../bin/utils.js'

test('should generate Sanity build plugin lookup', (t) => {
  /**
   * @type {SanityBuildPluginEntity[]}
   */
  const sanityBuildPlugins = [
    {
      _id: '1',
      compatibility: null,
      packageName: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.1',
    },
    {
      _id: '2',
      compatibility: null,
      packageName: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    {
      _id: '3',
      compatibility: null,
      packageName: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  ]
  const expected = {
    'netlify-plugin-use-env-in-runtime': {
      _id: '1',
      compatibility: null,
      packageName: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.1',
    },
    '@bharathvaj/netlify-plugin-airbrake': {
      _id: '2',
      compatibility: null,
      packageName: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    'netlify-plugin-debug-cache': {
      _id: '3',
      compatibility: null,
      packageName: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  }
  const actual = getSanityPluginLookup(sanityBuildPlugins)
  t.deepEqual(actual, expected)
})

test('should generate plugin diffs for Sanity', (t) => {
  const pluginLookup = {
    'netlify-plugin-use-env-in-runtime': {
      _id: '1',
      compatibility: null,
      packageName: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.1',
    },
    '@bharathvaj/netlify-plugin-airbrake': {
      _id: '2',
      compatibility: null,
      packageName: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    'netlify-plugin-debug-cache': {
      _id: '3',
      compatibility: null,
      packageName: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  }
  const plugins = [
    {
      compatibility: [
        {
          _key: 'dfsfg3443sdfgdfgd',
          version: '2.0.0',
        },
        {
          _key: 'dfsfg3443sdfgdfg2',
          version: '1.3.0',
          nodeVersion: '<12.0.0',
        },
      ],
      package: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.2',
    },
    {
      package: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    {
      compatibility: [],
      package: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  ]

  // authors are not currently in here because for v1, we're not updating authors.
  const expected = [
    {
      _id: '1',
      compatibility: [
        {
          _key: 'dfsfg3443sdfgdfgd',
          version: '2.0.0',
        },
        {
          _key: 'dfsfg3443sdfgdfg2',
          version: '1.3.0',
          nodeVersion: '<12.0.0',
        },
      ],
      version: '1.2.2',
    },
    {
      _id: '3',
      compatibility: [],
      version: '1.0.4',
    },
  ]
  const actual = getPluginDiffsForSanity(pluginLookup, plugins)

  t.deepEqual(actual, expected)
})

test('should return no plugin diffs for Sanity if there are no changes', (t) => {
  const pluginLookup = {
    'netlify-plugin-use-env-in-runtime': {
      _id: '1',
      compatibility: null,
      packageName: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.1',
    },
    '@bharathvaj/netlify-plugin-airbrake': {
      _id: '2',
      compatibility: null,
      packageName: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    'netlify-plugin-debug-cache': {
      _id: '3',
      compatibility: null,
      packageName: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  }
  const plugins = [
    {
      package: 'netlify-plugin-use-env-in-runtime',
      version: '1.2.1',
    },
    {
      package: '@bharathvaj/netlify-plugin-airbrake',
      version: '1.0.2',
    },
    {
      package: 'netlify-plugin-debug-cache',
      version: '1.0.4',
    },
  ]
  const expected = []
  const actual = getPluginDiffsForSanity(pluginLookup, plugins)

  t.deepEqual(actual, expected)
})

/* eslint-enable max-lines */
