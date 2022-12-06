/* eslint-disable max-nested-callbacks */
/* eslint-disable n/no-sync */
import fs from 'fs'

interface Surface {
  surfaceName: string
  surfaceScripts: string[]
  basePath: string
}

interface Workflow {
  package: string
  surfaces: Surface[]
}

// read all workflow-ui.json files from `site/**/workflow-ui.json`
const workflowFiles = fs
  .readdirSync('site', { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .flatMap(({ name }) =>
    fs
      .readdirSync(`site/${name}`)
      .map((file) => `site/${name}/${file}`)
      .filter((file) => file.endsWith('workflow-ui.json')),
  )

const workflows = workflowFiles.map((file) => {
  const content = fs.readFileSync(file)
  return JSON.parse(content.toString()) as Workflow
})

console.log(`processing ${workflows.length} workflows - ${workflows.map((workflow) => workflow.package).join(', ')}`)

const surfaces = workflows.reduce<Record<string, Workflow[]>>((acc, workflow) => {
  const newAcc = { ...acc }
  workflow.surfaces.forEach((surface) => {
    const filteredWorkflow = {
      ...workflow,
      surfaces: workflow.surfaces.filter(({ surfaceName }) => surfaceName === surface.surfaceName),
    }

    newAcc[surface.surfaceName] = [...(acc[surface.surfaceName] ?? []), filteredWorkflow]
  })

  return newAcc
}, {})

Object.entries(surfaces).forEach(([surfaceName, surfaceWorkflows]) => {
  const surfaceRoot = `site/surfaces/${surfaceName}`
  if (!fs.existsSync(surfaceRoot)) {
    fs.mkdirSync(surfaceRoot, { recursive: true })
  }

  fs.writeFileSync(`${surfaceRoot}/index.json`, JSON.stringify(surfaceWorkflows, null, 2))

  surfaceWorkflows.forEach((surfaceWorkflow) => {
    const normalisedPackage = surfaceWorkflow.package.replace(/\//g, '-')

    const surfacePackageRoot = `${surfaceRoot}/${normalisedPackage}`
    if (!fs.existsSync(surfacePackageRoot)) {
      fs.mkdirSync(surfacePackageRoot, { recursive: true })
    }
    fs.writeFileSync(`${surfacePackageRoot}/index.json`, JSON.stringify(surfaceWorkflow, null, 2))
  })
})
