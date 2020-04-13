/**
 * 评论回复组件
    一、引用：
        1、json中：
            "usingComponents": {
                "comment-area": "./component/comment/index"
            }
        2、wxml中：
            <comment-area id="commentArea" avatar="{{userInfo.avatar}}" placeholder="我来说两句..." to-comment-id="{{commentId}}" to-reply-id="{{replyId}}" to-reply-name="{{replyName}}" to-reply-user-id="{{replyUserId}}" bind:commentSuccess="commentSuccess" bind:commentFail="commentFail"></comment-area>
    二、传入参数说明说明：
        avatar: '', // 当前用户头像
        placeholder: '', // 输入框placeholder文案
        to-comment-id: '', // 当前评论ID
        to-reply-id: '', // 当前回复ID
        to-reply-name: '', // 回复回复的用户昵称
        to-reply-user-id: '', // 回复回复的用户ID
        commentSuccess: () => {}, // 回复/评论成功回调函数
        commentFail: () => {}, // 回复/评论失败回调函数
 */
const app = getApp()
Component({
    properties: {
        canvasId: {
            type: String,
            value: 'canvas',
        },
        filePath: {
            type: String,
            value: '',
        },
        canvasH: {
            type: Number,
            value: 0,
        },
        canvasW: {
            type: Number,
            value: 0,
        },
    },
    data: {},
    attached () {
    },
    // 数据监听(2.6.1)
    observers: {
        'filePath': function (path) { // 此方法不能用箭头函数，this为undefined
            if (path) {
                // 延时执行是因为需要给data数据改变留一定的时间
                setTimeout(() => {
                    this.compress()
                }, 100)
            }
        },
    },
    methods: {
        // 压缩方法
        compress () {
            // 绘制图形并取出图片路径
            const ctx = wx.createCanvasContext(this.data.canvasId, this) // 注意，在组件中使用canvas时，需要传this，下同
            ctx.drawImage(this.data.filePath, 0, 0, this.data.canvasW, this.data.canvasH)
            // 留一定的时间绘制canvas
            ctx.draw(false, setTimeout(() => {
                console.log(this.data.canvasId)
                wx.canvasToTempFilePath({
                    canvasId: this.data.canvasId,
                    destWidth: this.data.canvasW,
                    destHeight: this.data.canvasH,
                    fileType: 'jpg', // 目标文件的类型，默认png。1.7.0
                    quality: 0.8, // 图片的质量，目前仅对 jpg 有效。1.7.0
                    success: file => {
                        if (file && file.tempFilePath) {
                            let width = this.data.canvasW
                            let height = this.data.canvasH
                            let size = 0
                            let url = ''
                            // 最终图片路径
                            console.log(file.tempFilePath)
                            url = file.tempFilePath
                            wx.getFileInfo({
                                filePath: url,
                                success: info => {
                                    // 保存文件大小
                                    if (info && info.size) {
                                        size = info.size
                                    }
                                },
                                fail: err => {
                                    console.log(err)
                                },
                                complete: r => {
                                    this.triggerEvent('compressSuccess', {width, height, size, url})
                                },
                            })
                        } else {
                            this.triggerEvent('compressFail', {errMsg: '压缩图片失败，请重试'})
                        }
                    },
                    fail: err => {
                        console.log(err)
                        this.triggerEvent('compressFail', {errMsg: '压缩图片失败，请重试'})
                    }
                }, this) // 组件中的canvas操作需要加传this
            }, 100))
        },
    },
})
