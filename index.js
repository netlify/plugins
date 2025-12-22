'use strict'

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const PLUGINS_FILE = fileURLToPath(new URL('site/plugins.json', import.meta.url))

// TODO: replace with a JSON import once this is supported without any
// experimental flag
export const pluginsList = JSON.parse(readFileSync(PLUGINS_FILE))
export const pluginsUrl = 'https://deploy-preview-1450--netlify-plugins.netlify.app/plugins.json'

console.log({ pluginsUrl })
