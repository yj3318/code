/*
 * 自定义顶部导航
 * 由于顶部导航的高度是固定的，所以所有的单位全部为px
 */
const app = getApp()
Component({
    options: {
        multipleSlots: true, // 在组件定义时的选项中启用多slot支持
        styleIsolation: 'apply-shared', // 详情请看https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
    },
    properties: {
        // 样式模式 simple:无背景边线
        mode: {
            type: String,
            value: '',
        },
        // 背景颜色
        backgroundColor: {
            type: String,
            value: '#ffffff',
        },
        // 背景图片
        backgroundImage: {
            type: String,
            value: 'none',
        },
        // 定义显示层级
        zIndex: {
            type: Number,
            value: 999999,
        },
        // 标题文字
        title: {
            type: String,
            value: '',
        },
        // icon颜色
        iconColor: {
            type: String,
            value: '#222'
        },
        // 标题颜色
        titleColor: {
            type: String,
            value: '#000000',
        },
        // 标题字号
        titleFontSize: {
            type: Number,
            value: 14,
        },
        // 下拉列表数据
        menuData: {
            type: Array,
            value: [
                {
                    name: '首页',
                    iconfont: 'iconfont-home',
                    url: '/pages/index/index',
                },
                {
                    name: '搜索',
                    iconfont: 'iconfont-search',
                    url: '/pages/search/search',
                },
                {
                    name: '拼团',
                    iconfont: 'iconfont-groupBuy',
                    url: '/pages/groupBuy/groupList',
                },
                {
                    name: '领券',
                    iconfont: 'iconfont-couponCenter',
                    url: '/pages/coupon/couponCenter',
                },
            ],
        },
        // 返回按钮使用自定义方法，为true的话必须设置自定义的方法，否则返回无效
        hasGoBackFunction: {
            type: Boolean,
            value: false,
        },
    },
    data: {
        navH: 0, // 顶部导航总高度
        navAreaH: 0, // 文字区域高度
        navAreaSideW: 0, // 文字区域两边padding宽度
        navAreaT: 0, // 文字区域距顶高度
        showFlag: false, // 是否显示顶部导航
        menuH: 0, // 显示的菜单高度，用于动画
        isShowMenu: false, // 是否显示菜单，默认为false
        platform: '', // 平台
        capsuleW: 0, // 右上角胶囊宽，带边线
        capsuleH: 0, // 右上角胶囊高，带边线
        capsuleInnerH: 0, // 左上角胶囊内部高
        capsuleMiddle: 0, // 左上角胶囊中间位置
    },
    ready () {
        if (app.commonJs.compareVersion('', '2.5.2') >= 0) {
            let menuObj = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect() || ''
            if (menuObj) {
                // 如果返回值有问题，则用默认值替换
                if (!menuObj.bottom) {
                    menuObj.bottom = 58
                }
                if (!menuObj.height) {
                    menuObj.height = 32
                }
                if (!menuObj.left) {
                    menuObj.left = 278
                }
                if (!menuObj.right) {
                    menuObj.right = 365
                }
                if (!menuObj.top) {
                    menuObj.top = 26
                }
                if (!menuObj.width) {
                    menuObj.width = 87
                }
            } else {
                console.error('无法获取到胶囊信息，不能判断头部高度，将使用iPhone6默认值')
                menuObj = {
                    bottom: 58,
                    height: 32,
                    left: 278,
                    right: 365,
                    top: 26,
                    width: 87,
                }
            }
            let navH = menuObj.bottom + 6 || 0 // 6为胶囊下边距
            let navAreaH = navH - menuObj.top + 6 || 0 // 6为胶囊上边距
            let navAreaSideW = menuObj.right - menuObj.left + 10 * 2 || 0 // 10为胶囊右边距
            let navAreaT = navH - navAreaH || 0
            let menuH = (this.data.menuData && this.data.menuData.length || 0) * 46 + 7 // 46为每个菜单高度，7为小箭头高度
            let platform = app.commonJs.systemInfo.platform.toLowerCase()
            let middle = menuObj.width - (platform.indexOf('ios') >= 0 ? .5 : 1) * 2
            if (Math.floor(middle / 2) * 2 == middle) {
                // 正好整除
                middle = middle / 2 - (platform.indexOf('ios') >= 0 ? .5 : 1)
            } else {
                // 不能整除，则需要次middle的值向左移1
                middle = Math.floor(middle / 2)
            }
            this.setData({
                showFlag: true,
                navH,
                navAreaH,
                navAreaSideW,
                navAreaT,
                menuH,
                capsuleW: menuObj.width || 0,
                capsuleH: menuObj.height || 0,
                capsuleInnerH: menuObj.height - (platform.indexOf('ios') >= 0 ? .5 : 1) * 2,
                capsuleMiddle: middle,
                platform: platform.indexOf('android') >= 0 ? 'android' : (platform.indexOf('ios') >= 0 ? 'ios' : ''),
            })
            // 将自定义导航栏高度通知前页面
            this.triggerEvent('updateCustomNavigatorHeight', {navH}, {})
        } else {
            console.warn('微信SDK版本过低，不支持自定义导航组件')
        }
    },
    methods: {
        // 返回功能
        goBack () {
            if (this.data.hasGoBackFunction) {
                // 执行自定义事件
                this.triggerEvent('customNavigatorGoBack', {}, {})
            } else {
                let pages = getCurrentPages()
                if (pages.length > 1) {
                    // 返回上一级
                    wx.navigateBack({delta: 1})
                } else {
                    // 返回首页
                    app.commonJs.jumpUrl({url: '/pages/index/index'})
                }
            }
        },
        // 菜单功能
        controlMenu ({set = ''} = {}) {
            let flag = true
            if (set == 'show') {
                // 显示
                flag = true
            } else if (set === 'hide') {
                // 隐藏
                flag = false
            } else {
                // 改变状态
                if (this.data.isShowMenu) {
                    flag = false
                }
            }
            this.setData({
                isShowMenu: flag,
            })
        },
        // 菜单跳转
        menuJump (e) {
            // 大数据埋点
            let data = e.currentTarget.dataset
            app.ddBIstat && app.ddBIstat.sendEvent(data.url || '', data.area || '', data.pos || '', data.desc || '')

            // 关闭菜单
            this.controlMenu()

            // 跳转
            let url = e.currentTarget.dataset.url
            if (url) {
                app.commonJs.jumpUrl({url})
            }
        },
    },
})
