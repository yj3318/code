// const plugin = requirePlugin("chatbot")
const app = getApp()

Page({
    data: {},
    onLoad (options) {
        // plugin.init({
        //     appid: 'HWPonhp8Xvu9W8gLXflkppLOVKtpJ2',
        //     success: () => {},
        //     fail: error => {},
        //     guideList: ["打开体质检查程序"],
        //     textToSpeech: true, //默认为ture打开状态
        // })
    },
    // getQueryCallback回调 返回query与结果
    getQueryCallback (e) {
        console.log(e.detail)
    },
    // goBackHome回调 返回上一级页面
    goBackHome () {
        wx.navigateBack({
            delta: 1,
        })
    },
})
