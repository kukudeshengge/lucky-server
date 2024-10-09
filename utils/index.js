const toSuccess = (data = null, code = '200', message = 'success') => {
  return {
    code,
    data,
    message
  }
}

const toError = (message = 'error', data = null, code = '500') => {
  return {
    code,
    data,
    message
  }
}

const sleep = (time = 500) => {
  const timeStamp = new Date().getTime()
  const endTime = timeStamp + time
  while (true) {
    if (new Date().getTime() > endTime) return
  }
}

module.exports = {
  toSuccess,
  toError,
  sleep
}
