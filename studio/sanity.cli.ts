import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '__PROJECT_ID__',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
