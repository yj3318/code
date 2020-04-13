const app = getApp()

Page({
    data: {
        number: [], // 页面中的数字位数
        isAnimate: false, // 是否使用动画
    },
    defaultNumber: [], // 默认每位数值
    currentNumber: '', // 当前数值
    baseValue: 0, // 基础值
    animtateTime: 1500, // css动画过程1000ms，为保证动画能顺利执行完，这里会在多500ms，注意：css动画时间修改，这里也必须做相应修改
    oldNumber: '', // 存储前一个数字，用于慢速转动用
    onLoad (params) {
        this.defaultNumber.push('') // 第一值为空
        // 循环设置默认数值中的数据，需要3组0-9，默认放到中间那组数据中，这样可以向上向下滚动
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 10; j++) {
                this.defaultNumber.push(j)
            }
        }
        this.defaultNumber.push('.') // 最后一位为小数点
        this.baseValue = 100 / this.defaultNumber.length // 每一位的页面定位位置
        this.initNumber() // 初始化数字区域
    },
    // 设置默认显示位数数据，num为显示的数字，flag为变化趋势，fast为是否快速转动
    // 快速转动为变化数字会转动一周左右到达新的数字
    // 慢速转动为变化数字只会转动相应的差值到达新的数字
    setNumber ({num = this.currentNumber, flag = 0, fast = true} = {}) {
        // 设置最大显示位数
        let numberArr = []
        let numString = num >= 0 ? num.toString() : ''
        // 如果位数变小，则保持位数不变
        if (this.data.number.length > numString.length) {
            for (let i = 0; i < this.data.number.length - numString.length; i++) {
                numberArr.push({num: this.defaultNumber, translateY: 0})
            }
        }
        // 将之前的数字与当前的数字分割成数组
        let old = this.oldNumber.toString().split('')
        let cur = numString.split('')
        // 将变化前的数字位数与变化后的位数补齐，方便后续动画执行
        let maxLen = Math.max(old.length, cur.length)
        if (maxLen > old.length) {
            let len = maxLen - old.length
            for (let i = 0; i < len; i++) {
                old.unshift('')
            }
        }
        if (maxLen > cur.length) {
            let len = maxLen - cur.length
            for (let i = 0; i < maxLen - cur.length; i++) {
                cur.unshift('')
            }
        }
        // 开始从后向前逐位
        for (let i = this.data.number.length - 1; i >= 0; i--) {
            let translateY = 0
            if (fast) {
                // 快速转动
                if (old[i] !== cur[i]) {
                    // 数字变动了 
                    // 加10来动态来动态改变显示数字，使其自动定位在最中间的数据
                    if (cur[i] === '.') {
                        translateY = (this.defaultNumber.length - 1) * this.baseValue
                    } else if (cur[i] === '') {
                        translateY = 0
                    } else if (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) >= 0) {
                        // 区分变大与变小来设定新数字的位置
                        translateY = (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) + (flag < 0 ? 0 : (flag > 0 ? 20 : 10))) * this.baseValue
                    }
                } else {
                    // 数字没变动
                    if (old[i] === '') {
                        translateY = 0
                    } else if (old[i] === '.') {
                        translateY = (this.defaultNumber.length - 1) * this.baseValue
                    } else {
                        // 设置为当前位置
                        translateY = (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) + 10) * this.baseValue
                    }
                }
            } else {
                // 慢速转动
                if (old[i] !== cur[i]) {
                    // 数字变动了
                    let dval = cur[i] - old[i] || 0
                    if (cur[i] === '.') {
                        translateY = (this.defaultNumber.length - 1) * this.baseValue
                    } else if (cur[i] === '') {
                        translateY = 0
                    } else if (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) >= 0) {
                        if (old[i] === '' || old[i] === '.') {
                            // 之前的数字位为空或小数点
                            translateY = (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) + 10) * this.baseValue
                        } else if (old[i]) {
                            // 之前的数字为正常数字，区分是否变大或变小，做相应位置计算
                            translateY = (this.defaultNumber.indexOf(Number(old[i])) + 10 + (dval < 0 && flag > 0 ? 10 : (dval > 0 && flag < 0 ? -10 : 0)) + dval) * this.baseValue
                        } else {
                            // 其它情况，计算当前位置
                            translateY = (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) + 10 + dval) * this.baseValue
                        }
                    }
                } else {
                    // 数字没变动
                    if (old[i] === '') {
                        translateY = 0
                    } else if (old[i] === '.') {
                        translateY = (this.defaultNumber.length - 1) * this.baseValue
                    } else {
                        // 设置为当前位置
                        translateY = (this.defaultNumber.indexOf(cur[i] ? Number(cur[i]) : cur[i]) + 10) * this.baseValue
                    }
                }
            }
            // 加入到页面数组中
            numberArr[i] = {
                num: this.defaultNumber,
                translateY,
            }
        }
        // 设置页面显示值
        if (numberArr && numberArr.length > 0) {
            // 没值没有变化时，删除无用的位数，用于动画结束后，清除无用位数
            let realArr = numberArr
            if (flag == 0) {
                realArr = []
                for(let i = 0; i < numberArr.length; i++) {
                    if (numberArr[i].translateY) {
                        realArr.push(numberArr[i])
                    }
                }
            }
            this.setData({
                number: realArr,
            })
        } else {
            this.setData({
                number: [],
            })
        }
    },
    // 初始化数值
    initNumber () {
        // 执行初始化0
        this.animate({num: 0})
    },
    // 修改数字方法
    ok (e) {
        let val = e.type === 'confirm' ? e && e.detail && e.detail.value || '' : e.detail && e.detail.value && e.detail.value.val || '' 
        // 去掉结尾的小数点
        if (val.indexOf('.') === val.length - 1) {
            val = val.substr(0, val.length - 1)
        }
        if (val && !isNaN(val) && parseFloat(val) >= 0 || val === '') {
            // 输入为空或正数时，执行动画效果
            this.animate({num: val})
        } else {
            wx.showToast({title: '请输入正数', icon: 'none'})
        }
    },
    // 动画
    animate ({num = ''} = {}) {
        num = num.toString() // 传过来的值统一变为字符串
        this.oldNumber = this.currentNumber // 将变动前的数值存储到前一数值变量中
        if (num === '') {
            // 为空，设置成初始空状态
            this.currentNumber = num
            this.setData({
                isAnimate: true, // 开始动画
            }, () => {
                this.setNumber({num, flag: -1, fast: false}) // 设置数字转动位置
                // 延迟执行，等待动画执行结束再运行
                setTimeout(() => {
                    this.setData({
                        isAnimate: false, // 禁止动画
                    }, () => {
                        this.currentNumber = num // 保存新的数值到当前数值变量中
                        this.setNumber({num}) // 设置数值位置到新位置，为下次动画做准备
                    })
                }, this.animtateTime)
            })
        } else {
            let number = parseFloat(num) // 获取数值
            let flag = 0 // 动画状态，-1为变小，0为不变，1为变大
            // 判断currentNumber的值来确定动画转动效果
            if (this.currentNumber) {
                if (number - this.currentNumber > 0) {
                    // 数字变大
                    flag = 1
                } else if (number - this.currentNumber < 0) {
                    // 数字变小
                    flag = -1
                }
            } else {
                // currentNumber值不为正常值，则默认为数字变大动画效果
                flag = 1
            }
            // 执行动画
            if (flag) {
                if (this.currentNumber.toString().length < num.length) {
                    // 判断是否为新增位数
                    let numObj = app.commonJs.copyObj(this.data.number)
                    // 增加空位，为了后面的动画做准备
                    for (let i = 0; i < num.length - this.currentNumber.toString().length; i++) {
                        numObj.push({num: this.defaultNumber, translateY: 0,})
                    }
                    this.setData({
                        number: numObj, // 将多出的空位先加到页面中
                    }, () => {
                        this.setData({
                            isAnimate: true, // 开始动画
                        }, () => {
                            this.setNumber({num, flag, fast: false}) // 设置数字转动位置
                            // 延迟执行，等待动画执行结束再运行
                            setTimeout(() => {
                                this.setData({
                                    isAnimate: false, // 禁止动画
                                }, () => {
                                    this.currentNumber = number // 保存新的数值到当前数值变量中
                                    this.setNumber({num}) // 设置数值位置到新位置，为下次动画做准备 
                                })
                            }, this.animtateTime)
                        })
                    })
                } else {
                    this.setData({
                        isAnimate: true, // 开始动画
                    }, () => {
                        this.setNumber({num, flag, fast: false}) // 设置数字转动位置
                        // 延迟执行，等待动画执行结束再运行
                        setTimeout(() => {
                            this.setData({
                                isAnimate: false, // 禁止动画
                            }, () => {
                                this.currentNumber = number // 保存新的数值到当前数值变量中
                                this.setNumber({num}) // 设置数值位置到新位置，为下次动画做准备 
                            })
                        }, this.animtateTime)
                    })
                }
            }
        }
    },
})
