#!/usr/bin/env node
// node >= 8.9.0
const semver = require('semver')
const chalk = require('chalk')

const requiredVersion = require('../package.json').engines.node
const cliName = require('../package.json').name

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, cliName)

if (semver.satisfies(process.version, '9.x')) {
  console.log(chalk.red(
    `You are using Node ${process.version}.\n` +
    `Node.js 9.x has already reached end-of-life and will not be supported in future major releases.\n` +
    `It's strongly recommended to use an active LTS version instead.`
  ))
}
// CMD
const program = require('commander')
const minimist = require('minimist')

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program
  .version(`@asurada/cli ${require('../package').version}`, '-v --version')
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by g-cli')
  .option('-d, --default <projectName>', 'Skip prompts and use default preset')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    require('../lib/create')(name, options)
  })

// program
//   .command('add <plugin> [pluginOptions]')
//   .description('install a plugin and invoke its generator in an already created project')
//   .option('--registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
//   .allowUnknownOption()
//   .action((plugin) => {
//     require('../lib/add')(plugin, minimist(process.argv.slice(3)))
//   })

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    suggestCommands(cmd)
  })

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`g-vue <command> --help`)} for detailed usage of given command.`)
  console.log()
})
program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv)

function suggestCommands (unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}