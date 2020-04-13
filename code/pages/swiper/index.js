const app = getApp()
// import commonService from '../../utils/commonService'
Page({
    data: {
        swiperNextMargin: 200, // swiper后边距，可用于露出后一项的一小部分
        canNextMargin: true, // 是否支持swiper后边距
        imgUrls: [], // 轮播图片
    },
    windowW: app.commonJs.systemInfo.windowWidth / app.commonJs.systemInfo.rpx2px, // 页面宽度rpx
    onLoad (params) {
        let canNextMargin = true
        if (app.commonJs.compareVersion('', '1.9.0') < 0) {
            canNextMargin = false
        }
        let imgUrls = [
            'http://img62.ddimg.cn/upload_img/00745/cdn/2-1538103682.jpg',
            'https://img62.ddimg.cn/upload_img/00555/mina/xx-1532665560.png',
            'http://img62.ddimg.cn/upload_img/00745/cdn/2-1538103682.jpg',
        ]
        this.setData({
            imgUrls,
            canNextMargin,
        })
    },
    // 更多链接
    goToMore (e) {
        console.log(e)
    },
})
