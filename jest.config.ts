import type { Config } from '@jest/types'
import { jsWithTsESM as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ...tsjPreset.transform
  },
  testPathIgnorePatterns: ['./node_modules/', './dist/'],
}

export default config;
