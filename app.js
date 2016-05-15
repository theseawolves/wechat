var PORT = process.env.PORT || 3000
var http = require('http')
var qs = require('qs')
var tmpl = require('tmpl')
var parseString = require('xml2js').parseString
var TOKEN = 'quay'

var getUserInfo = require('./lib/user').getUserInfo;
var replyText = require('./lib/reply').replyText;
//var wss = require('./lib/ws.js').wss;

function checkSignature(params,token){
	var key = [token,params.timestamp,params.nonce].sort().join('')
	var sha1 = require('crypto').createHash('sha1')
	sha1.update(key)

	return sha1.digest('hex') == params.signature
}

//read reply
//
function replyText(msg, replyText){
	if (msg.xml.MsgType[0] !== 'text') {
		return ''
	}
	console.log(msg)

	var replyTmpl = '<xml>' +
    '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
    '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
    '<CreateTime><![CDATA[{time}]]></CreateTime>' +
    '<MsgType><![CDATA[{type}]]></MsgType>' +
    '<Content><![CDATA[{content}]]></Content>' +
    '</xml>'

	return tmpl(replyTmpl,{
		toUser: msg.xml.FromUserName[0],
		fromUser: msg.xml.ToUserName[0],
		type: 'text',
		time: Date.now(),
		content: replyText
	})
}


var server = http.createServer(function(request,response){
	var query = require('url').parse(request.url).query
	var params = qs.parse(query)

	// console.log(params)
	// console.log("token-->",TOKEN)

	if(!checkSignature(params,TOKEN)){
		response.end('signature fail')
	}

	if (request.method == 'GET') {
		response.end(params.echostr)
	} else {
		var postdata = ""

		request.addListener('data',function(postchunk){
			postdata +=postchunk
		})

		request.addListener('end',function(){
			console.log(postdata)
			parseString(postdata,function(err,result){
				if(!err){
					if(result.xml.MsgType[0] === 'text'){
						getUserInfo(result.xml.FromUserName[0])
						.then(function(userInfo){
							//获得用户信息，合并到消息中
							result.user = userInfo;
							//将消息通过websocket广播
							//wss.broadcast(result);
							var res = replyText(result, '消息推送成功！');
							response.end(res);
						})
					}
				}

			})

		})
	}

	request.addListener('end',function(){
		response.end('success')
	})



})

server.listen(PORT)

console.log("Server runing at port: "+ PORT +".")
