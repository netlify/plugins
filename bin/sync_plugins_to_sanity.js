// eslint-env node
import { promises } from 'fs'

import sanityClient from '@sanity/client'
import dotenv from 'dotenv'

// TODO: The plugins file that changed should be passed in as an argument

/**
 * @typedef { import("../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 */

import { getPluginDiffsForSanity, getSanityPluginLookup } from './utils.js'

const fs = promises

// Using dotenv for local development. When its running in a GitHub action it will use the GitHub action's environment variables
dotenv.config()

// eslint-disable-next-line n/prefer-global/process
const { SANITY_API_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET } = process.env
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
  // TODO: Remove hardcoded path. This will be coming in as an argument
  const filePath = '/Users/nicktaylor/dev/work/plugins/site/plugins.json'
  const fileContents = await fs.readFile(filePath)
  const plugins = JSON.parse(fileContents)

  /**
   * @type {SanityBuildPluginEntity[]}
   */
  const sanityBuildPlugins = await client.fetch(query, {})
  const sanityPluginLookup = await getSanityPluginLookup(sanityBuildPlugins)
  const pluginDiffs = getPluginDiffsForSanity(sanityPluginLookup, plugins)

  console.log(JSON.stringify(pluginDiffs, null, 2))
} catch (error) {
  console.error(error)
  throw new Error('Unable to retrieve plugins from CMS')
}
