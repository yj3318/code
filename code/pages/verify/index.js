const app = getApp()
Page({
    data: {
        left: 0, // X轴位置，单位px（需要接口给）
        top: 0, // Y轴位置，单位px（需要接口给），与targetData.y一致
        defaultX: 0, // 滑块初始位置
        // 目标对象数据（需要接口给）
        targetData: {
            width: 0, // 宽度，单位px
            height: 0, // 高度，单位px
            x: 0, // X轴坐标，单位px
            y: 0, // Y轴坐标，单位px
        },
        time: 0, // 拖拽秒数
    },
    puzzleLeft: 0, // 拼图初始X轴距离，单位px，与left一致
    tolerance: 5, // 误差（滑动距离)，单位px
    coord: 0, // 拖拽位置
    now: 0, // 拖拽初始时间戳
    // 拖拽时调用的方法
    drag(e) {
        if (!this.now) {
            this.now = new Date().getTime()
        }
        this.coord = this.puzzleLeft + e.detail.x // 记录拖拽位置
        this.setData({
            left: this.coord,
        })
    },
    // 拖拽完成时调用的方法
    dragOver (e) {
        if (this.coord >= this.data.targetData.x - this.tolerance && this.coord <= this.data.targetData.x + this.tolerance) {
            // 验证成功
            wx.showToast({
                title: '验证成功',
                icon: 'success',
                duration: 2000,
            })
            //验证成功之后的代码
            this.setData({
                time: (new Date().getTime() - this.now) / 1000,
            }, () => {
                this.now = 0
            })
            console.log('x:' + this.data.left, 'y:' + this.data.top)
        } else {
            this.setData({
                defaultX: 0,
                left: this.puzzleLeft,
                time: 0,
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (params) {
        // 初始化
        let width = 25
        let height = 20
        let x = 200
        let y = 25
        let left = 5
        this.setData({
            'targetData.width': width,
            'targetData.height': height,
            'targetData.x': x,
            'targetData.y': y,
            left,
            top: y,
        })
        this.puzzleLeft = left
    },
})
