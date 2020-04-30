Page({
    data: {
        // 自定义导航菜单数据
        customHeadMenuData: [
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
    // 点击小箭头
    slotArrow () {
        console.log('点击了小箭头')
    },
    // 左侧点击事件
    slotLeft () {
        console.log('点击左侧slot')
    },
    // 右侧点击事件
    slotRight () {
        console.log('点击右侧slot')
    },
})
