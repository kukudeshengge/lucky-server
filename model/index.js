const mongodb = require('../db/mongodb')

class Index {
  constructor (tableName) {
    this.tableName = tableName
  }
  
  init = async () => {
    const db = await mongodb()
    return await db.collection(this.tableName)
  }
  
  async find (data) {
    const db = await this.init()
    return db.find(data).toArray()
  }
  
  async findOne(data) {
    const db = await this.init()
    return db.findOne(data, {})
  }
  
  async insertOne (data) {
    const db = await this.init()
    return db.insertOne(data)
  }
}

module.exports = Index
