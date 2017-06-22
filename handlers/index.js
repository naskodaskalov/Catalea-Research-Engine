const homePageHandler = require('./home-page')
const faviconHandler = require('./favicon')
const staticPageHandler = require('./static-file')
const currentReportHandler = require('./report-handler')

module.exports = [
  homePageHandler,
  faviconHandler,
  currentReportHandler,
  staticPageHandler
]
