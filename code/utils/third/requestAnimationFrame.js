// 模拟 web端的requestAnimationFrame

// lastFrameTime为上次更新时间
let lastFrameTime = 0
let doAnimationFrame = callback => {
  //当前毫秒数
  let currTime = new Date().getTime()
  //设置执行该函数的等待时间，如果上次执行时间和当前时间间隔大于16ms，则设置timeToCall=0立即执行，否则则取16-(currTime - lastFrameTime)，确保16ms后执行动画更新的函数
  let timeToCall = Math.max(0, 16 - (currTime - lastFrameTime))
  // console.log(timeToCall)
  let id = setTimeout(() => {
    //确保每次动画执行时间间隔为16ms
    callback(currTime + timeToCall)
  }, timeToCall)
  //timeToCall小于等于16ms，lastFrameTime为上次更新时间
  lastFrameTime = currTime + timeToCall
  return id
}
// 模拟 cancelAnimationFrame
let abortAnimationFrame = id => {
    clearTimeout(id)
}
module.exports = {
    doAnimationFrame: doAnimationFrame,
    abortAnimationFrame: abortAnimationFrame
}
