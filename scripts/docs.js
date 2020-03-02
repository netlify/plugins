const fs = require('fs')
const url = require('url')
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
        md += `- **[${formatPluginName(data.name)} - \`${data.name.toLowerCase()}\`](${data.repo})** ${data.description}\n`
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
        const userName = data.author;
        const profileURL = `https://github.com/${userName}`
        md += `| **[${formatPluginName(data.name)} - \`${data.name.toLowerCase()}\`](${data.repo})** <br/> `
        md += ` ${data.description} | `
        md += `[${userName}](${profileURL}) |\n`
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

function formatPluginName(string) {
  const name = string.toLowerCase()
  const isInternal = name.match(/^@netlify\/plugin/)

  const cleanName = toTitleCase(name
    .replace(REGEX, '')
    .replace(/^@netlify\/plugin/, '')
    .replace(/-/g, ' ')
    .replace(/plugin$/g, '')
    .trim()
  )
  return (isInternal) ? `${cleanName} plugin` : cleanName
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

markdownMagic(MARKDOWN_PATH, mdConfig, () => {
  console.log('Docs updated!')
})
