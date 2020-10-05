const db = wx.cloud.database()
const WHInfo = db.collection('WHInfo')
Page({
    onLoad(e){
        var that = this
				var tempList = JSON.parse(e.tempList)
				this.setData({
					tempList:tempList,
					current:e.current
				})        
    }
})
