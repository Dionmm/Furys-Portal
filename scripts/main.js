//Global variables
var url = "https://api.furysayr.co.uk"
var authenticated = false;


//Index page form
$('.loginForm').submit(function(event){
	event.preventDefault();
	var username = $('#username').val();
	var password = $('#password').val();
	if(username && password){
		login(username, password);
	} else{
		console.error('no data');
	}
});

//Order page
authenticate();

$('.logout').click(function(){
	alert('Logged out');
	window.localStorage.removeItem("token");
});

//Functions
function login(username, password){
	var userData = {
		grant_type: "password",
		username: username,
		password: password
	};
	var data = $.param(userData);
	console.log(data);
	$.ajax({
		type: "POST",
		url: url + "/token",
		data: data
	}).done(function(result){
		console.log(result);
		if(result.role === "Admin"){
			window.localStorage.token = "Bearer " + result.access_token;
			window.location.replace("/order.html");
		} else{
			alert("You don't have permission to access this system");
		}
	}).fail(function(response){
		console.error(response.status)
		if(response.status === 400){
			alert("Username or password incorrect");
		}
	});
}

function authenticate(){
	if(window.localStorage.token){
		console.info("authenticated")
		authenticated = true;
	}else{
		console.error("Not authenticated")
		authenticated = false;
	}

	if(!authenticated && window.location.pathname !== "/index.html"){
		window.location.replace("/index.html")
	}
}

//SignalR
$.connection.hub.url = 'https://api.furysayr.co.uk/signalr'
var order = $.connection.orderHub;
var token = window.localStorage.token;

$.connection.hub.qs = { "bearerToken" : token}

order.client.test = function(data){
	console.info(data);
}

$.connection.hub.start().done(function(){
	console.log('Started');
});