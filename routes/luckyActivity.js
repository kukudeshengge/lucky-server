const express = require('express')
const {
  toError,
  toSuccess,
  sleep,
  getActivityStatus,
  shuffleArray,
  getRandomFromArray,
  generateRandomCharacters
} = require('../utils')
const { verifyCode } = require('../utils/auth')
const router = express.Router()
const BigNumber = require('bignumber.js')
const { isNumber } = require('../utils/type')
const Model = require('../model')
const dayjs = require('dayjs')
const ObjectId = require('mongodb').ObjectId

const getActivityItem = (item, typeEnum) => {
  item.startTimeTitle = dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss')
  item.endTimeTitle = dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
  item.activityTypeTitle = typeEnum[item.activityType]
  const { status, statusTitle } = getActivityStatus(item.startTime, item.endTime)
  item.status = status
  item.statusTitle = statusTitle
  return item
}

/**
 * 活动列表
 */
router.get('/getActivityList', async (req, res) => {
  try {
    const activityModel = new Model('activity')
    const activityTypeModel = new Model('luckyType')
    const list = await activityModel.find({})
    const activityTypeList = await activityTypeModel.find({})
    const typeEnum = activityTypeList.reduce((prev, next) => ({ ...prev, [next.type]: next.name }), {})
    list.forEach(item => getActivityItem(item, typeEnum))
    res.json(toSuccess(list))
  } catch (err) {
    res.json(toError(err.message))
  }
})

/**
 * 保存活动
 */
router.post('/activitySave', async (req, res) => {
  const { phone, activityName, activityType, startTime, endTime, prizeList } = req.body
  if (!phone || phone.trim() === '') {
    return res.json(toError('创建人手机号必填'))
  }
  if (!activityName || activityName.trim() === '') {
    return res.json(toError('活动名称必填'))
  }
  if (!startTime) {
    return res.json(toError('活动开始时间必填'))
  }
  if (!endTime) {
    return res.json(toError('活动结束时间必填'))
  }
  if (!prizeList || !Array.isArray(prizeList)) {
    return res.json(toError('奖项列表必填'))
  }
  if (prizeList.length < 4) {
    return res.json(toError('奖项最少添加4个'))
  }
  const prizeEmpty = prizeList.some(item => {
    if (!item.title || item.title.trim() === '') return true
    if (!item.src) return true
    if (!isNumber(item.prizeRate)) return true
  })
  if (prizeEmpty) {
    return res.json(toError('奖项信息有误'))
  }
  const allRate = BigNumber.sum(...prizeList.map(item => item.prizeRate))
  if (allRate.toNumber() !== 100) {
    return res.json(toError('所有奖项中奖率之和必须等于100'))
  }
  try {
    const activityModel = new Model('activity')
    const prizeModel = new Model('prize')
    const { status } = getActivityStatus(startTime, endTime)
    const activity = await activityModel.insertOne({
      phone,
      activityName,
      activityType: activityType || 1,
      startTime,
      endTime,
      status,
      code: generateRandomCharacters(4)
    })
    prizeList.forEach(item => item.activityId = activity.insertedId)
    for (let i = 0; i < prizeList.length; i++) {
      await prizeModel.insertOne(prizeList[i])
    }
    res.json(toSuccess(activity))
  } catch (err) {
    res.json(toError(err.message))
  }
})

/**
 * 查询活动详情
 */
router.get('/getActivityDetail', async (req, res) => {
  try {
    const { activityId } = req.query
    if (!ObjectId.isValid(activityId)) {
      return res.json(toError('活动id不规范'))
    }
    const activityModel = new Model('activity')
    const activityInfo = await activityModel.findOne({ _id: new ObjectId(activityId) })
    if (!activityInfo) {
      return res.json(toError('未查询到活动'))
    }
    const prizeModel = new Model('prize')
    const activityTypeModel = new Model('luckyType')
    // 查活动
    const activityTypeList = await activityTypeModel.find({})
    // 处理状态枚举
    const typeEnum = activityTypeList.reduce((prev, next) => ({ ...prev, [next.type]: next.name }), {})
    // 获取奖品列表
    activityInfo.prizeList = await prizeModel.find({ activityId: new ObjectId(activityInfo._id) })
    getActivityItem(activityInfo, typeEnum)
    res.json(toSuccess(activityInfo))
  } catch (err) {
    res.json(toError(err.message))
  }
})

/**
 * 活动类型列表
 */
router.get('/getActivityTypeList', async (req, res) => {
  try {
    const activityTypeModel = new Model('luckyType')
    const list = await activityTypeModel.find({})
    res.json(toSuccess(list))
  } catch (err) {
    res.json(toError(err.message))
  }
})

/**
 * 抽奖
 */
router.get('/startLucky', async (req, res) => {
  try {
    const { activityId, code } = req.query
    if (!ObjectId.isValid(activityId)) {
      return res.json(toError('活动id不规范'))
    }
    const pass = await verifyCode(activityId, code)
    if (!pass) {
      return res.json(toError('抽奖失败'))
    }
    const prizeModel = new Model('prize')
    const luckyRecordModel = new Model('luckyRecord')
    // 获取奖项列表
    const prizeList = await prizeModel.find({ activityId: new ObjectId(activityId) })
    // 生成奖项集合
    const jackpot = []
    const p = BigNumber.min(...prizeList.map(item => item.prizeRate)).decimalPlaces()
    let zero = ''
    for (let i = 0; i < p; i++) {
      zero += '0'
    }
    for (let i = 0; i < prizeList.length; i++) {
      // 获取中奖记录
      const item = prizeList[i]
      const len = BigNumber(item.prizeRate).multipliedBy(BigNumber(`1${zero}`)).toNumber()
      jackpot.push(...new Array(len).fill(item))
    }
    sleep(1500)
    // 打乱集合顺序
    const outOrderJackpot = shuffleArray(jackpot)
    // 获取中奖奖品
    const winPrize = getRandomFromArray(outOrderJackpot)
    // 插入中奖记录
    await luckyRecordModel.insertOne({
      prizeTime: Date.now(),
      prizeTimeTitle: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      activityId: winPrize.activityId,
      prizeId: winPrize._id,
      title: winPrize.title,
      src: winPrize.src
    })
    res.json(toSuccess(winPrize))
  } catch (err) {
    res.json(toError(err.message))
  }
})

/**
 * 获取中奖记录
 */
router.get('/getActivityLuckyRecord', async (req, res) => {
  try {
    const { activityId } = req.query
    if (!ObjectId.isValid(activityId)) {
      return res.json(toError('活动id不规范'))
    }
    const luckyRecordModel = new Model('luckyRecord')
    const list = await luckyRecordModel.find({ activityId: new ObjectId(activityId) })
    res.json(toSuccess(list))
  } catch (err) {
    res.json(toError(err.message))
  }
})

module.exports = router
