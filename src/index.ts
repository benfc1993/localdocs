#!/usr/bin/env node

import { find, PathTree } from './find'
import {
  createWriteStream,
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
  WriteStream,
} from 'node:fs'
import { linkDocs } from './linkDocs'
import { relative } from 'node:path'
import { utils } from './utils'
import { errorIcon, sucessIcon, warningIcon } from './consoleIcons'

function generateDocs() {
  let fileExtension = '.doc.md'
  try {
    const {
      path = '.',
      extension = fileExtension,
      exclude = [],
      includeNode = false,
      help = false,
    } = utils.processArgs(process.argv)
    fileExtension = extension

    if (help) {
      return console.log(`
localdocs [<root-path>] [-e <file extension> | -x <paths,to,exclude> | --include-node | -h]

-e              file extension to use                               (default) .doc.md
-x              comma seperated list of blobs or regex to ignore    (default) ''
--include-node  should include files in node_modules                (default) flase 
-h              show help 
      `)
    }

    const excludePatterns: string[] = []

    if (exclude) excludePatterns.push(...exclude)
    if (!includeNode) excludePatterns.push('**/node_modules/*')
    if (existsSync(`./docs${extension}`))
      renameSync(`./docs${extension}`, `./docs${extension}.temp`)

    const tree = find(path, {
      matchPatterns: [`*${extension}`],
      excludePatterns,
    })

    const index = {}

    if (!tree) {
      console.warn(
        `${warningIcon} No document files found with the extension: ${extension}`
      )
      return
    }

    linkDocs(tree, index)
    generateIndexFile(extension, tree, index)
    console.log(`${sucessIcon} Docs generated`)
  } catch (err) {
    const error = err as Error
    console.error(`${errorIcon} ${error.message}`)
    process.exitCode = 1
  } finally {
    if (existsSync(`./docs${fileExtension}.temp`))
      renameSync(`./docs${fileExtension}.temp`, `./docs${fileExtension}`)
  }
}

function generateIndexFile(
  extension: string,
  tree: PathTree,
  index: Record<string, string[]>
) {
  writeFileSync(`./docs${extension}`, '')
  const writer = createWriteStream('./docs.doc.md')

  generateTree(tree, writer)
  generateCategories(index, writer)
  writer.close()
}

function generateCategories(
  index: Record<string, string[]>,
  writer: WriteStream
) {
  writer.write('## Categories\n')
  Object.entries(index).forEach(([category, files]) => {
    writer.write(
      `\n### ${category.replace(/\w/, (match) => match.toUpperCase())}\n`
    )
    files.forEach((file) => writer.write(`${fileLink(file)}  \n`))
  })
}

function generateTree(tree: PathTree, writer: WriteStream) {
  writer.write('# Index \n')
  generateBranch(tree, writer, 0)
  writer.write('\n')
}

function generateBranch(tree: PathTree, writer: WriteStream, depth: number) {
  if (tree.files.length) {
    writer.write(
      `${Array.from({ length: Math.max(0, depth) })
        .fill('\t')
        .join('')}* ***${tree.path}***\n`
    )
    tree.files.forEach((file) => {
      const filePath = `${tree.path}/${file}`
      addNaviagation(filePath)
      writer.write(
        `${Array.from({ length: depth }).fill('\t').join('')}* ${fileLink(filePath)}\n`
      )
    })
    depth += 1
  }
  tree.children.forEach((child) => generateBranch(child, writer, depth))
}

function addNaviagation(filePath: string) {
  const file = readFileSync(filePath).toString().split('\n')
  const navigation = `[<-Home](${relative(filePath.slice(0, filePath.lastIndexOf('/')), `./docs.doc.md`)})</br>`
  if (file[0].startsWith('[<-Home]')) {
    file.shift()
  }
  file.unshift(navigation)
  writeFileSync(filePath, file.join('\n'))
}

function fileLink(filePath: string) {
  const title = getFileTitle(filePath)
  return `[${title}](${filePath})`
}

function getFileTitle(filePath: string) {
  const file = readFileSync(filePath).toString()
  const title = /# (.*)\n/.exec(file)?.[1]
  return title ? title : RegExp(/(?:.*\/)(.*?)\..*$/).exec(filePath)?.[1]
}

generateDocs()
