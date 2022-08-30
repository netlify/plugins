// import type { SanityClient } from '@sanity/client'

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
}

// type SanityFieldNameToPluginKeyLookup = typeof sanityFieldNameToPluginKeyLookup

// interface SanityBuildPluginEntity {
//   authors: [
//     {
//       _id: string
//       name: string | null
//     },
//   ]
//   compatibility: null
//   description: string
//   packageName: string
//   repoUrl: string
//   title: string
//   version: string
// }

// type SanityPluginLookup = Record<string, SanityBuildPluginEntity>

/**
 * Retrieves a list of all the plugins stored in Sanity
 *
 * @param query {string} Query to execute
 * @returns {object} A list of all the plugins stored in Sanity
 */
export const getSanityPluginLookup = async (query) => {
  const plugins = await query
  const pluginLookup = plugins.reduce((sanitytPluginLookup, plugin) => {
    // eslint-disable-next-line no-param-reassign
    sanitytPluginLookup[plugin.packageName] = plugin

    return sanitytPluginLookup
  }, {})

  return pluginLookup
}
