const app = getApp()
// import commonService from '../../utils/commonService'
Page({
    data: {
        iconData: {
            first: [
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework1',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework3',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework5',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework7',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework9',
                },
            ],
            second: [
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework2',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework4',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework6',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework8',
                },
                {
                    iconImg: "../../images/icon-framework.png",
                    iconLinkUrl: "",
                    rank: 'framework10',
                },
            ],
            scroll: {
                width: 0,
                left: 0,
            },
        },
        webpImage: 'https://img3m4.ddimg.cn/78/9/1429696104-1_e_1.jpg',
    },
    scrollW: 100, // CSS中设置的滚去区域宽度，用于判断滚动位置，后面会减去当前宽度
    windowW: app.commonJs.systemInfo.windowWidth / app.commonJs.systemInfo.rpx2px, // 页面宽度rpx
    onLoad (params) {
        let iconData = {}
        let data = [
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/tushu-1-1542197591.png",
                iconLinkUrl: "/pages/ranking/ranking?bang_name=newhotsell",
                rank: 1,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/1yuankanjia-1543910981.png",
                iconLinkUrl: "/pages/bargain/bargainList",
                rank: 2,
            },
            {
                iconImg: "https://img60.ddimg.cn/upload_img/00788/1/miaosha-3-1542197828.png",
                iconLinkUrl: "/pages/seckill/seckill",
                rank: 3,
            },
            {
                iconImg: "https://img63.ddimg.cn/upload_img/00788/1/cuxiao-4-1542197855.png",
                iconLinkUrl: "/pages/search/promotionList",
                rank: 4,
            },
            {
                iconImg: "https://img60.ddimg.cn/upload_img/00788/1/pintuan-5-1542197891.png",
                iconLinkUrl: "/pages/groupBuy/groupList",
                rank: 5,
            },
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/3-1555404826.png",
                iconLinkUrl: "/pages/redEnvelope/index?activity_id=49",
                rank: 6,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/1-1560256921.png",
                iconLinkUrl: "/pages/onePennyLuckyDraw/activityList",
                rank: 7,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/0yuan-8-1542250621.png",
                iconLinkUrl: "/pages/zeroYuan/activityList",
                rank: 8,
            },
            {
                iconImg: "https://img63.ddimg.cn/upload_img/00777/1/1-1556507868.png",
                iconLinkUrl: "/pages/signInAward/index",
                rank: 9,
            },
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/123-1560513875.gif",
                iconLinkUrl: "/pages/publicBooksIndex/index",
                rank: 10,
            },
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/tushu-1-1542197591.png",
                iconLinkUrl: "/pages/ranking/ranking?bang_name=newhotsell",
                rank: 11,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/1yuankanjia-1543910981.png",
                iconLinkUrl: "/pages/bargain/bargainList",
                rank: 12,
            },
            {
                iconImg: "https://img60.ddimg.cn/upload_img/00788/1/miaosha-3-1542197828.png",
                iconLinkUrl: "/pages/seckill/seckill",
                rank: 13,
            },
            {
                iconImg: "https://img63.ddimg.cn/upload_img/00788/1/cuxiao-4-1542197855.png",
                iconLinkUrl: "/pages/search/promotionList",
                rank: 14,
            },
            {
                iconImg: "https://img60.ddimg.cn/upload_img/00788/1/pintuan-5-1542197891.png",
                iconLinkUrl: "/pages/groupBuy/groupList",
                rank: 15,
            },
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/3-1555404826.png",
                iconLinkUrl: "/pages/redEnvelope/index?activity_id=49",
                rank: 16,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/1-1560256921.png",
                iconLinkUrl: "/pages/onePennyLuckyDraw/activityList",
                rank: 17,
            },
            {
                iconImg: "https://img62.ddimg.cn/upload_img/00788/1/0yuan-8-1542250621.png",
                iconLinkUrl: "/pages/zeroYuan/activityList",
                rank: 18,
            },
            {
                iconImg: "https://img63.ddimg.cn/upload_img/00777/1/1-1556507868.png",
                iconLinkUrl: "/pages/signInAward/index",
                rank: 19,
            },
            {
                iconImg: "https://img61.ddimg.cn/upload_img/00788/1/123-1560513875.gif",
                iconLinkUrl: "/pages/publicBooksIndex/index",
                rank: 20,
            },
        ]
        let first = []
        let second = []
        data.forEach((v, k) => {
            if (k % 2 === 0) {
                first.push(v)
            } else {
                second.push(v)
            }
        })
        iconData.first = first
        iconData.second = second
        let num = iconData.first.length
        let w = this.windowW / 5 * num
        this.scrollW = Math.floor(this.scrollW * this.windowW / w)
        iconData.scroll = {width: this.scrollW, left: 0}
        this.setData({
            iconData,
            webpImage: app.commonJs.img2Webp(this.data.webpImage),
        })
    },
    // 滑动条滚动事件
    iconScroll (e) {
        let scrollLeft = e.detail.scrollLeft / app.commonJs.systemInfo.rpx2px
        this.setData({
            'iconData.scroll.left': Math.floor(scrollLeft * this.scrollW / this.windowW),
        })
    },
    submitFormid (e) {
        // 大数据埋点
        // let data = e.currentTarget.dataset
        // app.ddBIstat && app.ddBIstat.sendEvent(data.url || '', data.area || '', data.pos || '', data.desc || '')

        // // 埋点
        // let feedReport = e.currentTarget.dataset.feedreport || false
        // let floorNo = e.currentTarget.dataset.floorno
        // if (feedReport) {
        //     wx.reportAnalytics('index_v2_feed', {
        //         tab_sort: this.tabSort,
        //         floor_no: floorNo,
        //     })
        // }
        // commonService.callMessageInterface(e, () => {
        //     app.commonJs.jumpUrl({
        //         url: e.currentTarget.dataset.url,
        //     })
        // })
    },
    imgLoad (res) {
        console.log(res)
    },
    imgError (res) {
        console.log(res)
    },
})
