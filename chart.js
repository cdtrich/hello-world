 ///////////////////////////////////////////////////////
 // data

 ///////////////////////////////////////////////////////
 // margins

 var w = 500;
 var h = 450;
 var svg = d3.select("body").append("svg")
   .attr("id", "chart")
   .attr("width", w)
   .attr("height", h),
   margin = {
     top: 30,
     bottom: 80,
     left: 50,
     right: 20,
   },
   width = w - margin.left - margin.right,
   height = h - margin.top - margin.bottom;
 ///////////////////////////////////////////////////////
 // scales

 var x = d3.scaleLinear()
   .range([0, width]);
 var y = d3.scaleLinear()
   .range([height, 0]);
 var responseScale = d3.scaleLinear() // suggested in course, but scaleLinear does not keep true area
   .range([5, 50]);
 var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
 
 var tickValues = [18, 25, 32, 39, 46, 53, 60, 67, 74];
 var xAxis = d3.axisBottom(x)
 		.tickValues(tickValues) // setting discrete tick values
    .tickSize(10);
 var yAxis = d3.axisLeft(y)
   .ticks(5)
   .tickSize(20) // pushes values further out
   .tickFormat(function(d) {
     return d.toFixed(1); // turns number into string with fixed decimal places
   });
 var xGridlines = d3.axisBottom(x)
 	.tickValues(tickValues)
  .tickFormat("")
  .tickSize(height);
 var yGridlines = d3.axisLeft(y)
   .tickFormat("")
   .tickSize(-width);
 /* .scale(y); */

 ///////////////////////////////////////////////////////
 // interactivity

 ///////////////////////////////////////////////////////
 // DOM

 var chart = svg.append("g")
   /* .classed("display", true) */
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 ///////////////////////////////////////////////////////
 // plot

 x.domain(d3.extent(data, function(d) {
   return d.age
 }));
 y.domain([1, 5]);
 responseScale.domain(d3.extent(data, function(d) {
   return d.responses;
 }));

 function drawAxis(params) {
   if (params.initialize) { // if data source is changed dynamically, this is needed not to redraw the axis each time
     // gridlines
     this.append("g")
       .classed("gridline x", true)
       .attr("transform", "translate(0,0)")
       .call(params.gridlines.x);
     this.append("g")
     	.classed("gridline y", true)
      .attr("transform", "translate(0,0)")
      .call(params.gridlines.y);
     // axes
     this.append("g")
       .classed("axis x", true)
       .attr("transform", "translate(0," + height + ")")
       .call(params.axis.x);     
     this.append("g")
       .classed("axis y", true)
       .attr("transform", "translate(0,0)")
       .call(params.axis.y);
     // axis titles
     this.select(".y.axis") // selecting all elements that have both classes
     	.append("text")
      .text("rating: 1=low, 5=high")
      .attr("dy", -10)
      .attr("dx", -23);
     this.select(".x.axis")
     	.append("text")
      .text("customer age")
      .attr("dy", 32);
     // data label
     this.append("g")
     	.append("text")
      .classed("label", true)
      .attr("transform", "translate(" + width/2 + ", " + -10 + ")")
      .text("hover over the bubbles to see values");
   }
 } // end of function drawAxis

 function plot(params) {

   drawAxis.call(this, params);
   var self = this; // stores value of "this" (here: chart) in "self"
   var donuts = d3.keys(params.data[0]) // keys function grabs property names of first index item [0]
     .filter(function(d) {
       return d !== "age" && d !== "responses";
     });

   // enter() for <g>
   this.selectAll(".donut")
     .data(donuts)
     .enter().append("g")
     .attr("class", function(d) { // dynamically setting classes of four groups
       return d;
     })
     .classed("donut", true); // classing all four groups as donut

		// update for <g> - coloring
		this.selectAll(".donut")
    	.style("fill", function(d, i) {
      	return colorScale(i);
      })
      /* .on("mouseover", function(d, i) { // mouse events in js
        d3.select(this)
          .transition()
          .style("opacity", 1)})
      .on("mouseout", function(d, i) {
        d3.select(this)
        	.transition()
          .style("opacity", 0.1);
      }) */;
   	
   // subsetting data
   donuts.forEach(function(donut) { // for each entry in "donut", do ...
     var g = self.selectAll("g." + donut); // selecting group specific to donut type: all items that are "g." and the donut name
     var arr = params.data.map(function(d) {
       return {
         key: donut, // name of donut
         value: d[donut], // current entry with key of one of four "donut"
         age: d.age, // same as current
         responses: d.responses // same as current
       };
     }); // creating an array that contains only donut, value, age, responses (for each group) - map iterates through array and returns data according to user-defined function
     /* console.log(arr); */
     /* console.log(donut); */

     // enter()
     g.selectAll(".response")
       .data(arr)
       .enter().append("circle")
       .classed("response", true);

     // update
     g.selectAll(".response")
       .attr("r", function(d) {
         return 5 * Math.sqrt(d.responses / 2); // value = circle area
       })
       .attr("cx", function(d) {
         return x(d.age);
       })
       .attr("cy", function(d) {
         return y(d.value);
       })
       .on("mouseover", function(d, i) {
       	 var str = d.key + " - ";
         str += "age: " + d.age;// += continues appending onto a string
				 str += "responses: " + d.responses;
         d3.select(".label").text(str); // selecting label and setting its value to "str"
       })
       .on("mouseout", function(d, i) {
       	 d3.select(".label").text("");
       });

     // exit()
     g.selectAll(".response")
       .data(arr)
       .exit().remove();

   });
 } // end of function plot

 ///////////////////////////////////////////////////////
 // events

 ///////////////////////////////////////////////////////
 // calling the plot

 plot.call(chart, {
   data: data,
   axis: {
     x: xAxis,
     y: yAxis
     },
     gridlines: {
     x: xGridlines,
     y: yGridlines
     },
   initialize: true   
 })
