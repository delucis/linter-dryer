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
  return lines.reduce((repetitions, line, idx, lines) => {
    const search = getRange(idx, lines, minimumLines)
    const matches = lines.reduce((matches, line, lineIdx, lines) => {
      if (
        lineIdx !== idx &&
        getRange(lineIdx, lines, minimumLines) === search
      ) {
        matches.push([lineIdx, lineIdx + minimumLines - 1])
      }
      return matches
    }, [])
    if (matches.length) {
      repetitions.push({
        range: [idx, idx + minimumLines - 1],
        matches
      })
    }
    return repetitions
  }, [])
}

export default function (textEditor) {
  const editorPath = textEditor.getPath()
  const text = textEditor.getText()
  const repetitions = findRepeats(text.split('\n'))
  return repetitions.map(({ range, matches }) => ({
    severity: 'warning',
    location: {
      file: editorPath,
      position: [[range[0], 0], [range[1], 0]]
    },
    reference: {
      file: editorPath,
      position: [matches[0][0], 0]
    },
    excerpt: `Repetition found at lines ${matches[0][0] + 1}–${matches[0][1] + 1}`
  }))
}
