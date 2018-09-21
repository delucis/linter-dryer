# linter-dryer

![apm](https://img.shields.io/apm/v/linter-dryer.svg)

> Highlight repetition in your code to help you stay <abbr title="Don’t Repeat Yourself">DRY</abbr>

## Installation

```sh
apm install linter-dryer
```

Or install it from within Atom by going to **Settings** → **Install** and searching for `linter-dryer`.

## Settings

### Minimum repeating lines

- type: `'integer'`
- default: `5`

Set how many lines must repeat before they are flagged as a repetition by `linter-dryer`

### Ignore indentation

- type `'boolean'`
- default: `true`

Set whether or not `linter-dryer` takes leading whitespace into account when comparing two lines

### Ignore trailing whitespace

- type `'boolean'`
- default: `true`

Set whether or not `linter-dryer` takes trailing whitespace into account when comparing two lines

### Ignore empty lines

- type `'boolean'`
- default: `true`

If `true`, `linter-dryer` ignores lines that are empty or only contain whitespace so blocks of text can match even if they are spaced differently
