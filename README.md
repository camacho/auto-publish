# Auto-publish
Automatically increment and publish module versions to NPM. Uses existing published versions to detect next version (rather than depending on the `package.json` file being updated).

# Install
```sh
yarn add -D continuous-publication
# or
npm install --save-dev continuous-publication
```

# Usage

```sh
$ cp -h

cp [bump]

Increment module version and publish

Positionals:
  bump                   [choices: "patch", "minor", "major"] [default: "patch"]

Options:
  --client                   [string] [choices: "yarn", "npm"] [default: "yarn"]
  --tag       Tag to use when publishing            [string] [default: "latest"]
  --dry       Dry run (do not publish)                [boolean] [default: false]
  -h, --help  Show help                                                [boolean]
```
