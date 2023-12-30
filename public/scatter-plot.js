// // Assuming you have a function to fetch data from the server
// function fetchDataForScatterPlot(selectedRow, selectedColX, selectedColY, selectedAgr) {
//   const url = `/getDataForScatterPlot?row=${selectedRow}&colX=${selectedColX}&colY=${selectedColY}&agr=${selectedAgr}`;
//   return fetch(url).then(response => response.json());
// }

// function generateScatterPlot() {
//   const rowSelect = document.getElementById("rowSelect");
//   const colSelectX = document.getElementById("colSelect");
//   const colSelectY = document.getElementById("colSelect");
//   const agrSelect = document.getElementById("agrSelect");

//   const selectedRow = rowSelect.value;
//   const selectedColX = colSelectX.value;
//   const selectedColY = colSelectY.value;
//   const selectedAgr = agrSelect.value;

//   fetchDataForScatterPlot(selectedRow, selectedColX, selectedColY, selectedAgr)
//     .then(data => {
//       // Extract labels and data from the response
//       const labels = data.map(item => item.label);
//       const chartData = data.map(item => ({ x: item.xValue, y: item.yValue }));

//       // Create a scatter plot
//       createScatterPlot(labels, chartData);
//     })
//     .catch(error => console.error("Error fetching data:", error));
// }

// function createScatterPlot(labels, data) {
//   const ctx = document.getElementById("myChart").getContext("2d");
//   const scatterChart = new Chart(ctx, {
//     type: 'scatter',
//     data: {
//       datasets: [{
//         label: 'Scatter Plot',
//         data: data,
//         backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         borderColor: 'rgba(75, 192, 192, 1)',
//         borderWidth: 1,
//       }]
//     },
//     options: {
//       scales: {
//         x: {
//           type: 'linear',
//           position: 'bottom'
//         },
//         y: {
//           min: 0
//         }
//       }
//     }
//   });
// }

d3.csv("marketing_campaign.csv", function(d) {
  return {
    type: d.type,
    amount: +d.amount // convert string to number
  };
}).then(function(data) {
  d3.select("#chart") // select the div with id "chart"
  .selectAll("div") // select all divs within the chart div
  .data(data) // bind the data to the divs
  .enter() // create new divs for each data item
  .append("div") // append new divs to the chart div
  .attr("class", "bar") // set the class attribute to "bar"
  .style("width", function(d) {
    return d.amount * 40 + "px"; // set the width of the divs based on the data
  })
  .style("height", "15px") // set the height of the divs
  .text(function(d) {
    return d.type; // set the text of the divs to the type of the post
  });

});



async function drawScatter () {
  const pathToJSON = "marketing_campaign.csv"

  // Access data
  const dataset = await d3.json(pathToJSON)
  const xAccessor = d => d.dewPoint
  const yAccessor = d => d.humidity
  // Let's show how the amount of cloud cover varies based on humidity and dew point
  const colorAccessor = d => d.cloudCover

  // Create chart dimensions
  // REMEMBER: For scatter plots, we typically want square charts so axes do not appear squished
  //           In this example, we want to use whatever is smaller - the width or height of our chart area.
  //
  // d3.min() offers a whole host of benefits/safeguards; which is why it is preferable when creating charts
  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9])

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // Draw canvas
  const wrapper = d3.select("#wrapper")
    .append("svg")
      // Note that these width and height sizes are the size "outside" of our plot
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    // Create a group element to move the inner part of our chart to the right and down
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)

  // Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))  // Find the min and max values
    .range([0, dimensions.boundedWidth])    // Display values appropriately
    .nice()

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))  // Find the min and max values
    .range([dimensions.boundedHeight, 0])   // Invert the range so the axis runs bottom-to-top
    // Current scale would be [0.27, 0.93] - let's use .nice() to make a friendlier scale
    .nice()
    // Now our scale is [0.25, 0.95] - offering better readability and avoiding smushing dots to the edge

  const colorScale = d3.scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))  // Find the min and max values
    .range(["skyblue", "darkslategrey"])

    // Draw data
  // REMEMBER: For scatter plots, we want one element per data point - not a line that covers all data points
  //  We will use the <circle> SVG element - setting x, y, and the radius (half of its width or height)

  // Test circle
  bounds.append("circle")
    .attr("cx", dimensions.boundedWidth / 2)
    .attr("cy", dimensions.boundedHeight / 2)
    .attr("r", 5)

  dataset.forEach(d => {
    bounds
      .append("circle")
      .attr("cx", xScale(xAccessor(d)))
      .attr("cy", yScale(yAccessor(d)))
      .attr("r", 5)
  })

  // const dots = bounds.selectAll("circle") // Returns an array of matching "circle" elements
  //   .data(dataset)  // Pass our dataset to the selection

  //   // Prove this!
  //   let theDots = bounds.selectAll("circle")
  //   console.log(theDots)  // Notice how _groups is an array with an empty node list; no dots exist
  //   theDots = theDots.data(dataset) // Bind our dataset
  //   console.log(theDots)  // Notice how _enter has an array of 365 items; and _groups now has an array of 365 items
  

  const dots = bounds.selectAll("circle") // Returns an array of matching "circle" elements
      .data(dataset)  // Pass our dataset to the selection
      .enter()  // Grab the selection of new dots to render (contained in _enter)
        .append("circle") // Create a circle element for each new dot(s)
          .attr("cx", d => xScale(xAccessor(d)))
          .attr("cy", d => yScale(yAccessor(d)))
          .attr("r", 5)
          // Let's make the dots a lighter color to help them stand out
          .attr("fill", "cornflowerblue")

  function drawDots(dataset) {
    const dots = bounds.selectAll("circle").data(dataset)


    //   .enter().append("circle")
    //     .attr("cx", d => xScale(xAccessor(d)))
    //     .attr("cy", d => yScale(yAccessor(d)))
    //     .attr("r", 5)
    //     .attr("fill", color)

    // Want to have all of the drawn dots to have the same color?
    // Notice how this example breaks the ability to chain.
    // dots
    //   .enter().append("circle")

    // bounds.selectAll("circle")
    //     .attr("cx", d => xScale(xAccessor(d)))
    //     .attr("cy", d => yScale(yAccessor(d)))
    //     .attr("r", 5)
    //     .attr("fill", color)

    // // Let's have all of the drawn dots have the same color AND use merge() so we can create a chain
    // dots
    //   .enter().append("circle")
    //   .merge(dots)  // Merge already drawn/existing dots with the new ones AND keep our chain going
    //     .attr("cx", d => xScale(xAccessor(d)))
    //     .attr("cy", d => yScale(yAccessor(d)))
    //     .attr("r", 5)
    //     .attr("fill", color)

    // Great news! Since d3-selection version 1.4.0, we can use a join() method - which is a shortcut for running the enter(), append(), merge(), and other methods
    dots.join("circle")
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", 5)
      .attr("fill", d => colorScale(colorAccessor(d)))  // Fill based on our new color scale for cloud cover

  }
  // Now let's call this function with a subset of our data
  drawDots(dataset.slice(0, 200))
  // After one second, let's call this function with our whole dataset and a blue color to distinguish our two sets of dots
  setTimeout(() => {
    drawDots(dataset)
  }, 1000)

  // Draw peripherals

  // x axis
  const xAxisGenerator = d3.axisBottom().scale(xScale)
  // Remember to translate the x axis to move it to the bottom of the chart bounds
  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  // Label for the x axis
  const xAxisLabel = xAxis.append("text") // Append a text element to our SVG
    .attr("x", dimensions.boundedWidth / 2) // Position it horizontally centered
    .attr("y", dimensions.margin.bottom - 10) // Position it slightly above the bottom of the chart
    // Explicitly set fill to black because D3 sets a fill of none by default on the axis "g" element
    .attr("fill", "black")
    // Style our label
    .style("font-size", "1.4em")
    // Add text to display on label
    .html("Dew point (&deg;F)")

  // y axis
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    // Cut down on visual clutter and aim for a certain number (4) of ticks
    .ticks(4)
    // Note that the resulting axis won't necessarily have exactly 4 ticks. It will aim for four ticks, but also use friendly intervals to get close. You can also specify exact values of ticks with the .ticksValues() method

  const yAxis = bounds.append("g")
    .call(yAxisGenerator)

  // Label for the y axis
  const yAxisLabel = yAxis.append("text")
    // Draw this in the middle of the y axis and just inside the left side of the chart wrapper
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .text("Relative humidity")
    // Rotate the label to find next to the y axis
    .style("transform", "rotate(-90deg)")
    // Rotate the label around its center
    .style("text-anchor", "middle")

}

drawScatter()


  Did we gain insight into our original question? Yes! We wanted to see if we were correct in guessing that high humidity would likely coincide with a high dew point.

  Looking at the plotted dots, they do seem to group around an invisible line from the bottom left to the top right of the chart.
*/