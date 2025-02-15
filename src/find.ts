import { readdirSync } from 'fs'
import { blobToRegex } from './utils/blobToRegex'

export type PathTree = {
  path: string
  files: string[]
  children: PathTree[]
}

type FindOptions = {
  excludePatterns?: (string | RegExp)[]
  matchPatterns?: (string | RegExp)[]
}

export function find(root: string, options?: FindOptions) {
  try {
    return searchDir(root, options)
  } catch (e) {
    return null
  }
}

function searchDir(root: string, options: FindOptions = {}) {
  const paths = readdirSync(root, {
    withFileTypes: true,
  }).filter((path) => {
    let valid = true
    if (options.matchPatterns && path.isFile()) {
      valid =
        valid &&
        options.matchPatterns.reduce(
          (acc, pattern) =>
            acc || !!path.name.match(blobToRegex(pattern))?.length,
          false
        )
    }
    if (!!options.excludePatterns?.length) {
      valid =
        valid &&
        options.excludePatterns.reduce((acc, pattern) => {
          return (
            acc &&
            !`${path.parentPath.replace('./', '')}/`.match(blobToRegex(pattern))
              ?.length
          )
        }, true)
    }
    return valid
  })
  if (paths.length === 0) return null

  const tree: PathTree = { path: root, files: [], children: [] }

  paths.forEach((path) => {
    if (path.isFile()) {
      tree.files.push(path.name)
    }
    if (path.isDirectory()) {
      const newChildren = searchDir(`${path.parentPath}/${path.name}`, options)
      if (!newChildren) return
      tree.children.push(newChildren)
    }
  })
  if (!tree.children.length && !tree.files.length) return null
  return tree
}
