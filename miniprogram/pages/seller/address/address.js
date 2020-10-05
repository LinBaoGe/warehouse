var QQMapWX = require('../libs/qqmap-wx-jssdk.js')
var qqmapsdk;
Page({
  onLoad: function (e) {
    var that = this
    qqmapsdk = new QQMapWX({
      key: 'WJOBZ-HMZ6V-6F3P4-UQBHX-CRASV-VOFZT'
    })

    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const lat = res.latitude
        const lon = res.longitude
        const markers = [{
          latitude: lat,
          longitude: lon,
          iconPath: 'landmark.png',
          width: 40,
          height: 40,
          callout: {
            content: '你现在位置'
          }
        }]
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: lat,
            longitude: lon
          },
          get_poi: 1,
          success(res) {
            console.log(res)
            var poiList = res.result.pois
            var sug = []
            for (var i in poiList) {
              sug.push({
                title: poiList[i].title,
                address: poiList[i].address,
                latitude: poiList[i].location.lat,
                longitude: poiList[i].location.lng
              })
            }
            that.setData({
              latitude: lat,
              longitude: lon,
              markers: markers,
              suggestion: sug
            })
          }
        })
      }
    })
  },

  backfill: function (e) {
    var id = e.currentTarget.id;
    for (var i = 0; i < this.data.suggestion.length; i++) {
      if (i == id) {
        this.setData({
          backfill: this.data.suggestion[i].title
        });
      }
    }
  },

  getsuggest(e) {
    var _this = this;
    var keyword = e.detail.value
    qqmapsdk.getSuggestion({
      keyword: e.detail.value, 
      success: function (res) {
        console.log(res);
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({
            title: res.data[i].title,
            id: res.data[i].id,
            address: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        console.log('sug', sug)
        _this.setData({
          suggestion: sug,
          keyword: keyword
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  addressConfirm(e) {
    let pages = getCurrentPages()
    let prePage = pages[pages.length - 2]
    let index = e.currentTarget.dataset.index
    let suggestion = this.data.suggestion
    console.log(suggestion)
    let addressTitle = suggestion[index].title
    let addressDetail = suggestion[index].address
    let latitude = suggestion[index].latitude
    let longitude = suggestion[index].longitude
    prePage.setData({
      addressTitle:addressTitle,
      addressDetail: addressDetail,
      latitude: latitude,
      longitude: longitude
    })
    wx.navigateBack({
      delta: 1
    })
  }

})
