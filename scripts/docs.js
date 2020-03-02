const fs = require('fs')
const path = require('path')
const markdownMagic = require('markdown-magic')

const REGEX = /(?:(?:^|-)netlify-plugin(?:-|$))|(?:(?:^|-)netlify(?:-|$))/
// const REGEX = /(?:(?:^|-)netlify-plugin(?:-|$))/
const MARKDOWN_PATH = path.join(__dirname, '..', 'README.md')
const PLUGINS_PATH = path.join(__dirname, '..', 'plugins.json')
const PLUGINS = JSON.parse(fs.readFileSync(PLUGINS_PATH, 'utf8'))

const mdConfig = {
  transforms: {
    /*
      <!-- AUTO-GENERATED-CONTENT:START (GENERATE_PLUGIN_LIST)-->
        plugin list will be generated here
      <!-- AUTO-GENERATED-CONTENT:END -->
     */
    GENERATE_PLUGIN_LIST: function(content, options) {
      let md = ''
      PLUGINS.sort(sortPlugins).forEach((data) => {
        md += `- **[${data.name} - \`${data.package.toLowerCase()}\`](${data.repo})** ${data.description}\n`
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    /*
      <!-- AUTO-GENERATED-CONTENT:START (GENERATE_PLUGIN_TABLE)-->
        plugin list will be generated here
      <!-- AUTO-GENERATED-CONTENT:END -->
     */
    GENERATE_PLUGIN_TABLE: function(content, options) {
      let md = `Plugin count: **${PLUGINS.length}** 🎉\n\n`
      md += `| Plugin | Author |\n`
      md += '|:---------------------------|:-----------:|\n'
      PLUGINS.sort(sortPlugins).forEach((data) => {
        const profileURL = `https://github.com/${data.author}`
        md += `| **[${data.name} - \`${data.package.toLowerCase()}\`](${data.repo})** <br/> `
        md += ` ${data.description} | `
        md += `[${data.author}](${profileURL}) |\n`
      })
      return md.replace(/^\s+|\s+$/g, '')
    }
  }
}

/* Utils functions */
function sortPlugins(a, b) {
  const aName = a.name.toLowerCase()
  const bName = b.name.toLowerCase()
  return aName.replace(REGEX, '').localeCompare(bName.replace(REGEX, '')) || aName.localeCompare(bName)
}

markdownMagic(MARKDOWN_PATH, mdConfig, () => {
  console.log('Docs updated!')
})
