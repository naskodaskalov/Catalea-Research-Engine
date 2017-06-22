const fs = require('fs')

module.exports = (req, res) => {
  if (req.path === '/') {
    fs.readFile('./index.html', 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
        return
      }

      let companies = [ 'APPLE C CHRIS',
        'APPLE INC',
        'APPLE COMPUTER INC/ FA',
        'APPLE COMPUTER INC',
        'APPLE CREEK ACQUISITION CORP',
        'APPLE FUNDING, LLC',
        'APPLE GREEN HOLDING, INC.',
        'APPLE HOMES CORP INC',
        'APPLE HOSPITALITY FIVE INC',
        'APPLE HOSPITALITY REIT, INC.',
        'APPLE HOSPITALITY TWO INC',
        'APPLE INVESTORS LLC',
        'APPLE JAMES G',
        'APPLE KENNETH W',
        'APPLE LANE GROUP LLC',
        'APPLE LESLIE M',
        'APPLE MELISSA',
        'APPLE ORANGE LLC',
        'APPLE ORTHODONTIX INC',
        'APPLE REIT EIGHT, INC.',
        'APPLE REIT NINE, INC.',
        'APPLE REIT SEVEN, INC.',
        'APPLE REIT SIX INC',
        'APPLE REIT TEN, INC.' ]

      let result = ''

      for (let company of companies) {
        result += `<option value="${company}">`
      }

      data = data.replace('{{content}}', result)
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
