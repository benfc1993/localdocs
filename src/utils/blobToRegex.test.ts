import { blobToRegex } from "./blobToRegex";

describe("blobToRegex", () => {
  it("should convert *.md to /^[^/]+.md$/", () => {
    const blob = "*.md";
    const regex = blobToRegex(blob);
    const validString = "file.md";
    const invalidString = "file.ms";
    expect(regex).toStrictEqual(/^[^/]+\.md$/);
    expect(validString.match(regex)).toBeTruthy();
    expect(invalidString.match(regex)).toBeFalsy();
  });
  it("should convert **/test/*.md to /^.*[.*/]*/test/[^/]+.md$/", () => {
    const blob = "**/test/*.md";
    const regex = blobToRegex(blob);
    const validString = "root/test/file.md";
    const invalidString = "root/test/nested/file.md";
    expect(regex).toStrictEqual(RegExp(/^.*[.*/]*\/test\/[^/]+\.md$/));
    expect(validString.match(regex)).toBeTruthy();
    expect(invalidString.match(regex)).toBeFalsy();
  });
  it("should convert test/*.md to /^test/[^/]+.md$/", () => {
    const blob = "test/*.md";
    const regex = blobToRegex(blob);
    const validString = "test/file.md";
    const invalidString = "root/test/nested/file.md";
    expect(regex).toStrictEqual(RegExp(/^test\/[^/]+\.md$/));
    expect(validString.match(regex)).toBeTruthy();
    expect(invalidString.match(regex)).toBeFalsy();
  });
  it("should convert test/** to /^test/.*$/", () => {
    const blob = "test/**";
    const regex = blobToRegex(blob);
    const validString = "test/nested/file.md";
    const invalidString = "root/test/nested/file.md";
    expect(regex).toStrictEqual(RegExp(/^test\/.*[.*/]*$/));
    expect(validString.match(regex)).toBeTruthy();
    expect(invalidString.match(regex)).toBeFalsy();
  });
});
