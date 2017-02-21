// global variables
var svg, xScale, yScale;
var cur_time = 0;
var cur_real_time = 0;
var step = 10;
var time_map = [];
var cur_person_ids = [];
document.onkeydown = keyEvent;

// Initialize canvas
function initialize() {
	var w = 1000;
	var h = 550;
	var padding = 40;
	xScale = d3.scaleLinear()
				   .domain([-41543, 48431])
				   .range([padding, w - padding * 2]);
	yScale = d3.scaleLinear()
				   .domain([-27825, 24224])
				   .range([h - padding, padding]);

	/* Need to be solved -- cannot work when added */
	// var xAxis = d3.axisBottom(xScale)
	// 			  .ticks(10);

	// var yAxis = d3.axisLeft(yScale)
	// 			  .ticks(10);

	/* track window init */
	svg = d3.select("#svg_div").select("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("style", "border:5px solid black;display:block;margin:auto;");
	/* Need to be solved -- cannot work when added */
	// svg.append("g")
	// 	 .attr("class", "axis")
	// 	 .attr("transform", "translate(0," + (h - padding) + ")")
	// 	 .call(xAxis);
	// svg.append("g")
	// 	 .attr("class", "axis")
	// 	 .attr("transform", "translate(" + padding + ",0)")
	// 	 .call(yAxis);
	document.getElementById("time").innerHTML = "0";
	document.getElementById("step").innerHTML = step;
	initTimeMap();
}

function paintTrack() {
	var time_id = document.getElementById("input1").value;
	if(!time_id)
		time_id = 0;
	document.getElementById("input1").value = "";
	document.getElementById("time").innerHTML = time_map[time_id];
	cur_time = time_id;
	paintWithTimeId(cur_time);
}

function paintWithTimeId(time_id) {
	var fileName = "time/" + time_id + ".csv";
	var newDate = new Date();
	newDate.setTime(parseInt(time_map[time_id] * 1000 + 3600000 * 9));
	document.getElementById("time").innerHTML = newDate.toGMTString();
	d3.csv(fileName, function(csvdata) {
		var points = [];
		var personIds = [];
		for (var i = 0; i < csvdata.length; i++) {
			var x = parseInt(csvdata[i]["x"]);
			var y = parseInt(csvdata[i]["y"]);
			var id = parseInt(csvdata[i]["id"])
			if (x && y && typeof x == "number" && typeof y == "number")
				points.push([x, y])
			personIds.push(id);
		}
		cur_person_ids = personIds;
		console.log("current person's ids:\n");
		console.log(cur_person_ids);
		svg.selectAll("circle")
		   .remove();
		svg.selectAll("text")
		   .remove();
		svg.selectAll("circle")
		   .data(points)
		   .enter()
		   .append("circle")
		   .attr("cx", function(d) {
		   		return xScale(d[0]);
		   })
		   .attr("cy", function(d) {
		   		return yScale(d[1]);
		   })
		   .attr("r", 5)
		   .attr("fill", "red")
		   .on("mouseover", function(d, i) {
		   		 d3.select(this)
		   		   .attr("fill", "orange")
		   		   .attr("r", 10);
		   		 
		   	     showPersonTrack(i, personIds[i]);
		   })
		   .on("mouseout", function() {
		   		 d3.select(this)
		   		   .attr("fill", "red")
		   		   .attr("r", 5);
		   		 svg.selectAll(".person_track")
		   		 	.remove();
		   		 svg.selectAll("#person_id")
		   		 	.remove();
		   });
		svg.selectAll("text")  
   		   .data(points)
           .enter()
   		   .append("text")
   		   .text(function(d, i) {
        		return personIds[i];
   		   })  
   		   .attr("x", function(d) {
        		return xScale(d[0]) + 5;
   		   })
   		   .attr("y", function(d) {
        		return yScale(d[1]) - 5;
   		   })
   		   .attr("font-size", "11px")
   		   .attr("fill", "blue");

	});
}

// Show all the track of one person
function showPersonTrack(i, personId) {
	var file_name;
	$.getJSON("mapping/id_map.json", function(data){
		paintWithPersonId(data[personId]);
	});
}

function paintWithPersonId(person_file_id) {
	var fileName = "person/" + person_file_id + ".csv"
	d3.csv(fileName, function(csvdata) {
		var points = [];
		var personIds = [];
		for (var i = 0; i < csvdata.length; i++) {
			var x = parseInt(csvdata[i]["x"]);
			var y = parseInt(csvdata[i]["y"]);
			if (x && y && typeof x == "number" && typeof y == "number")
				points.push([x, y])
		}
		svg.selectAll(".person_track")
		   .remove();
		svg.selectAll("circle")
		   .data(points)
		   .enter()
		   .append("circle")
		   .attr("cx", function(d) {
		   		return xScale(d[0]);
		   })
		   .attr("cy", function(d) {
		   		return yScale(d[1]);
		   })
		   .attr("r", 2)
		   .attr("fill", "blue")
		   .attr("class", "person_track");

	});
}

// Load Time mapping {0: time1, 1: time2..}
function initTimeMap() {
	$.getJSON("mapping/time_map.json", function(data) {
		for (var i = 0; i < 901524; ++i)
			time_map.push(data[i]);
	});
}

// Paint previous time's track
function paintPrevious() {
	if (parseInt(cur_time) - step > 0) {
	  cur_time = parseInt(cur_time) - step;
		cur_real_time = time_map[cur_time];
		console.log("current time id: " + 
			cur_time.toString() + 
			"\ncurrent real time: " +
			cur_real_time.toString());
		paintWithTimeId(cur_time);
	}
}

// Paint next time's track
function paintNext() {
	if (parseInt(cur_time) + step < 901524) {
	  cur_time = parseInt(cur_time) + step;
		cur_real_time = time_map[cur_time];
		console.log("current time id: " + 
			cur_time.toString() + 
			"\ncurrent real time: " +
			cur_real_time.toString());
		paintWithTimeId(cur_time);
	}
}

// slow down the time step
function slowDown() {
	if (step - 10 > 0) {
		step = step - 10;
	} 
	document.getElementById("step").innerHTML = step;
}

// speed up the time step
function speedUp() {
	step = step + 10;
	document.getElementById("step").innerHTML = step;
}

// Add keyboard shortcut
function keyEvent() {
	key = event.keyCode;
    if (key == 37 && cur_time > 0) paintPrevious();
    if (key == 38) speedUp();
    if (key == 39 && cur_time < 901524) paintNext();
    if (key == 40) slowDown();

}
