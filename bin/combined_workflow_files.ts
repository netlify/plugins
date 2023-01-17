 
/* eslint-disable n/no-sync */
import fs from 'fs'
import path from 'path'

interface Surface {
  surfaceName: string
  surfaceScripts: string[]
  basePath: string
}

interface Workflow {
  package: string
  packageId?: string
  surfaces: Surface[]
}

const getFiles = async function* (dir: string): AsyncGenerator<string, void, void> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

// read all workflow-ui.json files from `site/**/workflow-ui.json`
const workflowFiles = [];
for await (const file of getFiles('site')) {
  const normalizedFileName = file?.toLowerCase() || '';
  if (normalizedFileName.endsWith('/workflow-ui.json')){
    workflowFiles.push(file);
  }
}

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
    const normalizedPackage = (surfaceWorkflow.packageId || surfaceWorkflow.package).toLowerCase()

    const surfacePackageRoot = `${surfaceRoot}/${normalizedPackage}`
    if (!fs.existsSync(surfacePackageRoot)) {
      fs.mkdirSync(surfacePackageRoot, { recursive: true })
    }
    fs.writeFileSync(`${surfacePackageRoot}/index.json`, JSON.stringify(surfaceWorkflow, null, 2))
  })
})
