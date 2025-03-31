const _ = require('lodash')
const fs = require('fs-extra')
const wcc = require('world-countries-capitals')

let countries = require('./src/countries.json')

fs.writeJsonSync('countries.json', countries, {spaces: 2})