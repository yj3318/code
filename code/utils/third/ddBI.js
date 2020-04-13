// 全局变量，回头存到utils/config.js中
const ddBIKey = 'a62c8307891df356' // 接口秘钥
const DD_BI_API = 'http://testdataback.dangdang.com/miniprogram.php' // 测试环境
// const DD_BI_API = 'https://databack.dangdang.com/miniprogram.php' // 正式环境
!function (envObj, func) {
    if ("object" == typeof exports && "undefined" != typeof module) {
        module.exports = func()
    } else {
        if ("function" == typeof define && define.amd) {
            define(func) 
        } else {
            envObj.DdBI = func()
        }
    }
} (this,
function () {
    // 初始化执行队列及队列方法
    function queueFunc () {
        this.concurrency = 4 // 当前执行promise对象的数量
        this.queue = [] // 等待队列
        this.tasks = [] // 任务队列
        this.activeCount = 0 // promise计数
        var that = this // 当前对象
        // 压入任务队列方法
        this.push = function (promise) {
            this.tasks.push(new Promise(function (resolve, reject) {
                var ajax = function () {
                    that.activeCount++
                    promise().then(function (n) {
                        resolve(n)
                    }).then(function () {
                        that.next()
                    })
                }
                // 如果小于4个的请求，直接请求接口，否则加入到执行队列中
                if (that.activeCount < that.concurrency) {
                    ajax()
                } else {
                    that.queue.push(ajax)
                }
            }))
        }
        // 执行全部任务方法
        this.all = function () {
            return Promise.all(this.tasks)
        }
        // 将执行完的任务清除出等待队列并执行
        this.next = function () {
            that.activeCount--
            // 如果队列中的请求多于1个，则pull出第一个并执行
            if (that.queue.length > 0) {
                that.queue.shift()()
            }
        }
    }
    // 大数据埋点队列
    function ddBIQueueFunc () {
        this.request = [] // 请求队列，临时破放请求
        this.updata = false // 
        this.push = function (promisen) {
            // 当请求队列中有大于8个的请求时，去执行一次自动生成openid的操作，不知是为什么！
            if (this.request.length >= 8 && !this.updata) {
                this.updata = true
            }
            // 当请求队列大于10个的时候，则把第一个丢弃，可能是因为小程序规定只能有10个并发的原因
            if (this.request.length >= 10) {
                this.request.shift()
                this.request.push(promise)
            } else {
                this.request.push(promise)
            }
        }
        // 合并执行队列
        this.concat = function () {
            this.request.map(function (promise) {
                wx.Queue.push(promise)
            })
            this.request = [] // 合并完后清空请求队列
        }
    }
    // 大数据对象
    function ddBIStat (obj) {
        this.app = obj
    }
    // pages的onLoad触发事件
    function pageLoadEvent (params) {
        addDdBIQueue(params)
    }
    // page的onShow触发事件
    function pageShowEvent() {
        sn = this.route
        lifeMD("page", "show")
        rn = false
    }
    // page的onShareAppMessage触发事件
    function pageShareAppMessgeEvent (shareParams) {
        isClickShare = true
        var t = urlParams2Obj(shareParams.path),
            e = {}
        // 保存阿拉丁的ald_share_src参数
        for (var o in wsr.query) {
            if ("ald_share_src" === o) {
                e[o] = wsr.query[o]
            }
        }
        var r = ""
        if (shareParams.path.indexOf("?") == -1) {
            r = shareParams.path + "?"
        } else {
            shareParams.path.substr(0, shareParams.path.indexOf("?")) + "?"
        }
        if ("" !== t) {
            for (var o in t) {
                e[o] = t[o]
            }
        }
        if (e.ald_share_src) {
            if (e.ald_share_src.indexOf(getAldUuid) == -1 && e.ald_share_src.length < 200) {
                e.ald_share_src = e.ald_share_src + "," + getAldUuid
            } else {
                e.ald_share_src = getAldUuid
            }
        }
        for (var i in e) {
            if (i.indexOf("ald") == -1) {
                r += i + "=" + e[i] + "&"
            }
        }
        shareParams.path = r + "ald_share_src=" + e.ald_share_src
        eventMD("event", "ald_share_status", shareParams)
        return shareParams
    }
    // 生成随机udid
    function getRandomUuid () {
        function randomPart () {
            return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
        }
        return randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart()
    }
    // 将埋点请求压入执行队列
    const md5 = require('./md5')
    function addDdBIQueue (params) {
        let ajax = () => {
            return new Promise(function(reslove, reject) {
                params.time = new Date().getTime() // 收集时间  毫秒级13位时间戳（new Date().getTime()）
                params.permanentid = wx.getStorageSync('permanent_id') || '' // 个人用户标识
                params.udid = wx.getStorageSync('udid') || '' // 设备标识
                params.unionid = wx.getStorageSync('my_unionid') || '' // 渠道ID  推广或广告
                params.code = md5(params.time + ddBIKey + params.permanentid) // token验证 生成规则:code=md5(收集时间戳 + 密钥 + permanentid)
                params.wechat_user = '' // 微信用户信息
                wx.getSystemInfo({
                    success: res => {
                        if (wx.getSetting) {
                            wx.getSetting({
                                success: res => {
                                    if (res && res.authSetting && res.authSetting['scope.userInfo']) {
                                        wx.getUserInfo({
                                            success: res => {
                                                params.wechat_user = res.userInfo.nickName
                                            },
                                        })
                                    }
                                },
                            })
                        }
                    },
                })
                params.url = '' // 当前页面url
                const pages = getCurrentPages() // 获取加载的页面
                const currentPage = pages[pages.length-1] // 获取当前页面的对象
                const options = currentPage.options // 如果要获取url中所带的参数可以查看options
                params.url = currentPage.route // 当前页面url
                let urlParams = ''
                let andFlag = false
                for (let i in options) {
                    if (andFlag) {
                        urlParams += '&'
                    } else {
                        urlParams = true
                    }
                    urlParams += i + '=' + options[i]
                }
                if (urlParams) {
                    params.url += '?' + urlParams
                }
                // 请求
                wx.request({
                    url: DD_BI_API,
                    data: params,
                    method: "POST",
                    success: res => reslove(res),
                    fail: err => reslove(err),
                })
            })
        }
        wx.Queue.push(ajax) // 加入任务队列
    }
    // 拷贝传参对象
    function copyParams () {
        var temp = {}
        for (var i in params) {
            temp[i] = params[i]
        }
        return temp
    }
    // 得到用户头像文件名
    function getAvatarFileName (avatarArr) {
        for (var t = "", e = 0; e < avatarArr.length; e++) {
            avatarArr[e].length > t.length && (t = avatarArr[e])
        }
        return t
    }
    // 生成当前大于现在的随机时间戳
    function getRandomTimeStamp() {
        return "" + Date.now() + Math.floor(1e7 * Math.random())
    }
    // 过滤参数为rawData及errMsg字段
    function filterObject (obj) {
        var t = {}
        for (var e in obj) {
            if ("rawData" != e && "errMsg" != e) {
                t[e] = obj[e]
            }
        }
        return t
    }
    // 路径参数生成对象
    function urlParams2Obj (url) {
        if (url.indexOf("?") == -1) {
            return ""
        }
        var obj = {}
        url.split("?")[1].split("&").forEach(function (v) {
            var paramsArr = v.split("=")
            obj[paramsArr[0]] = paramsArr[i]
        })
        return obj
    }
    // 判断传入参数的二级是否还为对象
    function isDeepObject (obj) {
        for (var t in obj) {
            if ("object" == typeof obj[t] && null !== obj[t]) {
                return true
            }
        }
        return false
    }
    // 自定义埋点
    function customEvent (ev, evName) {
        var e = copyParams()
        e.ev = ev
        e.life = evName
        e.ec = errorCount
        e.dr = Date.now() - currentRandomTimeStamp
        if (X) {
            e.qr = X
            e.sr = X
        }
        if (F) {
            e.usr = F
        }
        addDdBIQueue(e)
    }
    // 生命周期函数埋点
    function lifeMD (ev, life) {
        var e = copyParams() // 拷贝传参
        e.ev = ev // 发起事件
        e.life = life // 触发的生命周期事件
        e.pp = sn
        e.pc = an
        e.dr = Date.now() - currentRandomTimeStamp
        if (isClickShare) {
            e.so = 1
            isClickShare = false
        }
        if (pageLoadParams && "{}" != JSON.stringify(pageLoadParams)) {
            e.ag = pageLoadParams
        }
        if (X) {
            e.qr = X
            e.sr = X
        }
        if (F) {
            e.usr = F
        }
        if (rn) {
            e.ps = 1
        }
        if (!on) {
            cn = sn
            on = true
            e.ifp = on
            e.fp = sn
        }
        addDdBIQueue(e)
    }
    // 事件埋点
    function eventMD (ev, evName, params) {
        var obj = copyParams()
        obj.ev = ev // 事件名称
        obj.tp = evName // 事件说明
        obj.dr = Date.now() - currentRandomTimeStamp
        if (params) {
            obj.ct = params
        }
        addDdBIQueue(obj)
    }
    // 劫持小程序原生事件(重要)
    function hijackEvent (that, evName, func) {
        if (that[evName]) {
            // 如果有原生事件，则在之前插入埋点事件
            var originalFunc = that[evName]
            that[evName] = function (params) {
                func.call(this, params, evName)
                originalFunc.call(this, params)
            }
        } else {
            // 没有原生事件，则直接执行埋点事件
            that[evName] = function (params) {
                func.call(this, params, evName)
            }
        }
    }
    // 劫持page级事件
    function hijackPageEvent (that) {
        var t = {}
        for (var e in that) {
            if ("onLoad" !== e) {
                t[e] = that[e]
            }
        }
        t.onLoad = function (params) {
            pageLoadEvent.call(this, params)
            if ("function" == typeof that.onLoad) {
                that.onLoad.call(this, params)
            }
        }
        return t
    }
    if (void 0 === wx.Queue) {
        wx.Queue = new queueFunc
        wx.Queue.all()
    }
    var client = "7.3.0", // 阿拉丁版本
        domain = "https://log.aldwx.com/", // 埋点请求的域名
        b = "wx",
        // 获取当前小程序的appId
        getMiniAppId = function() {
            // void 0 返回 undefined
            // return void 0 === wx.getAccountInfoSync ? "" : wx.getAccountInfoSync().miniProgram.appId.split("").map(function (n) {
                // return n.charCodeAt(0) + 9
            // }).join("-")
            return ""
        } (),
        timeStamp = getRandomTimeStamp(),
        appLaunchRandomTimeStamp = "", // onLaunch时生成的大于当前的随机时间戳
        currentRandomTimeStamp = 0, // 大于当前的随机时间戳
        currentTimeStamp = 0, // 当前时间戳
        sessionId = "",
        // 获取openid
        getOpenId = function () {
            var openId = ""
            try {
                openId = wx.getStorageSync("ddBIstat_op")
            } catch (e) {}
            return openId
        } (),
        userAvatar = "", // 用户头像
        sort = 0, // 事件序号，从0开始递增
        wsr = "", // 进入页面时的页面信息，例：{"scene":1001,"path":"pages/index/index","query":{},"referrerInfo":{}}
        ifo = "", // 参数ifo到值，不知道是什么意思
        // 获取阿拉丁uuid
        getAldUuid = function () {
            var uuid = ""
            try {
                uuid = wx.getStorageSync("ddBIstat_uuid")
            } catch(e) {
                uuid = "uuid_getstoragesync"
            }
            if (uuid) {
                ifo = false
            } else {
                uuid = getRandomUuid() // 生成uuid
                try {
                    wx.setStorageSync("ddBIstat_uuid", uuid)
                    ifo = true
                } catch (e) {
                    wx.setStorageSync("ddBIstat_uuid", "uuid_getstoragesync")
                }
            }
            return uuid
        } (),
        F = "", // 阿拉丁相关参数，无用
        X = "", // 阿拉丁相关参数，无用
        Y = "", // 阿拉丁相关参数，无用
        errorCount = 0, // app onError错误计数
        nn = "",
        tn = "",
        params = {}, // 给接口传的参数对象
        on = false,
        rn = false, // 阿拉丁相关参数，无用
        sn = "",
        an = "",
        pageLoadParams = "", // 页面的onLoad参数
        cn = "",
        fn = true,
        isClickShare = false, // 是否点击过分享标识
        ln = "", // 场景值
        ddBIQueue = new ddBIQueueFunc,
        openId = ""
    wx.ddBIstat = new ddBIStat("")
    try {
        var systemInfo = wx.getSystemInfoSync()
        params.br = systemInfo.brand
        params.pm = systemInfo.model
        params.pr = systemInfo.pixelRatio
        params.ww = systemInfo.windowWidth
        params.wh = systemInfo.windowHeight
        params.lang = systemInfo.language
        params.wv = systemInfo.version
        params.wvv = systemInfo.platform
        params.wsdk = systemInfo.SDKVersion
        params.sv = systemInfo.system
    } catch (e) {}
    wx.getNetworkType({
        success: function (res) {
            params.nt = res.networkType
        }
    })
    wx.getSetting({
        success: function (res) {
            if (res.authSetting["scope.userLocation"]) {
                wx.getLocation({
                    type: "wgs84",
                    success: function (r) {
                        params.lat = r.latitude
                        params.lng = r.longitude
                        params.spd = r.speed
                    },
                })
            }
        }
    })
    // 自定义埋点发送事件
    ddBIStat.prototype.sendEvent = function (evName, params) {
        if ("" !== evName && "string" == typeof evName && evName.length <= 255) {
            if ("string" == typeof params && params.length <= 255) {
                eventMD("event", evName, params)
            } else if ("object" == typeof params) {
                if (JSON.stringify(params).length >= 255) {
                    return void console.error("自定义事件参数不能超过255个字符")
                }
                if (isDeepObject(params)) {
                    return void console.error("事件参数，参数内部只支持Number,String等类型，请参考接入文档")
                }
                for (var e in params) {
                    "number" == typeof params[e] && (params[e] = params[e] + "s##")
                }
                eventMD("event", evName, JSON.stringify(params))
            } else {
                void 0 === params ? eventMD("event", evName, false) : console.error("事件参数必须为String,Object类型,且参数长度不能超过255个字符")
            }
        } else {
            console.error("事件名称必须为String类型且不能超过255个字符")
        }
    }
    // 发送session方法
    ddBIStat.prototype.sendSession = function (sessionid) {
        if ("" === sessionid || !sessionid) {
            return void console.error("请传入从后台获取的session_key")
        }
        sessionId = sessionid
        var t = copyParams()
        t.tp = "session"
        t.ct = "session"
        t.ev = "event"
        if ("" === tn) {
            wx.getSetting({
                success: function (res) {
                    if (res.authSetting["scope.userInfo"]) {
                        wx.getUserInfo({
                            success: function (r) {
                                t.ufo = filterObject(r)
                                userAvatar = getAvatarFileName(r.userInfo.avatarUrl.split("/"))
                                if ("" !== nn) {
                                    t.gid = nn
                                }
                                addDdBIQueue(t)
                            }
                        })
                    } else {
                        if ("" !== nn) {
                            t.gid = nn
                            addDdBIQueue(t)
                        }
                    }
                }
            })
        } else {
            t.ufo = tn
            if ("" !== nn) {
                t.gid = nn
                addDdBIQueue(t)
            }
        }
    }
    // 发送openid方法
    ddBIStat.prototype.sendOpenid = function (openId) {
        if ("" === openId || !openId || 28 !== openId.length) {
            return void console.error("openID不能为空")
        }
        getOpenId = n
        wx.setStorageSync("ddBIstat_op", openId)
        var params = copyParams()
        params.tp = "openid"
        params.ev = "event"
        params.ct = "openid"
        addDdBIQueue(params)
    }
    // 设置openid方法
    ddBIStat.prototype.setOpenid = function (openIdFunc) {
        if ("function" == typeof openIdFunc) {
            openId = openIdFunc
        }
    }
    // 将阿拉丁埋点事件注入页面对象
    return function () {
        var appObj = App,
            pageObj = Page,
            componentObj = Component
        // 小程序事件
        App = function (app) {
        //     hijackEvent(app, "onLaunch", appLaunchEvent)
        //     hijackEvent(app, "onShow", appShowEvent)
        //     hijackEvent(app, "onHide", appHideEvent)
        //     hijackEvent(app, "onError", appErrorEvent)
            appObj(app)
        }
        // 页面事件
        Page = function (page) {
            var e = page.onShareAppMessage
            hijackEvent(page, "onLoad", pageLoadEvent)
            // hijackEvent(page, "onUnload", pageUnloadEvent)
            // hijackEvent(page, "onShow", pageShowEvent)
            // hijackEvent(page, "onHide", pageHideEvent)
            // hijackEvent(page, "onReachBottom", pageReachBottomEvent)
            // hijackEvent(page, "onPullDownRefresh", pagePullDownRefreshEvent)
            // 分享事件劫持
            // if (void 0 !== e && null !== e) {
            //     page.onShareAppMessage = function (params) {
            //         if (void 0 !== e) {
            //             var t = e.call(this, params)
            //             if (void 0 === t) {
            //                 t = {}
            //                 t.path = sn
            //             } else {
            //                 if (void 0 === t.path) {
            //                     t.path = sn
            //                 }
            //             }
            //             return pageShareAppMessgeEvent(t)
            //         }
            //     }
            // }
            pageObj(page)
        }
        // 组件事件
        Component = function (component) {
            try {
                // var t = component.methods.onShareAppMessage
                // hijackEvent(component.methods, "onLoad", pageLoadEvent)
                // hijackEvent(component.methods, "onUnload", pageUnloadEvent)
                // hijackEvent(component.methods, "onShow", pageShowEvent)
                // hijackEvent(component.methods, "onHide", pageHideEvent)
                // hijackEvent(component.methods, "onReachBottom", pageReachBottomEvent)
                // hijackEvent(component.methods, "onPullDownRefresh", pagePullDownRefreshEvent)
                // if (void 0 !== t && null !== t) {
                //     component.methods.onShareAppMessage = function (params) {
                //         if (void 0 !== t) {
                //             var e = t.call(this, params)
                //             if (void 0 === e) {
                //                 e = {}
                //                 e.path = sn
                //             } else {
                //                 if (void 0 === e.path) {
                //                     e.path = sn
                //                 }
                //             }
                //             return pageShareAppMessgeEvent(e)
                //         }
                //     }
                // }
                componentObj(component)
            } catch (err) {
                componentObj(component)
            }
        }
    } ()
})
