<template>
  <div>
    <div v-for="disk in disks" v-bind:key="disk.path">
      <div v-if="disk.size > 1024*1024">
        <b-progress :type="'is-' + getDiskProgressType(disk.used, disk.size)" :value="disk.used" :max="disk.size"
          show-value>
          <div class="has-text-white">
            {{disk.path}}:
            {{humanize(disk.used*1024)}}/{{humanize((disk.used+disk.available)*1024)}}
            [{{humanize((disk.available)*1024)}}/{{Math.floor(disk.available / 106430464)}}]
          </div>
        </b-progress>
      </div>
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
  export default class DiskList extends Vue {
    @Prop() private disks!: any[];

    humanize(size: number) {
      var i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    getDiskProgressType(used: number, size: number) {
      const perc = used / size;
      if (perc < 0.5) return 'success';
      if (perc < 0.7) return 'warning';
      return 'danger';
    }
  }
</script>