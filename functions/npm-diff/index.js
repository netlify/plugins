const { computeDiffs } = require('./compute')
const { getNewPluginsUrls } = require('./new_urls')
const { upsertComment } = require('./upsert_comment')
const { validate } = require('./validate')

// Main function handler.
// Add/update a comment on each PR adding/updating a plugin showing the code
// difference of the npm package.
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

    const event = JSON.parse(rawEvent.body)
    if (!ALLOWED_ACTIONS.has(event.action)) {
      console.log(`Ignoring action ${event.action}`)
      return
    }

    await performDiff(event)
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

const performDiff = async function ({
  pull_request: {
    base: {
      sha: baseSha,
      repo: { url: baseRepoUrl },
    },
    diff_url: diffUrl,
    comments_url: commentsUrl,
  },
}) {
  const diffs = await computeDiffs({ baseSha, baseRepoUrl, diffUrl })
  if (diffs.length === 0) {
    console.log('No changed plugins')
    return
  }

  const diffUrls = await getNewPluginsUrls(diffs)
  await upsertComment(diffUrls, commentsUrl)
}

module.exports = { handler }
