// http://2ality.com/2013/04/quirk-implicit-conversion.html
// https://javascriptrefined.io/nan-and-typeof-36cd6e2a4e43
//
// eslint-disable-next-line no-self-compare
// && x !== x
module.exports = x => x !== null && x !== undefined && !Number.isNaN(x)
