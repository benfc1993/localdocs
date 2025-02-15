type Option<TData> = { flag: string; process: (arg: string) => TData }
type Options = {
  extension: Option<string>
  exclude: Option<string[]>
  includeNode: Option<boolean>
}
export function processArgs(processArgv: string[]) {
  const options: Options = {
    extension: {
      flag: '-e',
      process: (arg: string) =>
        !arg.startsWith('.') ? '.' + arg.slice(1) : arg,
    },
    exclude: { flag: '-x', process: (arg: string) => arg.split(',') },
    includeNode: {
      flag: '--include-node',
      process: (arg: string) => arg === 'true',
    },
  }

  const args = Object.entries(options).reduce(
    (
      acc: Record<keyof Options, ReturnType<Options[keyof Options]['process']>>,
      [name, option]
    ) => {
      const index = processArgv.indexOf(option.flag) + 1
      const value = processArgv[index > 2 ? index : -1]
      if (value) acc[name as keyof Options] = option.process(value)
      return acc
    },
    { extension: '', exclude: [], includeNode: false }
  ) as { [key in keyof Options]: ReturnType<Options[key]['process']> }

  return { path: processArgv[2], ...args }
}
