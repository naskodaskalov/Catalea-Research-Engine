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
        'APPLE COMPUTER INC',
        'APPLE FUNDING, LLC',
        'APPLE GREEN HOLDING, INC.',
        'APPLE HOMES CORP INC',
        'APPLE JAMES G',
        'APPLE ORTHODONTIX INC',
        'TWITTER INC',
        'BMW AUTO LEASING LLC',
        'VOLKSWAGEN AG',
        'MERCEDES BENZ AUTO RECEIVABLES TRUST 2012-1',
        'CHRISTIAN DIOR SA',
        'OPEL INTERNATIONAL INC',
        'IBM CREDIT CORP',
        'LENOVO GROUP LTD',
        'SAMSUNG ELECTRONICS CO LTD /FI',
        'INTERNATIONAL BUSINESS MACHINES CORP'
      ]

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
