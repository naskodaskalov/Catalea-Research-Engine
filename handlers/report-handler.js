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
        currentCompanyName = name.companyName.toUpperCase()
        companyInfo.companyName = currentCompanyName
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

        let newUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${currentCompanyCIK}&CIK=${currentCompanyCIK}&type=10-K%25&dateb=20161231&owner=include&start=0&count=10&output=atom`

        parserRss.parseURL(newUrl, function (err, parsed) {
          if (err) {
            console.log(err)
            return
          }
          parsedFeed = parsed.feed.entries
          let lastYearUrl = parsedFeed[0].link
          // parserRss.parseURL(lastYearUrl, function (err, linkParsed) {
          //   if (err) {
          //     console.log(err)
          //     return
          //   }

          //   console.log(linkParsed)
          // })
          if (parsedFeed.length === 0) {
            financialFiles += `
                              <tr>
                                <td class="text-center" colspan="3">No Information!</td>
                              </tr>`
          } else {
            for (let feed of parsedFeed) {
              // console.log(feed.link)
              let reportType = feed.title.slice(0, 4)
              let reportPulishDate = new Date(feed.pubDate)
              let reportTxtLink = feed.link.slice(0, -10) + '.txt'
              financialFiles += `
                                <tr>
                                  <td class="text-left">${reportType}</td>
                                  <td class="text-left">${reportPulishDate.toUTCString().slice(4, 16)}</td>
                                  <td class="text-left"><a href="${feed.link}">${feed.title}</a></td>
                                </tr>`
            }
          }
          companyInfo.companyCik = currentCompanyCIK
          data = data.replace('{{companyName}}', companyInfo.companyName)
          data = data.replace('{{companyCik}}', companyInfo.companyCik)
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
