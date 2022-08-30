// eslint-env node
import type { SanityClient } from '@sanity/client'
import sanityClient from '@sanity/client'
import dotenv from 'dotenv'

// Using dotenv for local development. When its running in a GitHub action it will use the GitHub action's environment variables
dotenv.config()

const sanityFieldNameToPluginKeyLookup = {
  title: 'name',
  description: 'description',
  // In sanity, the field is an array of authors, in plugins.json. it's one author
  authors: 'author',
  packageName: 'package',
  repoUrl: 'repo',
  version: 'version',
  // an object that can be null
  compatibility: 'compatibility',
} as const

type SanityFieldNameToPluginKeyLookup = typeof sanityFieldNameToPluginKeyLookup

interface SanityBuildPluginEntity {
  authors: [
    {
      _key: string
      _ref: string
      _type: 'reference'
    },
  ]
  compatibility: null
  description: string
  packageName: string
  repoUrl: string
  title: string
  version: string
}

type SanityPluginLookup = Record<string, SanityBuildPluginEntity>

// eslint-disable-next-line n/prefer-global/process
const { SANITY_API_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET } = process.env
const [apiVersion] = new Date().toISOString().split('T')

/**
 * Retrieves a list of all the plugins stored in Sanity
 *
 * @param client Sanity client
 * @param query Query to execute
 * @returns A list of all the plugins stored in Sanity
 */
const getSanityPluginLookup = async (client: SanityClient, query: string) => {
  const plugins = await client.fetch<SanityBuildPluginEntity[]>(query, {})
  const pluginLookup = plugins.reduce((sanitytPluginLookup: SanityPluginLookup, plugin: SanityBuildPluginEntity) => {
    // eslint-disable-next-line no-param-reassign
    sanitytPluginLookup[plugin.packageName] = plugin

    return sanitytPluginLookup
  }, {})

  return pluginLookup
}

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
 * @type: SanityClient
 */
const client = sanityClient(config)

const query = `*[_type == "buildPlugin"] { title, description, authors, packageName, repoUrl, version, compatibility }`

// TODO: Add a retry mechanism to handle network errors
try {
  const sanityPluginLookup = await getSanityPluginLookup(client, query)

  console.log(JSON.stringify(sanityPluginLookup, null, 2))
} catch (error) {
  console.error(error)
  throw new Error('Unable to retrieve plugins from CMS')
}
