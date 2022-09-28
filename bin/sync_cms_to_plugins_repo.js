// eslint-disable-next-line n/prefer-global/process
const changes = JSON.parse(process.env.CMS_CHANGES)

console.log('Checking for CMS updates...')

// This will be replaced in a follow up PR  with the actual sync logic
if (changes && Object.keys(changes).length !== 0) {
  console.log('Synchronizing changes to plugins repo...')
}

console.log('Done synching CMS updates to plugins repo.')
