const http = require('http');
const net = require('net');
const fs = require('fs');
const { URL } = require('url');
const urlutils		= require('url');

main();

function main(){
	run_http_server();
}

function run_http_server(){
	const hostname = 'capable-parfait-f97c22.netlify.app';
	const port = 80;
	const server = http.createServer((req, res) => {
		handle_request_test(req, res);
	});

	server.listen(port, hostname, () => {
	  console.log(`Server running at http://${hostname}:${port}/`);
	});
}

function handle_request_test(request, response){
	let parts = urlutils.parse(request["url"], true);
	let url = parts.pathname; /* "/" | "/rar_login_ui.js" | "/rar_ui.js" | "ajax" | "file" | ... */
	response.statusCode = 200;
	response.end(url+" was requested")
}
function handle_request(request, response){
	let parts = urlutils.parse(request["url"], true);
	let url = parts.pathname; /* "/" | "/rar_login_ui.js" | "/rar_ui.js" | "ajax" | "file" | ... */
	let query = parts.query; /* {} - empty object or | {"id":"2805"} - id of requested file */
	if(url.startsWith("/api")){
		if(url.startsWith("/api/vacs/")){
			const splitted =url.split("/");
			const company_id = splitted[splitted.length-1];
			//@
			console.log(">>>", company_id);
			get_company_vacs_by_company_id(company_id, (err, res)=>{
				//@
				if(res){
					console.log("ANSWER TYPE:", typeof res);
					const answer_start =res.indexOf("{");
					const only_result =res.slice(answer_start);
					console.log("ANSWER RES:", only_result);
					response.end(only_result);
				}else{
					console.log("ANSWER ERR:", err);
				}
			});
			//response.end(url+" was requested")
		}
	}else{
		read_file(url, (err, result)=>{
			if(result){
				console.log("returning:", url);
				response.statusCode = 200;
				response.end(result);
			}else{
				//console.error("fail to read file:", err);
				response.statusCode =404;
				response.end();
			}
		});
	}
}

function read_file(fname, callback){
	const PATH = "." + ((fname == "/") ? "/index.html" : fname);
	fs.readFile(PATH, "utf8", (err, res)=>{
		if(err){
			callback(err);
			
		}else{
			callback(null, res);
		}
	});
}

function get_company_vacs_by_company_id(company_id, callback){
	//9d513820-5679-11ec-a073-550ed7335bbe
	//http://opendata.trudvsem.ru/api/v1/vacancies/company/
	const options = {
		port: 80,
		host: 'opendata.trudvsem.ru',
		method: 'GET',
		path: '/api/v1/vacancies/company/'+company_id
	};
	let res ="";
	const req = http.request(options, (res) => {
		//console.log("res: ", res);
		console.log("StatusCode: ", res.statusCode);
		//console.log("Headers: ", res.headers);
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			//@ typeof chunk == "string"
			//console.log('BODY: ' + chunk);
			res +=chunk;
		});
		res.on('end', ()=>{
			console.log('END!');
			callback(null, res);
		});
	});

	// Printing the agent options
	console.log("Agent Options: ", req.agent.options);
	req.end();
}