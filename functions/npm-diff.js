/* eslint-disable max-lines, unicorn/filename-case */
const { env } = require('process')

const Diff = require('diff')
const fetch = require('node-fetch')
const pacote = require('pacote')

const { validate } = require('./utils/validate')

const fetchJson = async (url, errorPrefix, options) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'Content-Type': 'application/json' },
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${json.message}`)
  }
  return json
}

const fetchText = async (url, options, errorPrefix) => {
  const response = await fetch(url, options)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${text}`)
  }
  return text
}

const getBaseFile = async ({ baseRepoUrl, baseSha }) => {
  const baseFile = await fetchText(
    `${baseRepoUrl}/contents/site/plugins.json?ref=${baseSha}`,
    {
      headers: { Accept: 'application/vnd.github.VERSION.raw' },
    },
    'getBaseFile',
  )
  return baseFile
}

const getDiffText = async ({ diffUrl }) => {
  const diffText = await fetchText(diffUrl, {}, 'getDiffText')
  return diffText
}

const getDiffedFile = ({ baseFile, diffText }) => {
  const diffed = Diff.applyPatch(baseFile, diffText)
  // applyPatch() sometimes returns `false` instead of errors
  // https://github.com/kpdecker/jsdiff/issues/247
  if (diffed === false) {
    throw new Error('Failed applying diff')
  }
  return diffed
}

const toDictionary = (plugins) =>
  plugins.reduce((dic, plugin) => ({ ...dic, [`${plugin.author}-${plugin.package}`]: plugin }), {})

const getDiffs = (basePluginsDictionary, headPluginsDictionary) => {
  const diffs = Object.entries(headPluginsDictionary).reduce((acc, [key, headPlugin]) => {
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

  return diffs
}

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

const addOrUpdatePrComment = async ({ comment, commentsUrl, token }) => {
  try {
    const comments = await fetchJson(commentsUrl, 'failed getting comments', {})

    const headers = { Authorization: `token ${token}` }

    const existingComment = comments.find(hasHeader)
    if (existingComment === undefined) {
      console.log(`Creating comment:\n${comment}`)
      await fetchJson(commentsUrl, 'failed creating comment', {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: comment }),
      })
      return
    }

    console.log(`Updating comment to:\n${comment}`)
    await fetchJson(existingComment.url, 'failed updating comment', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ body: comment }),
    })
  } catch (error) {
    console.log(`addOrUpdatePrComment`, error.message)
  }
}

const hasHeader = function ({ body }) {
  return URL_TYPES.some(({ header }) => body.includes(header))
}

const diff = async ({ baseSha, baseRepoUrl, diffUrl, commentsUrl, token }) => {
  const [baseFile, diffText] = await Promise.all([getBaseFile({ baseSha, baseRepoUrl }), getDiffText({ diffUrl })])

  const basePlugins = JSON.parse(baseFile)
  const headPlugins = JSON.parse(getDiffedFile({ baseFile, diffText }))

  const basePluginsDictionary = toDictionary(basePlugins)
  const headPluginsDictionary = toDictionary(headPlugins)

  const diffs = getDiffs(basePluginsDictionary, headPluginsDictionary)
  if (diffs.length === 0) {
    console.log('No changed plugins')
    return
  }

  const diffUrls = await getNewPluginsUrls(diffs)
  diffUrls.sort(sortDiffUrls)

  const comment = URL_TYPES.flatMap(({ attribute, header }) => listDiffUrls(diffUrls, attribute, header))
    .filter(Boolean)
    .join('\n\n')

  if (comment === '') {
    return
  }

  await addOrUpdatePrComment({ comment, commentsUrl, token })
}

const sortDiffUrls = function (diffUrlA, diffUrlB) {
  return diffUrlA.package.localeCompare(diffUrlB.package)
}

const URL_TYPES = [
  { attribute: 'added', header: '#### Added Packages' },
  { attribute: 'updated', header: '#### Updated Packages' },
]

const listDiffUrls = function (diffUrls, status, header) {
  const statusUrls = diffUrls.filter((sortedUrl) => sortedUrl.status === status)
  return statusUrls.length === 0 ? [] : [header, statusUrls.map(serializeDiffUrl).join('\n')]
}

const serializeDiffUrl = function ({ url }) {
  return `- ${url}`
}

const handler = async function (rawEvent) {
  console.log(rawEvent)

  try {
    const { error } = validate(rawEvent)
    if (error) {
      console.warn('Validation error:', error.message)
      return {
        statusCode: 404,
        body: 'Not Found',
      }
    }

    const {
      action,
      pull_request: {
        base: {
          sha: baseSha,
          repo: { url: baseRepoUrl },
        },
        diff_url: diffUrl,
        comments_url: commentsUrl,
      },
    } = JSON.parse(rawEvent.body)
    if (!ALLOWED_ACTIONS.has(action)) {
      console.log(`Ignoring action ${action}`)
      return
    }

    await diff({ baseSha, baseRepoUrl, diffUrl, commentsUrl, token: env.GITHUB_TOKEN })
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success' }),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unknown error' }),
    }
  }
}

const ALLOWED_ACTIONS = new Set(['opened', 'synchronize', 'reopened'])

module.exports = { handler }
/* eslint-enable max-lines, unicorn/filename-case */
