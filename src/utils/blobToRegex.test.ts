import { blobToRegex } from './blobToRegex'

describe('blobToRegex', () => {
  it('should convert *.md', () => {
    const blob = '*.md'
    const regex = blobToRegex(blob)
    const validString = 'file.md'
    const invalidString = 'file.ms'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
  it('should convert **/test/*.md', () => {
    const blob = '**/test/*.md'
    const regex = blobToRegex(blob)
    const validString = 'root/test/nested/file.md'
    const invalidString = 'root/test/nested/file.ts'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
  it('should convert test/*.md', () => {
    const blob = 'test/*.md'
    const regex = blobToRegex(blob)
    const validString = 'test/nested/file.md'
    const invalidString = 'root/test/nested/file.md'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
  it('should convert test/**', () => {
    const blob = 'test/**'
    const regex = blobToRegex(blob)
    const validString = 'test/nested/file.md'
    const invalidString = 'root/test/nested/file.md'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
  it('should convert **/test/**', () => {
    const blob = '**/test/**'
    const regex = blobToRegex(blob)
    const validString = './root/test/nested/file.md'
    const invalidString = './root/nested/file.md'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
  it('should convert **/test/*', () => {
    const blob = '**/test/*'
    const regex = blobToRegex(blob)
    const validString = './root/test/file.md'
    const invalidString = './root/nested/file.md'

    expect(validString.match(regex)).toBeTruthy()
    expect(invalidString.match(regex)).toBeFalsy()
  })
})
