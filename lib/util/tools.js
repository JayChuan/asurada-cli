exports.initPromptModules = () => {
  return [
    'vue-js-template',
    'vue-ts-template'
  ].map(file => require(`../modules/${file}`))
}