const crypto = require('crypto')
const { env } = require('process')

const signRequestBody = (secret, body) =>
  `sha1=${crypto.createHmac('sha1', secret).update(body, 'utf-8').digest('hex')}`

const validate = (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      error: {
        message: "Expecting 'POST' request",
      },
    }
  }
  const githubSecret = env.GITHUB_WEBHOOK_SECRET

  if (typeof githubSecret !== 'string') {
    return {
      error: {
        message: "Missing 'GITHUB_WEBHOOK_SECRET'",
      },
    }
  }

  const requiredHeaders = ['x-hub-signature', 'x-github-event', 'x-github-delivery']
  const missing = requiredHeaders.filter((requiredHeader) => !event.headers[requiredHeader])
  if (missing.length !== 0) {
    return {
      error: {
        message: `Missing '${missing.join(', ')}'`,
      },
    }
  }

  const actualSignature = event.headers['x-hub-signature']
  const expectedSignature = signRequestBody(githubSecret, event.body)
  if (actualSignature !== expectedSignature) {
    return {
      error: {
        message: "Incorrect 'X-Hub-Signature'",
      },
    }
  }

  return { error: false }
}

module.exports = { validate }
