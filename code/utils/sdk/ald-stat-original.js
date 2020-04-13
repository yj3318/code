!function (envObj, func) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = func() : "function" == typeof define && define.amd ? define(func) : envObj.Ald = func()
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
                    that.activeCount++,
                    promise().then(function (n) {
                        resolve(n)
                    }).then(function () {
                        that.next()
                    })
                }
                that.activeCount < that.concurrency ? ajax() : that.queue.push(ajax)
            }))
        }
        // 执行全部任务方法
        this.all = function () {
            return Promise.all(this.tasks)
        }
        // 将执行完的任务清除出等待队列并执行
        this.next = function () {
            that.activeCount--
            that.queue.length > 0 && that.queue.shift()()
        }
    }
    // 阿拉丁埋点队列
    function aldQueueFunc () {
        this.request = [] // 请求队列
        this.updata = false // 
        this.push = function (promisen) {
            this.request.length >= 8 && !this.updata && (this.updata = true, computedOpenId()) // 当请求队列中有大于8个的请求时，去执行一次自动生成openid的操作，不知是为什么！
            this.request.length >= 10 ? (this.request.shift(), this.request.push(promise)) : this.request.push(promise) // 当请求队列大于10个的时候，则把第一个丢弃，可能是因为小程序规定只能有10个并发的原因
        }
        // 与执行队列相合并
        this.concat = function () {
            this.request.map(function (promise) {
                wx.Queue.push(promise)
            })
            this.request = [] // 清空请求队列
        }
    }
    // 如果设置了无openid，可以使用阿拉丁自己的openid来进行统计，前提是必须在useOpen设置为true才生效
    function computedOpenId() {
        "function" === typeof openId && "" === getOpenId && openId().then(function (openid) {
            28 === openid.length && (getOpenId = openid, wx.setStorageSync("aldstat_op", openid))
        })
    }
    // 阿拉丁对象
    function aldStat (obj) {
        this.app = obj
    }
    // APP的onLaunch触发事件
    function appLaunchEvent (params) {
        appLaunchRandomTimeStamp = getRandomTimeStamp()
        wsr = params // 页面参数
        ln = params.scene // 场景值
        this.aldstat = new aldStat(this)
    }
    // APP的onShow触发事件
    function appShowEvent (params) {
        computedOpenId()
        var t
        t = params.scene != ln
        ln = params.scene
        sort = 0
        wsr = params
        F = params.query.ald_share_src
        X = params.query.aldsrc || ""
        Y = params.query.ald_share_src
        fn || (ifo = false)
        fn = false
        if (!isClickShare) {
            if (0 !== currentTimeStamp && Date.now() - currentTimeStamp > 3e4) {
                timeStamp = getRandomTimeStamp()
                currentRandomTimeStamp = Date.now()
            } else {
                t && (currentRandomTimeStamp = Date.now(), timeStamp = getRandomTimeStamp())
            }
        }
        if (0 !== currentTimeStamp && Date.now() - currentTimeStamp < 3e4) {
            rn = true
        }
        if (params.query.ald_share_src && "1044" == params.scene && params.shareTicket) {
            wx.getShareInfo({
                shareTicket: params.shareTicket,
                success: function (res) {
                    nn = res,
                    eventMD("event", "ald_share_click", JSON.stringify(res))
                }
            })
        } else {
            params.query.ald_share_src && eventMD("event", "ald_share_click", 1)
            // 取到用户头像与昵称时也调用埋点事件
            if ("" === tn) {
                wx.getSetting({
                    withCredentials: true,
                    success: function (res) {
                        if (res.authSetting["scope.userInfo"]) {
                            wx.getUserInfo({
                                withCredentials: true,
                                success: function (r) {
                                    var data = copyParams()
                                    tn = r
                                    data.ufo = filterObject(r)
                                    userAvatar = getAvatarFileName(r.userInfo.avatarUrl.split("/"))
                                    addAldQueue(data)
                                }
                            })
                        }
                    },
                })
            }
        }
        customEvent("app", "show")
    }
    // APP的onHide触发事件
    function appHideEvent () {
        computedOpenId()
        currentTimeStamp = Date.now()
        if ("" === tn) {
            wx.getSetting({
                success: function (res) {
                    res.authSetting["scope.userInfo"] && wx.getUserInfo({
                        withCredentials: true,
                        success: function (r) {
                            tn = r
                            userAvatar = getAvatarFileName(r.userInfo.avatarUrl.split("/"))
                            var t = copyParams()
                            t.ufo = filterObject(r)
                            addAldQueue(t)
                        }
                    })
                }
            })
        }
        customEvent("app", "hide")
    }
    // APP的onError触发事件
    function appErrorEvent (n) {
        errorCount++
        eventMD("event", "ald_error_message", n)
    }
    // pages的onLoad触发事件
    function pageLoadEvent (params) {
        pageLoadParams = params
    }
    // page的onShow触发事件
    function pageShowEvent() {
        sn = isMpvuePluginFlag ? this.$mp.page.route: this.route,
        lifeMD("page", "show"),
        rn = false
    }
    // page的hide触发事件
    function pageHideEvent () {
        an = sn
    }
    // page的unload触发事件
    function pageUnloadEvent () {
        an = sn
    }
    // page的onPullDownRefresh触发事件
    function pagePullDownRefreshEvent () {
        eventMD("event", "ald_pulldownrefresh", 1)
    }
    // page的onReachBottom触发事件
    function pageReachBottomEvent () {
        eventMD("event", "ald_reachbottom", 1)
    }
    // page的onShareAppMessage触发事件
    function pageShareAppMessgeEvent (shareParams) {
        isClickShare = true
        var t = m(shareParams.path),
            e = {}
        for (var o in wsr.query) "ald_share_src" === o && (e[o] = wsr.query[o]);
        var r = "";
        if (r = shareParams.path.indexOf("?") == -1 ? shareParams.path + "?": shareParams.path.substr(0, shareParams.path.indexOf("?")) + "?", "" !== t) for (var o in t) e[o] = t[o]
        e.ald_share_src ? e.ald_share_src.indexOf(getAldUuid) == -1 && e.ald_share_src.length < 200 && (e.ald_share_src = e.ald_share_src + "," + getAldUuid) : e.ald_share_src = getAldUuid
        for (var i in e) i.indexOf("ald") == -1 && (r += i + "=" + e[i] + "&");
        return shareParams.path = r + "ald_share_src=" + e.ald_share_src,
        eventMD("event", "ald_share_status", shareParams),
        shareParams
    }
    // 生成随机udid
    function getRandomUuid () {
        function randomPart () {
            return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
        }
        return randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart() + randomPart()
    }
    // 将埋点请求压入执行队列
    function addAldQueue (params) {
        function ajax() {
            return new Promise(function(reslove, reject) {
                var header = {
                    AldStat: "MiniApp-Stat",
                    se: sessionId || "",
                    op: getOpenId || "",
                    img: userAvatar || "",
                }
                "" === getMiniAppId || (header.ai = getMiniAppId)
                wx.request({
                    url: domain + "d.html",
                    data: params,
                    header: header,
                    method: "GET",
                    success: function (res) {
                        reslove(200 == res.statusCode ? "" : "status error")
                    },
                    fail: function() {
                        reslove("fail")
                    }
                })
            })
        }
        sort++
        params.at = timeStamp,
        params.uu = getAldUuid,
        params.v = client,
        params.ak = aldStatConf.app_key.replace(/(\t)|(\s)/g, ""),
        params.wsr = wsr,
        params.ifo = ifo,
        params.rq_c = sort,
        params.ls = appLaunchRandomTimeStamp,
        params.te = b,
        params.et = Date.now(),
        params.st = Date.now(),
        aldStatConf.useOpen ? "" === getOpenId ? adlQueue.push(ajax) : (wx.Queue.push(ajax), adlQueue.concat()) : wx.Queue.push(ajax) // 压入执行队列
    }
    // 拷贝传参对象
    function copyParams () {
        var temp = {};
        for (var i in params) temp[i] = params[i]
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
            "rawData" != e && "errMsg" != e && (t[e] = obj[e])
        }
        return t
    }
    function m(n) {
        if (n.indexOf("?") == -1) return "";
        var t = {};
        return n.split("?")[1].split("&").forEach(function(n) {
            var e = n.split("=")[1];
            t[n.split("=")[0]] = e
        }),
        t
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
        addAldQueue(e)
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
        addAldQueue(e)
    }
    // 事件埋点
    function eventMD (ev, evName, params) {
        var obj = copyParams()
        obj.ev = ev // 事件名称
        obj.tp = evName // 事件说明
        obj.dr = Date.now() - currentRandomTimeStamp
        params && (obj.ct = params)
        addAldQueue(obj)
    }
    // 劫持小程序原生事件(重要)
    function hijackEvent (that, evName, func) {
        if (that[evName]) {
            var originalFunc = that[evName]
            that[evName] = function (params) {
                func.call(this, params, evName),
                originalFunc.call(this, params)
            }
        } else {
            that[evName] = function (params) {
                func.call(this, params, evName)
            }
        }
    }
    // 劫持APP级事件
    function hijackAppEvent (that) {
        var t = {}
        for (var e in that) {
            // 删除以下事件
            if ("onLaunch" !== e && "onShow" !== e && "onHide" !== e && "onError" !== e) {
                t[e] = that[e]
            }
        }
        // 重置以上事件
        t.onLaunch = function (params) {
            r.call(this, params)
            if ("function" == typeof that.onLaunch) {
                that.onLaunch.call(this, t)
            }
        }
        t.onShow = function (params) {
            i.call(this, params)
            if (that.onShow && "function" == typeof that.onShow) {
                that.onShow.call(this, params)
            }
        }
        t.onHide = function () {
            s.call(this)
            if (that.onHide && "function" == typeof that.onHide) {
                taht.onHide.call(this)
            }
        }
        t.onError = function (params) {
            a.call(this, params)
            if (that.onError && "function" == typeof that.onError) {
                that.onError.call(this, params)
            }
        }
        return t
    }
    // 劫持page级事件
    function hijackPageEvent (that) {
        var t = {}
        for (var e in that) {
            if ("onLoad" !== e && "onShow" !== e && "onHide" !== e && "onUnload" !== e && "onPullDownRefresh" !== e && "onReachBottom" !== e && "onShareAppMessage" !== e) {
                t[e] = that[e]
            }
        }
        t.onLoad = function (params) {
            u.call(this, params)
            if ("function" == typeof that.onLoad) {
                that.onLoad.call(this, params)
            }
        }
        t.onShow = function (params) {
            c.call(this)
            if ("function" == typeof that.onShow) {
                that.onShow.call(this, params)
            }
        }
        t.onHide = function (params) {
            f.call(this)
            if ("function" == typeof that.onHide) {
                that.onHide.call(this, params)
            }
        }
        t.onUnload = function (params) {
            h.call(this)
            if ("function" == typeof that.onUnload) {
                that.onUnload.call(this, params)
            }
        }
        t.onReachBottom = function (params) {
            pageReachBottomEvent()
            if (that.onReachBottom && "function" == typeof that.onReachBottom) {
                that.onReachBottom.call(this, params)
            }
        }
        t.onPullDownRefresh = function (params) {
            pagePullDownRefreshEvent()
            if (that.onPullDownRefresh && "function" == typeof n.onPullDownRefresh) {
                that.onPullDownRefresh.call(this, params)
            }
        }
        if (that.onShareAppMessage && "function" == typeof that.onShareAppMessage) {
            t.onShareAppMessage = function (params) {
                var e = that.onShareAppMessage.call(this, params)
                if (void 0 === e) {
                    e = {}
                    e.path = this.route
                } else {
                    if (void 0 === e.path) {
                        e.path = this.route
                    }
                }
                return pageShareAppMessgeEvent.call(this, e)
            }
        }
        return t
    }
    function L(n) {
        return App(hijackAppEvent(n))
    }
    function O(n) {
        return Page(hijackPageEvent(n))
    }
    function k(n) {
        return hijackPageEvent(n)
    }
    var aldStatConf = require("./ald-stat-conf")
    void 0 === wx.Queue && (wx.Queue = new queueFunc, wx.Queue.all())
    aldStatConf.useOpen && console.warn("提示：开启了useOpen配置后，如果不上传用户opendId则不会上报数据。")
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
        isMpvuePluginFlag = false,
        timeStamp = getRandomTimeStamp(),
        appLaunchRandomTimeStamp = "", // onLaunch时生成的大于当前的随机时间戳
        currentRandomTimeStamp = 0, // 大于当前的随机时间戳
        currentTimeStamp = 0, // 当前时间戳
        sessionId = "",
        // 获取openid
        getOpenId = function () {
            var openId = ""
            try {
                openId = wx.getStorageSync("aldstat_op")
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
                uuid = wx.getStorageSync("aldstat_uuid")
            } catch(e) {
                uuid = "uuid_getstoragesync"
            }
            if (uuid) {
                ifo = false
            } else {
                uuid = getRandomUuid() // 生成uuid
                try {
                    wx.setStorageSync("aldstat_uuid", uuid)
                    ifo = true
                } catch (e) {
                    wx.setStorageSync("aldstat_uuid", "uuid_getstoragesync")
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
        rn = false,
        sn = "",
        an = "",
        pageLoadParams = "", // 页面的onLoad参数
        cn = "",
        fn = true,
        isClickShare = false, // 是否点击过分享标识
        ln = "", // 场景值
        adlQueue = new aldQueueFunc,
        openId = ""
    wx.aldstat = new aldStat("")
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
            res.authSetting["scope.userLocation"] ? wx.getLocation({
                type: "wgs84",
                success: function (r) {
                    params.lat = r.latitude
                    params.lng = r.longitude
                    params.spd = r.speed
                }
            }) : aldStatConf.getLocation && wx.getLocation({
                type: "wgs84",
                success: function (r) {
                    params.lat = r.latitude
                    params.lng = r.longitude
                    params.spd = r.speed
                }
            })
        }
    })
    // 自定义埋点发送事件
    aldStat.prototype.sendEvent = function (evName, params) {
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
    aldStat.prototype.sendSession = function (sessionid) {
        if ("" === sessionid || !sessionid) {
            return void console.error("请传入从后台获取的session_key");
        }
        sessionId = sessionid;
        var t = copyParams();
        t.tp = "session",
        t.ct = "session",
        t.ev = "event",
        "" === tn ? wx.getSetting({
            success: function (res) {
                res.authSetting["scope.userInfo"] ? wx.getUserInfo({
                    success: function (r) {
                        t.ufo = filterObject(r),
                        userAvatar = getAvatarFileName(r.userInfo.avatarUrl.split("/")),
                        "" !== nn && (t.gid = nn),
                        addAldQueue(t)
                    }
                }) : "" !== nn && (t.gid = nn, addAldQueue(t))
            }
        }) : (t.ufo = tn, "" !== nn && (t.gid = nn), addAldQueue(t))
    }
    // 发送openid方法
    aldStat.prototype.sendOpenid = function (openId) {
        if ("" === openId || !openId || 28 !== openId.length) {
            return void console.error("openID不能为空")
        }
        getOpenId = n
        wx.setStorageSync("aldstat_op", openId)
        var params = copyParams()
        params.tp = "openid"
        params.ev = "event"
        params.ct = "openid"
        addAldQueue(params)
    }
    // 设置openid方法
    aldStat.prototype.setOpenid = function (openIdFunc) {
        if ("function" == typeof openIdFunc) {
            openId = openIdFunc, computedOpenId()
        }
    }
    // 将阿拉丁埋点事件注入页面对象
    return function () {
        var appObj = App,
            pageObj = Page,
            componentObj = Component
        // 小程序事件
        App = function (app) {
            hijackEvent(app, "onLaunch", appLaunchEvent)
            hijackEvent(app, "onShow", appShowEvent)
            hijackEvent(app, "onHide", appHideEvent)
            hijackEvent(app, "onError", appErrorEvent)
            appObj(app)
        }
        // 页面事件
        Page = function (page) {
            var e = page.onShareAppMessage
            hijackEvent(page, "onLoad", pageLoadEvent)
            hijackEvent(page, "onUnload", pageUnloadEvent)
            hijackEvent(page, "onShow", pageShowEvent)
            hijackEvent(page, "onHide", pageHideEvent)
            hijackEvent(page, "onReachBottom", pageReachBottomEvent)
            hijackEvent(page, "onPullDownRefresh", pagePullDownRefreshEvent)
            // 分享事件劫持
            if (void 0 !== e && null !== e) {
                page.onShareAppMessage = function (params) {
                    if (void 0 !== e) {
                        var t = e.call(this, params)
                        if (void 0 === t) {
                            t = {}
                            t.path = sn
                        } else {
                            if (void 0 === t.path) {
                                t.path = sn
                            }
                        }
                        return pageShareAppMessgeEvent(t)
                    }
                }
            }
            pageObj(page)
        }
        // 组件事件
        Component = function (component) {
            try {
                var t = component.methods.onShareAppMessage
                MhijackEvent(component.methods, "onLoad", pageLoadEvent)
                hijackEvent(component.methods, "onUnload", pageUnloadEvent)
                hijackEvent(component.methods, "onShow", pageShowEvent)
                hijackEvent(component.methods, "onHide", pageHideEvent)
                hijackEvent(component.methods, "onReachBottom", pageReachBottomEvent)
                hijackEvent(component.methods, "onPullDownRefresh", pagePullDownRefreshEvent)
                if (void 0 !== t && null !== t) {
                    component.methods.onShareAppMessage = function (params) {
                        if (void 0 !== t) {
                            var e = t.call(this, params)
                            if (void 0 === e) {
                                e = {}
                                e.path = sn
                            } else {
                                if (void 0 === e.path) {
                                    e.path = sn
                                }
                            }
                            return pageShareAppMessgeEvent(e)
                        }
                    }
                }
                componentObj(component)
            } catch (err) {
                componentObj(component)
            }
        }
    } ()
})
