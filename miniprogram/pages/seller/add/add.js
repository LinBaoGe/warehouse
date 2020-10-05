const db = wx.cloud.database()
const WHInfo = db.collection('WHInfo')

Page({
	onLoad() {
		var heightList = []
		for (var i = 3; i < 21; i++) {
			heightList.push(i)
		}
		wx.cloud.callFunction({
			name: 'login'
		}).then(res => {
			this.openid = res.result.openid
		})
		this.setData({
			heightList: heightList
		})
	},

	onShow() {
		wx.authorize({
			scope: 'scope.userLocation',
		})
	},

	focus(e) {
		var mId = e.currentTarget.id
		this.setData({
			mId: mId
		})
	},

	mBlur(e) {
		var mId = e.currentTarget.id
		var value = e.detail.value
		this[mId] = value
		this.setData({
			mId: 0
		})
	},

	height(e) {
		var hIndex = e.detail.value
		var heightList = this.data.heightList
		this.setData({
			hIndex: hIndex,
			height: heightList[hIndex],
			pickOrNot: true
		})
	},

	address() {
		wx.getSetting({
			success: (res) => {
				if (!res.authSetting['scope.userLocation']) {
					wx.showModal({
						title: '提示',
						content: '请求获取位置权限',
						success(res) {
							if (res.confirm == false) {
								return false
							}
							wx.openSetting({
								success: (res) => {
									if (!res.authSetting['scope.userLocation']) {
										wx.showToast({
											title: '提示',
											content: '此功能需要获取位置信息，请重新设置',
											duration: 2000,
											icon: 'warn'
										})
									}
								}
							})
						}
					})
				} else {
					wx.navigateTo({
						url: '/pages/seller/address/address',
					})
				}
			},
		})
	},

	addImg() {
		wx.chooseImage({
			complete: (res) => {
				let TFP = res.tempFilePaths
				this.setData({
					TFP: TFP
				})
			}
		})
	},

	blChange(e) {
		var lineCount = e.detail.lineCount
		if (lineCount > 1) {
			this.setData({
				autoHeight: true
			})
		}
	},

	async confirm() {
		wx.showLoading({
			title: '上传中',
		})
		var explainList = ['面积', '单价', '高度', '地址', '门牌', '姓名', '电话', '标题', '图片']
		var warnList = []
		var height = this.data.height
		var TFP = this.data.TFP
		var addressTitle = this.data.addressTitle
		warnList.push(this.area, this.unitPrice, height, addressTitle, this.houseNum, this.userName, this.phoneNum, this.userTitle, TFP)
		console.log(warnList)
		this.exist = true
		this.imgList = []

		for (var i = 0; i < warnList.length; i++) {
			if (!warnList[i]) {
				this.exist = false
				this.setData({
					warn: true,
					warnInfo: '请完善' + explainList[i] + '的信息'
				})
				setTimeout(() => {
					this.setData({
						warn: false
					})
				}, 2000)
				break
			}
		}

		if (this.exist) {
			for (let i = 0; i < TFP.length; i++) {
				await wx.cloud.uploadFile({
					cloudPath: 'warehouse/img' + i + this.openid + (new Date() * 1) + '.png',
					filePath: TFP[i]
				}).then(res => {
					this.imgList.push(res.fileID)
				})
			}
			WHInfo.add({
				data: {
					area: this.area * 1,
					unitPrice: this.unitPrice * 1,
					height: height * 1,
					hIndex: this.data.hIndex * 1,
					voltage: this.voltage * 1,
					imgList: this.imgList,
					img: this.imgList[0],
					cfmTime: new Date(),
					houseNum: this.houseNum,
					WHLAL: db.Geo.Point(this.data.longitude, this.data.latitude),
					userName: this.userName,
					phoneNum: this.phoneNum,
					userTitle: this.userTitle,
					remark: this.remark,
					addressTitle: addressTitle,
					addressDetail: this.data.addressDetail,
				}
			})
			wx.hideLoading({
				complete: (res) => {
					wx.showToast({
						title: '成功！',
						icon: 'success',
						duration: 2000
					})
				},
			})
			wx.navigateBack({
				delta: 1
			})
		}
	}

})

