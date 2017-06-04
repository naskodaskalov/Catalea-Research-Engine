const fs = require('fs')
const database = require('../database/database')

module.exports = (req, res) => {
  if (req.headers['statusheader'] && req.headers['statusheader'] === 'Full') {
    fs.readFile('./views/status.html', 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
        return
      }

      let totalImages = database.getAll().length

      data = data.replace('{{content}}', `<h1>Total uploaded images - ${totalImages}</h1>`)

      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.write(data)
      res.end()
    })
  } else {
    return true
  }
}
