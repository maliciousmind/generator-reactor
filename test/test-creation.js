/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var del = require('del');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var _ = require('underscore.string');

describe('reactor generator', function() {
  var reactor;
  var expected = [
    'src/favicon.ico',
    'src/index.html',
    'Makefile',
    'webpack.config.js',
    'webpack.development.js',
    'webpack.production.js',
    'karma.conf.js',
    'package.json'
  ];
  var mockPrompts = {};
  var genOptions = {
    'skip-install': true,
    'skip-welcome-message': true,
    'skip-message': true,
    '--force': true
  };
  var deps = [
    __dirname + '/../app',
    __dirname + '/../common',
    __dirname + '/../component',
    __dirname + '/../main'
  ];

  afterEach(function(){
    del([ __dirname + '/temp-test' ]);
  });

  beforeEach(function(done) {
    helpers.testDirectory(path.join(__dirname, 'temp-test'), function(err) {
      if (err) {
        return done(err);
      }
      reactor = helpers.createGenerator('reactor:app', deps, false, genOptions);
      helpers.mockPrompt(reactor, mockPrompts);
      done();
    });
  });

  describe('App files', function() {

    it('should generate dotfiles', function(done) {

      reactor.run({}, function() {
        helpers.assertFile([].concat(expected, [
          '.yo-rc.json',
          '.editorconfig',
          '.gitignore',
          '.babelrc',
          '.editorconfig',
          '.eslintignore',
          '.gitignore',
          '.jshintrc',
          '.nvmrc',
          '.jshintrc'
        ]));
        done();
      });
    });

    it('should generate app files', function(done) {
      reactor.run({}, function() {
        // TODO: Hack, no time to work out why generated
        // files not present at point of test...
        setTimeout(function() {
          helpers.assertFile(expected);
          done();
        });
      });
    });

    it('should generate expected JS files', function(done) {
      reactor.run({}, function() {
        setTimeout(function() {
          helpers.assertFile([].concat(expected, [
            'src/scripts/components/card/Card.js',
            'src/scripts/components/card/CardItem.js',
            'src/scripts/components/card/CardList.js',
            'src/scripts/components/card/CardListItem.js',
            'src/scripts/components/main.js',
            'src/scripts/components/routers.js',
            'src/scripts/stores/card/CardStore.js',
            'src/scripts/constants/AppConstants.js',
            'src/scripts/helpers/UrlHelper.js'
          ]));
          done();
        });
      });
    });

    it('should generate expected test JS files', function(done) {
      reactor.run({}, function() {
        // TODO: Hack, no time to work out why generated
        // files not present at point of test...
        setTimeout(function() {
          helpers.assertFile([].concat(expected, [
            'test/helpers/phantomjs-shims.js',
            'test/helpers/react/addons.js',
            'test/mocks/MockApp.js',
            'test/spec/components/cards/Card.js',
            'test/spec/components/cards/CardItem.js',
            'test/spec/components/cards/CardList.js',
            'test/spec/components/cards/CardListItem.js',
            'test/spec/stores/card/CardStore.js'
          ]));
          done();
        });
      });
    });

    it('should generate expected mock test JS files', function(done) {
      reactor.run({}, function() {
        // TODO: Hack, no time to work out why generated
        // files not present at point of test...
        helpers.assertFile([].concat(expected, [
          'test/mocks/MockApp.js'
        ]));
        done();
      });
    });

    it('should use HMR webpack API inside of configs', function (done) {
      reactor.run({}, function() {
        assert.fileContent([
          ['package.json', /react-hot-loader/]
        ]);
        done();
      });
    });

    it('should generate JS config with aliases', function(done) {
      reactor.run({}, function() {
        assert.fileContent([
            // style aliases
            ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+styles/m],
            ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+helpers/m],
            ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+components/m],
            ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+stores/m],
            ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+actions/m]
        ]);
        done();
      });
    });

    it('should not have any flux assets configured', function(done) {
      reactor.run({}, function() {
        assert.noFileContent([
          ['package.json', /dependencies\.flux/],
          ['package.json', /dependencies\.events/],
          ['package.json', /dependencies\.object-assign/],
        ]);

        done();
      });
    });
  });

  describe('Generator', function () {

    it('should contain info about used style lang', function (done) {
      reactor.run({}, function() {
        assert.ok(reactor.config.get('styles-language'));
        done();
      });
    });

    it('by default should use css style lang', function (done) {
      reactor.run({}, function() {
        assert.equal(reactor.config.get('styles-language'), 'css');
        done();
      });
    });

    var assertStyle = function (lang, done) {
      helpers.mockPrompt(reactor, {
        stylesLanguage: lang
      });
      reactor.run({}, function() {
        assert.equal(reactor.config.get('styles-language'), lang);
        assert.equal(reactor.config.get('stylesLanguage'), lang);
        var cssExtension = lang.substr(0, 4);
        assert.equal(reactor.config.get('cssExtension'), cssExtension);

        helpers.assertFile([].concat(expected, [
          'src/styles/main.' + cssExtension
        ]));
        done();
      });
    };

    it('should use sass style lang', function (done) {
      assertStyle('sass', done);
    });

    it('should use scss style lang', function (done) {
      assertStyle('scss', done);
    });

    it('should use less style lang', function (done) {
      assertStyle('less', done);
    });

    it('should use stylus style lang', function (done) {
      assertStyle('stylus', done);
    });

  });

  describe('When using Flux', function() {

    beforeEach(function(done) {
      helpers.mockPrompt(reactor, {
        architecture: 'flux'
      });

      reactor.run({}, function() {
        done();
      })
    });

    afterEach(function(){
      del([ __dirname + '/temp-test' ]);
    });

    it('should add flux, events, and object-assign packages', function(done) {
      assert.fileContent([
        ['package.json', /flux/],
        ['package.json', /events/],
        ['package.json', /object-assign/]
      ]);

      done();
    });

    it('should add stores and actions alias to karma config', function(done) {
      assert.fileContent([
        ['karma.conf.js', /resolve[\S\s]+alias[\S\s]+stores/m]
      ]);

      done();
    });

    it('should add stores and actions alias to webpack configs', function(done) {
      assert.fileContent([
        ['webpack.config.js', /resolve[\S\s]+modulesDirectories[\S\s]+stores/m]
      ]);

      done();
    });

    it('should have a Dispatcher generated', function(done) {
      setTimeout(function(){
        assert.file('src/scripts/dispatcher/TempTestAppDispatcher.js');

        done();
      });
    })
  });

  describe('When generating a Component', function() {
    var generatorTest = function(name, generatorType, specType, targetDirectory, scriptNameFn, specNameFn, suffix, done) {

      var deps = [path.join(__dirname, '../' + generatorType)];
      genOptions.appPath = 'src';

      var reactorGenerator = helpers.createGenerator('reactor:' + generatorType, deps, [name], genOptions);

      reactor.run([], function() {
        reactorGenerator.run([], function() {
          helpers.assertFileContent([
            [path.join('src/scripts', targetDirectory, name + '.js'), new RegExp('export default class ' + scriptNameFn(name) + suffix, 'g')],
            [path.join('test/spec', targetDirectory, name + '.js'), new RegExp('import ' + scriptNameFn(name) + suffix + ' from \'components\\/' + name + suffix, 'g')],
            [path.join('test/spec', targetDirectory, name + '.js'), new RegExp('describe\\(\'' + specNameFn(name) + suffix + '\'', 'g')]
          ]);
          done();
        });
      });
    }

    it('should generate a new component', function(done) {
      reactor.run({}, function() {
        generatorTest('Foo', 'component', 'component', 'components', _.capitalize, _.capitalize, '', done);
      });
    });

    it('should generate a subcomponent', function(done) {
      reactor.run({}, function() {
        var subComponentNameFn = function () { return 'Bar'; };
        generatorTest('Foo/Bar', 'component', 'component', 'components', subComponentNameFn, subComponentNameFn, '', done);
      });
    });

  });

  describe('When generating a Class', function() {
    var generatorTest = function(name, generatorType, specType, targetDirectory, scriptNameFn, specNameFn, suffix, done) {

      var deps = [path.join(__dirname, '../' + generatorType)];
      genOptions.appPath = 'src';

      var reactorGenerator = helpers.createGenerator('reactor:' + generatorType, deps, [name], genOptions);

      reactor.run([], function() {
        reactorGenerator.run([], function() {
          helpers.assertFileContent([
            [path.join('src/scripts', targetDirectory, name + '.js'), new RegExp('export default class ' + scriptNameFn(name) + suffix, 'g')],
            [path.join('test/spec', targetDirectory, name + '.js'), new RegExp('import ' + scriptNameFn(name) + suffix + ' from \'components\\/' + name + suffix, 'g')],
            [path.join('test/spec', targetDirectory, name + '.js'), new RegExp('describe\\(\'' + specNameFn(name) + suffix + '\'', 'g')]
          ]);
          done();
        });
      });
    }

    it('should generate a new class', function(done) {
      reactor.run({}, function() {
        generatorTest('Foo', 'class', 'component', 'components', _.capitalize, _.capitalize, '', done);
      });
    });

    it('should generate a subcomponent', function(done) {
      reactor.run({}, function() {
        var subComponentNameFn = function () { return 'Bar'; };
        generatorTest('Foo/Bar', 'class', 'component', 'components', subComponentNameFn, subComponentNameFn, '', done);
      });
    });

  });

  describe('When generating an Action', function() {

    afterEach(function(){
      del([ __dirname + '/temp-test' ]);
    });

    beforeEach(function(done){
      helpers.mockPrompt(reactor, {
        architecture: 'flux'
      });

      reactor.run({}, function() {
        var generator =
          helpers.createGenerator(
            'reactor:action',
            [path.join('../../action')],
            ['Test'],
            { appPath: 'src' }
          );

        reactor.run([], function() {
          generator.run([], function() {
            done();
          })
        });
      });
    });

    it('should generate a new action with tests', function(done) {
      assert.fileContent([
        ['src/scripts/actions/TestActionCreators.js', /export default TestActionCreators/g],
        ['test/spec/actions/TestActionCreators.js', /import TestActionCreators from \'actions\/TestActionCreators\'/g],
        ['test/spec/actions/TestActionCreators.js', /describe\('TestActionCreators'/g]
      ]);

      done();
    });
  });

  describe('When generating a Store', function() {

    afterEach(function(){
      del([ __dirname + '/temp-test' ]);
    });

    beforeEach(function(done) {
      helpers.mockPrompt(reactor, {
        architecture: 'flux'
      });

      reactor.run({}, function() {
        var generator =
          helpers.createGenerator(
            'reactor:store',
            [path.join('../../store')],
            ['Test'],
            { appPath: 'src' }
          );

        reactor.run([], function() {
          generator.run([], function() {
            done();
          });
        });
      });
    });

    it('should generate a new store with tests', function(done) {
      assert.fileContent([
        ['src/scripts/stores/TestStore.js', /let TestStore/g],
        ['test/spec/stores/TestStore.js', /import TestStore from 'stores\/TestStore'/g],
        ['test/spec/stores/TestStore.js', /describe\('TestStore'/g]
      ]);

      done();
    });
  });
});
