const bar = document.querySelectorAll(".barpilihan > a");

const home = document.querySelector("a[name='home']");
const dataSummary = document.querySelector("a[name='data-summary']");
const barChart = document.querySelector("a[name='barChart']");
const scatterPlot = document.querySelector("a[name='scatterPlot']");

bar.forEach(item => item.addEventListener("click", () => {
    item.classList.add("touch")
}));