#!/usr/bin/env node

import { find, PathTree } from './find'
import {
  createWriteStream,
  readFileSync,
  writeFileSync,
  WriteStream,
} from 'node:fs'
import { linkDocs } from './linkDocs'
import { relative } from 'node:path'
import { utils } from './utils'

function generateDocs() {
  const { path, extension, exclude, includeNode } = utils.processArgs(
    process.argv
  )
  if (!extension)
    return console.warn(
      `No extension provided. Please provide one with the '-e' flag`
    )
  if (!extension.endsWith('.md'))
    return console.warn(
      'Docs extension provided is not a markdown file. Please provide a markdown extension'
    )
  const excludePatterns: string[] = []

  if (exclude) excludePatterns.push(...exclude)
  if (!includeNode) excludePatterns.push('**/node_modules/*')

  const tree = find(path, {
    matchPatterns: [`*${extension}`],
    excludePatterns,
  })

  const index = {}

  if (!tree) {
    console.warn(`No document files found with the extension: ${extension}`)
    return
  }

  linkDocs(tree, index)
  generateIndexFile(extension, tree, index)
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
  tree.children.forEach((child) => generateBranch(child, writer, 1))
}

function generateBranch(tree: PathTree, writer: WriteStream, depth: number) {
  writer.write(
    `${Array.from({ length: Math.max(0, depth - 1) })
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
  tree.children.forEach((child) => generateBranch(child, writer, depth + 1))
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
