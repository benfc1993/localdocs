# Repo Docs

This is tool to provide embedded docs into a repo. The idea is to reduce context switching and allowing tighter coupling between docs and code.

This tool mostly provides auto generated navigation through your documentation, A navigation tree will always be created and you can specify categories to improve navigation.

## Generating docs

Running the script is done by calling `localdocs`. This will look for any markdown files within the project directory with the documentation extension which defaults to `doc.md`.

This will generate a `docs.doc.md` file at the root of the repository.

### Options

You can pass an entry point as the second argument to only search for documentation files within a specified directory:

```sh
npm run localdocs ./test
```

| flag           | description                                      | value             |
| -------------- | ------------------------------------------------ | ----------------- |
| `e`            | file extension to use                            | (default) .doc.md |
| `x`            | comma seperated list of blobs or regex to ignore | (default) ''      |
| `include-node` | should include files in node_modules             | (default) flase   |
| `h`            | show help                                        |                   |

It is advisable to add generating the docs to your pre-commit git hook.

The command will modify and generate the documentation files when it runs so you can add something like the below example:

```sh
npm run generate:docs
git add *.doc.md
```

## Categories

Creating a category is done by adding a category tag to any documentation page e.g.

```markdown
<#my category>
```

When the documentation pages are walked these categories will be found and links created on your documentation homepage in the Categories section.
