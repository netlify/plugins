/* eslint-disable max-lines, unicorn/filename-case */
const { env } = require('process')

const Diff = require('diff')
const fetch = require('node-fetch')
const pacote = require('pacote')

const { validate } = require('./utils/validate')

const fetchJson = async (url, options, errorPrefix) => {
  const response = await fetch(url, options)
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

const getNewPluginsUrls = async (diffs) => {
  const diffUrls = await Promise.all(
    diffs.map(async (diff) => {
      if (diff.status === 'added') {
        const manifest = await pacote.manifest(`${diff.package}@${diff.version}`)
        return { ...diff, url: manifest.dist.tarball }
      }
      return diff
    }),
  )

  return diffUrls
}

const ADDED_HEADER = '#### Added Packages'
const UPDATED_HEADER = '#### Updated Packages'

const addOrUpdatePrComment = async ({ comment, commentsUrl, token }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    const comments = await fetchJson(commentsUrl, { headers }, 'failed getting comments')
    const existingComment = comments.find(({ body }) => body.includes(ADDED_HEADER) || body.includes(UPDATED_HEADER))
    if (existingComment) {
      console.log(`Updating comment to:\n${comment}`)
      await fetchJson(
        existingComment.url,
        {
          headers: {
            ...headers,
            Authorization: `token ${token}`,
          },
          method: 'PATCH',
          body: JSON.stringify({ body: comment }),
        },
        'failed updating comment',
      )
    } else {
      console.log(`Creating comment:\n${comment}`)
      await fetchJson(
        commentsUrl,
        {
          headers: {
            ...headers,
            Authorization: `token ${token}`,
          },
          method: 'POST',
          body: JSON.stringify({ body: comment }),
        },
        'failed creating comment',
      )
    }
  } catch (error) {
    console.log(`addOrUpdatePrComment`, error.message)
  }
}

// eslint-disable-next-line complexity, max-statements
const diff = async ({ baseSha, baseRepoUrl, diffUrl, commentsUrl, token }) => {
  const [baseFile, diffText] = await Promise.all([getBaseFile({ baseSha, baseRepoUrl }), getDiffText({ diffUrl })])

  const basePlugins = JSON.parse(baseFile)
  const headPlugins = JSON.parse(getDiffedFile({ baseFile, diffText }))

  const basePluginsDictionary = toDictionary(basePlugins)
  const headPluginsDictionary = toDictionary(headPlugins)

  const diffs = getDiffs(basePluginsDictionary, headPluginsDictionary)
  if (diffs.length <= 0) {
    console.log('No changed plugins')
    return
  }
  const diffUrls = await getNewPluginsUrls(diffs)

  const sorted = [...diffUrls]
  sorted.sort(({ package: packageA }, { package: packageB }) => packageA.localeCompare(packageB))

  const added = sorted.filter(({ status }) => status === 'added')
  const updated = sorted.filter(({ status }) => status === 'updated')

  let comment = ''
  if (added.length !== 0) {
    comment += `${ADDED_HEADER}\n\n${added.map(({ url }) => `- ${url}`).join('\n')}`
  }
  if (updated.length !== 0) {
    if (comment) {
      comment += '\n\n'
    }
    comment += `${UPDATED_HEADER}\n\n${updated.map(({ url }) => `- ${url}`).join('\n')}`
  }

  if (comment) {
    await addOrUpdatePrComment({ comment, commentsUrl, token })
  }
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
