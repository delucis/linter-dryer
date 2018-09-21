'use babel'

const getRange = (idx, lines, count) => {
  const ignoreIndentation = atom.config.get('linter-dryer.ignoreIndentation')
  const ignoreTrailingWhitespace = atom.config.get('linter-dryer.ignoreTrailingWhitespace')
  return lines
    .slice(idx, idx + count)
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
function findRepeats (lines) {
  const minimumLines = atom.config.get('linter-dryer.minimumLines')
  let pos = 0
  return new Promise(function (resolve, reject) {
    try {
      const repetitions = lines.reduce((repetitions, line, idx, lines) => {
        let search = getRange(idx, lines, minimumLines)
        for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          if (
            idx >= pos &&
            lineIdx !== idx &&
            getRange(lineIdx, lines, minimumLines) === search
          ) {
            let matching = true
            let count = minimumLines
            while (lineIdx + count - 1 < lines.length && matching) {
              count++
              search = getRange(idx, lines, count)
              matching = search === getRange(lineIdx, lines, count)
            }
            repetitions.push({
              range: [idx, idx + count - 1],
              match: [lineIdx, lineIdx + count - 2]
            })
            pos = idx + count - 1
            break
          }
        }
        return repetitions
      }, [])
      resolve(repetitions)
    } catch (e) {
      reject(e)
    }
  })
}

export default async function (textEditor) {
  const editorPath = textEditor.getPath()
  const text = textEditor.getText()
  const repetitions = await findRepeats(text.split('\n'))
  return repetitions.map(({ range, match }) => {
    const rangeEndCol = textEditor.lineTextForBufferRow(range[1] - 1).length
    return {
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
    }
  })
}
