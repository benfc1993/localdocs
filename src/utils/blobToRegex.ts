export function blobToRegex(blob: string | RegExp) {
  if (blob instanceof RegExp) return blob

  const regStr = `^${blob
    .replace(/\./g, `\\.`)
    .replace(/\*\*\/?/g, `.*[.*\/]*`)
    .replace(/(?<![\.\]\*]{1})\*/g, `.*`)}$`
  return RegExp(regStr)
}
