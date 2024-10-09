const { MongoClient } = require('mongodb')

const dbUrl = 'mongodb://localhost:27017'
const dbName = 'data'

let db = null

async function connect () {
  try {
    const client = await MongoClient.connect(dbUrl)
    db = client.db(dbName)
    return db
  } catch (err) {
    console.log(err, 'connect error');
  }
}

async function mongodbInstance () {
  return db ? db : connect()
}

module.exports = mongodbInstance
