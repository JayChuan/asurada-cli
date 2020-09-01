const { execSync } = require('child_process')
const ora = require('ora')
const fs = require('fs')
const download = require('download-git-repo')

exports.hasYarn = () => {
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

exports.downloadTemplate = (projectName, url) => {
  return new Promise((resolve, reject) => {
    download(url, projectName, {clone: true}, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// spinner
const spinner = ora()
let lastMsg = null
let isPaused = false

exports.logWithSpinner = (symbol, msg) => {
  if (!msg) {
    msg = symbol
    symbol = chalk.green('✔')
  }
  if (lastMsg) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
      text: lastMsg.text
    })
  }
  spinner.text = ' ' + msg
  lastMsg = {
    symbol: symbol + ' ',
    text: msg
  }
  spinner.start()
}

exports.stopSpinner = (persist) => {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
      text: lastMsg.text
    })
  } else {
    spinner.stop()
  }
  lastMsg = null
}

exports.pauseSpinner = () => {
  if (spinner.isSpinning) {
    spinner.stop()
    isPaused = true
  }
}

exports.resumeSpinner = () => {
  if (isPaused) {
    spinner.start()
    isPaused = false
  }
}

exports.failSpinner = (text) => {
  spinner.fail(text)
}

// clearConsole
exports.clearConsole = async () => {
  process.stdout.write('\033c')
  console.log('\033[2J')
}

//  update package.json
exports.updateJson = async (file, obj) => {
  if(fs.existsSync(file)){
    const data = fs.readFileSync(file).toString()
    let json = JSON.parse(data)
    Object.keys(obj).forEach(key => {
        if (key === 'dependencies') {
          json[key] = {
            ...json[key],
            ...obj[key]
          }
        } else {
          json[key] = obj[key]
        }
    })
    fs.writeFileSync(file, JSON.stringify(json, null, '\t'), 'utf-8')
  }
}

exports.formateModules = (template) => {
  return require(`../modules/${template}`)
}