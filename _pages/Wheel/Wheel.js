var wheel = {
	svgNS: 'http://www.w3.org/2000/svg',
	player : null,
	input : null,
	graph : null,
	vgraph : null,
	table : null,
	data : [],

	update : function() {this.graph.update(); this.vgraph.update(), this.table.update()}
};



var frameStep = 1;
var frameTime = 1/25;
var frameDuration = frameTime;
var frameNum = 0;
var started = false





window.addEventListener('load', function () 
{
	
	
	
	fileInput = document.querySelector('input')
	
	fileInput.addEventListener('change', function()
	{
	console.log('input oninputed')
	console.log(fileInput.files)

	//document.querySelector('video').style.width = "50%";

	file = fileInput.files[0]

	wheel.player.src = URL.createObjectURL(file)
	reset()
	wheel.update()
	});

	wheel.player = document.getElementById('video');

	wheel.input = document.getElementById('rotations')
	console.log('player:', wheel.player)

	wheel.graph = create_graph('positiongraph')

	wheel.vgraph = create_velocity_graph('velocitygraph')

	wheel.table = create_table('table')
});

var margin = {
		'left' : 40,
		'right' : 20,
		'top' : 40,
		'bottom' : 40,
	}

var xscale
//MARK: initialization functions
create_graph = function(elm)
{
	
	console.log('create_graph')
	container = d3.select('#' + elm)//.append('svg:g')

	var width = container._groups['0']['0'].clientWidth
	var height = container._groups['0']['0'].clientHeight
	
	

	var graph = container.append('svg:g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
					.attr('width', width - margin.left - margin.right)
					.attr('height', height - margin.top - margin.bottom)
	

	console.log('container view dimensions:', width, ', ', height)
	console.log('graph dimensions: ', graph.attr('width'), graph.attr('height'))
	
	xscale = d3.scaleLinear().range([0, graph.attr('width')])

	var xAxis = graph.append('g')
		.attr('transform', 'translate(0,' + graph.attr('height') + ')')
		.call(d3.axisBottom(xscale))

	var yscale = d3.scaleLinear().range([graph.attr('height'), 0])
	var yAxis = graph.append('g')
		.attr('transform', 'translate(0,' + '0' + ')')
		.call(d3.axisLeft(yscale))


	container.append("text")
        .attr('transform', 'translate(' + width / 2 + ',' + margin.top / 2 + ')')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Position vs. Time");
	container.append("text")
        .attr('transform', 'translate(' + width / 2 + ',' + (height - (margin.bottom / 4))+ ')')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Time (seconds)");

   	container.append("text")
        
        .attr('transform', 'translate(' + margin.left / 3 + ',' + height / 2 + ')rotate(-90)')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")   
        .text("Position (Rotations)");

	var _update_data = function(data)
	{
		
		//console.log("view width", view.attr("width"))
		//console.log("view scroll width", view.attr("scrollWidth"))
		//data is a array of tuples (frame num, position)
		//console.log('graph._update_data')
		//console.log('data:', data)
		if(data.length == 0)
		{
			points = graph.selectAll('.position').data(data)
			points.exit().remove()
			return;
		}

		xscale = d3.scaleLinear().range([0, graph.attr('width')])

		xdomainLow = Math.floor(data[0][0])
		xdomainHigh = Math.ceil(data[data.length - 1][0])
		
		var xdomain = [xdomainLow, xdomainHigh]
		var xrange = [0, graph.attr('width')]

		//console.log('graph update_data xdomain xrange', xdomain, xrange)

		xscale.range(xrange).domain(xdomain)
		
		//console.log('after assignment:', xscale.domain(), xscale.range())
		xAxis.call(d3.axisBottom(xscale))



		var ydomain = [0, data[data.length - 1][1]]
		var yrange = [graph.attr('height'), 0]

		var yscale = d3.scaleLinear().range(yrange).domain(ydomain)

	
		yAxis.attr('class', 'y axis')
			.attr('transform', 'translate(0,' + '0' + ')')
			.call(d3.axisLeft(yscale))


		//container.style('background', 'black')
		points = graph.selectAll('.position').data(data)

		points
			.enter().append('svg:circle')
				.attr('class', 'position')
				.attr('r', 5)
			.merge(points)
				.attr('cx', (d,i) => xscale(d[0]))
				.attr('cy',  function(d) {return yscale(d[1])})
		
		points.exit().remove()


		






		lines = graph.selectAll('.line').data(data)
		/*
		lines
			.enter().append('svg:line')
				.attr('class', 'line')
				.attr('stroke', 'black')
			.merge(lines)
				.attr('x1', (d,i) => data[i-1][0])
				.attr('y1', (d,i) => scale(data[i-1][1]))
				.attr('x2', (d,i) => d[0])
				.attr('y2', (d,i) => scale(d[1]))
		*/
	}

	var extend = function()
	{
		curWidth = container.style('width')
		num = parseInt(curWidth.split('px')[0])
		console.log('curWidth:', num)
		num = num + 20
		container.style('width', num + 'px')
		graph.attr('width', num)
	}


    return {
      	
    	update: function()
    	{
    		data = []
    		rotations = 0
    		for (var i = 0; i < wheel.data.length; i++) {
    			datapoint = wheel.data[i]

    			rotations = rotations + datapoint[1]
    			data.push([datapoint[0], rotations])
    		}

    		_update_data(data)



    	}
    }



}//create_graph



var create_velocity_graph = function(elm)
{

	console.log('create_velocity_graph')
	container = d3.select('#' + elm)//.append('svg:g')

	

	
	var width = container._groups['0']['0'].clientWidth
	var height = container._groups['0']['0'].clientHeight
	

	container.append("text")
        .attr("x", (width / 2))             
        .attr("y",  (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Velocity vs. Time");


	var graph = container.append('svg:g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('width', width - margin.left - margin.right)
		.attr('height', height - margin.top - margin.bottom)


	var xAxis = graph.append('g')
		.attr('transform', 'translate(0,' + graph.attr('height') + ')')
		.call(d3.axisBottom(xscale))

	var yscale = d3.scaleLinear().range([graph.attr('height'), 0])
	var yAxis = graph.append('g')
		.attr('transform', 'translate(0,' + '0' + ')')
		.call(d3.axisLeft(yscale))

	container.append("text")
        .attr('transform', 'translate(' + width / 2 + ',' + margin.top / 2 + ')')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Velocity vs. Time");
	container.append("text")
        .attr('transform', 'translate(' + width / 2 + ',' + (height - (margin.bottom / 4))+ ')')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Time (seconds)");

   	container.append("text")
        
        .attr('transform', 'translate(' + margin.left / 3 + ',' + height / 2 + ')rotate(-90)')
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")   
        .text("Velocity (RPM)");
	var _update_data = function(data)
	{
		

		console.log('vgraph._update_data:', data)
		//data is a array of tuples (frame num, position)
		
		if(data.length == 0)
		{
			points = graph.selectAll('.velocity').data(data)
		points.exit().remove()
			return;
		}
		
		
		

		console.log('xscale.domain(), range()', xscale.domain(), xscale.range())
		
		
		xAxis.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + graph.attr('height') + ')')
			.call(d3.axisBottom(xscale))



		

	
		yAxis.attr('class', 'y axis')
			.attr('transform', 'translate(0,' + '0' + ')')
			.call(d3.axisLeft(yscale))

		points = graph.selectAll('.velocity').data(data)
		points
			.enter().append('svg:circle')
				.attr('class', 'velocity')
				.attr('r', 5)
			.merge(points)
				.attr('cx', (d,i) => xscale(d[0]))
				.attr('cy',  function(d) {; return yscale(d[1])})
		
		

	}//_update_data


	return {
      	
    	update: function()
    	{

    		

    		data = []
    		rotations = 0
    		for (var i = 0; i < wheel.data.length; i++) {
    			datapoint = wheel.data[i]

    			rotations = rotations + datapoint[1]
    			data.push([datapoint[0], rotations])
    		}

    		if(data.length == 0)
			{
				return;
			}
			

			velocityData = []

			maxVelocity = 0
			lastPoint = data[0]
			for (var i = 1; i < data.length; i++) {
				point = data[i]

				dx = point[0] - lastPoint[0]
				dy = point[1] - lastPoint[1]
				velocity = 60 * dy * 1.0 / dx * 1.0
				maxVelocity = velocity > maxVelocity ? velocity : maxVelocity;


				velocityTimeStamp = (lastPoint[0] + point[0]) / 2.0


				velocityPoint = [velocityTimeStamp, velocity]

				velocityData.push(velocityPoint)
				lastPoint = point

			}

    		
    		yscale.domain([0, maxVelocity * 1.1])

    		_update_data(velocityData)



    	}//update
    }

}//create_velocity_graph


let velocity_data = function(data) {
	velocityData = []


	lastPoint = data[0]
	for (var i = 1; i < data.length; i++) {
		point = data[i]

		dx = point[0] - lastPoint[0]
		dy = point[1] - lastPoint[1]
		velocity = 60 * dy * 1.0 / dx * 1.0

		velocityTimeStamp = (lastPoint[0] + point[0]) / 2.0

		velocityPoint = [velocityTimeStamp, velocity]

		velocityData.push(velocityPoint)
		lastPoint = point

	}

	return velocityData;
}

var create_table = function(id)
{
	console.log('create_table(', id)

	var table = d3.select(".dataTable").append('table').attr('border', 1)

	var thead = table.append('thead')
	var tbody = table.append('tbody')

	headers = thead.append('tr')
	headers.append('th').text('Time (s)').style("background-color","white")
	headers.append('th').text('Position (Rotations)').style("background-color","white")
	
	
	
	return {
		update : function()
		{
			data = []
    		rotations = 0
    		for (var i = 0; i < wheel.data.length; i++) {
    			datapoint = wheel.data[i]

    			rotations = rotations + datapoint[1]
    			data.push([datapoint[0], rotations])
    		}
			
			bound = tbody.selectAll('tr')
						.data(data)
			
			bound.exit().remove()

			rows = bound.enter()
					.append('tr')

			rows.append('td')
					.text(d => d[0]).style("background-color","white")
			rows.append('td')
					.text(d => d[1]).style("background-color","white")						


		}
	}

}

var reset = function()
{
	wheel.data = []
	started = false
	frameNum = 0
	wheel.update()
}

var undo_one_input = function() 
{
	console.log('undoing one input')
	if(wheel.data.length == 0){
		console.log('no data to undo. returning')
		return;
	}


	mostRecentInput = wheel.data.pop()


	mostRecentInputTime = mostRecentInput[0]


	if (mostRecentInputTime == wheel.player.currentTime) {
		//then we're at a marked point in the video
		// we need to go back one

		destinationInput = wheel.data.pop()
	} else {
		//we're between or after a marked point
		// we need to go back to the immediately 
		//following the last input
		destinationInput = mostRecentInput
	}

	//go to destination input
	wheel.data.push(destinationInput)
	wheel.player.currentTime = destinationInput[0]
	wheel.update()



}

//MARK: key handling



document.addEventListener('keypress', function (evt)
{
	console.log('current time:', wheel.player.currentTime)
	console.log('keypress:', evt.keyCode)

	zeroKey = 48
	nineKey = 57
	dotKey = 46
	if(evt.keyCode >= zeroKey && evt.keyCode <= nineKey || evt.keyCode == dotKey)
	{
		wheel.input.focus()
	}


	skey = 115
	if(evt.keyCode == skey)
	{
		if(started)
		{
			return
		}
		reset()
		wheel.data.push([wheel.player.currentTime, 0])
	}
	

	nkey = 110
	if(evt.keyCode == nkey)
	{

		console.log('nkey')
		wheel.player.currentTime = Math.min(video.duration, wheel.player.currentTime + frameStep * frameDuration);

		frameNum = frameNum + frameStep
		wheel.input.blur()

	}

	ukey = 117
	if(evt.keyCode == ukey) {
		console.log("u key")
		undo_one_input()
	}

	ekey = 101
	if(evt.keyCode == ekey)
	{
		console.log('ekey')
		export_data()
		wheel.input.blur()
	}


	enterKey = 13
	if(evt.keyCode == enterKey || evt.keyCode == nkey)
	{
		consume_amount_input()
	}

	wheel.update()
});


consume_amount_input = function()
{


	console.log('input:', wheel.input.value)

	value = wheel.input.value

	
	if(value == '')
	{
		return
	}

	tuple = [wheel.player.currentTime, parseFloat(value)]

	wheel.data.push(tuple)

	console.log('allData:', wheel.data)

	wheel.input.value = ''



}


var export_data = function()
{
	filename = 'data.csv'

	string = 'Time (s),Position (Rotations),Velocity (rpm)\n'
	rotations = 0
	rotationPoints = []

	for (var i = 0; i < wheel.data.length; i++) {
		point = wheel.data[i]
		rotations += point[1]
		rotationPoints.push([point[0], rotations])
	}

	velocityData = velocity_data(rotationPoints)

	for (var i = 0; i < wheel.data.length; i++) {
		position = rotationPoints[i]

		string += String(position[0]) + ', ' + String(position[1]) + ', \n'
	}

	for(var i = 0; i < velocityData.length; i++) {
		v = velocityData[i];
		console.log("velocity point:", v);
		string += String(v[0]) + ", ," + String(v[1]) + "\n"
	}
	//console.log(string)


	var file = new Blob([string], {type: 'csv'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

