import { promises as fs } from 'fs'

import plugins from '../site/plugins.json'

import { updatePlugins } from './utils.js'

// eslint-disable-next-line n/prefer-global/process
const changes = JSON.parse(process.env.CMS_CHANGES)

console.log('Checking for CMS updates...')
console.log('Changes to synchronize', changes)
console.log('Synchronizing changes to plugins repo...')
const updatedPlugins = updatePlugins(changes, plugins)
fs.writeFile('site/plugins.json', JSON.stringify(updatedPlugins, null, 2))

console.log('Done synching CMS updates to plugins repo.')
