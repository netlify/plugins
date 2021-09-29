const { applyPatch } = require('diff')

const { fetchText } = require('./fetch')

// Retrieve list of plugins differences
const computeDiffs = async function ({ baseSha, baseRepoUrl, diffUrl }) {
  const [baseFile, diffText] = await Promise.all([getBaseFile({ baseSha, baseRepoUrl }), getDiffText(diffUrl)])

  const basePlugins = JSON.parse(baseFile)
  const headPlugins = JSON.parse(getDiffedFile(baseFile, diffText))

  const basePluginsDictionary = toDictionary(basePlugins)
  const headPluginsDictionary = toDictionary(headPlugins)

  const diffs = getDiffs(basePluginsDictionary, headPluginsDictionary)
  return diffs
}

// Fetch list of plugins, before PR changes
const getBaseFile = async ({ baseRepoUrl, baseSha }) =>
  await fetchText(`${baseRepoUrl}/contents/site/plugins.json?ref=${baseSha}`, 'getBaseFile', {
    headers: { Accept: 'application/vnd.github.VERSION.raw' },
  })

// Fetch list of PR changes
const getDiffText = (diffUrl) => fetchText(diffUrl, 'getDiffText', {})

// Retrieve list of plugins, after PR changes
const getDiffedFile = (baseFile, diffText) => {
  const diffed = applyPatch(baseFile, diffText)

  // applyPatch() sometimes returns `false` instead of errors
  // https://github.com/kpdecker/jsdiff/issues/247
  if (diffed === false) {
    throw new Error('Failed applying diff')
  }

  return diffed
}

const toDictionary = (plugins) =>
  plugins.reduce((dictionary, plugin) => ({ ...dictionary, [`${plugin.author}-${plugin.package}`]: plugin }), {})

const getDiffs = (basePluginsDictionary, headPluginsDictionary) =>
  Object.entries(headPluginsDictionary).reduce((acc, [key, headPlugin]) => {
    const basePlugin = basePluginsDictionary[key]
    if (basePlugin && basePlugin.version !== headPlugin.version) {
      // existing plugin
      return [
        ...acc,
        {
          package: headPlugin.package,
          version: headPlugin.version,
          url: `https://diff.intrinsic.com/${headPlugin.package}/${basePlugin.version}/${headPlugin.version}`,
          status: 'updated',
        },
      ]
    }
    if (!basePlugin) {
      // new plugin
      return [...acc, { package: headPlugin.package, version: headPlugin.version, status: 'added' }]
    }
    // unchanged version
    return acc
  }, [])

module.exports = { computeDiffs }
