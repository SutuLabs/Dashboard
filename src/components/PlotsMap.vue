<template>
  <div>
    <b-button @click="load()">Get Plot Info</b-button>
    总共有：{{ plots.length }}块图 异常图块如下：
    <div v-for="plot in abnormalFiles" :key="plot.host + plot.directory + plot.filename">
      {{ plot.host }}:{{ plot.directory }}/{{ simplify(plot.filename) }}[{{ humanize(plot.size) }}]
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop
} from 'vue-property-decorator';
import getInfo from '@/services/getInfo';

@Component
export default class PlotsMap extends Vue {
  private plots: {
    directory: string,
    filename: string,
    host: string,
    plotId: string,
    size: number
  }[] = [];

  load() {
    getInfo.getInfo('plots')
      .then(response => response.json())
      .then(json => {
        this.plots = json;
      });
  }

  humanize(size: number) {
    if (size == 0) return 0;
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  simplify(name: string) {
    return name.replace(/-([0-9a-f]{8})[0-9a-f]{56}.plot/, "-$1.plot");
  }

  get abnormalFiles() {
    return this.plots.filter(_ => !_.plotId || _.size < 100000000000);
  }
}
</script>