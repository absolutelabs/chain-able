const ObjectProperties = require('./util/props')
const traverse = require('./traverse')
const isObj = require('./is/obj')
const isArray = require('./is/array')

// https://stackoverflow.com/questions/1947995/when-should-i-use-delete-vs-setting-elements-to-null-in-javascript
// https://v8project.blogspot.ca/2015/08/getting-garbage-collection-for-free.html
// https://github.com/natewatson999/js-gc
// https://github.com/siddMahen/node-gc
// http://buildnewgames.com/garbage-collector-friendly-code/
// https://stackoverflow.com/questions/27597335/ensuring-object-can-be-garbage-collected
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management

/**
 * @TODO: , blacklist = []
 * @TODO: put all GC events into a cached map and debounce the operation
 *
 * @since 4.0.0
 * @desc remove all methods, mark for garbage collection
 * @param {Object} obj
 * @param {Array<string>} ignore
 * @return {void}
 */
function markForGarbageCollection(obj, ignore = ['parent']) {
  // if (!isObj(obj)) return

  let props = ObjectProperties(obj)
  if (props.length > 10) {
    traverse(obj).forEachs(traverser => {
      const {value, path} = traverser

      const shouldIgnore = path
        .map(pathPart => ignore.includes(pathPart))
        .includes(true)

      // ensure the longest paths in traverser are used...
      if (!shouldIgnore && !isArray(value) && !isObj(value)) {
        traverser.remove()
      }
    })
  }

  // simple fast easy cleanup
  for (let p = 0; p < props.length; p++) {
    delete obj[p]
  }

  props = undefined
  obj = undefined
}

module.exports = markForGarbageCollection
