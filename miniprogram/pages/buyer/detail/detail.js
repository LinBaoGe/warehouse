Page({
	onLoad(e) {
		var WHInfoIndex = JSON.parse(e.WHInfoIndex)
		var addressTitle = WHInfoIndex.addressTitle
		var userTitle = WHInfoIndex.userTitle
		var imgList = WHInfoIndex.imgList
		var area = WHInfoIndex.area
		var height = WHInfoIndex.height
		var voltage = WHInfoIndex.voltage
		var unitPrice = WHInfoIndex.unitPrice
		var WHLon = WHInfoIndex.WHLAL.coordinates[0]
		var WHLat = WHInfoIndex.WHLAL.coordinates[1]
		var remark = WHInfoIndex.remark
		var markers = [{
			iconPath: 'landmark.png',
			id: 0,
			longitude: WHLon,
			latitude: WHLat,
			width: 30,
			height: 30,
			label: {
				content: addressTitle,
				display: 'always',
				borderRadius: 3,
				borderWidth: 1,
				borderColor: 'black',
				bgColor: '#ffffff',
				textAlign: 'center'
			}
		}]

		this.a = wx.cloud.getTempFileURL({
			fileList: imgList,
			success: res => {
				this.tempList = res.fileList
				console.log(tempList)
			}
		})

		this.setData({
			userTitle:userTitle,
			addressTitle: addressTitle,
			imgList: imgList,
			voltage: voltage,
			area: area,
			height: height,
			unitPrice: unitPrice,
			WHLon: WHLon,
			WHLat: WHLat,
			markers: markers,
			remark:remark
		})
	},

	bChange(e) {
		this.current = e.detail.current
	},

	img() {
		Promise.all([this.a]).then(res => {
			wx.navigateTo({
				url: '/pages/buyer/swiper/swiper?tempList=' + JSON.stringify(this.tempList) + '&current=' + this.current
			})
		})
	},

	phoneCall(){
		wx.makePhoneCall({
			phoneNumber: '13138237201',
		})
	}
})