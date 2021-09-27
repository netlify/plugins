const pacote = require('pacote')

// Add npm URLs to new plugins.
const getNewPluginsUrls = (diffs) => Promise.all(diffs.map(getDiffNewPluginsUrls))

const getDiffNewPluginsUrls = async function (diff) {
  if (diff.status !== 'added') {
    return diff
  }

  const {
    dist: { tarball },
  } = await pacote.manifest(`${diff.package}@${diff.version}`)
  return { ...diff, url: tarball }
}

module.exports = { getNewPluginsUrls }
