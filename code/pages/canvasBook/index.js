const app = getApp()
const animationFrame = require('../../utils/third/requestAnimationFrame.js')
const ctx = wx.createCanvasContext('canvas')

Page({
    data: {
        // 默认canvas高度，px
        canvasH: 0,
        //默认canvas宽度，px
        canvasW: 0,
        // 书的答案
        bookAnswer: '',
        isShowBookAnswer: false, // 是否显示答案，擦除时才将答案显示出来
    },
    rpx2px: app.commonJs.systemInfo.rpx2px,
    // 图片数据，URL
    imgData: {
        bookBg: 'https://img63.ddimg.cn/upload_img/00610/test/bookBg-1563160042.png',
        bookLeft: 'https://img60.ddimg.cn/upload_img/00610/test/bookLeft-1563160069.png',
        bookRight: 'https://img62.ddimg.cn/upload_img/00610/test/bookRight-1563160096.png',
    },
    // 图片临时地址
    tempImgData: {
        bookBg: '',
        bookLeft: '',
        bookRight: '',
    },
    imgNum: 3, // 图片总张数，预加载图片用
    loadedImgNum: 0, // 已经下载的图片总张数
    pageTurnningAnimation: null, // 翻页动画
    animationData: {
        isInTurning: false, // 是否执行翻页动画
        scale: 1, // 翻转状态，将该值变为-1，即翻转
        skewY: 0, // 水平倾斜角度，从0开始
        critical: -.2, // 拉伸临界点，再大就会出现书页超出页面范围的现象
        isTurned: false, // 是否翻过页面
        step: .1, // 动画步长
        canClick: true, // 是否可点击
        radius: 20, // 擦除效果半径
    },
    // 书中的内容
    bookData: [],
    currentBook: 0, // 当前页索引值
    bookPages: 0, // 总页数
    bookBtnStatus: '', // 点击按钮状态，只能有‘’，next和preview三个值，默认值空表示当前页
    canEraser: true, // 是否可以擦除，默认为false，点完神奇药水后才为true
    touchStartCoor: {x: 0, y: 0}, // 记录接触时的当前坐标
    onLoad (params) {
        this.setData({
            canvasH: app.commonJs.systemInfo.highWindowHeight,
            canvasW: app.commonJs.systemInfo.windowWidth,
        })
        this.init()
    },
    //初始化数据，获取绘图所需图片
    init () {
        // 预加载图片
        for (let name in this.imgData) {
            this.preLoadImg({name, url: this.imgData[name]})
        }
        // 假数据
        this.bookData = [
            {
                front: '测试文字1',
                behind: '继续努力',
            },
            {
                front: '测试文字2',
                behind: '加油~',
            },
            {
                front: '测试文字3',
                behind: '想做就做吧',
            },
        ]
        this.bookPages = this.bookData.length
    },
    preLoadImg ({name = '', url = ''} = {}) {
        wx.downloadFile({
            url,
            success: res => {
                if (res && res.tempFilePath) {
                    this.loadedImgNum++ // 已经成功下载的图片总张数加1
                    this.tempImgData[name] = res.tempFilePath
                    if (this.loadedImgNum === this.imgNum) {
                        // 全部成功下载后，开始画
                        console.log('图片全部下载成功', this.tempImgData)
                        this.bookDraw()
                    }
                } else {
                    this.preLoadImg({name, url})
                }
            },
            fail: err => {
                console.log(err)
                this.preLoadImg({name, url})
            },
        })
    },
    //开始画图    
    bookDraw() {
        // 画背景
        ctx.rect(0, 0, this.data.canvasW, this.data.canvasH)
        ctx.setFillStyle('#000000')
        ctx.fill()
        // 画图书背景
        ctx.drawImage(this.tempImgData.bookBg, -300 * this.rpx2px, 400 * this.rpx2px, 960 * this.rpx2px, 600 * this.rpx2px)
        // 画图书左边图片
        ctx.drawImage(this.tempImgData.bookLeft, -463 * this.rpx2px, 0, 462 * this.rpx2px, 582 * this.rpx2px)
        // 当前的答案
        if (this.bookBtnStatus === '') {
            this.setData({bookAnswer: this.bookData[this.currentBook].behind})
        }
        // 可擦除背景
        ctx.setFillStyle('#cccccc')
        ctx.fillRect(220 * this.rpx2px, 440 * this.rpx2px, 400 * this.rpx2px, 100 * this.rpx2px)
        // 第二页的文字
        ctx.setTextAlign('left')
        ctx.setFontSize(30)
        ctx.setFillStyle('blue')
        let txt = ''
        if (this.bookBtnStatus === 'preview' || this.bookBtnStatus === '') {
            txt = this.bookData[this.currentBook].front
        } else {
            txt = this.bookData[this.currentBook + 1].front
        }
        ctx.fillText(txt, 280 * this.rpx2px, 510 * this.rpx2px, 440 * this.rpx2px)
        // 保存状态
        ctx.save()
        // 翻页动画
        if (this.bookBtnStatus === 'next') {
            this.nextPageTurning()
        } else if (this.bookBtnStatus === 'preview') {
            this.previewPageTurning()
        }
        // 还原状态
        ctx.restore()
        // 将上面的设置画到canvas上
        ctx.draw()
        if (this.animationData.isInTurning) {
            // 下一页动画
            this.pageTurnningAnimation = animationFrame.doAnimationFrame(this.bookDraw)
        }
    },
    // 上一页动画
    previewPageTurning () {
        ctx.beginPath()
        ctx.translate(180 * this.rpx2px, 410 * this.rpx2px) // 切换中心点
        ctx.transform(this.animationData.scale, this.animationData.skewY, 0, 1, 0, 0)
        // 画图书右边图片
        ctx.drawImage(this.tempImgData.bookRight, 0, 0, 460 * this.rpx2px, 582 * this.rpx2px)
        // 答案
        this.setData({bookAnswer: this.bookData[this.currentBook - 1].behind})
        // 可擦除背景
        ctx.setFillStyle('#cccccc')
        ctx.fillRect(40 * this.rpx2px, 30 * this.rpx2px, 400 * this.rpx2px, 100 * this.rpx2px)
        // 文字
        ctx.setTextAlign('center')
        ctx.setFontSize(30)
        ctx.setFillStyle('blue')
        ctx.fillText(this.bookData[this.currentBook - 1].front, 230 * this.rpx2px, 50, 440 * this.rpx2px)
        if (!this.animationData.isTurned && this.animationData.scale <= 0 || this.animationData.isTurned && this.animationData.skewY <= 0) {
            // 执行结束后禁止再执行动画
            if (this.animationData.isTurned && this.animationData.skewY === 0) {
                this.animationData.isInTurning = false
                this.animationData.canClick = true
                this.currentBook--
            }
            if (this.animationData.isTurned) {
                // 右侧翻页
                if (this.animationData.scale < 1) {
                    this.animationData.scale += this.animationData.step
                    // 判断是否超过上限值
                    if (this.animationData.scale > 1) {
                        this.animationData.scale = 1
                    }
                } else {
                    if (this.animationData.skewY < 0) {
                        if (Math.abs(this.animationData.skewY) < .1) {
                            this.animationData.skewY = 0
                        } else {
                            this.animationData.skewY += this.animationData.step
                        }
                    }
                }
            } else {
                // 左侧翻页
                if (this.animationData.skewY > this.animationData.critical) {
                    this.animationData.skewY -= this.animationData.step
                } else {
                    this.animationData.scale += this.animationData.step
                }
                // 清除文字
                ctx.drawImage(this.tempImgData.bookRight, 0, 0, 460 * this.rpx2px, 582 * this.rpx2px)
            }
        } else {
            this.animationData.isTurned = true
        }
    },
    // 下一页动画
    nextPageTurning () {
        ctx.beginPath()
        ctx.translate(180 * this.rpx2px, 410 * this.rpx2px) // 切换中心点
        ctx.transform(this.animationData.scale, this.animationData.skewY, 0, 1, 0, 0)
        // 画图书右边图片
        ctx.drawImage(this.tempImgData.bookRight, 0, 0, 460 * this.rpx2px, 582 * this.rpx2px)
        // 答案
        this.setData({bookAnswer: this.bookData[this.currentBook + 1].behind})
        // 可擦除背景
        ctx.setFillStyle('#cccccc')
        ctx.fillRect(40 * this.rpx2px, 30 * this.rpx2px, 400 * this.rpx2px, 100 * this.rpx2px)
        // 文字
        ctx.setTextAlign('center')
        ctx.setFontSize(30)
        ctx.setFillStyle('blue')
        ctx.fillText(this.bookData[this.currentBook].front, 230 * this.rpx2px, 100 * this.rpx2px, 440 * this.rpx2px)
        if (!this.animationData.isTurned && this.animationData.scale >= 0 || this.animationData.isTurned && this.animationData.skewY <= 0) {
            // 执行结束后禁止再执行动画
            if (this.animationData.isTurned && this.animationData.skewY === 0) {
                this.animationData.isInTurning = false
                this.animationData.canClick = true
                this.currentBook++
            }
            if (this.animationData.isTurned) {
                // 左侧翻页
                if (this.animationData.scale > -1) {
                    this.animationData.scale -= this.animationData.step
                    // 判断是否超过上限值
                    if (this.animationData.scale < -1) {
                        this.animationData.scale = -1
                    }
                } else {
                    if (this.animationData.skewY < 0) {
                        if (Math.abs(this.animationData.skewY) < .1) {
                            this.animationData.skewY = 0
                        } else {
                            this.animationData.skewY += this.animationData.step
                        }
                    }
                }
                // 清除文字
                ctx.drawImage(this.tempImgData.bookRight, 0, 0, 460 * this.rpx2px, 582 * this.rpx2px)
            } else {
                // 右侧翻页
                if (this.animationData.skewY > this.animationData.critical) {
                    this.animationData.skewY -= this.animationData.step
                } else {
                    this.animationData.scale -= this.animationData.step
                }
            }
        } else {
            this.animationData.isTurned = true
        }
    },
    // 擦除开始
    eraserStart (e) {
        ctx.globalCompositeOperation = 'destination-out'
        this.touchStartCoor = {
            x: e.changedTouches && e.changedTouches[0] && e.changedTouches[0].x || 0,
            y: e.changedTouches && e.changedTouches[0] && e.changedTouches[0].y || 0,
        }
    },
    // 擦除效果
    eraserMove (e) {
        if (e) {
            // let x = e.touches && e.touches[0] && e.touches[0].x || 0
            // let y = e.touches && e.touches[0] && e.touches[0].y || 0
            let x = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].x || 0
            let y = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].y || 0
            if (this.canEraser && x > 230 * this.rpx2px && x < (230 + 370) * this.rpx2px && y > 450 * this.rpx2px && y < (450 + 100) * this.rpx2px) {
                // console.log('擦除')
                // 显示答案
                if (!this.data.isShowBookAnswer) {
                    this.setData({isShowBookAnswer: true})
                }
                // 径向渐变
                ctx.beginPath()
                let radgrad = ctx.createCircularGradient(x, y, this.animationData.radius)
                radgrad.addColorStop(0, 'rgba(0,0,0,0.6)')
                radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
                ctx.setFillStyle(radgrad)
                ctx.arc(x, y, this.animationData.radius, 0, Math.PI * 2, true)
                ctx.fill()
                ctx.draw(true)
            }
        }
    },
    // 擦除结束
    eraserEnd (e) {
        ctx.globalCompositeOperation = 'source-over'
        let x = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].x || 0
        let y = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].y || 0
        // 重置翻页状态
        this.animationData.isTurned = false
        // 手机上同时设置tap和touchmove事件的情况下，tap事件不执行
        if (Math.abs(x - this.touchStartCoor.x) > Math.abs(y - this.touchStartCoor.y)) {
            if (this.currentBook < this.bookPages - 1 && x - this.touchStartCoor.x < -10) {
                // 下一页
                console.log('下一页')
                this.bookBtnStatus = 'next'
                // 重置缩放值
                this.animationData.scale = 1
                if (this.animationData.canClick) {
                    this.animationData.canClick = false
                    this.animationData.isInTurning = true
                    this.bookDraw()
                }
            } else if (this.currentBook > 0 && x - this.touchStartCoor.x > 10) {
                // 上一页
                console.log('上一页')
                this.bookBtnStatus = 'preview'
                // 重置缩放值
                this.animationData.scale = -1
                if (this.animationData.canClick) {
                    this.animationData.canClick = false
                    this.animationData.isInTurning = true
                    this.bookDraw()
                }
            }
        }
    },
})
