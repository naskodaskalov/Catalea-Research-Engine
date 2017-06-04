const homePageHandler = require('./home-page')
const faviconHandler = require('./favicon')
const staticPageHandler = require('./static-file')

module.exports = [
  homePageHandler,
  faviconHandler,
  staticPageHandler
]
