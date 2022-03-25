<template>
  <div class="main-container">
    <a-row justify="center">
      <img src="https://www.duemint.com/img/home2/logo2.svg" alt="Logo Duemint" class="logo">
    </a-row>
    <a-row justify="center">
      <a-col :span="12" class="main-box">
        <a-space>
          <a-select
            ref="slYears"
            v-model:value="selectedYear"
            style="width: 200px"
            :options="yearsList"
            placeholder="Selecciona un año"
          ></a-select>
        </a-space>
      </a-col>
    </a-row>
    <a-row justify="center" v-if="showChart" class="row-chart">
      <a-col :span="12">
        <a-space>
          <Bar
            chart-id="bar-chart"
            :chart-options="chartOptions"
            :chart-data="parsedStatsYear"
            :heigth="400"
            :width="400"
          />
        </a-space>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  inject,
  ref,
  watch,
  computed,
} from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const totalFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'CLP',
});

export default defineComponent({
  name: 'HomeView',
  components: { Bar },
  setup() {
    const axios = inject('axios');
    const statsYear = ref(null);
    const parsedStatsYear = ref(null);
    const selectedYear = ref(null);
    const yearsList = ref([]);
    const showChart = computed(() => statsYear.value !== null && selectedYear.value !== null);
    const chartOptions = ref({
      responsive: true,
    });
    console.log(totalFormatter);

    onMounted(async () => {
      const { data: rawMetadata } = await axios.get('/invoices/misc/metadata');

      yearsList.value = Array.from(rawMetadata.data).map((year) => ({
        value: year,
        label: year,
      }));
    });

    watch(() => selectedYear.value, async (newValue) => {
      const { data: rawStats } = await axios.get('/invoices/misc/monthly', { params: { year: newValue } });
      statsYear.value = rawStats.data;
    });

    watch(() => statsYear.value, async (newValue) => {
      const labels = Object.keys(newValue.months).map((month) => {
        const parsedMonth = Number(month) < 10 ? `0${month}` : month;
        return `${parsedMonth}/${newValue.year}`;
      });
      const data = Object.keys(newValue.months).map((month) => newValue.months[month].total);

      parsedStatsYear.value = {
        labels,
        datasets: [
          {
            data,
            label: 'Total de ventas por año y mes',
            backgroundColor: '#f87979',
          },
        ],
      };
    });

    return {
      statsYear,
      parsedStatsYear,
      selectedYear,
      yearsList,
      showChart,
      chartOptions,
    };
  },
});
</script>

<style lang="scss">
.main-container {
  margin-top: 100px;
}
.main-box {
  background: white;
  // border: 1px solid lightgray;
  // border-radius: 5px;
  // box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
  padding: 15px 10px;
}
.row-chart {
  margin-top: 20px;
}
.logo {
  max-width: 200px;
}
</style>
