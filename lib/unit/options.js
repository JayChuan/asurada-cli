
exports.defaultPreset = {
  packageManager: 'npm',
  template: 'vue-js-template'
}

exports.defaults = {
  lastChecked: undefined,
  latestVersion: undefined,
  packageManager: undefined,
  useTaobaoRegistry: undefined,
  presets: {
    'default': exports.defaultPreset
  }
}
exports.vueTsPreset = {
  template: 'vue-ts-template'
}
exports.vueTsTemplate = {
  lastChecked: undefined,
  latestVersion: undefined,
  packageManager: undefined,
  useTaobaoRegistry: undefined,
  presets: {
    'vue-ts-template': exports.vueTsPreset
  }
}

