/**
 * @typedef { import("../types/plugins").SanityBuildPluginEntity } SanityBuildPluginEntity
 * @typedef { import("../types/plugins").SanityPluginLookup } SanityPluginLookup
 * @typedef { import("../types/plugins").BuildPluginEntity } BuildPluginEntity
 */

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
  const pluginChanges = convertCmsChangesToRepoPlugin(changes)

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
