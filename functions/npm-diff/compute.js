const { applyPatch } = require('diff')

const { fetchText } = require('./fetch')

// Retrieve list of plugins differences
const computeDiffs = async function ({ baseSha, baseRepoUrl, diffUrl }) {
  const [baseFile, diffText] = await Promise.all([getBaseFile({ baseSha, baseRepoUrl }), getDiffText(diffUrl)])

  const basePlugins = JSON.parse(baseFile)
  const headPlugins = JSON.parse(getDiffedFile(baseFile, diffText))

  const diffs = getDiffs(basePlugins, headPlugins)
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

// Retrieve list of difference between current plugins and new plugins
const getDiffs = (basePlugins, headPlugins) =>
  headPlugins.map((headPlugin) => getDiff(basePlugins, headPlugin)).filter(Boolean)

const getDiff = function (basePlugins, { package, version, author }) {
  const basePlugin = basePlugins.find((plugin) => plugin.author === author && plugin.package === package)

  // New plugin
  if (basePlugin === undefined) {
    return { package, version, status: 'added' }
  }

  // Existing plugin, same version
  if (basePlugin.version === version) {
    return
  }

  // Existing plugin, different version
  const url = `https://diff.intrinsic.com/${package}/${basePlugin.version}/${version}`
  return { package, version, url, status: 'updated' }
}

module.exports = { computeDiffs }
