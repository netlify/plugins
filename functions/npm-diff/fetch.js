import { env } from 'process'

import fetch from 'node-fetch'

// Make an HTTP request with a JSON request/response
export const fetchJson = async (url, errorPrefix, { headers, body, ...options } = {}) => {
  const response = await fetch(url, {
    ...options,
    body: JSON.stringify({ body }),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Authorization: `token ${env.GITHUB_TOKEN}`,
    },
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${json.message}`)
  }
  return json
}

// Make a regular HTTP request
export const fetchText = async (url, errorPrefix, options) => {
  const response = await fetch(url, options)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${text}`)
  }
  return text
}
