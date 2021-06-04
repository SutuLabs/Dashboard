<template>
  <div class="diskSpaceCalculator">
    <div class="card">
      <div class="card-header">
        <div class="card-header-title">
          <div class="has-text-info">磁盘空间计算器</div>
        </div>
      </div>
      <div class="card-content">
        <b-field label="磁盘大小">
          <b-select placeholder="请选择磁盘大小" v-model="diskspace" v-on:input="calculate()" required>
            <option value="2tb">2TB</option>
            <option value="3tb">3TB</option>
            <option value="4tb">4TB</option>
            <option value="6tb">6TB</option>
            <option value="8tb">8TB</option>
          </b-select>
        </b-field>
        <b-table :data="plans" :mobile-cards="false">
          <b-table-column field="k32" label="k-32" v-slot="plan">{{plan.row.k32}}</b-table-column>
          <b-table-column field="percent" label="磁盘空间使用率" v-slot="plan">{{plan.row.percent}}% (已用{{plan.row.usedSpace}}TB)</b-table-column>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { Component, Vue } from 'vue-property-decorator';

  @Component
  export default class diskSpaceCalculator extends Vue {
    plans: any[] = [];
    diskspace = "2tb"; 

    mounted() {
      this.calculate();
    }

    calculate() {
      this.plans.length = 0;
      var actualSize = parseInt(this.diskspace) * 931.323; // GiB 
      const k32PlotSize = 101.4;
      var nPlot = Math.floor(actualSize / k32PlotSize);
      var usedSpace = nPlot * k32PlotSize;
      var percentage = (usedSpace) / actualSize * 100;
      this.plans.push({ k32: nPlot, percent: percentage.toFixed(2), usedSpace: (usedSpace / 931.323).toFixed(3) }); 
    }
  }
</script>