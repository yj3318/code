/*
 * 公共方法
 * create: yang jun
 */
import CONFIG from './config.js'
class ddWxCommon{
	constructor(){
    	this.systemInfo = {errCode:-1};
		this.init();
	}

	init(){
		let that = this;
		that.getSystemInfo();
		//为string加入去掉前后空格的方法
		if(!String.prototype.trim){
			String.prototype.trim = () => this.toString().replace(/^\s+|\s+$/g, '');
		}
	}

	getSystemInfo(){
		/* 获取系统信息，如显示区域宽、高等 */
		let that = this;
        if (!that.systemInfo.highWindowHeight || that.systemInfo.highWindowHeight <= that.systemInfo.windowHeight) {
            wx.getSystemInfo({
                success: function(res){
                    that.systemInfo.errCode = 0;
                    if(!that.systemInfo.windowHeight){
                        for(let i in res){
                            that.systemInfo[i] = res[i];
                        }
                        that.systemInfo.highWindowHeight = res.windowHeight;//无底部菜单时的页面高度赋初值
                        that.systemInfo.rpx2px = res.windowWidth / 750;//1rpx等于多少px
                    }else if(that.systemInfo.highWindowHeight < res.windowHeight){
                        that.systemInfo.highWindowHeight = res.windowHeight;//无底部菜单时的页面高度
                    }else if(that.systemInfo.windowHeight > res.windowHeight){
                        that.systemInfo.windowHeight = res.windowHeight;//有底部菜单时页面高度
                    }
                },
                fail: function(res){
                    that.systemInfo.errCode = 1;
                    //console.dir(res);
                }
            });
        }
		return that;
	}

	copyObj(obj){
		/* 深拷贝对象 */
		let that = this,
			newObj = obj instanceof Array ? [] : {};
		for(let i in obj){
			if(obj[i] instanceof Object || obj[i] instanceof Array){
				newObj[i] = that.copyObj(obj[i]);
			}else{
				if(obj[i] || obj[i] == 0){
					newObj[i] = obj[i];
				}else{
					newObj[i] = '';
				}
			}
		}
		return newObj;
	}
	
	coverMerge(target){
		/* 合并对象, 覆盖目标对象 */
		let deep = false,
			args = [].slice.call(arguments, 1);
		if(typeof target === 'boolean'){
		  deep = target;
		  target = args.shift();
		}
		function extend(target, source, deep){
			for(let key in source){
				if(deep && (typeof source[key] === 'object' && Object.getPrototypeOf(source[key]) == Object.prototype || source[key] instanceof Array)){
					if(typeof source[key] === 'object' && Object.getPrototypeOf(source[key]) == Object.prototype && !(typeof target[key] === 'object' && Object.getPrototypeOf(target[key]) == Object.prototype)){
						target[key] = {};
					}
					if(source[key] instanceof Array && !(target[key] instanceof Array)){
						target[key] = [];
					}
					extend(target[key], source[key], deep);
				}else if(source[key] !== undefined){
					target[key] = source[key];
				}
			}
		}
		args.forEach(function(arg){
			extend(target, arg, deep);
		});
		return target;
	}

	extendMerge(target){
		/* 合并对象, 不覆盖目标对象 */
		let deep = false,
			args = [].slice.call(arguments, 1);
		if(typeof target === 'boolean'){
		  deep = target;
		  target = args.shift();
		}
		function extend(target, source, deep){
			for(let key in source){
				if(typeof target[key] !== 'undefined'){
					//目标对象有值则不覆盖
					continue;
				}
				if(deep && (typeof source[key] === 'object' && Object.getPrototypeOf(source[key]) == Object.prototype || source[key] instanceof Array)){
					if(typeof source[key] === 'object' && Object.getPrototypeOf(source[key]) == Object.prototype && !(typeof target[key] === 'object' && Object.getPrototypeOf(target[key]) == Object.prototype)){
						target[key] = {};
					}
					if(source[key] instanceof Array && !(target[key] instanceof Array)){
						target[key] = [];
					}
					extend(target[key], source[key], deep);
				}else if(source[key] !== undefined){
					target[key] = source[key];
				}
			}
		}
		args.forEach(function(arg){
			extend(target, arg, deep);
		});
		return target;
	}

	dateFormat(dateData, formatData){
		/* 日期格式化 */
        let tempDate = parseInt(dateData) ? parseInt(dateData).toString() : ''
        let format = ''
        if (tempDate) {
            if (tempDate.length === 13) {
                // 时间戳格式
                dateData = parseInt(dateData)
            } else {
                dateData = dateData.replace(/-/g, '/');//IOS不识别yyyy-MM-dd格式的日期
            }
            let date = new Date(dateData)
            let o = {
                'M+': date.getMonth() + 1, //month
                'd+': date.getDate(), //day
                'h+': date.getHours(), //hour
                'm+': date.getMinutes(), //minute
                's+': date.getSeconds(), //second
                'q+': Math.floor((date.getMonth() + 3)/3), //quarter
                'S': date.getMilliseconds() //millisecond
            }
            format = formatData ? formatData : 'yyyy-MM-dd hh:mm:ss'
            if(/(y+)/.test(format)){
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            }
            for(let k in o){
                if(new RegExp('(' + k + ')').test(format)){ 
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
                }
            }
        }
		return format
	}

	stringLength(str){
		/* 字符长度（中文一个字符长度，字母数字标点半个字符长度） */
		return /[\u4e00-\u9fa5]/.test(str) || str.codePointAt(0) > 0xFFFF ? 1 : 0.5;
	}

	autoImageWH(e){
		/* 动态计算图片长与宽 */
		let that = this;
		//获取图片的原始长宽
		let originalWidth = e.detail.width,
			originalHeight = e.detail.height,
			autoWidth = 0,
			autoHeight = 0,
			results= {};
		if(originalWidth > that.systemInfo.windowWidth){//在图片width大于手机屏幕width时候
			autoWidth = that.systemInfo.windowWidth;
			autoHeight = (autoWidth * originalHeight) / originalWidth;
			results.width = autoWidth;
			results.height = autoHeight;
		}else{
			//否则展示原来的数据
			results.width = originalWidth;
			results.height = originalHeight;
		}
		return results;
	}

	priceIntegerDecimal(price, fixed = 2){
		/* 价格分成整数部分和小数部分 */
		let that = this,
			zero = 0;
		price = typeof price === 'number' ? price.toFixed(fixed) : (!isNaN(Number(price)) ? Number(price).toFixed(fixed) : zero.toFixed(fixed));
		price = price.toString().split('.');
		return {integer:price[0], decimal:`.${price[1]}`};
	}

	fromNowDate(time = 0, compareTime = 0){
		/*
		 * 将传入的ms时间戳做比较，返回时间差
		 * 返回值：对象
		 * {
		 *		future: true/false,//布尔值，true代表返回值是距将来的时间
		 *		day: Number,//int值，天数
		 *		hour: Number,//int值，小时数
		 *		minute: Number,//int值，分钟数
		 *		second: Number,//int值，秒数
		 *		ms: Number,//int值，毫秒数
		 * }
		 */
		let now = compareTime ? compareTime : new Date().getTime(),
			dval = 0,
			future = false,
			day = 0,
			hour = 0,
			minute = 0,
			second = 0,
			ms = 0,
			flag = true;
		if(!time){
			flag = false;
		}
		if(flag){
			if(now - time < 0){
				dval = time - now;
				future = true;
			}else{
				dval = now - time;
			}
			ms = dval % 1000;
			dval = Math.floor(dval / 1000);
			day = Math.floor(dval / (24 * 3600));
			hour = Math.floor(dval % (24 * 3600) / 3600);
			minute = Math.floor(dval % (24 * 3600) % 3600 / 60);
			second = Math.floor(dval % (24 * 3600) % 3600 % 60);
		}
		return {future, day, hour, minute, second, ms};
	}

	getRandmoString(len = 32){
		/* 生成随机串 */
		return Array(len).fill(1, 0, len)
					.map(() => Math.floor(Math.random() * 36 + 48))
					.map((code) => String.fromCharCode(code > 57 ? code + 7 : code))
					.join("").toLowerCase();
	}

	getUdid(args){
		/* 异步获取UDID */
		//let udid = "bd6fc271a3975583cb6f7ff1e4a38790";
		//let err = null;
		//args.success(res)
		//return
		wx.getStorage({
			key: 'udid',
			success: function(res){
				console.log(res.data);
				args.success(res.data);
			},
			fail: (err) => {
				console.log(err);
				let udid = this.getRandmoString(32)
					
				wx.setStorage({
					key: 'udid',
					data: udid,
					success: function(res){
						args.success(udid)
					},
					fail: args.fail,
					complete: args.complete
				});
			},
			complete: args.complete
		})
	}

	getUdidSync(){
		/* 同步获取UDID */
		let value = wx.getStorageSync('udid');
		if (value) {
			return value;
		}
		let udid = this.getRandmoString(32);
		wx.setStorageSync('udid', udid);
		return udid;
	}

	getPermanentIDSync() {
		/* 同步获取 PermanentID */
		let value = wx.getStorageSync('permanent_id');
		if (value) {
			return value;
		}
		let pid = this.createPermanentID();
		wx.setStorageSync('permanent_id', pid);
		return pid;
	}

	createPermanentID() {
		var n = new Date();
		var y = n.getFullYear() + '';
		var m = n.getMonth() + 1;
		if (m < 10) m = "0" + m;
		var d = n.getDate();
		if (d < 10) d = "0" + d;
		var H = n.getHours();
		if (H < 10) H = "0" + H;
		var M = n.getMinutes();
		if (M < 10) M = "0" + M;
		var S = n.getSeconds();
		if (S < 10) S = "0" + S;
		var a = "00" + n.getMilliseconds();
		a = a.substr(a.length - 3, 3);
		var b = Math.floor(100000 + Math.random() * 900000);
		var c = Math.floor(100000 + Math.random() * 900000);
		var z = Math.floor(100000 + Math.random() * 900000);
		return y + m + d + H + M + S + a + b + c + z
	}

    getUnionidSync(){
        //获取当前时间
        let ms = new Date();
        let currenttime = ms.getTime();
        let expiretime = wx.getStorageSync('unionid_time');

        //如果unionid过期，超过24小时，需要清除unionid
        if (expiretime && (currenttime > expiretime)){
            wx.removeStorageSync('unionid');
            wx.removeStorageSync('unionid_time');

            return null;
        }

        let unionid = wx.getStorageSync('unionid');
        if (unionid && expiretime) {
            return unionid;
        }

        return null;
    }

    setUnionidSync(unionid){
        //获取当前时间
        let ms = new Date();
        let expiretime = ms.getTime() + 24*3600*1000; //unionid有效期24小时

        wx.setStorageSync('unionid', unionid);
        wx.setStorageSync('unionid_time', expiretime);
    }

    getCpsPackageSync(){
        //获取当前时间
        let ms = new Date();
        let currenttime = ms.getTime();
        let expiretime = wx.getStorageSync('cps_package_time');

        //如果cps_package过期，超过90天，需要清除cps_package
        if (expiretime && (currenttime > expiretime)){
            wx.removeStorageSync('cps_package');
            wx.removeStorageSync('cps_package_time');

            return null;
        }

        let cps_package = wx.getStorageSync('cps_package');
        if (cps_package && expiretime) {
            return cps_package;
        }

        return null;
    }

    setCpsPackageSync(cps_package){
        //获取当前时间
        let ms = new Date();
        let expiretime = ms.getTime() + 90*86400*1000; //CpsPackage有效期90天

        wx.setStorageSync('cps_package', cps_package);
        wx.setStorageSync('cps_package_time', expiretime);
    }

    jumpUrl ({url = '', mode = ''}) {
        // 根据URL实现不同跳转方式
        if (url) {
            let switchTabUrl = ['/pages/index/index', '/pages/category/category', '/pages/cart/cart', '/pages/my/index'] // tab级URL，想要用switchTab方式跳转必须写绝对路径
            let isTabFlag = false // 是否为tab级页面
            if (mode === '') {
                // 判断
                for (let i = 0, j = switchTabUrl.length; i < j; i++) {
                    if (url.indexOf(switchTabUrl[i]) >= 0) {
                        isTabFlag = true
                        break
                    }
                }
            }
            // 跳转
            if (isTabFlag || mode === 'switch') {
                wx.switchTab({
                    url,
                })
            } else if (mode === 'redirect') {
                wx.redirectTo({
                    url,
                })
            } else {
                wx.navigateTo({
                    url,
                })
            }
        }
	}
	/*
		礼券根据类型跳转
	*/
	couponJump (e) {
		var dataSet = e.target.dataset;
        var mediumScopeId = dataSet.mediumScopeId
		var url = dataSet.url
        if (url) {
            this.jumpUrl({url})
        } else {
            if (dataSet.couponapplytype == 2 || dataSet.couponapplytype == 3 || dataSet.type != 0 && dataSet.type != 6 && mediumScopeId != 3){
                wx.navigateTo({
                    url:'../search/couponProduct?apply_id=' + dataSet.applyId + '&title=' + dataSet.title + '&date=' + dataSet.date + '&name=礼券可用商品页'
                })
			} else { 
                wx.switchTab({
                    url: '../index/index'
                });
            }
        }
	}
	  //拼接h5url
	  buildUrl(){
		let union_id = getApp().commonJs.getUnionidSync() || '';
		let udid = wx.getStorageSync(CONFIG.MYUDID_STORAGE_NAME);
		let permanent_id = wx.getStorageSync(CONFIG.MYPERMANENTID_STORAGE_NAME);
		let user_client = CONFIG.MAPI_USER_CLIENT;
		let client_version =CONFIG.MAPI_CLIENT_VERSION;
        let system = encodeURIComponent(getApp().commonJs.systemInfo.system);
		let buildurl = 'union_id='+union_id+'&udid='+udid+'&permanent_id='+permanent_id+'&user_client='+user_client+'&client_version='+client_version+'&ua='+system;
		return buildurl;
	 }
	 //版本比较
	 compareVersion(v1 = '', v2 = '') {
		if (!v2) {
			console.log('compareVersion参数错误')
		} else {
            if (!v1) {
                v1 = wx.getSystemInfoSync()
                if (v1 && v1.SDKVersion) {
                    v1 = v1.SDKVersion
                } else {
                    console.log('SDK版本号获取失败')
                    return
                }
            }
			v1 = v1.split(".")
			v2 = v2.split(".")
			var len = Math.max(v1.length, v2.length)
			while (v1.length < len) {
			  v1.push('0')
			}
			while (v2.length < len) {
			  v2.push('0')
			}
		  
			for (var i = 0; i < len; i++) {
			  var num1 = parseInt(v1[i])
			  var num2 = parseInt(v2[i])
		  
			  if (num1 > num2) {
				return 1
			  } else if (num1 < num2) {
				return -1
			  }
			}
		}
		return 0
	  }
    // 获取用户信息
    // success成功回调
    // fail错误回调
    getUserInfo ({success = userInfo => {}, fail = err => {}}) {
        let userInfo = {}
        wx.getSystemInfo({
            success: res => {
                if (this.compareVersion(res.SDKVersion, '1.2.0') >= 0) {
                    wx.getSetting({
                        success: res => {
                            if (res && res.authSetting && res.authSetting['scope.userInfo']) {
                                wx.getUserInfo({
                                    success: res => {
                                        userInfo = res.userInfo
                                        success(userInfo)
                                    },
                                    fail: err => {
                                        fail(userInfo)
                                    },
                                })
                            } else {
                                fail(userInfo)
                            }
                        },
                        fail: err => {
                            fail(userInfo)
                        },
                    })
                } else {
                    fail(userInfo)
                }
            },
            fail: err => {
                fail(userInfo)
            },
        })
    }
                    
    /*             
     * 拼接h5页面url                                                                                                                                          
     * @param url  跳转h5页面的url
     * @param miniProgram  标明来源哪个小程序
     * @param data  URL后面的参数
     * @param needEncode  是否需要加密参数
     * url不传的话，会返回拼好的参数
     */             
    buildH5ReadingUrl({url = '', miniProgram = 'ddshopping', data = {}, needEncode = true}) {
        let token = wx.getStorageSync('token')
        let res = 'token=' + (token ? (needEncode ? encodeURIComponent(token) : token) : '') + '&miniProgram=' + (needEncode ? encodeURIComponent(miniProgram) : miniProgram)
        if (url && url.indexOf('?') === url.length - 1) {
            url = url.slice(0, url.length - 1) // 去除url最后的问号
        }           
        let hasQuestion = url.indexOf('?') < 0 // 是否包含问号
        if (data) { 
            // 有参数
            if (typeof data === 'string') {
                // 参数为字符串
                data = data.replace(/\b&{0,1}token=\w*\b/, '').replace(/\b&{0,1}miniProgram=\w*\b/, '')
                if (hasQuestion) {
                    if (data) {
                        res = url + '?' + data + '&' + res
                    } else {
                        res = url + '?' + res
                    }
                } else {
                    if (data) {
                        res = url + '&' + data + '&' + res
                    } else {
                        res = url + '&' + res
                    }
                }   
            } else if (data instanceof Array || data instanceof Object) {
                // 参数为数组或对象拼参数
                let buildUrl = ''
                let times = 0 // 循环次数
                for (let k in data) {
                    let v = data[k]
                    if (typeof v !== 'undefined' && k !== 'token' && k !== 'miniProgram') {
                        // 循环加上链接符
                        if (times > 0) {
                            buildUrl += '&'
                        }
                        times++
                        buildUrl += k + '=' + (needEncode ? encodeURIComponent(v) : v)
                    }
                }    
                if (hasQuestion) {
                    if (buildUrl) {
                        res = url + '?' + buildUrl + '&' + res
                    } else{
                        res = url + '?' + res
                    }
                } else {
                    if (buildUrl) {
                        res = url + '&' + buildUrl + '&' + res
                    } else{
                        res = url + '&' + res
                    }
                }    
            } else { 
                // 参数为其它类型则转换成字符串
                data = data ? (needEncode ? encodeURIComponent(data.toString()) : data.toString()) : ''
                if (hasQuestion) {
                    if (data) {
                        res = url + '?' + data + '&' + res
                    } else {
                        res = url + '?' + res
                    }
                } else {
                    if (data) {
                        res = url + '&' + data + '&' + res
                    } else {
                        res = url + '&' + res
                    }
                }
            }        
        } else {     
            // 无参数
            if (hasQuestion) {
                res = url + '?' + res
            } else { 
                res = url + '&' + res
            }        
        }            
        return res   
    }

    	
    /*
     * 判断授权状态，未授权弹允许授权弹层，禁止授权过刚弹打开授权弹层
     * 入参：
     *      scope：需要授权的权限名称，如scope.writePhotosAlbum，必传
     *      success：授权成功后执行的方法
     *      fail：授权失败后执行的方法
     *      complete：授权成功或失败后统一执行的方法
     */
    judgeAuthorizeStatus ({scope = '', success = res => {}, fail = err => {}, complete = res => {}}) {
        if (!scope) {
            console.log('入参错误')
            return
        }
        if (this.compareVersion('', '1.2.0') >= 0) {
            wx.getSetting({
                success: res => {
                    if (res.authSetting[scope] === false) {
                        // 用户禁止过授权保存图片到系统相册权限
                        wx.openSetting({
                            success: res => {
                                success(res)
                            },
                            fail: err => {
                                fail(err)
                            },
                            complete: res => {
                                complete(res)
                            },
                        })
                    } else if (!res.authSetting[scope]) {
                        // 用户没有授权过保存图片到系统相册权限
                        wx.authorize({
                            scope,
                            success: res => {
                                success(res)
                            },
                            fail: err => {
                                fail(err)
                            },
                            complete: res => {
                                complete(res)
                            },
                        })
                    } else {
                        // 用户已授权访问保存图片到系统相册权限
                        success(res)
                    }
                },
            })
        } else {
            wx.showToast({
                icon: 'none',
                title: '微信版本过低，请升级微信',
            })
        }
    }

    /*
     * 判断是否包含中文字符
     * 入参：
     *      str：字符串
     * 原理：escape对字符串进行编码时，字符值大于255的以"%u****"格式存储，而字符值大于255的恰好是非英文字符（一般是中文字符，非中文字符也可以当作中文字符考虑）；indexOf用以判断在字符串中是否存在某子字符串，找不到返回"-1"
     * 返回：包含中文返回true
     */
    judgeChinese (str = '') {
        let flag = false // 默认为英文
        if (escape(str).indexOf('%u') >= 0) {
            flag = true // 中文返回true
        }
        return flag
    }

    /*
     * 如果用到setData的第二个参数（即setData引起的界面更新渲染完毕后的回调函数），则必须调用该方法保证兼容性
     * 入参：
     *      callback：延迟执行的方法
     *      params：给callback传递的参数
     *      delay：延迟执行callback的时间，默认500ms
     */
    setDataCallback ({callback = () => {}, params = {}, delay = 500} = {}) {
        // SDK版本小于1.5.0，不支持setData后执行callback方法，手动请求数据
        if (this.compareVersion('', '1.5.0') < 0 &&  typeof callback === 'function') {
            setTimeout(() => {callback(params)}, delay)
        }
    }

    /*
     * 好物推荐入参格式化
     * 订单列表页、订单详情页
     */
    formatGoodsShareData ({
        productId = '', // 单品ID（必传）
        productName = '', // 商品名称（必传）
        productDesc = '', // 商品描述（必传）
        categoryList = [], // 类目列表，数组，数组长度必须大于0，数组内所有元素都应为字符串，数组内不能含有空白字符串元素（必传）
        imageList = [], // 物品图片URL列表，数组，数组长度必须大于0，数组内所有元素都应为字符串，数组内不能含有空白字符串元素（必传）
        miniPath = '', // 物品在第三方小程序内的页面路径，非空白字符串（必传）
        brandName = '', // 商家名字
        brandLogo = '', // 商家的Logo URL
        hasSkuList = false, // 是否有sku列表数据
        // 下面的数据数组长度必须一致并且一一对应
        skuId = [], // sku品ID数组（如果hasSkuList为true，则必传）
        skuPrice = [], // 现价数组，单位为分的物品现价。大于等于0的整数（如果hasSkuList为true，则必传）
        skuOriginalPrice = [], // 原价数组，单位为分的物品原价。大于等于0的整数（如果hasSkuList为true，则必传）
        skuStatus = [], // 物品状态数组。数字枚举值：1:在售; 2:停售; 3:售罄（如果hasSkuList为true，则必传）
        skuAttrList = [], // 物品属性列表。必须是一个非空数组，每个数组元素都必须是下面的格式[{"name": "颜色", "value": "白色"},{"name": "尺码", "value": "XXL"}]
        skuPoitionList = [], // 地理位置（门店）信息列表。必须是一个非空数组（暂时用不到）
    } = {}) {
        if (!productId) {
            console.warn(productId + '--' + productName + '：没传单品Id')
            return
        }
        if (!productName) {
            console.warn(productId + '--' + productName + '：没传商品名称')
            return
        }
        if (!productDesc) {
            console.warn(productId + '--' + productName + '：没传商品描述')
            return
        }
        if (!categoryList || categoryList.length <= 0) {
            console.warn(productId + '--' + productName + '：没传类目列表')
            return
        }
        if (!imageList || imageList.length <= 0) {
            console.error(productId + '--' + productName + '：没传物品图片URL列表')
            return
        }
        if (!miniPath) {
            console.warn(productId + '--' + productName + '：没传小程序页面路径')
            return
        }
        let product = {
            item_code: productId.toString(),
            title: productName,
            desc: productDesc,
            category_list: categoryList,
            image_list: imageList,
            src_mini_program_path: miniPath,
            brand_info: {
                name: brandName,
                logo: brandLogo,
            },
        }
        if (hasSkuList) {
            if (!skuId || skuId.length <= 0) {
                console.warn(productId + '--' + productName + '：没传sku品ID')
                return
            }
            if (!skuPrice || skuPrice.length <= 0) {
                console.warn(productId + '--' + productName + '：没传sku价格')
                return
            }
            if (!skuOriginalPrice || skuOriginalPrice.length <= 0) {
                console.warn(productId + '--' + productName + '：没传sku原价')
                return
            }
            if (!skuStatus || skuStatus.length <= 0) {
                console.warn(productId + '--' + productName + '：没传sku销售状态')
                return
            }
            product.sku_list = []
            skuId.forEach((v, k) => {
                let sku = {
                    sku_id: v,
                    price: skuPrice[k],
                    original_price: skuOriginalPrice[k],
                    status: skuStatus[k],
                    sku_attr_list: skuAttrList[k],
                }
                if (skuPoitionList[k]) {
                    sku.poi_list = skuPoitionList[k]
                }
                product.sku_list.push(sku)
            })
        }
        return product
    }

    // 将图片URL转换成WEBP格式的URL
    img2Webp (url) {
        let res = url
        let flag = this.systemInfo.platform.toLowerCase().indexOf('ios') >= 0 ? false : true // 平台判断，ios暂不支持webp格式图片
        if (res && flag) {
            let domainReg1 = new RegExp('^https?://img3m[0-9].ddimg.cn(.*)')
            let domainReg2 = new RegExp('^https?://img3x[0-9].ddimg.cn(.*)')
            let domainReg3 = new RegExp('^https?://img5[0-9].ddimg.cn(.*)')
            let domainReg4 = new RegExp('^https?://img6[0-3].ddimg.cn(.*)')
            if (domainReg1.test(res) || domainReg2.test(res)) {
                // img3m[0-9]和img3x[0-9]只支持jpg的 .webp格式的图片
                if (res.lastIndexOf('.jpg') >= 0) {
                    res += '.webp'
                }
            } else if (domainReg3.test(res) || domainReg4.test(res)) {
                // img6[0-3]和img5[0-9]都支持.png和.jpg和 .webp格式的图片
                if (res.lastIndexOf('.png') >= 0 || res.lastIndexOf('.jpg') >= 0) {
                    res += '.webp'
                }
            }
        }
        return res
    }

    // 取localstorage中的5级地址，如果没有，默认为北京
    getAddressInfo () {
        let addressInfo = wx.getStorageSync(CONFIG.ADDRESS_STORAGE_NAME) || ''
        if (!addressInfo) {
            addressInfo = CONFIG.DEFAULT_ADDRESS
        }
        let province_id = ''
        let city_id = ''
        let district_id = ''
        let town_id = ''

        if (addressInfo) {
            if (addressInfo.provinceArray && addressInfo.provinceArray.length > 0) {
                province_id = addressInfo.provinceArray[addressInfo.province_index].id
            }
            if (addressInfo.cityArray && addressInfo.cityArray.length > 0) {
                city_id = addressInfo.cityArray[addressInfo.city_index].id
            }
            if (addressInfo.areaArray && addressInfo.areaArray.length > 0) {
                district_id = addressInfo.areaArray[addressInfo.area_index].id
            }
            if (addressInfo.streetArray && addressInfo.streetArray.length > 0) {
                town_id = addressInfo.streetArray[addressInfo.street_index].id
            }
        }
        return {
            province_id,
            city_id,
            district_id,
            town_id,
        }
    }
}

/* 对外暴露接口 */
export default new ddWxCommon
