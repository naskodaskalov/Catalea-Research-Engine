const fs = require('fs')
const parser = require('querystring')
const parserRss = require('rss-parser')

module.exports = (req, res) => {
  if (req.path !== '/current-report') {
    return true
  }

  fs.readFile('./views/current-report.html', 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    if (req.method === 'POST') {
      let financialFiles = ''
      let fileName = 'tuk'
      let parsedFeed = ''
      let companyInfo = {
        'companyName': '',
        'companyCik': ''
      }
      let currentCompanyName = ''
      let currentCompanyCIK = ''
      let result = ''
      req.on('data', (d) => {
        result += d
      }).on('end', () => {
        let name = parser.parse(result)
        currentCompanyName = name.companyName
        companyInfo.companyName = currentCompanyName
        console.log(companyInfo.companyName)
      })

      fs.readFile('./content/cik-lookup-data.txt', 'utf-8', (err, file) => {
        if (err) {
          console.log(err)
          return
        }
        let readedFile = file

        let currentCompanyNameIndex = (Number)(file.indexOf(currentCompanyName))
        let currentCompanyNameLenght = (Number)(currentCompanyName.length)
        let currentCompanyCIKNumberIndex = (Number)(currentCompanyNameIndex + currentCompanyNameLenght + 1)
        currentCompanyCIK = readedFile.slice(currentCompanyCIKNumberIndex, (currentCompanyCIKNumberIndex) + 10)
        console.log(currentCompanyCIK)

        let newUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${currentCompanyCIK}&CIK=${currentCompanyCIK}&type=10-K%25&dateb=20161231&owner=include&start=0&count=10&output=atom`

        parserRss.parseURL(newUrl, function (err, parsed) {
          if (err) {
            console.log(err)
            return
          }
          parsedFeed = parsed.feed.entries
          for (let feed of parsedFeed) {
            let reportType = feed.title.slice(0, 4)
            let reportPulishDate = new Date(feed.pubDate)
            let reportTxtLink = feed.link.slice(0, -10) + '.txt'
            console.log(reportTxtLink)
            // console.log(feed.title)
            // console.log(feed.pubDate)
            // console.log(feed.link)
            financialFiles += `
                              <tr>
                                <td class="text-left">${reportType}</td>
                                <td class="text-left">${reportPulishDate.toUTCString().slice(4, 16)}</td>
                                <td class="text-left"><a href="${reportTxtLink}">${feed.title}</a></td>
                              </tr>`
          }
          console.log('parsing finish')
          // console.log(parsedFeed[0].pubDate)
          companyInfo.companyCik = currentCompanyCIK

          console.log('rendering company info')
          data = data.replace('{{companyName}}', companyInfo.companyName)
          data = data.replace('{{companyCik}}', companyInfo.companyCik)
          console.log('rendering financial info')
          data = data.replace('{{financialFiles}}', financialFiles)
          res.writeHead(200, {
            'Content-Type': 'text/html'
          })
          res.write(data)
          res.end()
        })
      })
    }
  })
}
