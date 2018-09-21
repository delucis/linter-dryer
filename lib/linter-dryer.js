'use babel'

import { CompositeDisposable } from 'atom'

export default {
  config: {
    minimumLines: {
      type: 'integer',
      default: 3,
      minimum: 1
    },
    ignoreIndentation: {
      type: 'boolean',
      default: true,
      title: 'Ignore indentation',
      description: 'Ignore indentation when comparing lines'
    },
    ignoreTrailingWhitespace: {
      type: 'boolean',
      default: true,
      title: 'Ignore trailing whitespace',
      description: 'Ignore trailing whitespace when comparing lines'
    },
    ignoreEmptyLines: {
      type: 'boolean',
      default: true,
      title: 'Ignore empty lines',
      description: 'Ignore lines that are empty or contain only whitespace'
    }
  },

  async activate () {
    await require('atom-package-deps').install('linter-dryer')

    this.subscriptions = new CompositeDisposable()
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  provideLinter () {
    return {
      name: 'dryer',
      grammarScopes: ['*'],
      scope: 'file',
      lintsOnChange: true,
      lint: require('./dry')
    }
  }
}
