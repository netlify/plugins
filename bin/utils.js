/**
 * @typedef { import("../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("../types/plugins").SanityPluginLookup } SanityPluginLookup
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

// TODO: remove this an use assert.deepEqual once we support only node engines > 18
import deepEqual from 'deep-equal'

const sanitizeCompatibility = (compatibility) =>
  compatibility
    ? compatibility.map((compatibilityItem) => {
        // _keys will alwyas be different and they're not the data we care about comparing.
        // eslint-disable-next-line no-unused-vars
        const { _key, ...resetOfItem } = compatibilityItem

        return resetOfItem
      })
    : null

const sanityFieldNameToPluginKeyLookup = {
  _id: '_id',
  packageName: 'package',
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
      switch (key) {
        // _id field was added from Sanity so there is a unique identifier for each plugin when pushing things back to Sanity.
        case '_id':
          // eslint-disable-next-line no-param-reassign
          pluginToFormat[pluginKeyToSanityFieldNameLookup[key]] = plugin[key]
          break
        case 'compatibility':
          // eslint-disable-next-line no-param-reassign
          pluginToFormat[pluginKeyToSanityFieldNameLookup[key]] = plugin[key] || null
          break

        case 'version':
          // eslint-disable-next-line no-param-reassign
          pluginToFormat[pluginKeyToSanityFieldNameLookup[key]] = plugin[key]
          break

        default:
          // We only want to sync the version and compatibility fields for now.
          // _id is used to identify which documents in Sanity need to be updated.
          break
      }

      return pluginToFormat
      // initializing with compatibility as null because in Sanity it will be null, but in plugins.json the compatibility
      // property won't be null. It won't exist.
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
  // These are the only fields we care about for now.
  const formattedPlugin = {
    // eslint-disable-next-line no-underscore-dangle
    _id: plugin._id,
    version: plugin.version,
    compatibility: sanitizeCompatibility(plugin.compatibility),
  }

  return formattedPlugin
}

/**
 * Gets the differences between the Sanity plugins and the plugins.json file
 *
 * @param {SanityPluginLookup} pluginLookup
 * @param {BuildPluginEntity[]} plugins
 * @returns
 */
export const getPluginDiffsForSanity = (pluginLookup, plugins) => {
  const diffs = plugins
    .filter((plugin) => {
      if (!(plugin.package in pluginLookup)) {
        // The plugin does not Exist in Sanity, so we filter it out.
        return false
      }

      // adding the _id field to the plugin object so that we can use it to update the plugin in Sanity
      // eslint-disable-next-line no-param-reassign, no-underscore-dangle
      plugin._id = pluginLookup[plugin.package]._id

      // These are the only fields we care about for now.
      const minimalPlugin = {
        // eslint-disable-next-line no-underscore-dangle
        _id: plugin._id,
        version: plugin.version,
        // In Sanity it's null, in plugins.json it's undefined
        compatibility: sanitizeCompatibility(plugin.compatibility),
      }

      const sanityPlugin = convertSanityPluginToPlugin(pluginLookup[plugin.package])

      return !deepEqual(minimalPlugin, sanityPlugin)
    })
    .map((plugin) => {
      console.info('Plugin diff found:', plugin.package)
      return convertToSanityPlugin(plugin)
    })

  return diffs
}

/**
 *
 * @param {SanityBuildPluginEntity} plugin
 *
 * @returns {BuildPluginEntity}
 */
const convertCmsChangesToRepoPlugin = (plugin) => {
  const { compatibility, description, packageName, status: rawStatus, repoUrl: repo, title: name, version } = plugin
  /**
   * @type {BuildPluginEntity['status']}
   */
  const status = rawStatus === 'deactivated' ? rawStatus.toUpperCase() : undefined

  return {
    name,
    package: packageName,
    description,
    repo,
    version,
    status,
    compatibility,
  }
}

const stripNullifiedFields = (plugin) => {
  // If plugin status is undefined, it means the plugin is active, so the field is omitted
  if (!plugin.status) {
    // eslint-disable-next-line no-param-reassign
    delete plugin.status
  }

  // If plugin compatibility is null, it means there is no compatibility set, so the field is omitted
  if (!plugin.compatibility) {
    // eslint-disable-next-line no-param-reassign
    delete plugin.compatibility
  }

  return plugin
}

/**
 * Updates or adds a plugin to the list of plugins.
 *
 * @param {SanityBuildPluginEntity} changes
 * @param {BuildPluginEntity[]} plugins
 *
 * return {BuildPluginEntity[]} The updated list of plugins
 */
export const updatePlugins = (changes, plugins) => {
  const { compatibility, ...restOfChanges } = changes
  const updatedCompatibility = compatibility?.map((compatibilityItem) => {
    // eslint-disable-next-line no-unused-vars
    const { _key, ...rest } = compatibilityItem

    return rest
  })

  const sanitizedChanges = { ...restOfChanges, compatibility: updatedCompatibility }
  const pluginChanges = convertCmsChangesToRepoPlugin(sanitizedChanges)

  let pluginToUpdate = plugins.find((plugin) => plugin.package === pluginChanges.package)

  if (pluginToUpdate) {
    pluginToUpdate = stripNullifiedFields({ ...pluginToUpdate, ...pluginChanges })

    return plugins.map((plugin) => {
      if (plugin.package === pluginToUpdate.package) {
        return pluginToUpdate
      }

      return plugin
    })
  }

  pluginToUpdate = stripNullifiedFields(pluginChanges)

  return [...plugins, pluginToUpdate]
}
