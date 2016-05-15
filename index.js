var PORT = process.env.PORT || 3000
var http = require('http')

var app = http.createServer(function(request,response){
  request.addListener('end',function(){
		response.end('success')
	})
})

app.listen(PORT)
