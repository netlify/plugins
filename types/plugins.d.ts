export interface SanityBuildPluginEntity {
  authors: [
    {
      _id: string
      name: string | null
    },
  ]
  compatibility: null
  description: string
  packageName: string
  repoUrl: string
  title: string
  version: string
}

export type SanityPluginLookup = Record<string, SanityBuildPluginEntity>

export type BuildPluginEntity = {}
