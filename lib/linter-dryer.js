'use babel'

import fileWatcher from './file-watcher'

export default {
  config: {
    minimumLines: {
      order: 1,
      type: 'integer',
      default: 3,
      minimum: 1,
      title: 'Minimum repeating lines',
      description: 'This sets how many lines must repeat before they are flagged as a repetition'
    },
    minimumTokens: {
      order: 2,
      type: 'integer',
      default: 25,
      minimum: 1,
      title: 'Minimum repeating code tokens',
      description: 'Code is processed and tokenized in order to find repetition in similar but slightly different code. This sets how many tokens need to match to qualify as a repetition. Values that are too low may produce meaningless output.'
    },
    linterScope: {
      order: 3,
      type: 'string',
      default: 'file',
      enum: [
        { value: 'file', description: 'file — shows repetitions within the current file' },
        { value: 'project', description: 'project — shows repetitions across your project' }
      ],
      title: 'Scope to search for repetitions',
      description: 'This sets where the linter looks for repetitions'
    },
    ignoreFiles: {
      order: 4,
      type: 'array',
      items: {
        type: 'string'
      },
      default: ['.gitignore'],
      title: '.ignore files',
      description: 'Specify files like `.gitignore` or `.npmignore` to use in deciding which files linter-dryer should ignore'
    },
    exclude: {
      order: 5,
      type: 'array',
      items: {
        type: 'string'
      },
      default: ['**/*.min.*'],
      title: 'Additional ignore patterns',
      description: 'Files that match any of the patterns set here will be ignored when looking for repetition. (See [`minimatch`](https://github.com/isaacs/minimatch/#minimatch) for globbing documentation.) These patterns are applied _in addition_ to rules found in any files set in the **.ignore files** option.'
    },
    severity: {
      order: 6,
      type: 'string',
      default: 'info',
      enum: ['info', 'warning', 'error'],
      title: 'Repetition severity',
      description: 'This sets how repetitions are highlighted in Atom'
    }
  },

  async activate () {
    await require('atom-package-deps').install('linter-dryer')
    await fileWatcher.start()
  },

  deactivate () {
    fileWatcher.dispose()
  },

  fileWatcher,

  provideLinter () {
    return {
      name: 'dryer',
      grammarScopes: ['*'],
      scope: atom.config.get('linter-dryer.linterScope'),
      lintsOnChange: false,
      lint: require('./cpd')
    }
  }
}
