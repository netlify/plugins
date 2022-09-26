// eslint-env node
/* eslint-disable n/prefer-global/process */
import { promises as fs } from 'fs'
import path from 'path'

// when testing this script locally, add a path in your .env for GITHUB_WORKSPACE or pass it in
// e.g. GITHUB_WORKSPACE="$(pwd)" npx tsx bin/sync_plugins_to_cms.js

import sanityClient from '@sanity/client'

/**
 * @typedef { import("../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("@sanity/client").SanityClient } SanityClient
 * @typedef { import("@sanity/client").Transaction } Transaction
 * @typedef { import("@sanity/client").Patch } Patch
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

import { getPluginDiffsForSanity, getSanityPluginLookup } from './utils.js'

if (process.env.NODE_ENV === 'development') {
  // Using dotenv for local development.
  console.log('running in development mode')

  const dotenv = await import('dotenv')
  dotenv.config()
}

const { GITHUB_WORKSPACE, SANITY_API_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET } = process.env
const [apiVersion] = new Date().toISOString().split('T')

const config = {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion,
  token: SANITY_API_TOKEN,
  // make sure we have the freshest data when doing the diff with plugins.json
  useCdn: false,
}

/**
 * Creates a transaction containing updates to plugins for the CMS
 *
 * @param {Transaction} transaction
 * @param {Patch} patch
 * @param {BuildPluginEntity[]} diffs
 * @returns
 */
const createUpdates = (transaction, patch, diffs) =>
  diffs.reduce((tx, plugin) => {
    const { _id, ...changes } = plugin
    const fieldUpdates = {}
    const fieldRemovals = []

    for (const [key, value] of Object.entries(changes)) {
      // any property that is null needs to be unset instead of being set to null
      if (value === null) {
        fieldRemovals.push(key)
      } else {
        fieldUpdates[key] = value
      }
    }

    const update = patch(_id).set(fieldUpdates)

    if (fieldRemovals.length !== 0) {
      update.unset(fieldRemovals)
    }

    tx.patch(update)

    return tx
  }, transaction)

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
  compatibility[]
}`

// TODO: Add a retry mechanism to handle network errors
try {
  const pluginsFilePath = path.join(GITHUB_WORKSPACE, '/site/plugins.json')
  const fileContents = await fs.readFile(pluginsFilePath)
  const plugins = JSON.parse(fileContents)

  console.info('Detecting plugin changes...')

  /**
   * @type {SanityBuildPluginEntity[]}
   */
  const sanityBuildPlugins = await client.fetch(query, {})
  const sanityPluginLookup = await getSanityPluginLookup(sanityBuildPlugins)
  const pluginDiffs = getPluginDiffsForSanity(sanityPluginLookup, plugins)

  if (pluginDiffs.length === 0) {
    console.info('No plugin changes found.')
  } else {
    console.info(`Found ${pluginDiffs.length} plugins with changes`)
    console.info('Updating plugins...')

    const transaction = createUpdates(client.transaction(), client.patch, pluginDiffs)

    client.mutate(transaction)
    console.info('Plugins were updated in the CMS.')
  }
} catch (error) {
  console.error(error)
  throw new Error('Unable to synchronize plugins to the CMS')
}

/* eslint-enable n/prefer-global/process */
