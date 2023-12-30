// Assuming you have a function to fetch data from the server
function fetchDataForScatterPlot(selectedRow, selectedColX, selectedColY, selectedAgr) {
  const url = `/getDataForScatterPlot?row=${selectedRow}&colX=${selectedColX}&colY=${selectedColY}&agr=${selectedAgr}`;
  return fetch(url).then(response => response.json());
}

function generateScatterPlot() {
  const rowSelect = document.getElementById("rowSelect");
  const colSelectX = document.getElementById("colSelect");
  const colSelectY = document.getElementById("colSelect");
  const agrSelect = document.getElementById("agrSelect");

  const selectedRow = rowSelect.value;
  const selectedColX = colSelectX.value;
  const selectedColY = colSelectY.value;
  const selectedAgr = agrSelect.value;

  fetchDataForScatterPlot(selectedRow, selectedColX, selectedColY, selectedAgr)
    .then(data => {
      // Extract labels and data from the response
      const labels = data.map(item => item.label);
      const chartData = data.map(item => ({ x: item.xValue, y: item.yValue }));

      // Create a scatter plot
      createScatterPlot(labels, chartData);
    })
    .catch(error => console.error("Error fetching data:", error));
}

function createScatterPlot(labels, data) {
  const ctx = document.getElementById("myChart").getContext("2d");
  const scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Scatter Plot',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom'
        },
        y: {
          min: 0
        }
      }
    }
  });
}
