import commonJs from 'utils/utils.js' // 导入公共方法
// 概率加载阿拉丁埋点功能
const aldRandom = Math.ceil(Math.random() * 9) + 1
const aldRate = 10
let ald = ''
if (aldRandom <= aldRate) {
    ald = require('./utils/third/ald-stat.js')
}
// 当当大数据埋点
import ddBI from './utils/third/ddBI'

const time = Date.now()
App({
    onLaunch (params) {
    },
    // 在App周期中使用自定义事件
    onShow () {
        this.aldstat && this.aldstat.sendEvent('小程序启动花费时间', {
            '花费时长': Date.now() - time,
        })
    },
    globalData: {
        userInfo: null
    },
    // 公共方法
    commonJs: commonJs,
})
