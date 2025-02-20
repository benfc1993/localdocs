type Option<TData> = {
  flag: string
  process: (arg: string) => TData
  requiresArg: boolean
  required: boolean
}
type Options = {
  help: Option<boolean>
  extension: Option<string>
  exclude: Option<string[]>
  includeNode: Option<boolean>
}
export function processArgs(processArgv: string[]) {
  const options: Options = {
    help: {
      flag: '-h',
      process: () => true,
      requiresArg: false,
      required: false,
    },
    extension: {
      flag: '-e',
      requiresArg: true,
      process: (arg: string) =>
        (!arg.startsWith('.') ? '.' + arg : arg).replace('*', ''),
      required: false,
    },
    exclude: {
      flag: '-x',
      requiresArg: true,
      process: (arg: string) => arg.split(','),
      required: false,
    },
    includeNode: {
      flag: '--include-node',
      requiresArg: false,
      process: (arg: string) => arg === 'true',
      required: false,
    },
  }

  type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][]

  const args = (Object.entries(options) as Entries<typeof options>).reduce(
    (
      acc: Partial<{
        [key in keyof typeof options]: unknown
      }>,
      [name, option]
    ) => {
      if (name === 'help' && processArgv.includes('-h')) {
        acc.help = true
        return acc
      }

      const lastIndex = processArgv.lastIndexOf(option.flag)
      const index = processArgv.indexOf(option.flag)

      if (lastIndex !== index) {
        throw new Error(`${option.flag} provided multiple times`)
      }

      if (index === -1) {
        if (option.required) {
          throw new Error(`${option.flag} is required`)
        }
        return acc
      }

      const value = processArgv[index + 1 > 2 ? index + 1 : -1]

      if (
        option.requiresArg &&
        (!value || Object.keys(options).includes(value))
      ) {
        throw new Error(`${option.flag} requires argument`)
      }

      if (value) acc[name] = option.process(value)
      return acc
    },
    {}
  ) as Partial<{
    [TKey in keyof Options]: ReturnType<Options[TKey]['process']>
  }>

  return {
    path: processArgv[2]?.startsWith('-') ? undefined : processArgv[2],
    ...args,
  }
}
