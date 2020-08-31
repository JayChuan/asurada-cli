const { executeCommand } = require('./executeCommand')

module.exports = class PackageManager {
  constructor ({context, packageManager} = {}) {
    this.context = context || process.cwd()
    this.bin = packageManager
  }
  async install () {
    try {
      await this.runCommand('install')
    } catch (err) {
      console.log(err)
    }
  }
  async runCommand (command, args = []) {
    return await executeCommand(
      this.bin,
      [
        command,
        ...args
      ],
      this.context
    )
  }
}
