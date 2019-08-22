'use babel'

import { dirname, basename } from 'path'
import jscpd from 'jscpd'
import { fileWatcher } from './linter-dryer'

/**
 * Use `jscpd` to detect “copy-paste” instances
 * @param  {Object} textEditor Current TextEditor instance to lint
 * @return {Promise<Object>}   Results from jscpd
 */
async function detectCopyPaste (textEditor) {
  const editorPath = textEditor.getPath()
  const scope = atom.config.get('linter-dryer.linterScope')
  const minLines = atom.config.get('linter-dryer.minimumLines')
  const minTokens = atom.config.get('linter-dryer.minimumTokens')
  const exclude = atom.config.get('linter-dryer.exclude')
  const opts = {
    path: scope === 'project' ? atom.project.getPaths()[0] : dirname(editorPath),
    files: scope === 'project' ? await fileWatcher.getFiles() : basename(editorPath),
    exclude,
    reporter: 'json',
    'min-lines': minLines,
    'min-tokens': minTokens
  }
  return jscpd.prototype.run(opts)
}

/**
 * Build an excerpt message, showing file name if duplicate found in a
 * different file
 * @param  {Number} lines             How many lines have matched
 * @param  {Object} firstFile         firstFile object from `jscpd`
 * @param  {Number} firstFile.start   First row number of match in first file
 * @param  {String} firstFile.name    Path to first file
 * @param  {Object} secondFile        secondFile object from `jscpd`
 * @param  {Number} secondFile.start  First row number of match in second file
 * @param  {String} secondFile.name   Path to second file
 * @return {String}                   Excerpt message describing match
 */
function buildExcerptMessage ({ lines, firstFile, secondFile }) {
  const msg = `L${firstFile.start}–${firstFile.start + lines - 1}: Duplicate found at L${secondFile.start}–${secondFile.start + lines - 1}`
  if (firstFile.name === secondFile.name) {
    return msg
  } else {
    const relativePath = atom.project.relativizePath(secondFile.name)[1]
    return `${msg} in ${relativePath}`
  }
}

/**
 * Reduce a `jscpd` report to an array of linter messages
 * @param  {Object[]} duplicates  Array of duplicate objects from `jscpd`
 * @param  {Object}   textEditor  Current TextEditor instance
 * @return {Promise<Object[]>}    An array of linter message objects
 */
async function reduceReport (duplicates, textEditor) {
  const severity = atom.config.get('linter-dryer.severity')
  const messages = []
  await Promise.all(duplicates.map(async ({ lines, firstFile, secondFile }) => {
    await Promise.all(
      [[firstFile, secondFile], [secondFile, firstFile]].map(
        async ([firstFile, secondFile]) => {
          const rangeEndRow = firstFile.start - 1 + lines - 1
          let rangeEndCol = 0
          if (firstFile.name === textEditor.getPath()) {
            rangeEndCol = textEditor.lineTextForBufferRow(rangeEndRow).length
          }

          const excerpt = buildExcerptMessage({ lines, firstFile, secondFile })

          messages.push({
            severity,
            location: {
              file: firstFile.name,
              position: [[firstFile.start - 1, 0], [firstFile.start - 1 + lines - 1, rangeEndCol]]
            },
            reference: {
              file: secondFile.name,
              position: [secondFile.start - 1, 0]
            },
            excerpt
          })
        }
      )
    )
  }))
  return messages
}

/**
 * Provide a linter
 * @param  {Object} textEditor Current TextEditor instance supplied by linter
 * @return {Promise<Object[]>} An array of linter message objects
 */
export default async function (textEditor) {
  const { report } = await detectCopyPaste(textEditor)
  return reduceReport(report.duplicates, textEditor)
}
