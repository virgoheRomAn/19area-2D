var http = require('http');

http.createServer(function(request, response) {
    response.writeHead(200, {'content-type' : 'application/json; charset=utf-8'});
    
    if (request.method === 'POST') {
        if (request.url === '/getIn' && request.headers['requestgetin'] === 'true') {
            response.write('{ "code": 1000, "message": "成功" }');
            process.send("123");
        } else {
            response.write('{ "code": 999, "message": "error url" }');
        }
    } else {
        response.write('{ "code": 999, "message": "error method" }');
    }
    response.end();

}).listen(8089, '127.0.0.1',function(){
    console.log("Listening on port 8089!");
});