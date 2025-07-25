<template>
    <div class="chart-card">
      <h2>환율 변동 차트</h2>
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script>
  import { defineComponent, computed } from "vue";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
  } from "chart.js";
  import { Line } from "vue-chartjs";
  
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
  );
  
  export default defineComponent({
    name: "ExchangeRateChart",
    components: { Line },
    props: { rates: { type: Array, required: true } },
    setup(props) {
      const colors = { usd: "#008485", eur: "#005750", jpy: "#00aba0", cny: "#6fd3c4" };
      const currencies = ["usd", "eur", "jpy", "cny"];
  
      const chartData = computed(() => ({
        labels: props.rates.map((item) => item.date),
        datasets: currencies.map((cur) => ({
          label: cur.toUpperCase(),
          data: props.rates.map((item) => item[cur]),
          borderColor: colors[cur],
          backgroundColor: colors[cur],
          tension: 0.3,
          fill: false,
          pointRadius: 3,
        })),
      }));
  
      const chartOptions = {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { title: { display: true, text: "날짜" } },
          y: { title: { display: true, text: "환율 (KRW)" }, beginAtZero: false },
        },
      };
  
      return { chartData, chartOptions };
    },
  });
  </script>
  