export interface SanityBuildPluginEntity {
  authors: [
    {
      _id: string
      name: string | null
    },
  ]
  compatibility?: Compatibility[]
  description: string
  packageName: string
  repoUrl: string
  title: string
  version: string
  status: 'active' | 'deactivated'
}

export type SanityPluginLookup = Record<string, SanityBuildPluginEntity>

export type Compatibility =
  | {
      version: string
      migrationGuide: string
    }
  | {
      version: string
      nodeVersion: string
    }

export type BuildPluginEntity = {
  author: string
  description: string
  name: string
  package: string
  repo: string
  version: string
  compatibility?: Compatibility[]
  status?: 'DEACTIVATED'
}
