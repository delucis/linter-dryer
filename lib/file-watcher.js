'use babel'

import walk from 'ignore-walk'

export default (function () {
  'use strict'

  const watcher = {}

  /**
   * Start file watching if linter scope is 'project' and stop if it is 'file'
   * @param  {String} scope The current linterScope setting: 'project' or 'file'
   * @return {Promise<undefined>}
   */
  const handleLinterScope = async function functionName (scope) {
    if (scope === 'project' && (!watcher.listener || watcher.listener.disposed)) {
      watcher.listener = atom.project.onDidChangeFiles(walkFiles)
      await walkFiles()
    } else if (watcher.listener && !watcher.listener.disposed) {
      watcher.listener.dispose()
    }
  }

  /**
   * Collect project file paths using `ignore-walk` & filter out `.git` paths
   * @return {Promise<undefined>}
   */
  const walkFiles = async function walkFiles () {
    const files = await walk({
      path: atom.project.getPaths()[0],
      ignoreFiles: atom.config.get('linter-dryer.ignoreFiles')
    })
    watcher.files = files.filter(path => !/\.git\//.test(path))
  }

  return {
    /**
     * Initialise a disposable fileWatcher instance by observing linter scope
     * @return {Promise<undefined>}
     */
    start: async function functionName () {
      if (!watcher.atomConfigListener || watcher.atomConfigListener.disposed) {
        watcher.atomConfigListener = atom.config.observe('linter-dryer.linterScope', handleLinterScope)
      }
    },

    /**
     * Get the files retrieved using `ignore-walk`
     * @return {Promise<String[]>} Array of file paths in the current project
     */
    getFiles: async function getFiles () {
      return watcher.files
    },

    /**
     * Dispose of fileWatcher’s internal listeners
     * @return {undefined}
     */
    dispose: function functionName () {
      watcher.listener.dispose()
      watcher.atomConfigListener.dispose()
    }
  }
}())
