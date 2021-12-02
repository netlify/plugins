import { createHmac } from 'crypto'
import { env } from 'process'

// Validate Function event payload
export const validatePayload = (rawEvent) => {
  const failedValidation = VALIDATIONS.find(({ test }) => test(rawEvent))
  if (failedValidation === undefined) {
    return
  }
  const { errorMessage } = failedValidation
  return typeof errorMessage === 'function' ? errorMessage(rawEvent) : errorMessage
}

const VALIDATIONS = [
  {
    test: ({ httpMethod }) => httpMethod === 'POST',
    errorMessage: "Expecting 'POST' request",
  },
  {
    test: ({ headers }) => REQUIRED_HEADERS.every((requiredHeader) => headers[requiredHeader]),
    errorMessage({ headers }) {
      const missingHeaders = REQUIRED_HEADERS.filter((requiredHeader) => !headers[requiredHeader]).join(', ')
      return `Missing '${missingHeaders}'`
    },
  },
  {
    test: () => Boolean(env.GITHUB_WEBHOOK_SECRET),
    errorMessage: "Missing 'GITHUB_WEBHOOK_SECRET'",
  },
  {
    test({ headers, body }) {
      const expectedSignature = createHmac('sha1', env.GITHUB_WEBHOOK_SECRET).update(body, 'utf-8').digest('hex')
      return headers['x-hub-signature'] === `sha1=${expectedSignature}`
    },
    errorMessage: "Incorrect 'X-Hub-Signature'",
  },
]

const REQUIRED_HEADERS = ['x-hub-signature', 'x-github-event', 'x-github-delivery']
