'use babel'

/**
 * get a range of lines from the text buffer
 * @param  {number} startLine  line number at start of range to get
 * @param  {object} textEditor textEditor instance
 * @param  {number} count      number of lines to get
 * @return {string[]}          an array of line strings
 */
const getRange = (startLine, textEditor, count) => {
  const lineCount = textEditor.getLineCount()
  if (startLine >= lineCount) return null
  const ignoreIndentation = atom.config.get('linter-dryer.ignoreIndentation')
  const ignoreTrailingWhitespace = atom.config.get('linter-dryer.ignoreTrailingWhitespace')
  const ignoreEmptyLines = atom.config.get('linter-dryer.ignoreEmptyLines')
  const lines = []
  for (let i = 0; i < count && startLine + i < lineCount; i++) {
    let line = textEditor.lineTextForBufferRow(startLine + i)
    if (ignoreIndentation && ignoreTrailingWhitespace) line = line.trim()
    else if (ignoreIndentation) line = line.trimStart()
    else if (ignoreTrailingWhitespace) line = line.trimEnd()
    if (!ignoreEmptyLines || line !== '') lines.push(line)
  }
  return lines
}

/**
 * return whether or not two line ranges match
 * @param  {string[]} r1 array of lines to compare
 * @param  {string[]} r2 array of lines to compare
 * @return {boolean}     true if r1 and r2 match, otherwise false
 */
function rangesMatch (r1, r2) {
  [r1, r2] = [r1, r2].map(r => r.join('\n'))
  return r1 === r2
}

/**
 * find repetitions in a text buffer
 * @param  {string} text text to lint
 * @return {object[]}    array of repetition objects
 */
function findRepeats (textEditor) {
  return new Promise(function (resolve, reject) {
    try {
      const minimumLines = atom.config.get('linter-dryer.minimumLines')
      const ignoreEmptyLines = atom.config.get('linter-dryer.ignoreEmptyLines')
      const lineCount = textEditor.getLineCount()
      let pos = 0
      const repetitions = []
      for (let searchLine = 0; searchLine < lineCount; searchLine++) {
        let firstSearchLine = textEditor.lineTextForBufferRow(searchLine)
        // don’t start a match on an empty line
        if (ignoreEmptyLines && firstSearchLine.trim() === '') continue

        let search = getRange(searchLine, textEditor, minimumLines)
        if (search === null) continue

        let searchCount = minimumLines
        while (
          search.length < minimumLines &&
          searchLine + searchCount < lineCount
        ) {
          searchCount++
          search = getRange(searchLine, textEditor, searchCount)
        }

        for (let blockLine = searchLine + searchCount; blockLine < lineCount; blockLine++) {
          // skip lines covered in previous iteration &
          // don’t compare lines against themselves
          if (searchLine < pos || blockLine === searchLine) continue
          // don’t start a match on an empty line
          let firstBlockLine = textEditor.lineTextForBufferRow(blockLine)
          if (ignoreEmptyLines && firstBlockLine.trim() === '') continue

          let block = getRange(blockLine, textEditor, minimumLines)
          if (block === null) continue

          let blockCount = minimumLines
          while (
            block.length < minimumLines &&
            blockLine + blockCount < lineCount
          ) {
            blockCount++
            block = getRange(blockLine, textEditor, blockCount)
          }

          if (!rangesMatch(block, search)) continue

          let matching = true
          let blockMatchCount = blockCount
          let searchMatchCount = searchCount
          while (
            matching &&
            blockLine + blockMatchCount - 1 < lineCount &&
            searchLine + searchMatchCount - 1 < lineCount
          ) {
            blockMatchCount++
            searchMatchCount++
            search = getRange(searchLine, textEditor, searchMatchCount)
            block = getRange(blockLine, textEditor, blockMatchCount)
            matching = rangesMatch(block, search)
          }

          repetitions.push({
            range: [searchLine, searchLine + searchMatchCount - 2],
            match: [blockLine, blockLine + blockMatchCount - 2]
          })

          pos = searchLine + searchMatchCount - 1
          break
        }
      }
      resolve(repetitions)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * get linter messages for a textEditor instance
 * @param  {object} textEditor textEditor instance to lint
 * @return {object[]}          array of linter messages
 */
export default async function (textEditor) {
  const editorPath = textEditor.getPath()
  const repetitions = await findRepeats(textEditor)
  return repetitions.reduce((messages, { range, match }) => {
    [{ range, match }, { range: match, match: range }].forEach(({ range, match }) => {
      const rangeEndCol = textEditor.lineTextForBufferRow(range[1] - 1).length
      messages.push({
        severity: 'info',
        location: {
          file: editorPath,
          position: [[range[0], 0], [range[1], rangeEndCol]]
        },
        reference: {
          file: editorPath,
          position: [match[0], 0]
        },
        excerpt: `L${range[0] + 1}–${range[1] + 1}: Repetition found at L${match[0] + 1}–${match[1] + 1}`
      })
    })
    return messages
  }, [])
}
