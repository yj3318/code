const app = getApp()
// import commonService from '../../utils/commonService'
Page({
    data: {
        // 原始图片
        originalImage: {
            width: 0, // px
            height: 0, // px
            size: 0,
            url: '',
        },
        // 压缩后的图片
        compressImage: {
            width: 0, // px
            height: 0, // px
            size: 0,
            url: '',
        },
        canvasW: 0, // canvas宽，px
        canvasH: 0, // canvas高，px
    },
    maxWidth: 500, // 图片最大宽度，px
    onLoad (params) {},
    // 选择图片事件
    chooseImage (e) {
        let width = 0
        let height = 0
        let size = 0
        let url = 0
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 指定只能为压缩图，首先进行一次默认压缩
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: photo => {
                // 获取文件大小
                if (photo && photo.tempFilePaths && photo.tempFilePaths[0]) {
                    url = photo.tempFilePaths[0]
                    wx.getFileInfo({
                        filePath: photo.tempFilePaths[0],
                        success: info => {
                            // 保存文件大小
                            if (info && info.size) {
                                size = info.size
                            }
                        },
                        complete: r => {
                            // 返回选定照片的本地文件路径列表，获取照片信息
                            wx.getImageInfo({
                                src: photo.tempFilePaths[0],
                                success: res => {
                                    if (res) {
                                        if (res.width) {
                                            width = res.width
                                        }
                                        if (res.height) {
                                            height = res.height
                                        }
                                        this.setData({
                                            'originalImage.width': width,
                                            'originalImage.height': height,
                                            'originalImage.size': size,
                                            'originalImage.url': url,
                                        })
                                    }
                                    // 利用canvas压缩图片
                                    let canvasW = res.width // 图片原始宽
                                    let canvasH = res.height // 图片原始高
                                    // 保证宽在maxWidth以内
                                    if (canvasW > this.maxWidth) {
                                        canvasW = this.maxWidth
                                        canvasH = Math.ceil(res.height * this.maxWidth / res.width)
                                    }
                                    this.setData({
                                        canvasW,
                                        canvasH,
                                    })
                                },
                                fail: err => {
                                    console.log(err)
                                },
                            })
                        },
                    })
                }
            },
        })
    },
    // 压缩成功回调方法
    compressSuccess (res) {
        console.log(res.detail)
        let detail = res.detail
        this.setData({
            'compressImage.width': detail.width,
            'compressImage.height': detail.height,
            'compressImage.size': detail.size,
            'compressImage.url': detail.url,
        })
    },
    // 压缩失败回调方法
    compressFail (err) {
        console.log(err.detail)
    },
})
