<template>
  <div class="main-container">
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
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  inject,
  ref,
  watch,
} from 'vue';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const axios = inject('axios');
    const statsYear = ref(null);
    const selectedYear = ref(null);
    const yearsList = ref([]);

    onMounted(async () => {
      const { data: rawMetadata } = await axios.get('/invoices/misc/metadata');

      yearsList.value = Array.from(rawMetadata.data).map((year) => ({
        value: year,
        label: year,
      }));
    });

    watch(() => selectedYear.value, async (newValue) => {
      console.info('NV', newValue);
      const { data: rawStats } = await axios.get('/invoices/misc/monthly', { params: { year: newValue } });
      statsYear.value = rawStats.data;
    });

    return {
      statsYear,
      selectedYear,
      yearsList,
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
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
  padding: 15px 10px;
}
</style>
