/**
 * @typedef { import("../types").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("../types/plugins").SanityPluginLookup } SanityPluginLookup
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

// TODO: remove this an use assert.deepEqual once we support only node engines > 18
import deepEqual from 'deep-equal'

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

/**
 *
 * @param {*} plugin
 * @returns
 */
const convertSanityPluginToPlugin = (plugin) => {
  const formattedPlugin = Object.keys(plugin).reduce((pluginToFormat, key) => {
    // TODO: It appears for now at least, plugins.json only ever has one author.
    const fieldValue = key === `authors` ? plugin[key][0].name : plugin[key]

    if (fieldValue !== null) {
      // eslint-disable-next-line no-param-reassign
      pluginToFormat[sanityFieldNameToPluginKeyLookup[key]] = fieldValue
    }

    return pluginToFormat
  }, {})

  return formattedPlugin
}

/**
 * Gets the differences between the Sanity plugins and the plugins.json file
 *
 * @param {SanityPluginLookup} pluginLookup
 * @param {BuildPluginEntity[]} plugins
 * @returns
 */
export const getPluginDiffsForSanity = (pluginLookup, plugins) =>
  plugins.filter((plugin) => {
    if (!(plugin.package in pluginLookup)) {
      return false
    }
    const sanityPlugin = convertSanityPluginToPlugin(pluginLookup[plugin.package])

    return !deepEqual(plugin, sanityPlugin)
  })
