// 0. export rollup configs
//   - dev, sourcemap files, amd, cjs, iife, typescript definitions
// 1. compile (tsc, babel, buble)
//   - src -> dist
// 2. compile (babel, buble)
//   - test -> test-dist
// 3. copy:
//   - dist -> root
// 4. bundle (rollup)
//   - dist -> index.bundle
// 5. compile (tsc)
//   - index.bundle -> index.compiled
// 6. bundle (rollup)
//   -> index.compiled -> index.js
// 6. ops:
//   - run test
// - run cov
const {resolve} = require('path')
const fwf = require('funwithflags')
const Script = require('script-chain')
const log = require('fliplog')
const {read, write, del} = require('flipfile')

const res = rel => resolve(__dirname, rel)
log.startTimer('cli')

// setup args
// src: [rollup, typescript, buble, babel, browserify, copy/strip]
const argvOpts = {
  boolean: ['cov', 'src', 'copy', 'production'],
  string: ['format'],
  default: {
    clean: false,
    tests: false,
    cov: false,
    quick: false,
    production: false,
    format: ['amd', 'iife', 'dev', 'es', 'umd'],
  },
}
const argvs = fwf(process.argv.slice(2), argvOpts)
const {production, quick, tests, cov, clean} = argvs

if (clean) {
  const toClean = {
    files: [
      'browserified',
      'MethodChain',
      'Chainable',
      'ChainedMap',
      'FactoryChain',
      'MergeChain',
      'ChainedSet',
      'TraverseChain',
      'index.amd',
      'index.cjs',
      'index.dev',
      'index.es',
      'index',
      'index.tsc.bundle',
    ],
    dirs: [
      'dist',
      'test-dist',
      'disted',
      'compose',
      'coverage',
      '.nyc_output',
      'deps',
    ],
  }

  toClean.files.map(
    file => del(res(file + '.js')) && del(res(file + '.js.map'))
  )
  toClean.dirs.map(file => del(res(file + '/')))
}

// script factory
const script = (bin = 'rollup', flags = '') => {
  const scripty = new Script().stdout('inherit').debug(false).add().npm(bin)

  flags.split(' ').map(flag => scripty.raw(flag))
  scripty.remember = {
    start() {},
    finish() {},
  }
  return scripty.run()
}

// cli class
class CLI {
  copy(root = false) {
    // @TODO: dist & root (does it ever need to be in dist except for buble?)
    const scripts = new Script()
      .add()
      .bin('flow-remove-types')
      .raw('src/')
      .flag('pretty')
      .flag('quiet')
      .flag('all')
      .flag('out-dir')
      .arg('./dist')
    if (root) {
      scripts
        .add()
        .bin('flow-remove-types')
        .raw('src/')
        .flag('pretty')
        .flag('quiet')
        .flag('all')
        .flag('out-dir')
        .arg('./')
    }
    scripts.remember = {
      start() {},
      finish() {},
    }
    scripts.toString()
  }

  tsc(buildTests = false) {
    if (buildTests) {
      const flags =
        '--pretty --sourceMap --allowJs --project test --outDir test-dist'
      return script('tsc', flags)
    }
    return script('tsc')
  }
  ts() {
    const ts = require('typescript')
    const source = read('./index.dev.js')

    let result = ts.transpileModule(source, {
      compilerOptions: {module: ts.ModuleKind.CommonJS},
    })
    write(require.resolve('./index.tsc.bundle.js'), result.outputText)

    console.log(JSON.stringify(result))
    process.exit()
  }
  optimizejs(url = './disted/index.umd.js') {
    const optimizeJs = require('optimize-js')
    const {read, write} = require('flipfile')
    const file = require.resolve(url)
    const code = read(file)
    log.diff(code)
    const optimized = optimizeJs(code)
    log.diff(optimized)
    write(file, optimized)
    log.log()
    return Promise.resolve()
  }
  rollup(flags = '') {
    if (Array.isArray(flags)) return flags.map(flag => this.rollup(flag))
    const config = './_cli-rollup'
    return script('rollup', '-c ' + require.resolve(config) + ' ' + flags)
  }

  buble() {
    const sourcemaps = true
    const scripts = new Script()
      .add()
      .bin('buble')
      .raw('-i dist')
      .raw('-o dist')
      .raw('--no forOf,dangerousForOf,computedProperty,spreadRest')
    if (sourcemaps) scripts.raw('-m inline')
    return scripts.run()
  }
  browserify() {}
  babel() {
    // return new Script().add().bin('babel').raw('src/ --out-dir dist').run()
  }
  coveralls() {
    // 'coveralls < coverage/lcov.info'
  }
  test(built = false) {
    return script('ava', !built ? '--verbose' : 'test-dist/built.js')
    // return script('test')
  }
  cov() {
    // "cov:report": "nyc report"
    // "cov:text": "nyc --reporter=html --reporter=text ava",
    return script('nyc', 'ava')
  }
  lint() {
    return script('eslint', '"src/**"')
  }
}

// use the cli class, time the operations, use the argv setup

log.startTimer('go')
const cli = new CLI()

async function src() {
  log.startTimer('src')
  // copy
  log.startTimer('copy')
  await cli.copy()
  log.stopTimer('copy')

  // rollup
  log.startTimer('dev')
  await cli.rollup('--environment format:dev')
  log.stopTimer('dev')

  // typescript the rollup
  log.startTimer('tsc')
  await cli.tsc()
  log.stopTimer('tsc')

  // rollup the typescripted rollup... o.o
  log.startTimer('tsc2')
  await cli.rollup('--environment format:tsc')
  log.stopTimer('tsc2')
  log.stopTimer('src')
  log.echoTimer('src')
}

async function compileTests() {
  log.startTimer('tests')
  await cli.tsc(true)
  log.stopTimer('tests').echoTimer('tests')
}

async function test() {
  log.startTimer('test')
  await cli.test()
  log.stopTimer('test')
  // cov
}

async function publishing() {
  log.startTimer('publishing')
  log.startTimer('amd')
  await cli.rollup('--environment format:amd')
  log.stopTimer('amd')

  log.startTimer('es')
  await cli.rollup('--environment format:es')
  log.stopTimer('es')

  log.startTimer('umd')
  await cli.rollup('--environment format:umd')
  log.stopTimer('umd')

  // ignoring this one for now, already so many, don't want to build them all
  // await cli.rollup('--environment format:iife')

  log
    .stopTime('publishing')
    .echoTimer('publishing')
    .echoTimer('copy')
    .echoTimer('dev')
    .echoTimer('tsc')
    .echoTimer('tsc2')
    .echoTimer('tsctests')
    .echoTimer('amd')
    .echoTimer('es')
}

async function all() {
  if (!quick) await src()
  if (tests) {
    await compileTests()
    await test()
  }
  if (production) await publishing()
  cli.optimizejs()

  // if (cov) await runCov()
  // // all ops are done
  // log.stopTimer('go').echoTimer('go')
}
all()
