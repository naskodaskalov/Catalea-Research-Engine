const fs = require('fs')
const parser = require('querystring')
const Request = require('request')
const convert = require('xml-js')
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

    let companyInfo = {
      'companyName': '',
      'companyCik': ''
    }
    let results = ''
    if (req.method === 'POST') {
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

        // file = file.toString()
        let currentCompanyNameIndex = (Number)(file.indexOf(currentCompanyName))
        let currentCompanyNameLenght = (Number)(currentCompanyName.length)
        let currentCompanyCIKNumberIndex = (Number)(currentCompanyNameIndex + currentCompanyNameLenght + 1)
        currentCompanyCIK = readedFile.slice(currentCompanyCIKNumberIndex, (currentCompanyCIKNumberIndex) + 10)
        console.log(currentCompanyCIK)
        let baseUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${currentCompanyCIK}&type=10-K&dateb=20161231&owner=include&count=10`
        let fetchingData = ''

        let newUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${currentCompanyCIK}&CIK=${currentCompanyCIK}&type=10-K%25&dateb=20161231&owner=include&start=0&count=10&output=atom`

        parserRss.parseURL(newUrl, function (err, parsed) {
          if (err) {
            console.log(err)
            return
          }
          console.log('feed title:')
          if (parsed.feed.entries.length !== 0) {
            console.dir(parsed.feed.entries)
            console.log(parsed.feed.title)
            parsed.feed.entries.forEach(function (entry) {
              console.log(`${entry.title}:${entry.pubDate}:${entry.link}`)
            })
          } else {
            console.log('No Entries')
          }
        })

        // url:  https://www.sec.gov/Archives/edgar/data/320193/000162828016020309/a201610-k9242016.htm
        // Request.get(newUrl, 'utf-8')
        //   .on('data', (data) => {
        //     fetchingData += data
        //     // console.dir(convert.xml2json(fetchingData))
        //     // let cnData = convert.xml2js(fetchingData)
        //     // // console.log(cnData.elements[0].elements[1].elements[3].elements[0].text)
        //     // companyName = cnData.elements[0].elements[1].elements[3].elements[0].text
        //     // // companyCity = cnData.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].text

        //     // companyCik = cnData.elements[0].elements[1].elements[1].elements[0].text
        //     // console.log(cnData)
        //     // let val = cnData.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].text
        //     companyInfo['company-name'] = companyName
        //     companyInfo['company-city'] = companyCity
        //     companyInfo['company-cik'] = companyCik
        //   })
        //   .on('error', (err) => {
        //     if (err) {
        //       companyInfo.error = err.message
        //     }
        //   })
        //   // .on('end', () => {
        // console.log(companyInfo['company-name'])

            // console.log(companyInfo.CIK)
        companyInfo.companyCik = currentCompanyCIK
        // <div class='company-info'>
        //   <label>Company Name:</label> ${companyInfo.companyName}<br />
        //   <label>Company CIK Number:</label> ${companyInfo.companyCik}<br />
        // </div>
        results = `<div class='companyInfoTable'>
                      <div class="table-title">
                        <h3>Company info</h3>
                      </div>
                      <table class="table-fill">
                        <thead>
                          <tr>
                            <th class="text-left">Company name</th>
                            <th class="text-left">CIK Number</th>
                          </tr>
                        </thead>
                        <tbody class="table-hover">
                          <tr>
                            <td class="text-left">${companyInfo.companyName}</td>
                            <td class="text-left">${companyInfo.companyCik}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class='financialsTable'>
                      <div class="table-title">
                        <h3>Financials</h3>
                      </div>
                      <table class="table-fill">
                        <thead>
                          <tr>
                            <th class="text-left">Company name</th>
                            <th class="text-left">CIK Number</th>
                          </tr>
                        </thead>
                        <tbody class="table-hover">
                          <tr>
                            <td class="text-left">${companyInfo.companyName}</td>
                            <td class="text-left">${companyInfo.companyCik}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  `
        data = data.replace('{{report}}', results)

        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(data)
        res.end()
          // })
      })
    }
  })
}
