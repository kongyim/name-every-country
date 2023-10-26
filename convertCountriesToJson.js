let _ = require('lodash')
let fs = require('fs-extra')
let countries = require('./countries.js')


countries = _.sortBy(countries, item => item.country)

fs.writeJsonSync('countries.json', countries)