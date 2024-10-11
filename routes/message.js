const express = require('express')
const { toSuccess, toError } = require('../utils')
const { verifyCode } = require('../utils/auth')
const router = express.Router()
const WS = require('express-ws')(router)

const { stringify } = JSON

router.ws('/:activityId/:code', async (ws, req) => {
  const { activityId, code } = req.params
  try {
    const pass = await verifyCode(activityId, code)
    if (!pass) {
      ws.send(stringify(toError('连接失败')))
      ws.close()
      return
    }
  } catch (err) {
    ws.send(stringify(toError(err.message)))
  }
  
  ws.on('message', (msg) => {
    console.log('接收消息', msg)
  })
 
  ws.on('error', (err) => ws.send(stringify(toError(err.message))))
  ws.on('open', () => ws.send(stringify(toSuccess())))
})

module.exports = router
