const db = wx.cloud.database()
const WHInfo = db.collection('WHInfo')

Page({
	async onLoad() {
		await wx.cloud.callFunction({
			name: 'login'
		}).then(res => {
			this.openid = res.result.openid
		})
		await WHInfo.where({
			_openid: this.openid
		}).get().then(res => {
			this.list = res.data
		})
		this.setData({
			openid: this.openid,
			list: this.list
		})
	},

	onShow(){
		this.onLoad()
	},

	WHItem(e) {
		var list = this.data.list
		var wIndex = e.currentTarget.dataset.index
		var detailList = list[wIndex]
		wx.navigateTo({
			url: '/pages/seller/edit/edit?detailList=' + JSON.stringify(detailList)
		})
	}

})
