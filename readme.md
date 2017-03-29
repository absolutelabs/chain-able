# webpack-chain

Use a chaining API to generate and simplify the modification of
Webpack 2 configurations.

## Introduction

Webpack's core configuration is based on creating and modifying a
potentially unwieldy JavaScript object. While this is OK for configurations
on individual projects, trying to share these objects across projects and
make subsequent modifications gets messy, as you need to have a deep
understanding of the underlying object structure to make those changes.

`webpack-chain` attempts to improve this process by providing a chainable or
fluent API for creating and modifying webpack configurations. Key portions
of the API can be referenced by user-specified names, which helps to
standardize how to modify a configuration across projects.

This is easier explained through the examples following.

## Contributing

I welcome any contributor. Just fork and clone, make changes, and send a pull request.

## Installation

`webpack-chain` requires Node.js v6.9 and higher. `webpack-chain` also
only creates configuration objects designed for use in Webpack 2.

You may install this package using either Yarn or npm (choose one):

**Yarn**

```bash
yarn add --dev webpack-chain
```

**npm**

```bash
npm install --save-dev webpack-chain
```

## Getting Started

Once you have `webpack-chain` installed, you can start creating a
Webpack configuration. For this guide, our example base configuration will
be `webpack.config.js` in the root of our project directory.

```js
// Require the webpack-chain module. This module exports a single
// constructor function for creating a configuration API.
const Config = require('webpack-chain');

// Instantiate the configuration with a new API
const config = new Config();

// Make configuration changes using the chain API.
// Every API call tracks a change to the stored configuration.

// Interact with entry points
config
  .entry('index')
    .add('src/index.js')
    .end()
  // Modify output settings
  .output
    .path('dist')
    .filename('[name].bundle.js');

// Create named rules which can be modified later
config.module
  .rule('lint')
    .test(/\.js$/)
    .pre()
    .include('src')
    // Even create named loaders for later modification
    .loader('eslint', 'eslint-loader', {
      rules: {
        semi: 'off'
      }
    });

config.module
  .rule('compile')
    .test(/\.js$/)
    .include('src', 'test')
    .loader('babel', 'babel-loader', {
      presets: [
        ['babel-preset-es2015', { modules: false }]
      ]
    });

// Create named plugins, too!
config.plugin('clean', CleanPlugin, [BUILD], { root: CWD });

// Export the completed configuration object to be consumed by webpack
module.exports = config.toConfig();
```

Having shared configurations is also simple. Just export the configuration
and call `.toConfig()` prior to passing to Webpack.

```js
// webpack.core.js
const Config = require('webpack-chain');
const config = new Config();

// Make configuration shared across targets
// ...

module.exports = config;

// webpack.dev.js
const config = require('./webpack.core');

// Dev-specific configuration
// ...
module.exports = config.toConfig();

// webpack.prod.js
const config = require('./webpack.core');

// Production-specific configuration
// ...
module.exports = config.toConfig();
```

## ChainedMap

One of the core API interfaces in webpack-chain is a `ChainedMap`. A `ChainedMap` operates
similar to a JavaScript Map, with some conveniences for chaining and generating configuration.
If a property is marked as being a `ChainedMap`, it will have an API and methods as described below:

**Unless stated otherwise, these methods will return the `ChainedMap`, allowing you to chain these methods.**

```js
// Remove all entries from a Map.
clear()
```

```js
// Remove a single entry from a Map given its key.
// key: *
delete(key)
```

```js
// Fetch the value from a Map located at the corresponding key.
// key: *
// returns: value
get(key)
```

```js
// Set a value on the Map stored at the `key` location.
// key: *
// value: *
set(key, value)
```

```js
// Returns `true` or `false` based on whether a Map as has a value set at a particular key.
// key: *
// returns: Boolean
has(key)
```

```js
// Returns an array of all the values stored in the Map.
// returns: Array
values()
```

```js
// Returns an object of all the entries in the backing Map
// where the key is the object property, and the value
// corresponding to the key. Will return `undefined` if the backing 
// Map is empty.
// returns: Object, undefined if empty
entries()
````

```js
// Provide an object which maps its properties and values 
// into the backing Map as keys and values.
// obj: Object
merge(obj)
```

## ChainedSet

Another of the core API interfaces in webpack-chain is a `ChainedSet`. A `ChainedSet` operates
similar to a JavaScript Set, with some conveniences for chaining and generating configuration.
If a property is marked as being a `ChainedSet`, it will have an API and methods as described below:

**Unless stated otherwise, these methods will return the `ChainedSet`, allowing you to chain these methods.**

```js
// Add/append a value to the end of a Set.
// value: *
add(value)
```

```js
// Add a value to the beginning of a Set.
// value: *
prepend(value)
```

```js
// Remove all values from a Set.
clear()
```

```js
// Remove a specific value from a Set.
// value: *
delete(value)
```

```js
// Returns `true` or `false` based on whether or not the
// backing Set contains the specified value.
// value: *
// returns: Boolean
has(value)
```

```js
// Returns an array of values contained in the backing Set.
// returns: Array
values()
```

```js
// Concatenates the given array to the end of the backing Set.
// arr: Array
merge(arr)
```

## Shorthand methods

A number of shorthand methods exist for setting a value on a `ChainedMap`
with the same key as the shorthand method name.
For example, `devServer.hot` is a shorthand method, so it can be used as:

```js
// A shorthand method for setting a value on a ChainedMap
devServer.hot(true);

// This would be equivalent to:
devServer.set('hot', true);
```

A shorthand method is chainable, so calling it will return the original instance,
allowing you to continue to chain.

### Config

Create a new configuration object.

```js
const Config = require('webpack-chain');

const config = new Config();
```

Moving to deeper points in the API will change the context of what you
are modifying. You can move back to the higher context by either referencing
the top-level `config` again, or by calling `.end()` to move up one level.
If you are familiar with jQuery, `.end()` works similarly. All API calls
will return the API instance at the current context unless otherwise
specified. This is so you may chain API calls continuously if desired.

For details on the specific values that are valid for all shorthand and low-level methods,
please refer to their corresponding name in the
[Webpack docs hierarchy](https://webpack.js.org/configuration/).

```js
Config : ChainedMap
```

#### Config shorthand methods

```js
config
  .amd(amd)
  .bail(bail)
  .cache(cache)
  .devtool(devtool)
  .context(context)
  .externals(externals)
  .loader(loader)
  .profile(profile)
  .recordsPath(recordsPath)
  .recordsInputPath(recordsInputPath)
  .recordsOutputPath(recordsOutputPath)
  .stats(stats)
  .target(target)
  .watch(watch)
  .watchOptions(watchOptions)
```

#### Config entryPoints

```js
// Backed at config.entryPoints : ChainedMap
config.entry(name) : ChainedSet

config
  .entry(name)
    .add(value)
    .add(value)

config
  .entry(name)
  .clear()
  
// Using low-level config.entryPoints:
 
config.entryPoints
  .get(name)
    .add(value)
    .add(value)
    
config.entryPoints
  .get(name)
  .clear()
```

#### Config output: shorthand methods

```js
config.output : ChainedMap

config.output
  .chunkFilename(chunkFilename)
  .crossOriginLoading(crossOriginLoading)
  .filename(filename)
  .library(library)
  .libraryTarget(libraryTarget)
  .devtoolFallbackModuleFilenameTemplate(devtoolFallbackModuleFilenameTemplate)
  .devtoolLineToLine(devtoolLineToLine)
  .devtoolModuleFilenameTemplate(devtoolModuleFilenameTemplate)
  .hashFunction(hashFunction)
  .hashDigest(hashDigest)
  .hashDigestLength(hashDigestLength)
  .hashSalt(hashSalt)
  .hotUpdateChunkFilename(hotUpdateChunkFilename)
  .hotUpdateFunction(hotUpdateFunction)
  .hotUpdateMainFilename(hotUpdateMainFilename)
  .jsonpFunction(jsonpFunction)
  .path(path)
  .pathinfo(pathinfo)
  .publicPath(publicPath)
  .sourceMapFilename(sourceMapFilename)
  .sourcePrefix(sourcePrefix)
  .strictModuleExceptionHandling(strictModuleExceptionHandling)
  .umdNamedDefine(umdNamedDefine)
```

#### Config resolve: shorthand methods

```js
config.resolve : ChainedMap

config.resolve
  .enforceExtension(enforceExtension)
  .enforceModuleExtension(enforceModuleExtension)
  .unsafeCache(unsafeCache)
  .symlinks(symlinks)
  .cachePredicate(cachePredicate)
```

#### Config resolve alias

```js
config.resolve.alias : ChainedMap

config.resolve.alias
  .set(key, value)
  .set(key, value)
  .delete(key)
  .clear()
```

#### Config resolve modules

```js
config.resolve.modules : ChainedSet

config.resolve.modules
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolve aliasFields

```js
config.resolve.aliasFields : ChainedSet

config.resolve.aliasFields
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolve descriptionFields

```js
config.resolve.descriptionFields : ChainedSet

config.resolve.descriptionFields
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolve extensions

```js
config.resolve.extensions : ChainedSet

config.resolve.extensions
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolve mainFields

```js
config.resolve.mainFields : ChainedSet

config.resolve.mainFields
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolve mainFiles

```js
config.resolve.mainFiles : ChainedSet

config.resolve.mainFiles
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolveLoader

```js
config.resolveLoader : ChainedMap
```

#### Config resolveLoader extensions

```js
config.resolveLoader.extensions : ChainedSet

config.resolveLoader.extensions
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolveLoader modules

```js
config.resolveLoader.modules : ChainedSet

config.resolveLoader.modules
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolveLoader moduleExtensions

```js
config.resolveLoader.moduleExtensions : ChainedSet

config.resolveLoader.moduleExtensions
  .add(value)
  .prepend(value)
  .clear()
```

#### Config resolveLoader packageMains

```js
config.resolveLoader.packageMains : ChainedSet

config.resolveLoader.packageMains
  .add(value)
  .prepend(value)
  .clear()
```

#### Config performance: shorthand methods

```js
config.performance : ChainedMap

config.performance
  .hints(hints)
  .maxEntrypointSize(maxEntrypointSize)
  .maxAssetSize(maxAssetSize)
  .assetFilter(assetFilter)
```

#### Config plugins: adding

_NOTE: Do not use `new` to create the plugin, as this will be done for you._

```js
// Backed at config.plugins
config.plugin(name, WebpackPlugin, ...args) : chainable

// Example
config.plugin('env', webpack.EnvironmentPlugin, 'NODE_ENV');
```

#### Config plugins: modifying arguments

```js
config.plugin(name, args => newArgs)

// Example
config.plugin('env', args => [...args, 'SECRET_KEY']);
```

#### Config resolve plugins: adding

_NOTE: Do not use `new` to create the plugin, as this will be done for you._

```js
// Backed at config.resolve.plugins
config.resolve.plugin(name, WebpackPlugin, ...args) : chainable
```

#### Config resolve plugins: modifying arguments

```js
config.resolve.plugin(name, args => newArgs)
```

#### Config node

```js
config.node : ChainedMap

config.node
  .set('__dirname', 'mock')
  .set('__filename', 'mock');
```

#### Config devServer

```js
config.devServer : ChainedMap
```

#### Config devServer: shorthand methods

```js
config.devServer
  .clientLogLevel(clientLogLevel)
  .compress(compress)
  .contentBase(contentBase)
  .filename(filename)
  .headers(headers)
  .historyApiFallback(historyApiFallback)
  .host(host)
  .hot(hot)
  .hotOnly(hotOnly)
  .https(https)
  .inline(inline)
  .lazy(lazy)
  .noInfo(noInfo)
  .overlay(overlay)
  .port(port)
  .proxy(proxy)
  .quiet(quiet)
  .setup(setup)
  .stats(stats)
  .watchContentBase(watchContentBase)
```

#### Config module

```js
config.module : ChainedMap
```

#### Config module rules: shorthand methods

```js
config.module.rules : ChainedMap

config.module
  .rule(name)
    .test(test)
    .pre()
    .post()
    .include(...paths)
    .exclude(...paths)
```

#### Config module rules loaders: creating

```js
config.module.rules[].loaders : Map

config.module
  .rule(name)
    .loader(name, loader, options: optional)
    
// Example

config.module
  .rule('compile')
  .loader('babel', 'babel-loader', { presets: ['babel-preset-es2015'] });
```

#### Config module rules loaders: modifying options

```js
config.module
  .rule(name)
  .loader(name, options => newOptions)
  
// Example

config.module
  .rule('compile')
  .loader('babel', options => merge(options, { plugins: ['babel-plugin-object-rest-spread'] }));
```

---

### Merging Config

webpack-chain supports merging in an object to the configuration instance which matches a layout
similar to how the webpack-chain schema is laid out. Note that this is not a Webpack configuration
object, but you may transform a Webpack configuration object before providing it to webpack-chain
to match its layout.

```js
config.merge({ devtool: 'source-map' });

config.get('devtool') // "source-map"
```

```js
config.merge({
  [key]: value,
  
  amd,
  bail,
  cache,
  devtool,
  context,
  externals,
  loader,
  profile,
  recordsPath,
  recordsInputPath,
  recordsOutputPath,
  stats,
  target,
  watch,
  watchOptions,
  
  entry: {
    [name]: [...values]
  },
  
  plugin: {
    [name]: {
      plugin: WebpackPlugin,
      args: [...args]
    }
  },
  
  devServer: {
    [key]: value,
    
    clientLogLevel,
    compress,
    contentBase,
    filename,
    headers,
    historyApiFallback,
    host,
    hot,
    hotOnly,
    https,
    inline,
    lazy,
    noInfo,
    overlay,
    port,
    proxy,
    quiet,
    setup,
    stats,
    watchContentBase
  },
  
  node: {
    [key]: value
  },
  
  performance: {
    [key]: value
  },
  
  resolve: {
    [key]: value,
    
    alias: {
      [key]: value
    },
    aliasFields: [...values],
    descriptionFields: [...values],
    extensions: [...values],
    mainFields: [...values],
    mainFiles: [...values],
    modules: [...values],
    
    plugin: {
      [name]: {
        plugin: WebpackPlugin,
        args: [...args]
      }
    }
  },
  
  resolveLoader: {
    [key]: value,
    
    extensions: [...values],
    modules: [...values],
    moduleExtensions: [...values],
    packageMains: [...values]
  },
  
  module: {
    [key]: value,
    
    rule: {
      [name]: {
        [key]: value,
        
        include: [...paths],
        exclude: [...paths],
        test: RegExp,
        enforce: value,
        
        loader: {
          [name]: {
            loader: LoaderString,
            options: LoaderOptions
          }
        }
      }
    }
  }
})
```