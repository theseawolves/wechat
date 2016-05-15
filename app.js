var PORT = process.env.PORT || 3000
var http = require('http')
var qs = require('qs')
var tmpl = require('tmpl')
var parseString = require('xml2js').parseString


var TOKEN = 'quay'

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

function replyLocation(msg, x,y,label,scale){
	// if (msg.xml.MsgType[0] !== 'location') {
	// 	return ''
	// }
	//console.log(msg)

	var replyTmpl = '<xml>' +
    '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
    '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
    '<CreateTime>{time}</CreateTime>' +
    '<MsgType><![CDATA[{type}]]></MsgType>' +
		'<Scale>16</Scale>'+
		'<Location_X>22.575359</Location_X>'+
		'<Location_Y>113.946121</Location_Y>'+
    '<Label><![CDATA[{label}]]></Label>' +
    '</xml>'

	return tmpl(replyTmpl,{
		toUser: msg.xml.FromUserName[0],
		fromUser: msg.xml.ToUserName[0],
		type: 'location',
		time: Date.now(),
		locationX: x,
		locationY: y,
		scale: scale,
		label: label
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
					var res = replyText(result,'消息推送成功！')
					// var res = replyLocation(result,21,110,'位置信息推送成功',16)
					// console.log( res )
					response.end(res)
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
