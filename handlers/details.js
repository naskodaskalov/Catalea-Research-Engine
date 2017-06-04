const fs = require('fs')
const database = require('../database/database')

module.exports = (req, res) => {
  if (!req.path.startsWith('/images/details')) {
    return true
  }

  if (req.method === 'GET') {
    let imgUrl = req.path.split('/')[3]
    let currentImg = database.getById(imgUrl)

    fs.readFile('./views/details.html', (err, data) => {
      if (err) {
        console.log(err)
        return
      }

      let result = ''
      result += `<h1>More details for ${currentImg.name} image</h1>`
      result += `<img src="${currentImg.url}" />`
      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.write(result)
      res.end()
    })
  }
}
