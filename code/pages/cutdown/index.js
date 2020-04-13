const app = getApp() // 小程序对象
import cutdownPannel from '../../component/cutdown/index' // 导入倒计时组件
Page({
    data: {},
    cutdownObj: null, // 倒计时组件实例对象
    onLoad (params) {
        // 注册倒计时组件
        this.cutdownObj = new cutdownPannel({
            $this: this,
            isDouble: false,
            success: sort => {
                console.log('第' + (parseInt(sort) + 1) + '个倒计时完成')
            },
        })
        this.cutdownObj.add({sort: 0, times: 29}) // 加入到倒计时中
        this.cutdownObj.add({sort: 2, times: 15}) // 加入到倒计时中
        this.cutdownObj.add({sort: 3, times: 7}) // 加入到倒计时中
        setTimeout(() => {
            this.cutdownObj.add({sort: 4, times: 10}) // 加入到倒计时中
        }, 5000)
    },
    start () {
        this.cutdownObj.start()
    },
    stop () {
        this.cutdownObj.stop()
    },
})
