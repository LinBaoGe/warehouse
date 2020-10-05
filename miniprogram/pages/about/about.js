Page({
	clip(e){
		var content = e.currentTarget.id
		wx.setClipboardData({
			data: content,
			success (res) {
				wx.getClipboardData({
					success (res) {
						console.log(res.data) // data
					}
				})
			}
		})
	}
})