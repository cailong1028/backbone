/**
 * Created by cailong on 2015/6/25.
 */
var http = require('http');

var emulatePost = function(){
	console.log('do here');
	var data = {
		types: ['Consulting service','Proposals','Requests', 'Complaints', 'Other']
	};

	data = JSON.stringify(data);
	var options = {
		method: 'POST',
		host: '192.168.102.11',
		port: 80,
		path: '/api/ticket-types',
		data: data,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	};

	var req = http.request(options, function(res){
		console.log(JSON.stringify('res is --> '+res));
		if(res.statusCode >= 200 && res.statusCode < 300){
			res.on('data', function(data){
				console.log('on data !!!   '+ data);
			}).on('end', function(){
				console.log('end!!!! ');
			});
		}else {
			console.log('500 here');
		}
	});
	req.write(data = '\n');
	req.end();
};

module.exports = emulatePost();