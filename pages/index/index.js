//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    user: '',
    wish_content: '',
    scrollTop: '',
    alert: false,
    imgList:[],
    current: 1,
    pages: '',
    isLoading: false,
    loadingComplete: false,
  },
  // 下拉刷新 API 有scroll-view就是不灵活不作用
  upper:function(){
    var that = this;
    this.firstUrl()
    this.setData({
      isLoading:true
    })
    setTimeout(function(){
      that.setData({
        isLoading: false
      })
    }, 1000)
    console.log('huidaodingbu');
  },
  // onPullDownRefresh: function (e) {
  //   wx.stopPullDownRefresh();
  //   var that = this;
  //   var user = this.firstUrl();
  //   setTimeout(function () {
  //     that.setData({
  //       user:user
  //     })
  //   }, 1500);
  // },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 回到顶部
  toTop: function() {
    this.fresh();
    this.setData({
      scrollTop: 0
    })
  },
  // 滚动到底部
  loadMore: function() {
    this.data.page += 1;
    var tryuser = this.data.tryuser;
    var useritem = this.data.user1.filter((item) => {
      return item.page === this.data.page;
    });
    var item;
    for (var key in useritem[0]) {
      if (key === "item"){
        item=useritem[0][key];
      }
    }
    if (item) {
      this.setData({
        tryuser: tryuser.concat(item),
        isLoading: true
      })
    } else {
      this.setData({
        isLoading: false,
        loadingComplete: true, //把“没有数据”设为true，显示  
          //把"上拉加载"的变量设为false，隐藏  
      })
    }
    
  },
  loadPage: function(page) {
    var that = this;
    wx.showLoading({
      title: '正在加载中'
    });
    setTimeout(function () {
      wx.hideLoading();
    }, 1000)
    console.log('is loading');
    wx.request({
      url: `https://s-prod-07.qunzhu666.com/wish/index?page=${page}`,
      header: {
        'content-type':'application/json'
      },
      success:function(res) {
        var user = that.data.user;
        var item = res.data.results;
        var imgList = that.data.imgList;
        that.util(item);
        for (var i = 0; i < item.length; i++) {
          for (var key in item[i]) {
            if (key === "font_img") {
              if (item[i][key] !== "") {
                imgList.push(user[i][key]);
              }
            }
          }
        }
        that.setData({
          user: user.concat(item),
          imgList: imgList
        });
        console.log(item);
      }
    })
  },
  // 第一次加载时或者下拉刷新 重新请求数据的通用函数
  firstUrl: function() {
    var that = this;
    wx.request({
      url: 'https://s-prod-07.qunzhu666.com/wish/index',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var user = that.data.user;
        var count = res.data.count;
        if (count % 40 === 0) {
          count = count / 40;
        } else {
          count = Math.ceil(count / 40);
        }
        that.setData({
          pages: count
        });
        console.log(count);
        user = res.data.results;
        console.log(that.util(user));
        that.setData({
          user: user
        })
        var imgList = that.data.imgList;
        for (var i = 0; i < user.length; i++) {
          for (var key in user[i]) {
            if (key === "font_img") {
              if (user[i][key] !== "") {
                imgList.push(user[i][key]);
              }
            }
          }
        }
        that.setData({
          imgList: imgList
        });
      }
    });
  },
  // 下拉刷新
  fresh: function() {
    this.firstUrl();
  },
  // 上拉加载
  loadMore: function(){
    var page = this.data.current + 1;
    this.setData({
      current: page
    })
    console.log(page);
    if (page <= this.data.pages){
      this.loadPage(page);
    } else {
      this.setData({
        loadingComplete: true
      })
    }
  },
  // 通用工具 时间转换和图片判断
  util: function(user) {
    for (var i = 0; i < user.length; i++) {
      for (var key in user[i]) {
        if (key === "created") {
          user[i][key] = this.convertUTCTimeToLocalTime(user[i][key]);
        }
        if (key === 'img_url') {
          if (user[i][key] === 'test' || user[i][key] === '' || user[i][key] === null) {
            user[i][key] = "../static/images/default-head.jpg";
          }
        }
        if (key === "font_img") {
          if (user[i][key] === "undefined") {
            user[i][key] = "";
          }
        }
      }
    }
   
    return user;
  },
  onLoad: function() {
   this.firstUrl();
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.imgList // 需要预览的图片http链接列表  
    })
  },
  convertUTCTimeToLocalTime: function (UTCDateString) {
    if (!UTCDateString) {
      return '-';
    }
    function formatFunc(str) {    //格式化显示
      return str > 9 ? str : '0' + str
    }
    var date2 = new Date(UTCDateString);     //这步是关键
    var year = date2.getFullYear();
    var mon = formatFunc(date2.getMonth() + 1);
    var day = formatFunc(date2.getDate());
    var hour = date2.getHours();
    // var noon = hour >= 12 ? 'PM' : 'AM';
    // hour = hour >= 12 ? hour - 12 : hour;
    // hour = formatFunc(hour);
    var min = formatFunc(date2.getMinutes());
    var dateStr = mon + '-' + day + ' '+ ' ' + hour + ':' + min;
    return dateStr;
  },
  showDialog: function(e) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        showWish: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          showWish: true
        });
        
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            showWish: true
          });
          
        }
      })
      
    }
    this.setData({
      scrollTop: this.data.scrollTop
    })
    
  },
  inputChange: function(e) {
    this.setData({
      wish_content: e.detail.value
    });
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showWish: false,
      alert: false,
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function (e) {
    var that= this;
    var user = this.data.user;
    if (this.data.wish_content === '') {
      this.setData({
        alert:true
      })
    } else {
      this.setData({
        alert: false
      })
      console.log(this.data.tempFilePaths);
      var img = this.data.tempFilePaths;
      if (img === undefined || img === "") {
        img = "";
      } else {
        img = img[0];
      }
      var data = {
        "username": this.data.userInfo.nickName,
        "img_url": this.data.userInfo.avatarUrl,
        "wish_content": this.data.wish_content,
        "font_img": img,
      };
      wx.request({
        url: 'https://s-prod-07.qunzhu666.com/wish/index',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        data: data,
        success: function (res) {
          var useritem = res.data;
          for (var key in useritem) {
            if (key === 'created') {
              useritem[key] = that.convertUTCTimeToLocalTime(useritem[key]);
            }
          }
          console.log(useritem);
          var imgList = that.data.imgList;
          for (key in useritem) {
              if (key === "font_img") {
                if (useritem[key] !== "") {
                  imgList.push(user[key]);
                }
              }
          }
          that.setData({
            imgList: imgList
          });
          user.unshift(useritem);
          that.setData({
            user: user,
            tempFilePaths: '',
            wish_content: ''
          });
        }
      });
      this.hideModal();
    }
  },
  // 获取照片
  chooseimage: function () {
    var _this = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        _this.setData({
          tempFilePaths: res.tempFilePaths
        })

      }
    });
  }  
})
