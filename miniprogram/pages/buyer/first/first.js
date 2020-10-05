const db = wx.cloud.database()
const WHInfo = db.collection('WHInfo')
const mapDemo = db.collection('mapDemo')
const WHOther = db.collection('WHOther')

Page({
	data: {
		slidownOrNot: true,
		mArr: [[], [], []],
		sMask:false
	},

	async onLoad() {
		await this.latNlng()
		await WHInfo.get().then(res => {
			this.list = res.data
		})
		var list = this.list.concat()
		for (var i in list) {
			var yLat = list[i].WHLAL.latitude
			var yLng = list[i].WHLAL.longitude
			var distance = this.distance(this.mLat, this.mLng, yLat, yLng)
			list[i].distance = distance
		}
		for (var i in list) {
			if (list[i].distance >= 1) {
				list[i].afterDistance = list[i].distance.toFixed(1)
				list[i].unit = '公里'
			} else {
				list[i].afterDistance = (list[i].distance * 1000).toFixed(0)
				list[i].unit = '米'
			}
		}
		var WHList = list.sort((a, b) => a.distance - b.distance)
		var ttlList = []
		var ttlEmptyList = ['位置', '面积', '单价']
		var three = [['<5公里', '<10公里', '>10公里'], ['<1000方', '1000~3000方', '>3000方'], ['<10元', '10~15元', '>15元']]
		var threeEmpty = []
		for (var i in three) {
			threeEmpty.push([])
			for (var j in three[i]) {
				threeEmpty[i].push({ name: three[i][j] })
			}
		}
		for (var i in ttlEmptyList) {
			ttlList.push({ name: ttlEmptyList[i], list: threeEmpty[i] })
		}
		this.setData({
			ttlList: ttlList,
			WHList: WHList,
			filterArray: WHList
		})
	},

	onShow(){
		this.onLoad()
	},

	bConfirm(e){
		var value = e.detail.value
		var WHList = this.data.WHList
		var arr = []
		for(var i in WHList){
			if(WHList[i].userTitle.indexOf(value)!=-1 || WHList[i].remark.indexOf(value)!=-1){
				arr.push(WHList[i])
			}
		}
		console.log(arr)
		this.setData({
			filterArray:arr
		})
	},

	// bIndex = beforeIndex
	one(e) {
		var ttlList = this.data.ttlList
		var oIndex = e.currentTarget.dataset.index
		var bIndex = this.data.oIndex
		var sMask = this.data.sMask
		for (var i = 0; i < ttlList.length; i++) {
			if (i == oIndex) {
				continue
			}
			ttlList[i].up = false
		}
		ttlList[oIndex].up = !ttlList[oIndex].up
		if(oIndex==null || oIndex==bIndex){
			sMask = !this.data.sMask
		}else{
			sMask = true
		}

		this.setData({
			oIndex: oIndex,
			ttlList: ttlList,
			sMask: sMask
		})
	},

	sMask() {
		var ttlList = this.data.ttlList
		var oIndex = this.data.oIndex
		ttlList[oIndex].up = false
		this.setData({
			sMask: false,
			ttlList: ttlList
		})
	},

	two(e) {
		var oIndex = this.data.oIndex
		var tIndex = e.currentTarget.dataset.index
		var ttlList = this.data.ttlList
		var mArr = this.data.mArr
		var WHList = this.data.WHList
		ttlList[oIndex].up = false
		ttlList[oIndex].color = true
		ttlList[oIndex].name = ttlList[oIndex].list[tIndex].name
		for (var i = 0; i < ttlList[oIndex].list.length; i++) {
			ttlList[oIndex].list[i].color = false
		}
		ttlList[oIndex].list[tIndex].color = true
		oIndex == 0 && (mArr[0] = [oIndex, tIndex])
			|| oIndex == 1 && (mArr[1] = [oIndex, tIndex])
			|| oIndex == 2 && (mArr[2] = [oIndex, tIndex])
		
		console.log(mArr)
		var filterArray = this.filterMethod(mArr, WHList)
		
		// console.log('filterArray', filterArray)
		this.setData({
			tIndex: tIndex,
			ttlList: ttlList,
			filterArray: filterArray,
			sMask: false
		})
	},

	listItem(e) {
		var listIndex = e.currentTarget.dataset.index
		this.setData({
			listIndex: listIndex,
			slidownOrNot: false
		})
	},

	//--------------------------------------公共方法--------------------------------------------

	distance(lat1, lng1, lat2, lng2) {
		lat1 = lat1 || 0
		lng1 = lng1 || 0
		lat2 = lat2 || 0
		lng2 = lng2 || 0

		var rad1 = lat1 * Math.PI / 180.0
		var rad2 = lat2 * Math.PI / 180.0
		var a = rad1 - rad2
		var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
		var r = 6378.137
		var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))

		return distance
	},

	latNlng() {
		var that = this
		return new Promise((resolve, reject) => {
			wx.getLocation({
				type: 'gcj02',
				success(res) {
					that.mLat = res.latitude
					that.mLng = res.longitude
					resolve(that.mLat, that.mLng)
				}
			})
		})
	},

	filterMethod(mArr, arr) {
		var index1 = mArr[0][0]
		var index2 = mArr[0][1]
		var index11 = mArr[1][0]
		var index22 = mArr[1][1]
		var index111 = mArr[2][0]
		var index222 = mArr[2][1]

		return arr.filter(item => {
			var exp1 = true
			var exp2 = true
			var exp3 = true
			if (mArr[0].length>0) {
				var exp1 = (index1 == 0 & index2 == 0) && item.distance <= 5
					|| index1 == 0 & index2 == 1 && item.distance <= 10
					|| index1 == 0 & index2 == 2 && item.distance > 10
			}

			if (mArr[1].length>0) {
				var exp2 = (index11 == 1 & index22 == 0) && item.area <= 1000
					|| (index11 == 1 & index22 == 1) && (item.area > 1000 & item.area <= 3000)
					|| (index11 == 1 & index22 == 2) && item.area > 3000
			}

			if (mArr[2].length>0) {
				var exp3 = (index111 == 2 & index222 == 0) && item.unitPrice <= 10
					|| (index111 == 2 & index222 == 1) && (item.unitPrice > 10 & item.unitPrice <= 15)
					|| (index111 == 2 & index222 == 2) && item.unitPrice > 15
			}
			return exp1 & exp2 & exp3
		})
	},

	WHItem(e) {
		var index = e.currentTarget.dataset.index
		var filterArray = this.data.filterArray
		var WHInfoIndex = filterArray[index]
		wx.navigateTo({
			url: '/pages/buyer/detail/detail?WHInfoIndex=' + JSON.stringify(WHInfoIndex)
		})
	},

	addWH() {
		wx.navigateTo({
			url: '/pages/seller/add/add',
		})
	},

})