/**
 * @typedef { import("../types").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("../types/plugins").SanityPluginLookup } SanityPluginLookup
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

// TODO: remove this an use assert.deepEqual once we support only node engines > 18
import deepEqual from 'deep-equal'

const sanityFieldNameToPluginKeyLookup = {
  _id: '_id',
  title: 'name',
  description: 'description',
  // In sanity, the field is an array of authors, in plugins.json. it's one author
  // authors: 'author',
  packageName: 'package',
  repoUrl: 'repo',
  version: 'version',
  // an object that can be null
  compatibility: 'compatibility',
}

const pluginKeyToSanityFieldNameLookup = Object.entries(sanityFieldNameToPluginKeyLookup).reduce(
  (lookup, [key, value]) => {
    // eslint-disable-next-line no-param-reassign
    lookup[value] = key

    return lookup
  },
  {},
)

/**
 * Retrieves a list of all the plugins stored in Sanity
 *
 * @param plugins {SanityBuildPluginEntity[]} Query to execute
 * @returns A list of all the plugins stored in Sanity
 */
export const getSanityPluginLookup = (plugins) => {
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
 * @param {BuildPluginEntity} plugin
 *
 * @returns {SanityBuildPluginEntity}
 */
const convertToSanityPlugin = (plugin) => {
  const formattedPlugin = Object.keys(plugin).reduce(
    (pluginToFormat, key) => {
      // TODO: Skipping authors for now as they'd already be in Sanity and there in the plugins.json file it appears to be a github username, but in Sanity it's a person's name.
      switch (key) {
        case 'author':
          break

        case 'compatibility':
          // In Sanity, the compatibility field is an array of strings, but in plugins.json it's an array of objects.
          // eslint-disable-next-line no-param-reassign
          pluginToFormat[pluginKeyToSanityFieldNameLookup[key]] = plugin[key] || null
          break

        default:
          // eslint-disable-next-line no-param-reassign
          pluginToFormat[pluginKeyToSanityFieldNameLookup[key]] = plugin[key]
          break
      }

      return pluginToFormat
      // initializing with compatibility as null because in Sanity it will be null, but in plugins.json the compatibility property won't be null
      // It won't exist.
    },
    { compatibility: null },
  )

  return formattedPlugin
}

/**
 *
 * @param {*} plugin
 * @returns
 */
const convertSanityPluginToPlugin = (plugin) => {
  const formattedPlugin = Object.keys(plugin).reduce((pluginToFormat, key) => {
    let fieldValue

    // TODO: It appears for now at least, plugins.json only ever has one author.
    switch (key) {
      case 'authors':
        break
      case 'compatibility':
        if (plugin[key]) {
          // TODO: This is stored as an array of strings in Sanity at the moment, but there is no validation on the Sanity end as it's a string.
          // For another iteration, we could store the compatibility field as an array of objects instead and avoid JSON.parse failing potentially.
          fieldValue = plugin[key].map(JSON.parse)
        }
        break
      default:
        fieldValue = plugin[key]
    }

    if (fieldValue) {
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
  plugins
    .filter((plugin) => {
      if (!(plugin.package in pluginLookup)) {
        return false
      }

      // adding the _id field to the plugin object so that we can use it to update the plugin in Sanity
      // eslint-disable-next-line no-param-reassign, no-underscore-dangle
      plugin._id = pluginLookup[plugin.package]._id

      const sanityPlugin = convertSanityPluginToPlugin(pluginLookup[plugin.package])
      // eslint-disable-next-line no-unused-vars
      const { author, ...pluginWithoutAuthor } = plugin

      return !deepEqual(pluginWithoutAuthor, sanityPlugin)
    })
    .map((plugin) => {
      console.info('Plugin diff found:', plugin.package)
      return convertToSanityPlugin(plugin)
    })
