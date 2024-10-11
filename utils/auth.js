const Model = require('../model')
const { ObjectId } = require('mongodb')

const verifyCode = async (activityId, code) => {
  if (!ObjectId.isValid(activityId) || !code) {
    return false
  }
  const activityModel = new Model('activity')
  const detail = await activityModel.findOne({ _id: new ObjectId(activityId) })
  if (detail && detail.code === code) return true
}

module.exports = {
  verifyCode
}
