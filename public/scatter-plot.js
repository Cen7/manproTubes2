d3.csv("marketing_campaign.csv",function (data) {

  var margin = {top: 30, right: 10, bottom: 50, left: 60},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        var xMax = d3.max(data, function(d) { return +d.Survivaltime; }),
        xMin = 0,
        yMax = d3.max(data, function(d) { return +d.Year; }),
        yMin = 1950;

        //Define scales
    var x = d3.scale.linear()
        .domain([xMin, xMax])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([yMin, yMax])
        .range([height, 0]);
});


// the chart object, includes all margins
var chart = d3.select('body')
.append('svg:svg')
.attr('width', width + margin.right + margin.left)
.attr('height', height + margin.top + margin.bottom)
.attr('class', 'chart')

// the main object where the chart and axis will be drawn
var main = chart.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
.attr('width', width)
.attr('height', height)
.attr('class', 'main')   

// draw the x axis
var xAxis = d3.svg.axis()
.scale(x)
.orient('bottom');
.tickSize(-height)
.tickFormat(d3.format("s"));

main.append('g')
.attr('transform', 'translate(0,' + height + ')')
.attr('class', 'main axis date')
.call(xAxis);

// draw the y axis
var yAxis = d3.svg.axis()
.scale(y)
.orient('left');
.ticks(5)
.tickSize(-width)
.tickFormat(d3.format("s"));


main.append('g')
.attr('transform', 'translate(0,0)')
.attr('class', 'main axis date')
.call(yAxis);


// draw the graph object
var g = main.append("svg:g");

g.selectAll(".scatter-dots")
  .data(d.Year)  // using the values in the ydata array
  .enter().append("svg:circle")  // create a new circle for each value
      .attr("class", "scatter-dots")
      .attr("cy", function (d) { return y(d.Year); } ) // translate y value to a pixel
      .attr("cx", function (d) { return x(d.Survivaltime); } ) // translate x value
      .attr("r", 10) // radius of circle
      .style("opacity", 0.6); // opacity of circle