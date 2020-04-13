const app = getApp()

Page({
    data: {
        isClosePopFlag: false, // 是否关闭弹层
    },
    onLoad (params) {
    },
    preventTouchMove () {},
    // 关闭弹层
    closePop (e) {
        this.setData({
            isClosePopFlag: true,
        })
    },
})
