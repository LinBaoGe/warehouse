const db = wx.cloud.database()
const WHInfo = db.collection('WHInfo')
Page({
	data: {
		TFP: []
	},

	onLoad(e) {
		this.dList = JSON.parse(e.detailList)
		console.log(this.dList)
		console.log(this.dList.addressTitle)
		this.longitude = this.dList.WHLAL.coordinates[0]
		this.latitude = this.dList.WHLAL.coordinates[1]
		console.log(this.latitude)
		this.openid = this.dList._openid
		var heightList = []
		for (var i = 3; i < 21; i++) {
			heightList.push(i)
		}
		this.setData({
			dList: this.dList,
			heightList: heightList,
			hIndex: this.dList.hIndex,
			imgList: this.dList.imgList
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
		console.log(mId)
		console.log(e.detail.value)
		this.dList[mId] = e.detail.value
		console.log(this.dList)
		// this.setData({
		// 	mId: 0
		// })
	},

	height(e) {
		var hIndex = e.detail.value
		var heightList = this.data.heightList
		this.dList.height = heightList[hIndex] * 1
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

	blChange(e) {
		var lineCount = e.detail.lineCount
		if (lineCount > 1) {
			this.setData({
				autoHeight: true
			})
		}
	},

	addImg() {
		let imgList = this.dList.imgList
		wx.chooseImage({
			success: (res) => {
				let TFP = res.tempFilePaths
				let mixImg = imgList.concat(TFP)
				imgList = mixImg //全局用
				this.setData({
					TFP: TFP,  // 渲染用
					imgList: mixImg
				})
			}
		})
	},

	delImg(e) {
		var that = this
		this.imgIndex = e.currentTarget.dataset.index
		var imgList = this.dList.imgList
		wx.showModal({
			title: '删除图片',
			success(res) {
				if (res.confirm) {
					imgList.splice(that.imgIndex, 1)
					that.setData({
						imgList: imgList
					})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},

	async confirm() {
		console.log(this.dList)
		wx.showLoading({
			title: '上传中',
		})
		var explainList = ['标题', '面积', '单价', '高度', '地址', '门牌', '姓名', '电话', '图片',]
		var warnList = []
		var dList = this.dList
		var dataId = dList._id
		var area = dList.area
		var unitPrice = dList.unitPrice
		var height = dList.height
		var voltage = dList.voltage
		var imgList = dList.imgList
		var userTitle = dList.userTitle
		var houseNum = dList.houseNum
		var TFP = this.data.TFP
		var addressTitle = this.data.addressTitle ? this.data.addressTitle : dList.addressTitle
		var addressDetail = this.data.addressDetail ? this.data.addressDetail : dList.addressDetail
		var latitude = this.data.latitude ? this.data.latitude : this.latitude
		var longitude = this.data.longitude ? this.data.longitude : this.longitude
		var userName = dList.userName
		var phoneNum = dList.phoneNum
		warnList.push(userTitle, area, unitPrice, height, address, houseNum, userName, phoneNum, imgList)
		this.exist = true
		this.newImgList = []
		var finalImg = []

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
		if (this.exist & TFP.length > 0) {
			for (let i = 0; i < TFP.length; i++) {
				await wx.cloud.uploadFile({
					cloudPath: 'warehouse/img' + i + this.openid + (new Date() * 1) + '.png',
					filePath: TFP[i]
				}).then(res => {
					this.newImgList.push(res.fileID)
				})
			}
		}

		finalImg = imgList.concat(this.newImgList)

		await new Promise((rs, rj) => {
			rs(
				this.exist &&
				WHInfo.where({
					_id: dataId
				}).update({
					data: {
						area: area,
						unitPrice: unitPrice,
						height: height,
						voltage: voltage,
						imgList: finalImg,
						img: finalImg[0],
						updateTime: new Date(),
						userTitle: this.userTitle,
						addressTitle: addressTitle,
						addressDetail: addressDetail,
						houseNum: houseNum,
						WHLAL: db.Geo.Point(longitude, latitude)
					}
				})
			)
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

	}

})

// imgList不能为空 => TFP不能为空(imgList不为空不代表TFP不为空
// this.exist == imgList已经不为空了 // 可是imgList为空
// imgList不能为空  => 默认   TFP不能为空 => 语法错误