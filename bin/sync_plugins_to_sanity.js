// eslint-env node
/* eslint-disable n/prefer-global/process */
import { promises } from 'fs'
import path from 'path'

import sanityClient from '@sanity/client'

/**
 * @typedef { import("../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("@sanity/client").SanityClient } SanityClient
 */

import { getPluginDiffsForSanity, getSanityPluginLookup } from './utils.js'

const fs = promises

if (process.env.NODE_ENV === 'development') {
  // Using dotenv for local development.
  console.log('running in development mode')

  const dotenv = await import('dotenv')
  dotenv.config()
}

const { GITHUB_WORKSPACE, SANITY_API_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET } = process.env
const [apiVersion] = new Date().toISOString().split('T')

// TODO: projectId and dataset should be read from GH action secrets?
const config = {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion,
  token: SANITY_API_TOKEN,
  // make sure we have the freshest data when doing the diff with plugins.json
  useCdn: false,
}

/**
 * @type {SanityClient}
 */
const client = sanityClient(config)

const query = `*[_type == "buildPlugin"] {
  _id,
  title,
  description,
  authors,
  authors[]->{_id, name},
  packageName,
  repoUrl,
  version,
  compatibility
}`

// TODO: Add a retry mechanism to handle network errors
try {
  // when testing this script locally, add a path in your .env for GITHUB_WORKSPACE or pass it in
  // e.g. GITHUB_WORKSPACE="/Users/some-dev/dev/plugins/" npx tsx bin/sync_plugins_to_sanity.js
  const pluginsFilePath = path.join(GITHUB_WORKSPACE, '/site/plugins.json')
  console.log(`Reading existing plugins in repository from ${pluginsFilePath}`)
  const fileContents = await fs.readFile(pluginsFilePath)
  const plugins = JSON.parse(fileContents)

  console.info('Detecting plugin diffs.')

  /**
   * @type {SanityBuildPluginEntity[]}
   */
  const sanityBuildPlugins = await client.fetch(query, {})
  const sanityPluginLookup = await getSanityPluginLookup(sanityBuildPlugins)
  const pluginDiffs = getPluginDiffsForSanity(sanityPluginLookup, plugins)

  console.info(`Found ${pluginDiffs.length} plugin diffs`)

  /**
   *
   * @param {BuildPluginEntity} pluginDiffs
   * @returns
   */
  const createUpdates = (transaction, patch, diffs) =>
    diffs.reduce((tx, plugin) => {
      const { _id, ...pluginUpdates } = plugin
      const update = patch(_id).set(pluginUpdates)

      tx.patch(update)

      return tx
    }, transaction)

  console.info('Updating plugins...')
  const transaction = createUpdates(client.transaction(), client.patch, pluginDiffs)

  client.mutate(transaction, { dryRun: false })
  console.info('Plugins were updated in the CMS.')
} catch (error) {
  console.error(error)
  throw new Error('Unable to retrieve plugins from CMS')
}

/* eslint-enable n/prefer-global/process */
