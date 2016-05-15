var appID = require('./config').appID
var appsecret = require('./config').appsecret
var getToken = require('./token').getToken
var request = require('request')

function getUserInfo(openID){
  return getToken(appID,appsecret).then(function(res){
    var token = res.access_token
    var userUrl = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+token+'&openid='+openID+'&lang=zh_CN'

    return new Promise(function(resolve,reject){
      request(userUrl,function(err,res,data){
        resolve(JSON.parse(data))
      })
    }).catch(function(err){
      console.error(err)
    })
  })
}

module.exports = {
  getUserInfo: getUserInfo
}
