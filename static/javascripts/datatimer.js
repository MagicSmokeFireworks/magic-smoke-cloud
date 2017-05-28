
var x = setInterval(function() {
	var z = document.getElementsByClassName("datatimer");
	for (var i = 0; i < z.length; i++) {
		var dt = parseFloat(z[i].innerHTML);
		dt = dt + 0.1;
		z[i].innerHTML = dt.toFixed(1);
	}
}, 100);

