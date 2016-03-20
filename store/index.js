'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');

var StoreGenerator  = module.exports = function StoreGenerator(args, options, config) {
  if (!args[0]) console.log('\n Please specify a name for this store \n');
  else {
    args[0] += 'Store';
    ScriptBase.apply(this, arguments)
  }
};

util.inherits(StoreGenerator, ScriptBase);

StoreGenerator .prototype.createStoreFile  = function createStoreFile() {
  this.option('es6');

  this.es6 = true;

  var storeTemplate;
  switch (this.architecture){
    case 'flux':
      storeTemplate = 'FluxStore';
      this.dispatcherName = this._.capitalizeFile(this.config.get('app-name')) + 'AppDispatcher';
      break;
    case 'reflux':
      storeTemplate = 'RefluxStore';
      break;
  }

  console.log('Creating ' + this.architecture + ' store');


  this.generateSourceAndTest(
    storeTemplate,
    'spec/Store',
    'scripts/stores'
  );
};
