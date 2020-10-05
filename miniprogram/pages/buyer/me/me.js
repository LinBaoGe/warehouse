Page({
	onLoad() {
		this.authMethod()
	},

	onShow() {
		this.authMethod()
	},

	auth() {
		this.authMethod()
	},

	mRent() {
		wx.navigateTo({
			url: '/pages/seller/his/his',
		})
	},

	about() {
		wx.navigateTo({
			url: '/pages/about/about',
		})
	},

	authMethod() {
		var that = this
		wx.getSetting({
			success(res) {
				if (res.authSetting['scope.userInfo']) {
					wx.getUserInfo({
						success: function (res) {

							that.setData({
								auth: true,
								authInfo: res.userInfo
							})
						}
					})
				} else {
					console.log('fail')
					that.setData({
						auth: false
					})
				}
			}
		})
	}


})

// if(res.userInfo.gender==1){
// 	var mGender = '女士'
// }else{
// 	var mGender = '先生'
// }
// that.setData({
// 	mGender:mGender,
// 	nickname:res.userInfo.nickName
// })