const app = getApp()
import config from '../../utils/config' // 导入config
// import loginPannel from '../../component/login/login' // 导入登录组件
// import commonService from '../../utils/commonService'
Page({
    pageName: 'IM',
    data: {
        platform: '', // 平台
        // 聊天区域数据
        imData: {
            imHeight: 0,
            placeholder: '请输入想要说的话',
            value: '', // 输入文案
            imScrollJump: '', // 存储历史记录跳转ID
            scrollAnimation: 'false', // 在设置滚动条位置时是否使用动画过渡
        },
        isNoWirelessFlag: false, // 是否为离线模式
        // 无网页数据
        noWirelessData: {
            text: config.ERROR_PAGE.ERROR_TEXT.nowireless,
            noPaddingTop: true, // 是否需要padding-top
            icon: config.ERROR_PAGE.ERROR_PIC_URL.nowireless, // icon图片路径
            refreshFunc: 'refreshEvent', // 刷新函数名称
            height: 0,//高度
        },
        // 页面数据
        imPageData: [],
    },
    // 接口相关数据
    interfaceData: {
        chat: 'http://10.255.209.80:8088/base64upload/image/1',
        portrait: 'http://10.255.209.80:8088/base64upload/image/2',
        file: 'http://10.255.209.80:8088/upload/file/1',
    },
    // 聊天相关数据
    imData: {
        custId: 50100886, // 用户custId
        custIdFriend:"",
        userType: 1, // 顾客端写死1
        tenantId: 1, // 是分配的，写死1
        socketTaskId: 0, // 接口socket id
        roomId: '', // 从指令里取。长连接会通过指令返回
        sessionId: '', // 对应小程序的token
        version: '1.0', // 版本
        fromPlatform: 21, // 写死 Android是2，iphone是3，小程序21
        connId: '', // 连接ID
        isBlock: false, // 是否为黑名单用户
        area: '北京市-东城区', // 地址信息，3级地址-4级地址
        dialogerId: 0, // 对话人Id
        hasRobot: 0, // 是否有机器人
        imStatus: 0, // 聊天状态，正常 status=0;无空闲客服，等待 status=1;已过工作时间：status=2;黑名单：status=3
        lastSeq: 0, // 最后一个seq，用于历史数据调用
        pageSize: 30, // 翻页数据
        page: 0, // 当前页码
        anchorName: 'anchor', // 锚点名称
    },
    webSocketObj: null, // websocket对象
    heartJumpInterval: null, // 心跳计时器
    onLoad (params) {
        // 注册登录组件
        // new loginPannel({
        //      $this: this,
        // })
        this.setData({
            platform: app.commonJs.systemInfo.platform.toLowerCase().indexOf('android') >= 0 ? 'android' : (app.commonJs.systemInfo.platform.toLowerCase().indexOf('ios') >= 0 ? 'ios' : ''),
            'imData.imHeight': (app.commonJs.systemInfo.highWindowHeight || app.commonJs.systemInfo.windowHeight) - 100 * app.commonJs.systemInfo.rpx2px, 
        })
        this.initPage()
        // 测试上传网络头像
        // this.networkImage({imgUrl: 'https://img61.ddimg.cn/upload_img/00774/mina/default-1540894544.png'})
    },
    onUnload () {
        // 停止心跳
        clearInterval(this.heartJumpInterval)
        // 关闭webSocket连接
        this.webSocketObj.close({
            code: 1000,
            reaseon: '页面退出，正常关闭',
            success: res => {
                console.log(res)
            },
        })
    },
    initPage () {
        let address = wx.getStorageSync(config.ADDRESS_STORAGE_NAME)
        let city = address && address.cityArray && address.cityArray.name || '北京市'
        let area = address && address.areaArray && address.areaArray.name || '东城区'
        this.imData.area = city + '-' + area
        this.imData.sessionId = wx.getStorageSync('token')
        // 判断网络类型
        wx.getNetworkType({
            success: res => {
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                if(res.networkType != 'none'){
                    this.connectSocket()
                    if(this.data.isNoWirelessFlag){
                        this.setData({
                            isNoWirelessFlag: false,
                        })
                    }
                }else{
                    if(!this.data.isNoWirelessFlag){
                        this.setData({
                            isNoWirelessFlag: true,
                        })
                    }
                }
            }
        })
    },
    // 数据结构
    dataStructure ({
        module = '', // 模块名，img为纯图片，txt为纯文本，robot为机器人
        data = '', // 模块中的内容
        who = 'my', // 是否为本人所发，my为本人所发，server为服务器，robot为机器人
        seq = 0, // 消息ID，用于撤销用
        anchor = '', // 锚点名，用于定位
        sendTime = new Date().getTime(), // 发送时间，用于撤销判断
        messageStatus = 'already', // 消息状态，loading为发送中，already为已读，no为未读
    } = {}) {
        return {
            module,
            data,
            who,
            seq,
            anchor,
            sendTime,
            messageStatus,
        }
    },
    connectSocket () {
        // 连接
        this.webSocketObj = wx.connectSocket({
            url: 'ws://10.255.242.221:9600',
            // url: 'ws://192.168.87.97:9600',
            header:{
                'content-type': 'application/json',
            },
            success: res => {
                if (res) {
                    this.imData.socketTaskId = res.socketTaskId || '' 
                }
                console.log('webSocket连接成功', res)
                // 开始心跳
                if (this.heartJumpInterval) {
                    clearInterval(this.heartJumpInterval)
                }
                this.heartJumpInterval = setInterval(this.heartJump, 30000)
            },
            fail: err => {
                console.log('webSocket连接失败', err)
            },
        })
        // 监听打开事件
        this.webSocketObj.onOpen(res => {
            console.log('监听webSocket打开事件', res)
            // 建立连接(指令1)
            let data = JSON.stringify({
                msgId: new Date().getTime(),
                command: 1,
                version: this.imData.version,
                tenantId: this.imData.tenantId,
                connect: {
                    userSession: this.imData.sessionId,
                    userType: this.imData.userType,
                    fromPlatform: this.imData.fromPlatform,
                }
            })
            console.log(data)
            this.webSocketObj.send({
                data,
                success: res => {
                    console.log('建立连接', res)
                },
            })
        })
        // 监听关闭事件
        this.webSocketObj.onClose(err => {
            console.log('监听webSocket关闭事件', err)
        })
        // 监听出错事件
        this.webSocketObj.onError(err => {
            console.log('监听webSocket出错事件', err)
        })
        // 监听websocket接收到服务器事件
        this.webSocketObj.onMessage(res => {
            console.log('收到服务器消息', res)
            if (!res) {
                res = {}
            }
            if (res.data) {
                try {
                    res.data = JSON.parse((res.data))
                } catch (e) {
                    console.log(返回指令数据结构错误, res, e)
                }
            }
            // 成功建立连接(指令2)
            if (res.data && res.data.command == 2) {
                // 保存connId
                if (res.data.res && res.data.res.resMsg && !this.imData.connId) {
                    this.imData.connId = parseInt(res.data.res.resMsg)
                }
                // 开始会话(指令3)
                this.webSocketObj.send({
                    /*
                     * sourcePage与sourceContent取值
                     * 如果是从单品页进来的，那sourcePage="product"  sourceContent=对应的productId
                     * 如果是从订单详情页进来的，那sourcePage="order"  sourceContent=对应的orderId
                     * 如果是从消息中心进来的，
                     */
                    /*
                     * 如果从公益进入，则shopId与ddShopId都为0
                     */
                    /*
                     * type为聊天室类型：1：顾客-客服，2：c2c，3：group
                     */
                    data: JSON.stringify({
                        msgId: new Date().getTime(),
                        command: 3,
                        version: this.imData.version,
                        connId: this.imData.connId,
                        tenantId: this.imData.tenantId,
                        session: {
                            userId: this.imData.custId,
                            shopId: '0',
                            type: 1,
                            sourcePage: 'product',
                            sourceContent: '24370',
                            fromPlatform: this.imData.fromPlatform,
                            area: this.imData.area,
                            ddShopId: '0',
                        }
                    }),
                    success: res => {
                        console.log('开始会话', res)
                    },
                })
            }
            // 创建会话结果返回（指令4）
            if (res.data && res.data.command == 4) {
                if (res.data.sessionResp) {
                    if (res.data.sessionResp.roomId) {
                        this.imData.roomId = parseInt(res.data.sessionResp.roomId)
                    }
                    if (res.data.sessionResp.userId) {
                        this.imData.dialogerId = parseInt(res.data.sessionResp.userId)
                    }
                    if (res.data.sessionResp.hasRobot) {
                        this.imData.hasRobot = parseInt(res.data.sessionResp.hasRobot)
                    }
                    if (res.data.status) {
                        this.imData.status = parseInt(res.data.status)
                    }
                    // 获取历史消息，需要roomId做为参数
                    this.getHistory()
                }
            }
            // 结束会话（指令5）
            if (res.data && res.data.command == 5) {
                wx.showToast({icon: 'none', title: '超时，已断开连接'})
            }
            // 接收消息（指令6）
            if (res.data && res.data.command == 6) {
                console.log('接收对方发送的信息成功', res)
                // 页面中显示聊天记录
                try {
                    let content = res.data && res.data.req || ''
                    if (content && content.content) {
                        console.log(content)
                        content = JSON.parse(content.content)
                        let data = this.dataStructure({
                            module: res.data.req.msgType == 8 ? 'robot' : content.msgtype,
                            data: content || '',
                            who: res.data.req.senderType == 3 ? 'robot' : 'server',
                            sendTime: res.data.req.sendTime || '',
                        })
                        this.setData({
                            imPageData: this.data.imPageData.concat(data),
                        }, () => {
                            // 跳转到最后
                            setTimeout(() => {
                                this.setData({
                                    'imData.imScrollJump': 'anchorButton',
                                })
                            })
                        })
                    }
                } catch (e) {
                    console.log('对方发送的信息数据结构错误', e, res)
                }
            }
            // 收到消息反馈——发消息结束后（指令7）
            if (res.data && res.data.command == 7) {
                // 保存seq，以便撤销用
                if (res.data.res && res.data.res.resMsg) {
                    this.setData({
                        ['imPageData[' + (this.data.imPageData.length - 1) + '].seq']: res.data.res.resMsg,
                    })
                }
            }
            // 未登录（指令99）
            if (res.data && res.data.command == 99) {
                console.log('未登录')
                this.showAuthorModal({                                                                                                
                    success: res => {
                        this.initPage()
                    },
                })
            }
        })
    },
    // 发送聊天方法
    sendInfo (content = '', msgType = 1) {
        // 发送消息（指令6）
        this.webSocketObj.send({
            data: JSON.stringify({
                msgId: new Date().getTime(),
                command: 6,
                version: this.imData.version,
                connId: this.imData.connId,
                tenantId: this.imData.tenantId,
                roomId: this.imData.roomId,
                req: {
                    senderId: this.imData.custId,
                    seq: 0, // server端生成的序列号，用于消息的回撤
                    senderType: 1, // 发送人type：1"顾客"2"客服"3"机器人"
                    msgType, // 1文本;2图片;3语音;4视频;5地理位置;6链接;7卡片;8机器人
                    content, // 发送的消息，或图片url
                }
            }),
            success: res => {
                console.log('发送信息成功', res)
                // 清空输入内容
                if (this.data.imData.value) {
                    // 页面中显示聊天记录
                    let data = this.dataStructure({
                        module: 'txt',
                        data: content,
                        anchor: this.data.imPageData.length === 0 ? this.imData.page : '', // 判断是否当前页面为空时，将默认锚点加上，方便历史记录定位
                    })
                    this.setData({
                        imPageData: this.data.imPageData.concat(data),
                    }, () => {
                        // 跳转到最后
                        setTimeout(() => {
                            this.setData({
                                'imData.imScrollJump': 'anchorButton',
                            })
                        })
                    })
                    this.setData({
                        'imData.value': '',
                    })
                }
            },
        })
    },
    // 提交文本方法
    submitIM (e) {
        let val = e.detail && e.detail.value || ''
        if (!(val instanceof Object) && val) {
            this.setData({
                'imData.value': val,
            })
            // 调用发送聊天方法
            this.sendInfo(val, 1)
        } else if ((val instanceof Object)) {
            // 收集formid
            console.log('收集formid')
        }
    },
    // 选取图片方法
    selectImage () {
        if (app.commonJs.compareVersion('', '1.9.9') >= 0) {
            wx.chooseImage({
                count: 9,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: res => {
                    // tempFilePath可以作为img标签的src属性显示图片
                    const tempFilePaths = res.tempFilePaths
                    if (tempFilePaths && tempFilePaths.length > 0) {
                        tempFilePaths.forEach((v, k) => {
                            // 生成base64
                            this.pic2Base64({
                                imgPath: res.tempFilePaths[k],
                                success: res => {
                                    // 上传图片
                                    this.uploadPictures({imgData: res.data, success: res => {
                                        this.sendInfo(res.url, 2)
                                        let data = this.dataStructure({
                                            module: 'img',
                                            data: res.url + '?sessionId=' + this.imData.sessionId + '&userType=' + this.imData.userType + '&tenantId=' + this.imData.tenantId,
                                        })
                                        this.setData({
                                            imPageData: this.data.imPageData.concat(data),
                                        })
                                        console.log(this.data.imPageData)
                                    }})
                                },
                            })
                        })
                    }
                }
            })
        } else {
            wx.showToast({
                title: '您的微信版本过低，晒图功能请更新到最新版本。',
                icon: 'none',
            })
        }
    },
    // 选取网络图片方法
    networkImage ({imgUrl = '', success = () => {}, fail = () => {}, complete = () => {}} = {}) {
        if (imgUrl) {
            wx.downloadFile({
                url: imgUrl, // 'https://img61.ddimg.cn/upload_img/00774/mina/default-1540894544.png',
                success: res => {
                    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                    if (res && res.statusCode === 200) {
                        // 生成base64
                        this.pic2Base64({
                            imgPath: res.tempFilePath,
                            success: res => {
                                // 上传图片
                                this.uploadPictures({url: this.interfaceData.portrait, imgData: res.data, success: res => {
                                    this.sendInfo(res.url, 2)
                                    let data = this.dataStructure({
                                        module: 'portrait',
                                        data: res.url + '?sessionId=' + this.imData.sessionId + '&userType=' + this.imData.userType + '&tenantId=' + this.imData.tenantId,
                                    })
                                    this.setData({
                                        imPageData: this.data.imPageData.concat(data),
                                    })
                                }})
                            },
                        })
                    } else {
                        fail && fail(err)
                    }
                },
                fail: err => {
                    console.log(err)
                    fail && fail(err)
                },
                complete: r => {
                    complete && complete(r)
                },
            })
        } else {
            fail && fail()
        }
    },
    // 图片转base64
    pic2Base64 ({imgPath = '', encoding = 'base64', success = () => {}, fail = () => {}, complete = () => {}} = {}) {
        if (imgPath) {
            wx.getFileSystemManager().readFile({
                filePath: imgPath, // 选择图片返回的相对路径
                encoding: 'base64', // 编码格式
                success: result => {
                    // 成功的回调
                    if (result && result.data) {
                        let extension = imgPath.substr(imgPath.lastIndexOf('.') + 1)
                        let prefix = 'data:image/' + extension + ';base64,'
                        result.data = prefix + result.data
                        success && success(result)
                    } else {
                        fail && fail(result)
                    }
                },
                fail: err => {
                    fail && fail(err)
                },
                complete: r => {
                    complete && complete(r)
                },
            })
        } else {
            fail && fail()
        }
    },
    // 上传图片
    uploadPictures ({url = this.interfaceData.chat, imgData = '', success = () => {}, fail = () => {}, complete = () => {}} = {}) {
        if (imgData) {
            wx.request({
                url,
                method: 'post',
                data: {
                    base64: imgData,
                    roomId: this.imData.roomId,
                    sessionId: this.imData.sessionId,
                    userType: this.imData.userType,
                    tenantId: this.imData.tenantId,
                },
                dataType: 'json',
                header: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                success: res => {
                    if (res && res.data && res.data.code == 0) {
                        // 成功
                        success && success(res.data.data)
                        // console.log(res.data.data)
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: res && res.data && res.data.message ? res.data.message : '出错了',
                        })
                        setTimeout(() => {
                            fail && fail(res)
                        }, 1500)
                    }
                },
                fail: err => {
                    console.log(err)
                    wx.showToast({
                        icon: 'none',
                        title: res && res.data && res.data.message ? res.data.message : '出错了~',
                    })
                    setTimeout(() => {
                        fail && fail(err)
                    }, 1500)
                },
                complete: r => {
                    // console.log(r)
                    complete && complete(r)
                },
            })
        } else {
            fail && fail()
        }
    },
    // 撤销操作
    repealInfo (e) {
        let dataset = e.currentTarget.dataset
        let seq = dataset.seq
        if (seq) {
            seq = parseInt(seq)
        }
        let index = typeof dataset.sort !== 'undefined' ? dataset.sort : -1
        console.log('撤销操作', seq)
        // 撤销消息（指令9）
        this.webSocketObj.send({
            data: JSON.stringify({
                msgId: new Date().getTime(),
                command: 9,
                version: this.imData.version,
                connId: this.imData.connId,
                tenantId: this.imData.tenantId,
                roomId: this.imData.roomId,
                withdraw: {
                    withdraw: seq,
                }
            }),
            success: res => {
                console.log('撤销信息成功', res)
                // 删除相关数据
                if (index >= 0) {
                    let imPageData = app.commonJs.copyObj(this.data.imPageData)
                    imPageData.splice(index, 1)
                    this.setData({
                        imPageData,
                    })
                }
            },
        })
    },
    // 心跳
    heartJump () {
        // 心跳（指令13）
        this.webSocketObj.send({
            data: JSON.stringify({
                msgId: new Date().getTime(),
                command: 13,
                version: this.imData.version,
                connId: this.imData.connId,
                tenantId: this.imData.tenantId,
                roomId: this.imData.roomId,
                heartBeat: {
                    hbMsg: 'ping',
                }
            }),
            success: res => {
                console.log('心跳成功', res)
            },
        })
        
    },
    // 查询历史消息
    getHistory () {
        wx.showLoading({title: '加载中...'})
        wx.request({
            url: 'http://10.255.242.222:8092/sessionService/history',
            method: 'get',
            data: {
                seq: this.imData.lastSeq,
                roomId: this.imData.roomId,
                tenantId: this.imData.tenantId,
                pageSize: this.imData.pageSize,
            },
            dataType: 'json',
            success: res => {
                console.log('加载历史消息成功', res)
                if (this.data.imPageData.length > 0) {
                    this.imData.page++
                }
                let data = []
                if (res && res.data && res.data && res.data.data && res.data.data.length > 0) {
                    // 将最后一个seq存下来
                    this.imData.lastSeq = res.data.data[res.data.data.length - 1].seq
                    data = res.data.data.map((v, k) => {
                        let obj = {}
                        // 最后一个加个定位锚点
                        if (k === res.data.data.length - 1) {
                            obj.anchor = this.imData.anchorName + this.imData.page
                        } else {
                            obj.anchor = ''
                        }
                        let module = ''
                        switch (v.contentType) {
                            case 2:
                                module = 'img'
                                break
                            case 3:
                                module = 'audio'
                                break
                            case 4:
                                module = 'video'
                                break
                            case 5:
                                module = 'position'
                                break
                            case 6:
                                module = 'link'
                                break
                            case 7:
                                module = 'card'
                                break
                            case 8:
                                module = 'robot'
                                break
                            default:
                                module = 'txt'
                        }
                        obj.module = module
                        try {
                            if (v.contentType == 1) {
                                obj.data = v.content
                            } else if (v.contentType == 2) {
                                obj.data = v.content + '?sessionId=' + this.imData.sessionId + '&userType=' + this.imData.userType + '&tenantId=' + this.imData.tenantId
                            } else {
                                obj.data = JSON.parse(v.content)
                            }
                        } catch (e) {
                            console.log('历史消息数据结构出错', e, v)
                        }
                        obj.who = v.senderId == this.imData.custId ? 'my' : ''
                        obj.seq = v.seq || 0
                        obj.sendTime = v.sendTime
                        return this.dataStructure(obj)
                    })
                    // 倒序显示历史消息
                    data.reverse()
                    this.setData({
                        imPageData: data.concat(this.data.imPageData),
                    }, () => {
                        // 需要等待页面渲染完成再设置滚动条
                        setTimeout(() => {
                            if (this.imData.page <= 1) {
                                // 跳转到最后
                                this.setData({
                                    'imData.imScrollJump': 'anchorButton',
                                })
                            } else {
                                // 跳转至当前显示的区域
                                this.setData({
                                    'imData.imScrollJump': this.imData.anchorName + (this.imData.page > 0 ? this.imData.page - 1 : 0),
                                })
                            }
                        }, 100)
                    })
                }
            },
            fail: err => {
                console.log('加载历史消息失败', err)
            },
            complete: r => wx.hideLoading(),
        })
    },
})
