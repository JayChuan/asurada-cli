const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Creator = require('./unit/Creator')
const { clearConsole } = require('./util/cli-utils')


async function create (fileName, options) {

  const cwd = options.cwd || process.cwd() // get current work directory
  const inCurrent = fileName === '.' // judge fileName === '.' ?
  const name = inCurrent ? path.relative('../', cwd) : fileName
  const targetDir = path.resolve(cwd, fileName || '.')

  if (fs.existsSync(targetDir) && !options.merge) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      await clearConsole()
      if (inCurrent) {
        const { isGenerate } = await inquirer.prompt([{
          name: 'isGenerate',
          type: 'confirm',
          message: 'Generate project in current directory ?'
        }])
        if (!isGenerate) {
          return
        }
      } else {
        const { handle } = await inquirer.prompt([{
          name: 'handle',
          type: 'list',
          message: `${chalk.cyan(targetDir)} already exists, You want to`,
          choices: [
            {name: 'OverWrite', value: 'overwrite'},
            {name: 'Merge', value: 'merge'},
            {name: 'Concel', value: false}
          ]
        }])
        if (!handle) {
          return
        } else if (handle === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }

  const creator = new Creator(name, targetDir) // 实例化构造器
  await creator.create(options) // 创建
}

module.exports = (...args) => {
  return create(...args)
}