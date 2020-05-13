const app = getApp() // 小程序对象
import WeCropper from '../../component/cropImg/cropImg' // 导入裁剪方法
const device = wx.getSystemInfoSync()
const width = device.windowWidth // canvas宽度，单位px
const height = device.windowHeight - 100 // canvas高度，单位px
const cutW = 652 // 裁剪区宽度，单位rpx
const cutH = 372 // 裁剪区高度，单位rpx
Page({
    pageName: 'cutImage',
    defaultTitle: '裁剪图片效果',
    data: {
        isCutShow: false, // 是否显示裁剪区
        img: '', // 裁剪后的图片
        // canvas设置
        canvasSetting: {
            id: 'cropper',
            width,
            height,
        },
        // 宽高说明
        tipsData: {
            w: cutW,
            h: cutH,
        },
    },
    // 裁剪配置
    cropperOpt: {
        id: 'cropper',
        width,
        height,
        scale: 2.5,
        zoom: 8,
        // 裁剪区载设置
        cut: {
            x: (width - cutW * app.commonJs.systemInfo.rpx2px) / 2,
            y: (height - cutH * app.commonJs.systemInfo.rpx2px) / 2,
            width: cutW * app.commonJs.systemInfo.rpx2px,
            height: cutH * app.commonJs.systemInfo.rpx2px,
        }
    },
    onLoad (params) {
        // 截图
        new WeCropper(this.cropperOpt)
        .on('ready', ctx => {})
        .on('beforeImageLoad', ctx => {
            wx.showToast({
                title: '上传中',
                icon: 'loading',
                duration: 20000,
            })
        })
        .on('imageLoad', ctx => {
            wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
        })
        .updateCanvas()
    },
    // 上传图片
    uploadImg (e) {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: res => {
                wx.setNavigationBarTitle({title: '图片裁剪'})
                wx.setNavigationBarColor({
                    frontColor: '#ffffff', // 必写项
                    backgroundColor: '#000000', // 必写项
                       
                })     
                this.setData({
                    isCutShow: true,
                })     
                const src = res.tempFilePaths[0]
                // 获取裁剪图片资源后，给data添加src属性及其值
                this.wecropper.pushOrign(src)
            }          
        })
    },
    canvasTouchStart (e) {
        this.wecropper.touchStart(e)
    },
    canvasTouchMove (e) {
        this.wecropper.touchMove(e)
    },
    canvasTouchEnd (e) {
        this.wecropper.touchEnd(e)
    },
    // 取消
    cancelCutImage () {
        wx.setNavigationBarTitle({title: this.defaultTitle})
        wx.setNavigationBarColor({
            frontColor: '#000000', // 必写项
            backgroundColor: '#ffffff', // 必写项
        })
        this.setData({
            isCutShow: false,
        })
    },
    // 获取裁剪区域数据
    getCutImage () {
        this.wecropper.getCropperImage(src => {
            if (src) {
                this.setData({
                    img: src,
                })
                console.log('裁剪后的图片路径：' + src)
            } else {
                console.error('裁剪图片失败，请稍后再试')
            }
            this.cancelCutImage()
        })
    },
})
