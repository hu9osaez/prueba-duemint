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

          <a-select
            ref="slPeople"
            v-model:value="selectedPerson"
            style="width: 200px"
            :options="peopleList"
            :disabled="selectedYear === null"
            placeholder="Selecciona una persona"
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
            :chart-data="parsedStats"
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
    const parsedStats = ref(null);
    const statsPerson = ref(null);
    const selectedYear = ref(null);
    const yearsList = ref([]);
    const selectedPerson = ref(null);
    const peopleList = ref([]);
    const showChart = computed(() => statsYear.value !== null && selectedYear.value !== null);
    const chartOptions = ref({
      responsive: true,
    });
    console.log(totalFormatter);

    onMounted(async () => {
      const { data: yearsMetadata } = await axios.get('/invoices/stats/metadata/years');

      yearsList.value = Array.from(yearsMetadata.data).map((year) => ({
        value: year,
        label: year,
      }));

      const { data: personsMetadata } = await axios.get('/invoices/stats/metadata/people');

      peopleList.value = Array.from(personsMetadata.data).map((person) => ({
        value: person,
        label: person,
      }));
    });

    watch(() => selectedYear.value, async (newValue) => {
      if (selectedPerson.value !== null) {
        const { data: rawStats } = await axios.get('/invoices/stats/per-person', {
          params: { year: newValue, person: selectedPerson.value },
        });
        statsPerson.value = rawStats.data;
      } else {
        const { data: rawStats } = await axios.get('/invoices/stats/monthly', { params: { year: newValue } });
        statsYear.value = rawStats.data;
      }
    });

    watch(() => selectedPerson.value, async (newValue) => {
      const { data: rawStats } = await axios.get('/invoices/stats/per-person', {
        params: { year: selectedYear.value, person: newValue },
      });
      statsPerson.value = rawStats.data;
    });

    watch(() => statsYear.value, async (newValue) => {
      const labels = Object.keys(newValue.months).map((month) => {
        const parsedMonth = Number(month) < 10 ? `0${month}` : month;
        return `${parsedMonth}/${newValue.year}`;
      });
      const data = Object.keys(newValue.months).map((month) => newValue.months[month].total);

      parsedStats.value = {
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

    watch(() => statsPerson.value, async (newValue) => {
      const labels = Object.keys(newValue.months).map((month) => {
        const parsedMonth = Number(month) < 10 ? `0${month}` : month;
        return `${parsedMonth}/${newValue.year}`;
      });
      const data = Object.keys(newValue.months).map((month) => newValue.months[month].total);

      parsedStats.value = {
        labels,
        datasets: [
          {
            data,
            label: `Total de ventas por año y mes de [${newValue.person}]`,
            backgroundColor: '#f87979',
          },
        ],
      };
    });

    return {
      statsYear,
      statsPerson,
      parsedStats,
      selectedYear,
      yearsList,
      selectedPerson,
      peopleList,
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
