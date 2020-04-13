/*
 * 在js中加入 import cutdownPannel from '../../component/cutdown/index' // 导入倒计时组件
 * 新生成一个实例 let cutdownObj = new cutdownPannel({$this: this, success: () => {}})
 * 执行倒计时 this.cutdownObj.add({sort: 0, times})
 */
class CutdownPannel {
    // 构造
    constructor ({$this = null, dataName = 'cutdownData', noday = false, return99 = false, isDouble = true, success = () => {}}) {
        this.app = getApp()
        this.$this = $this // page对象
        this.dataName = dataName // 倒计时data对象名称
        this.isDouble = isDouble // 是否按双位数返回
        this.success = success // 倒计时归零后后执行的函数
        this.noday = noday // 是否需要返回天数
        this.return99 = return99 // 大于99，是否返回99
        this.stopTime = 0 // 暂停时间戳
        this.startTime = 0 // 开始时间戳
        this.cutdownTimeout = null // 倒计时定时器
        this.speed = 1000 // 倒计时间隔
        // 初始化页面data
        if (!this.$this.data[this.dataName]) {
            this.$this.setData({
                [this.dataName]: {},
            })
        }
    }
    // 加入到倒计时对象中
    // sort为对象中的下标，在页面中调用此下标就能取到倒计时数字，必须
    // times为时间差，单位秒，必须 
    add ({sort = 0, times = 0} = {}) {
        // 如果暂停后，加入倒计时数据，则自动开始倒计时
        if (this.stopTime) {
            this.startTime = Math.floor(new Date().getTime() / 1000)
        }
        if (sort.toString() && this.$this) {
            // 加入到数据中
            if (times && this.$this) {
                this._stop()
                // 满足倒计时条件，计时倒计时显示数字
                this.$this.setData({
                    [this.dataName + '[' + sort + ']']: this._computingTime({time: times}),
                })
                this._start()
            } else {
                // 不满足倒计时条件
                console.log('该条数据不满足倒计时条件，不与执行', 'sort:' + sort, 'times:' + times)
            }
        }
        return this
    }
    // 开始倒计时(外部调用)
    start () {
        // 只有停止时间戳有效，才记录开始时间戳
        if (this.stopTime) {
            this.startTime = Math.floor(new Date().getTime() / 1000)
        }
        this._start()
        return this
    }
    // 停止倒计时(外部调用)
    stop () {
        this.stopTime = Math.floor(new Date().getTime() / 1000)
        this._stop()
        return this
    }
    // 开始倒计时(内部调用)
    _start () {
        // 无倒计时的时候才执行，避免重计时
        if (!this.cutdownTimeout) {
            this._cutdown()
        }
    }
    // 停止倒计时(内部调用)
    _stop () {
        // 有倒计时的时候才执行
        if (this.cutdownTimeout) {
            clearTimeout(this.cutdownTimeout)
            this.cutdownTimeout = null
        }
    }
    // 消毁倒计时
    destory () {
        this.stop()
        // 将数据清除
        if (this.$this.data[this.dataName]) {
            this.$this.setData({
                [this.dataName]: {},
            })
        }
    }
    // 倒计时 
    _cutdown () {
        if (this.$this.data[this.dataName]) {
            let data = this.app.commonJs.copyObj(this.$this.data[this.dataName])
            // 循环倒计时数据
            let num = 0 // 倒计时数据数量，为0时不再执行setTimeout
            for (let i in data) {
                if (data[i]) {
                    // 判断是否有倒计时数据
                    if (data[i].time <= 0) {
                        // 倒计时已结束，从倒计时数据中删除
                        delete data[i]
                        if (typeof this.success === 'function') {
                            this.success(i)
                        }
                    } else {
                        num++
                        data[i].time--
                        if (data[i].time >= 0) {
                            // 倒计时后还大于0，则执行更新页面数值的方法
                            data[i] = this._computingTime({time: data[i].time})
                        }
                    }
                }
            }
            this.$this.setData({
                [this.dataName]: data,
            })
            // 清除开始与停止时间戳
            this.startTime = 0
            this.stopTime = 0
            if (num) {
                // 延迟执行
                this.cutdownTimeout = setTimeout(() => {
                    this._cutdown()
                }, this.speed)
            }
        }
    }
    _computingTime ({time = 0} = {}) {
        // 计算时间
        let days = 0
        let hours = 0
        let minutes = 0
        let seconds = 0
        let tempTimes = parseInt(time) - Math.abs(this.startTime - this.stopTime) // 去掉暂停中的时间
        if (tempTimes < 0) {
            // 重置时间
            tempTimes = 0
            time = 0
        } else {
            time = tempTimes // 保存时间
        }
        if (!this.noday) {
            days = Math.floor(tempTimes / 86400)
        }
        hours = Math.floor((tempTimes - days * 86400) / 3600)
        minutes = Math.floor((tempTimes - days * 86400 - hours * 3600) / 60)
        seconds = Math.floor(tempTimes - days * 86400 - hours * 3600 - minutes * 60)
        if (this.isDouble && days < 10) {
            days = '0' + days
        } else {
            days = this.return99 && days > 99 ? '99' : days.toString()
        }
        if (this.isDouble && hours < 10) {
            hours = '0' + hours
        } else {
            hours = this.return99 && hours > 99 ? '99' : hours.toString()
        }
        if (this.isDouble && minutes < 10) {
            minutes = '0' + minutes
        } else {
            minutes = minutes.toString()
        }
        if (this.isDouble && seconds < 10) {
            seconds = '0' + seconds
        } else {
            seconds = seconds.toString()
        }
        // time为当前所剩时间(秒)
        return {time, days, hours, minutes, seconds}
    }
}

export default CutdownPannel
