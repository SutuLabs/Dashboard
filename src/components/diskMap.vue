<template>
  <div class="diskMap">
    <div v-if="diskMap.chartOptions">
      <div class="content">
        <apexchart height="300" :options="diskMap.chartOptions" :series="diskMap.series"></apexchart>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';

  @Component
  export default class diskMap extends Vue {
    farm: any; 
    plot: any;
    diskMap = {};
    intervals: number[] = [];

    mounted() {
      this.load();
      this.autoRefresh();
    }
    
    load() {
      getInfo.getInfo('farmer')
        .then(response => response.json())
        .then(json => {
          this.farm = json;
          getInfo.sortDisks(this.farm);
          this.calcFarmPlotMap();
        });
      getInfo.getInfo('plotter')
        .then(response => response.json())
        .then(json => {
          this.plot = json;
          getInfo.sortDisks(this.plot);
          this.calcFarmPlotMap();
        });
    }

    autoRefresh() {
      var temp: number;
      temp = setInterval(() => {
        this.load();
      }, 20000);
      this.intervals.push(temp);
      getInfo.save("diskMap", this.diskMap);
    }

    calcFarmPlotMap() {
      if (!this.farm || !this.plot) return;
      const pn = this.farm.farm.plotCount;
      const tt = 12 + 40;
      const plots = this.plot.jobs.map((_: any) => Number(_.phase[0])).sort((a: number, b: number) => b - a);
      const series = new Array(10).fill({}).map((_, rowi) => ({
        name: rowi + 1,
        data: new Array(tt).fill({}).map((_, coli) => {
          const idx = coli * 10 + rowi;
          if (idx < pn) return 6;
          if (idx - pn >= plots.length) return 0;
          const curplot = plots[idx - pn];
          return curplot;
        })
      }));

      const colorRanges = [{
        from: 0,
        to: 0,
        name: 'Empty',
        color: '#DDDDDD'
      },
      {
        from: 1,
        to: 1,
        name: 'Phase 1',
        color: '#FF0000'
      },
      {
        from: 2,
        to: 2,
        name: 'Phase 2',
        color: '#0000FF'
      },
      {
        from: 3,
        to: 3,
        name: 'Phase 3',
        color: '#FFB200'
      },
      {
        from: 4,
        to: 4,
        name: 'Phase 4',
        color: '#006600'
      },
      {
        from: 5,
        to: 5,
        name: 'Moving',
        color: '#128FD9'
      },
      {
        from: 6,
        to: 6,
        name: 'Harvesting',
        color: '#00A100'
      },
      ];

      this.diskMap = {
        series,
        chartOptions: {
          chart: {
            height: 300,
            type: 'heatmap',
            animations: {
              enabled: false
            },
            toolbar: {
              show: false,
            }
          },
          plotOptions: {
            heatmap: {
              shadeIntensity: 0.5,
              radius: 0,
              // useFillColorAsStroke: true,
              colorScale: {
                ranges: colorRanges,
              }
            }
          },
          xaxis: {
            labels: {
              style: {
                colors: 'white',
              }
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            width: 1
          },
          title: {
            text: '磁盘工作情况',
            style: {
              color: "white",
            },
          },
          legend: {
            labels: {
              colors: "white",
            }
          },
          tooltip: {
            theme: "dark",
            y: {
              formatter: function (value: number) {
                return colorRanges[value].name
              }
            }
          }
        },
      };
    }
  }
</script>