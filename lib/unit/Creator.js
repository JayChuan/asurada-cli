const inquirer = require('inquirer')
const Eventer = require('events')
const cloneDeep = require('lodash.clonedeep')
const chalk = require('chalk')
const fs = require('fs')
const PackageManager = require('../util/packageManager')
const {
  hasYarn,
  logWithSpinner,
  stopSpinner,
  clearConsole,
  downloadTemplate,
  updateJson
} = require('../util/cli-utils')
const {
  defaults,
  vueTsTemplate
} = require('./options')

const minimist = require('minimist')

module.exports = class Creator extends Eventer {
  constructor (name, targetDir) {
    super()
    this.name = name
    this.targetDir = targetDir
    const { presetPrompt } = this.resolveIntroPrompts()
    this.presetPrompt = presetPrompt
  }
  async create (options = {}, preset = null) {
    const { name, targetDir } = this
    if (options.default) {
      let projectName = ''
      if (minimist(process.argv.slice(5))._.length > 0) {
        projectName = process.argv.slice(5)[0]
      } else {
        console.log(chalk.yellow('No project name, will use targetDir name...'))
        projectName = this.name
      }
      preset = {
        name: projectName,
        ...defaults.presets.default
      }
    } else {
      preset = await this.promptandResolvePreset()
    }
    preset = cloneDeep(preset)
    if (preset.template) {
      let newJson = {
        name: preset.name
      }
      await clearConsole()
      logWithSpinner(`✨`, `Creating project in ${chalk.yellow(targetDir)}.`)
      const link = require(`../modules/${preset.template}`).link
      const gitLink = 'direct:' + link
      downloadTemplate(this.name, gitLink).then(async () => {
        stopSpinner()
        console.log()
        console.log(`🎉  Successfully download template from ${chalk.yellow(link)}`)
        console.log()
        logWithSpinner(`📦`, `Updating package.json ...`)
        await updateJson(`${targetDir}/package.json`, newJson)
        stopSpinner()
        console.log()
        logWithSpinner(`📦`, `Installing package...`)
        const pm = new PackageManager({context: targetDir, packageManager: preset.packageManager})
        await pm.install()
        if (preset.packageManager === 'yarn' && fs.existsSync(`${targetDir}/package-lock.json`)) {
          fs.unlinkSync(`${targetDir}/package-lock.json`)
        }
        stopSpinner()
        console.log()
        console.log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
        console.log(
          `👉  Get started with the following commands:\n\n` +
          (this.targetDir === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
          chalk.cyan(` ${chalk.gray('$')} ${preset.packageManager === 'yarn' ? 'yarn serve' : 'npm run serve'}\n\n`)
        )
      })
    }
  }

  async promptandResolvePreset (answers = null) {
    if (!answers) {
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
    if (!answers.projectName) {
      console.log(chalk.yellow('No project name, will use targetDir...'))
      answers.projectName = this.name
    }
    if (answers.packageManager === 'yarn') {
      if (!hasYarn()) {
        console.log(chalk.yellow('No found yarn, will use npm...'))
        answers.packageManager = 'npm'
      }
    }
    let preset = {
      name: answers.projectName,
      packageManager: answers.packageManager,
      template: answers.preset === 'default' ? 'vue-js-template': answers.preset
    }
    return preset
  }
  getPresets () {
    return Object.assign({},  defaults.presets, vueTsTemplate.presets)
  }
  resolveIntroPrompts () {
    const presets = this.getPresets()
    const presetChoices = Object.keys(presets).map(name => {
      return {
        name: `${name}`,
        value: name
      }
    })
    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices
      ]
    }
    return {
      presetPrompt
    }
  }
  resolveFinalPrompts () {
    const prompts = [
      {
        name: 'projectName',
        type: 'input',
        message: 'Please enter the project name:'
      },
      {
        name: 'packageManager',
        type: 'list',
        message: 'Please select the package Manager:',
        choices: ['npm', 'yarn']
      },
      this.presetPrompt
    ]
    return prompts
  }
}