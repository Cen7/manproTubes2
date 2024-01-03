
    function generateScatterPlot() {
      const rowSelect = document.getElementById("rowSelect");
      const colSelect = document.getElementById("colSelect");
      const agrSelect = document.getElementById("agrSelect");
  
      const selectedRow = rowSelect.value;
      const selectedCol = colSelect.value;
      const selectedAgr = agrSelect.value;
  
      fetch(`/getDataForScatterPlot?row=${selectedRow}&col=${selectedCol}&agr=${selectedAgr}`)
        .then(response => response.json())
        .then(data => {
          // Extract labels and data from the response
          const labels = data.map(item => item.label);
          const chartData = data.map(item => ({ x: item.xValue, y: item.yValue }));
          console.log(chartData);
          console.log(selectedCol);
          console.log(selectedRow);
          // Create a scatter plot
          createScatterPlot(labels, chartData);
        })
        .catch(error => console.error("Error fetching data:", error));
    }
  
    function createScatterPlot(labels, chartData) {
      const ctx = document.getElementById("myChart").getContext("2d");
      const scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Scatter Plot',
            pointRadius: 4,
            data: chartData,
            pointBackgroundColor: 'rgba(75, 192, 192, 0.2)', // Set the background color
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom'
            },
            y: {
              min: 0 // You can adjust the minimum value for the y-axis
            }
          }
        }
      });
    }