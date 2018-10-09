# linter-dryer

[![apm](https://img.shields.io/apm/v/linter-dryer.svg)](https://atom.io/packages/linter-dryer) [![Build Status](https://travis-ci.com/delucis/linter-dryer.svg?branch=master)](https://travis-ci.com/delucis/linter-dryer) [![Greenkeeper badge](https://badges.greenkeeper.io/delucis/linter-dryer.svg)](https://greenkeeper.io/)

> Highlight repetition in [Atom](https://atom.io/) to help you stay <abbr title="Don’t Repeat Yourself">DRY</abbr> 🌂

## Installation

```sh
apm install linter-dryer
```

Or install it from within Atom by going to **Settings** → **Install** and searching for `linter-dryer`.

## Usage

This package provides “copy–paste detection” for files and projects in Atom, using [`jscpd`](https://github.com/kucherenko/jscpd). It will highlight code in the text editor that is repeated elsewhere. You may need to adjust the settings to get results that work well for your specific project.

`jscpd` supports a wide range of languages and a full list is available in [the `jscpd` README](https://github.com/kucherenko/jscpd#readme).

## Settings

### Minimum repeating lines

- type: `'integer'`
- default: `3`

Set how many lines must repeat before they are flagged as a repetition by `linter-dryer`.

### Minimum repeating code tokens

- type: `'integer'`
- default: `25`

Code is processed and tokenized by `jscpd` in order to find repetitions that are similar but not identical. This sets how many tokens need to match to qualify as a repetition. Values that are too low may produce meaningless output, while values that are too high may not return any results.

### Scope to search for repetitions

- `'file'` OR `'project'`
- default: `'file'`

Set whether the linter should look for repetitions only in the current file, or throughout the current project.

### Files to ignore

- type: `'array'` of strings
- default: `['**/node_modules/**', '**/.git/**', '**/*.min.*']`

Files that match any of the patterns set here will be ignored when looking for repetition. (See [`minimatch`](https://github.com/isaacs/minimatch/#minimatch) for globbing documentation.)

### Repetition severity

- `'info'`, `'warning'` OR `'error'`
- default: `'info'`

Sets how the linter UI highlights repetitions in Atom. By default, a blue “info” level is set, but users can choose to have repetitions highlighted as warnings (orange) or errors (red).

## Contributing

All contributions to this package — no matter how small — are welcome! Please see the [contribution guidelines](CONTRIBUTING.md) for notes on opening issues and submitting pull requests and the [code of conduct](CODE_OF_CONDUCT.md) for rules about how to treat other developers with kindness and respect.
