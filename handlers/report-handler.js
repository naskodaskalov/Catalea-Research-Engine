const fs = require('fs')
const parser = require('querystring')
const Request = require('request')
const convert = require('xml-js')

module.exports = (req, res) => {
  if (req.path !== '/current-report') {
    return true
  }

  fs.readFile('./views/current-report.html', 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    let companyName = ''
    let companyCity = ''
    let companyCik = ''

    let companyInfo = {
      'company-name': '',
      'company-city': '',
      'company-cik': ''
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
        console.log(currentCompanyName)
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

        // url:  https://www.sec.gov/Archives/edgar/data/320193/000162828016020309/a201610-k9242016.htm
        Request.get(baseUrl, 'utf-8')
          .on('data', (data) => {
            fetchingData += data
            console.dir(fetchingData)
            // let cnData = convert.xml2js(fetchingData)
            // // console.log(cnData.elements[0].elements[1].elements[3].elements[0].text)
            // companyName = cnData.elements[0].elements[1].elements[3].elements[0].text
            // // companyCity = cnData.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].text

            // companyCik = cnData.elements[0].elements[1].elements[1].elements[0].text
            // console.log(cnData)
            // let val = cnData.elements[0].elements[1].elements[0].elements[0].elements[0].elements[0].text
            companyInfo['company-name'] = companyName
            companyInfo['company-city'] = companyCity
            companyInfo['company-cik'] = companyCik
          })
          .on('error', (err) => {
            if (err) {
              companyInfo.error = err.message
            }
          })
          // .on('end', () => {
        console.log(companyInfo['company-name'])

            // console.log(companyInfo.CIK)
        results = `
        <label>Company CIK Number:</label>${companyInfo['company-cik']}<br />
        <label>Company Name:</label>${companyInfo['company-name']}<br />
        <label>Company Address:</label>${companyInfo['company-city']}<br />
        <label>Company CIK Number:</label>${companyInfo['company-name']}<br />
        <label>Company CIK Number:</label>${companyInfo['company-name']}<br />
        <label>Company CIK Number:</label>${companyInfo['company-name']}
        `
        data = data.replace('{{report}}', fetchingData)

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
