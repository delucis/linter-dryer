'use babel'

const getRange = (idx, textEditor, count) => {
  const lineCount = textEditor.getLineCount()
  if (idx >= lineCount) return null
  const lines = []
  for (var i = 0; i < count && idx + i < lineCount; i++) {
    lines.push(textEditor.lineTextForBufferRow(idx + i))
  }
  const ignoreIndentation = atom.config.get('linter-dryer.ignoreIndentation')
  const ignoreTrailingWhitespace = atom.config.get('linter-dryer.ignoreTrailingWhitespace')
  return lines
    .map(line => {
      if (ignoreIndentation && ignoreTrailingWhitespace) return line.trim()
      if (ignoreIndentation) return line.trimStart()
      if (ignoreTrailingWhitespace) return line.trimEnd()
      return line
    })
    .join('\n')
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
      const lineCount = textEditor.getLineCount()
      let pos = 0
      const repetitions = []
      for (let lineNum = 0; lineNum < lineCount; lineNum++) {
        let search = getRange(lineNum, textEditor, minimumLines)
        if (!search) continue
        for (let i = pos; i < lineCount; i++) {
          // skip lines covered in previous iteration &
          // don’t compare lines against themselves
          if (lineNum < pos || i === lineNum) continue
          let block = getRange(i, textEditor, minimumLines)
          if (!block) continue
          if (block !== search) continue
          let matching = true
          let count = minimumLines
          while (
            matching &&
            i + count - 1 < lineCount &&
            lineNum + count - 1 < lineCount
          ) {
            count++
            search = getRange(lineNum, textEditor, count)
            block = getRange(i, textEditor, count)
            matching = search === block
          }
          repetitions.push({
            range: [lineNum, lineNum + count - 1],
            match: [i, i + count - 1]
          })
          pos = lineNum + count - 1
          break
        }
      }
      resolve(repetitions)
    } catch (e) {
      reject(e)
    }
  })
}

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
        excerpt: `Repetition found at lines ${match[0] + 1}–${match[1] + 1}`
      })
    })
    return messages
  }, [])
}
