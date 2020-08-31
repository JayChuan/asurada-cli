const execa = require('execa')

exports.executeCommand = async (command, args, cwd) => {
  await execa(command, args, {cwd})
}