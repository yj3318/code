const app = getApp()
Page({
    data: {
        // 皮肤数据
        skinData: {
            // 背景图片
            bg: {
                width: 0, // 宽
                height: 0, // 高
                path: '', // 本地路径
                windowH: 0, // 显示区高度
            },
        },
        // 作家数据
        author: {
            avatar: '', // 头像
            nickName: '', // 昵称
            icon: '', // 头像icon
            position: '', // icon显示位置
            bgColor: '', // 气泡背景颜色
            fontColor: '', // 气泡文字颜色
        },
        // 用户数据
        my: {
            avatar: '', // 头像
            nickName: '', // 昵称
            bgColor: '', // 气泡背景颜色
            fontColor: '', // 气泡文字颜色
        },
        // 聊天数据
        imData: [
            {
                type: '', // 本条聊天记录身份，my用户，author作家
                text: '', // 聊天记录
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
        ],
        againStatus: false, // 是否可以点击再玩一次按钮
    },
    timeout: [], // 聊天动画延迟对象
    titleTimeout: null, // 标题延迟动画对象
    topVal: 0, // 背景高度差值，用于动画的top定位，单位px
    onLoad (params) {
        this.initPage()
    },
    onShow () {},
    onHide () {},
    onUnload () {
        this.stopTimeout()
    },
    initPage () {
        // 设置标题
        this.setTitle('董卿')
        // 获取背景图信息
        let imgUrl = 'https://img62.ddimg.cn/upload_img/00810/mina/mainbg-1606371578.jpg'
        this.getImageInfo({
            imgUrl,
            success: info => {
                if (info && info.path) {
                    const systemInfo = wx.getSystemInfoSync()
                    let h = 0
                    if (info.height && info.width) {
                        h = Math.round(systemInfo.windowWidth * info.height / info.width)
                    }
                    // 设置差值
                    this.topVal = systemInfo.windowHeight - h
                    this.setData({
                        // 'skinData.bg.path': info.path, // iPhone SE无法显示背景图
                        'skinData.bg.path': imgUrl,
                        'skinData.bg.width': systemInfo.windowWidth || 0,
                        'skinData.bg.height': h,
                        'skinData.bg.windowH': systemInfo.windowHeight || 0,
                    })
                }
            },
        })
        // 假数据开始
        const imData = [
            {
                type: 'my',
                text: '夸夸我',
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
            {
                type: 'author',
                text: '好的',
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
            {
                type: 'author',
                text: '我觉得你是全世界最绝顶聪明的人。|你连指尖都泛出好看的颜色',
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
            {
                type: 'my',
                text: '太会夸啦',
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
            {
                type: 'author',
                text: '多读书，你也可以|尤其是我的《朗读者》',
                animate: false, // 动画效果
                delay: 1000, // 动画延迟，默认1秒
            },
        ]
        const author = {
            avatar: 'https://img63.ddimg.cn/upload_img/00610/h5m/bg_pic-1597226866.png', // 头像
            nickName: '董卿', // 昵称
            icon: 'https://staticobs.ddimg.cn/appimg/touch_ios_banner.jpg', // 头像icon
            position: 'bottom', // icon显示位置，bottom下边，top上边
            bgColor: '#ffffff', // 气泡背景颜色
            fontColor: '#141414', // 气泡文字颜色
        }
        const my = {
            avatar: '', // 头像
            nickName: '', // 昵称
            bgColor: '#ff9b36', // 气泡背景颜色
            fontColor: '#ffffff', // 气泡文字颜色
        }
        // 假数据结束
        this.setData({
            againStatus: false,
            imData: this.crlf(imData),
            author,
            my,
        }, () => {
            this.stopTimeout()
            this.setTimeout()
        })
    },
    // 设置动画
    setTimeout () {
        if (this.data.imData && this.data.imData.length) {
            let time = 0
            this.data.imData.forEach((v, k) => {
                time += v.delay
                this.timeout.push(setTimeout(() => {
                    this.setData({
                        [`imData[${k}].animate`]: true,
                    })
                    // 清除标题动画
                    if (this.titleTimeout) {
                        clearTimeout(this.titleTimeout)
                        this.titleTimeout = null
                    }
                    // 设置标题
                    let title = this.data.author.nickName
                    if (k + 1 < this.data.imData.length) {
                        if (this.data.imData[k + 1] && this.data.imData[k + 1].type !== 'my') {
                            title = `${this.data.author.nickName}正在输入中...`
                        }
                        // 延迟设置标题
                        this.titleTimeout = setTimeout(() => {
                            this.setTitle(title)
                        }, 800)
                    } else {
                        // 最后一条数据发完后马上重置标题
                        this.titleTimeout = setTimeout(() => {
                            this.setTitle(title)
                            this.setData({
                                againStatus: true, // 允许点击再玩一次
                            })
                        }, 800)
                    }
                }, time))
            })
        }
    },
    // 停止动画
    stopTimeout () {
        // 清除标题动画
        if (this.titleTimeout) {
            clearTimeout(this.titleTimeout)
            this.titleTimeout = null
        }
        // 清除聊天动画
        if (this.timeout && this.timeout.length) {
            // 停止动画
            this.timeout.forEach(v => {
                if (v) {
                    clearTimeout(v)
                    v = null
                }
            })
            this.timeout = [] // 重置延迟对象
        }
    },
    // 动态设置标题
    setTitle (title = '') {
        wx.setNavigationBarTitle({
            title,
            fail: err => {
                console.error('调用wx.setNavigationBarTitle接口失败', err)
            },
        })
    },
    // 获取图片信息
    getImageInfo ({imgUrl = '', success = () => {}, fail = () => {}, complete = () => {}} = {}) {
        if (imgUrl) {
            wx.getImageInfo({
                src: imgUrl,
                success: res => {
                    if (success && typeof success === 'function') {
                        success(res)
                    }
                },
                fail: err => {
                    if (fail && typeof fail === 'function') {
                        fail(err)
                    }
                },
                complete: r => {
                    if (complete && typeof complete === 'function') {
                        complete(r)
                    }
                },
            })
        } else {
            console.error('缺少图片URL')
        }
    },
    // 将聊天数据替换回车
    crlf (data = []) {
        if (!data && data.length) {
            return []
        } else {
            // 动态判断延迟
            const dur = (text = '') => {
                let duration = 1
                if (text && text.length > 10) {
                    duration = Math.ceil(text.length / 5) / 4
                }
                return duration * 1000
            }
            // 替换成回车
            const transform = (text = '') => {
                if (text) {
                    text = text.replace(/\|/g, '\n')
                }
                return text
            }
            data.forEach(v => {
                if (v && v.text) {
                    v.delay = dur(v.text)
                    v.text = transform(v.text)
                }
            })
            return data
        }
    },
    // 再玩一次
    playAgain () {
        // 是否允许重置
        if (this.data.againStatus) {
            this.initPage()
        }
    },
})
