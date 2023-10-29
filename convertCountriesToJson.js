let _ = require('lodash')
let fs = require('fs-extra')
let countries = require('./src/countries.json')


countries = _.sortBy(countries, item => item.country)

fs.writeJsonSync('countries.json', countries)