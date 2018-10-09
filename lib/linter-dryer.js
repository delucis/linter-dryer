'use babel'

import { CompositeDisposable } from 'atom'

export default {
  config: {
    minimumLines: {
      type: 'integer',
      default: 3,
      minimum: 1,
      title: 'Minimum repeating lines',
      description: 'This sets how many lines must repeat before they are flagged as a repetition'
    },
    minimumTokens: {
      type: 'integer',
      default: 25,
      minimum: 1,
      title: 'Minimum repeating code tokens',
      description: 'Code is processed and tokenized in order to find repetition in similar but slightly different code. This sets how many tokens need to match to qualify as a repetition. Values that are too low may produce meaningless output.'
    },
    linterScope: {
      type: 'string',
      default: 'file',
      enum: [
        { value: 'file', description: 'file — finds repetitions within a single file' },
        { value: 'project', description: 'project — finds repetitions across your project' }
      ],
      title: 'Scope to search for repetitions',
      description: 'This sets where the linter looks for repetitions'
    },
    exclude: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: ['**/node_modules/**', '**/.git/**', '**/*.min.*'],
      title: 'Files to ignore (list of glob patterns)',
      description: 'Specify file globs to ignore when looking for repetitions across the project'
    },
    severity: {
      type: 'string',
      default: 'info',
      enum: ['info', 'warning', 'error'],
      title: 'Repetition severity',
      description: 'This sets how repetitions are highlighted in Atom'
    }
  },

  async activate () {
    await require('atom-package-deps').install('linter-dryer')
  },

  provideLinter () {
    return {
      name: 'dryer',
      grammarScopes: ['*'],
      scope: atom.config.get('linter-dryer.linterScope'),
      lintsOnChange: true,
      lint: require('./cpd')
    }
  }
}
