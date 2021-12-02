import { fetchJson } from './fetch.js'

// Add or update a comment on the GitHub PR displaying the diff
export const upsertComment = async (diffUrls, commentsUrl) => {
  const comment = getComment(diffUrls)
  if (comment === '') {
    return
  }

  try {
    const comments = await fetchJson(commentsUrl, 'failed getting comments', {})

    const existingComment = comments.find(hasHeader)
    if (existingComment === undefined) {
      console.log(`Creating comment:\n${comment}`)
      await fetchJson(commentsUrl, 'failed creating comment', { method: 'POST', body: comment })
      return
    }

    console.log(`Updating comment to:\n${comment}`)
    await fetchJson(existingComment.url, 'failed updating comment', { method: 'PATCH', body: comment })
  } catch (error) {
    console.log(`addOrUpdatePrComment`, error.message)
  }
}

const getComment = function (diffUrls) {
  diffUrls.sort(sortDiffUrls)
  return UPDATE_TYPES.flatMap(({ status, header }) => listDiffUrls(diffUrls, status, header))
    .filter(Boolean)
    .join('\n\n')
}

const sortDiffUrls = function (diffUrlA, diffUrlB) {
  return diffUrlA.package.localeCompare(diffUrlB.package)
}

const listDiffUrls = function (diffUrls, status, header) {
  const statusUrls = diffUrls.filter((sortedUrl) => sortedUrl.status === status)
  return statusUrls.length === 0 ? [] : [header, statusUrls.map(serializeDiffUrl).join('\n')]
}

const serializeDiffUrl = function ({ url }) {
  return `- ${url}`
}

const hasHeader = function ({ body }) {
  return UPDATE_TYPES.some(({ header }) => body.includes(header))
}

const UPDATE_TYPES = [
  { status: 'added', header: '#### Added Packages' },
  { status: 'updated', header: '#### Updated Packages' },
]
