/**
 * @typedef { import("../types").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("../types/plugins").SanityPluginLookup } SanityPluginLookup
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

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

/**
 * Retrieves a list of all the plugins stored in Sanity
 *
 * @param query {Promise<SanityBuildPluginEntity[]>} Query to execute
 * @returns A list of all the plugins stored in Sanity
 */
export const getSanityPluginLookup = async (query) => {
  const plugins = await query
  /**
   * @type {SanityPluginLookup}
   */
  const pluginLookup = plugins.reduce((sanitytPluginLookup, plugin) => {
    // eslint-disable-next-line no-param-reassign
    sanitytPluginLookup[plugin.packageName] = plugin

    return sanitytPluginLookup
  }, {})

  return pluginLookup
}
