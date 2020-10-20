const fs = require('fs')
const Airtable = require('airtable')

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.BASE_ID
let base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(BASE_ID)

async function getRecords() {
  return new Promise((resolve, reject) => {
    let entries = []
    base('Ethereum Addresses').select({
      maxRecords: 100,
    }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        let project = record.fields.Project || ''
        let contractName = record.fields['Contract Name'] || ''
        let name = record.fields.Name || ''
        let address = record.fields.Address || ''
        entries.push([project, contractName, name, address])
      })
      fetchNextPage()
    }, function done(err) {
      if (err) {
        reject(err)
      }
      resolve(entries)
    })
  })
}

async function main() {
  let entries = await getRecords().catch((error) => { console.log('error:', error); })
  let entriesString = []
  entries.forEach(function(entry) {
    console.log('entry', entry)
    let name = entry[0] + ':' + entry[1] + ':' + entry[2]
    let keyword = entry[1].toLowerCase()
    entriesString.push([name, keyword, entry[3]].join(','))
  })

  let data = entriesString.join('\n')
  console.log('data', data)
  fs.writeFile('output/snippets.csv', data, (err) => {
    if (err) {
      console.log('error', err)
    }
    console.log('file saved')
  })
}

main()
