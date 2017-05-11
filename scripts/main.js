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
	window.location.replace("/index.html");
});

$('.orderList').live('click', '.orderListItem', function(event){
	//Gets the id associated with the clicked order. Due to the ajax
	//loading of the orders .click() can't be used on the specific
	//.orderListItem so .live() on the parent element is used. Also,
	//due to the h3 element it is possible the click can be tracked to
	//either the li or h3 elements, this is accounted for below
	
	var target = event.target;
	var id = '';
	if(target.localName === 'h3'){
		id = target.parentElement.attributes['data-id'].value;
	}else{
		id = target.attributes['data-id'].value;
	}


	orderHub.server.orderDetails(id);
	$('.orderContent').css('visibility', 'visible');
});

$('#orderComplete').click(function(){
	if(confirm('Is this order complete?')){
		orderHub.server.orderComplete($(this).attr('data-id'));
	}
});

$('#orderCollected').click(function(){
	if(confirm('Has the order been collected?')){
		orderHub.server.orderCollected($(this).attr('data-id'));
	}
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
			window.localStorage.token = result.access_token;
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

function disableButton(){
	$('#orderCollected').removeAttr('disabled');
	$('#orderComplete').attr('disabled', 'true');
}

function enableButton(){
	$('#orderComplete').removeAttr('disabled');
	$('#orderCollected').attr('disabled', 'true');
}
//SignalR
$.connection.hub.url = url + '/signalr'
var orderHub = $.connection.orderHub;
var token = window.localStorage.token;

$.connection.hub.qs = { "bearerToken" : token }

orderHub.client.displayOrders = function(data){
	for(order of data){
		$('#displayOrders').append('<li class="orderListItem" data-id="'+ order.Id + '"><h3>Order ' + order.OrderNumber + '</h3></li>');
	}
}
orderHub.client.newOrder = function(order){
	$('#displayOrders').append('<li class="orderListItem" data-id="'+ order.Id + '"><h3>Order ' + order.OrderNumber + '</h3></li>');
}
orderHub.client.orderDetails = function(data){
	var drinkList = {}
	$('.drinkSidebar').html('');
	enableButton();

	$('.orderContentImage').html('<img src="https://www.placecage.com/150/150">');
	$('.orderContentMain h2').html('Order ' + data.OrderNumber);
	$('.orderContentWOD h1').text(data.OrderWord);
	$('#orderComplete').attr('data-id', data.OrderId);
	$('#orderCollected').attr('data-id', data.OrderId);
	if(data.Completed == true){
		disabledButton();
	}

	for(drink of data.Drinks){
		if(drinkList[drink.Id]){
			drinkList[drink.Id]++;
		} else{
			drinkList[drink.Id] = 1;
			$('.drinkSidebar').append('<li class="orderListItem" data-id="' + drink.Id + '"><h3 class="quantity"></h3><h3>' + drink.Name + '</h3></li>');
		}
		$('.orderListItem[data-id="' + drink.Id + '"] h3').first().text(drinkList[drink.Id]);
	}

}

orderHub.client.orderComplete = function(data){
	console.log(data);
	if(data.success){
		disableButton();
	}
};

orderHub.client.orderCollected = function(data){
	console.log(data);
	if(data.success){
		$('#orderCollected').attr('disabled', 'true');
		$('.orderContent').css('visibility', 'hidden');
		$('.orderListItem[data-id="' + data.orderId + '"]').remove();
	}
};

orderHub.client.error = function(data){
	console.error(data);
}
orderHub.client.userConnected = function(data){
	console.info(data);
}

$.connection.hub.start().done(function(){

});