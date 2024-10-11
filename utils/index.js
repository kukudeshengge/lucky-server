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

const getActivityStatus = (start, end) => {
  const now = Date.now()
  if (now <= start) {
    return {
      status: 0,
      statusTitle: '未开始'
    }
  }
  if (now >= end) {
    return {
      status: 2,
      statusTitle: '已结束'
    }
  }
  if (start > now && now < end) {
    return {
      status: 1,
      statusTitle: '进行中'
    }
  }
  return {
    status: -1,
    statusTitle: ''
  }
}

const shuffleArray = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex
  
  // 当还有元素时，继续打乱数组
  while (0 !== currentIndex) {
    
    // 随机选取一个元素
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    
    // 与当前元素交换
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  
  return array // 返回打乱后的数组
}

function getRandomFromArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generateRandomCharacters(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = {
  toSuccess,
  toError,
  sleep,
  getActivityStatus,
  shuffleArray,
  getRandomFromArray,
  generateRandomCharacters
}
