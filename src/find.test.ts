import mockFs from 'mock-fs'
import { find, PathTree } from './find'
describe('find', () => {
  beforeEach(() => {
    mockFs({
      src: {
        'index.ts': 'ts file',
        'app.doc.md': '# My app',
        utils: {
          'counter.ts': 'ts file',
          'counter.doc.md': '# Counter',
        },
      },
      node_modules: { node: { libs: { 'index.js': 'some code' } } },
    })
  })
  afterEach(() => {
    mockFs.restore()
  })

  it('should return a path tree with all files', () => {
    const tree = find('./src')
    const expected: PathTree = {
      path: './src',
      files: ['app.doc.md', 'index.ts'],
      children: [
        {
          path: './src/utils',
          files: ['counter.doc.md', 'counter.ts'],
          children: [],
        },
      ],
    }
    expect(tree).toStrictEqual(expected)
  })

  it('should return null if no files', () => {
    const tree = find('./testing')
    expect(tree).toStrictEqual(null)
  })

  describe('options:matchPatterns', () => {
    it('should return the files in the root path', () => {
      const tree = find('./src/utils')
      const expected: PathTree = {
        path: './src/utils',
        files: ['counter.doc.md', 'counter.ts'],
        children: [],
      }
      expect(tree).toStrictEqual(expected)
    })

    it('should return files matching the provided glob pattern', () => {
      const tree = find('./src', { matchPatterns: ['*.ts'] })
      const expected: PathTree = {
        path: './src',
        files: ['index.ts'],
        children: [
          {
            path: './src/utils',
            files: ['counter.ts'],
            children: [],
          },
        ],
      }
      expect(tree).toStrictEqual(expected)
    })

    it('should return files matching the provided regex pattern', () => {
      const tree = find('./src', { matchPatterns: [/.*\.doc.*/] })
      const expected: PathTree = {
        path: './src',
        files: ['app.doc.md'],
        children: [
          {
            path: './src/utils',
            files: ['counter.doc.md'],
            children: [],
          },
        ],
      }
      expect(tree).toStrictEqual(expected)
    })

    it('should return files matching the either provided pattern', () => {
      const tree = find('./src', { matchPatterns: ['*dex.ts', /a.*\.doc.*/] })
      const expected: PathTree = {
        path: './src',
        files: ['app.doc.md', 'index.ts'],
        children: [],
      }
      expect(tree).toStrictEqual(expected)
    })
  })
  describe('options:excludePatterns', () => {
    it('should not return results for the provided glob', () => {
      const tree = find('.', { excludePatterns: ['**/node_modules/*'] })
      const expected: PathTree = {
        path: '.',
        files: [],
        children: [
          {
            path: './src',
            files: ['app.doc.md', 'index.ts'],
            children: [
              {
                path: './src/utils',
                files: ['counter.doc.md', 'counter.ts'],
                children: [],
              },
            ],
          },
        ],
      }
      expect(tree).toStrictEqual(expected)
    })

    it('should not return results for the provided regex', () => {
      const tree = find('.', { excludePatterns: [/til/] })
      const expected: PathTree = {
        path: '.',
        files: [],
        children: [
          {
            path: './node_modules',
            files: [],
            children: [
              {
                path: './node_modules/node',
                files: [],
                children: [
                  {
                    path: './node_modules/node/libs',
                    files: ['index.js'],
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            path: './src',
            files: ['app.doc.md', 'index.ts'],
            children: [],
          },
        ],
      }
      expect(tree).toStrictEqual(expected)
    })

    it.only('should not return results for the either provided exclusion pattern', () => {
      const tree = find('.', { excludePatterns: ['**/node/*', /.*\/utils\//] })
      const expected: PathTree = {
        path: '.',
        files: [],
        children: [
          {
            path: './src',
            files: ['app.doc.md', 'index.ts'],
            children: [],
          },
        ],
      }
      expect(tree).toStrictEqual(expected)
    })
  })
})
