var express = require('express');
var app = express();
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

app.get('/', function(req, res) {
    if(checkSignature(req.params, TOKEN)){
     response.send(req.params.echostr);
   }else{
     response.send('signature fail');
   } 
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});

app.listen(process.env.PORT||3000, function () {
  console.log('Example app listening on port !'+(process.env.PORT||3000));
});
