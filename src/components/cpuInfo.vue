<template>
  <div class="cpuInfo">
    <div class="p-4" v-if="machine">
      <div class="columns is-multiline">
        <div class="column is-half">
          <disk-list :disks="machine.disks" />
        </div>
        <div class="column is-half columns is-mobile" v-if="machine.memory">
          <div class="column">
            <div class="block">
              <b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                <div>
                  <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">内存</div>
                  <div>{{(machine.memory.used/machine.memory.total*100).toFixed(2)}}%</div>
                </div>
                <template v-slot:content>
                  <div>已用：{{machine.memory.used}}GB</div>
                  <div>总共：{{machine.memory.total}}GB</div>
                </template>
              </b-tooltip>
            </div>
          </div>
          <div class="column">
            <div class="block">
              <b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">CPU</div>
                <div>{{calcCpu(machine)}}/{{machine.cpus.length}}</div>
                <template v-slot:content>
                  <div>超过50%</div>
                </template>
              </b-tooltip>
            </div>
          </div>
          <div class="column">
            <div class="block">
              <b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">Network</div>
                <div>{{humanize(machine.networkIoSpeed)}}</div>
                <template v-slot:content>
                  <div>{{machine.networkIoSpeed}}</div>
                </template>
              </b-tooltip>
            </div>
          </div>
          <div v-if="!hideProcess" class="column is-one-third">
            <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">进程情况</div>
            <template>
              <b-taglist attached>
                <b-tooltip position="is-bottom" type="is-light" label="进行中">
                  <b-tag type="is-success">{{machine.process.running}}</b-tag>
                </b-tooltip>
                <b-tooltip position="is-bottom" type="is-light" label="待进行">
                  <b-tag type="is-info">{{machine.process.sleeping}}</b-tag>
                </b-tooltip>
                <b-tooltip position="is-bottom" type="is-light" label="预警">
                  <b-tag type="is-warning">{{machine.process.stopped}}</b-tag>
                </b-tooltip>
                <b-tooltip position="is-bottom" type="is-light" label="问题">
                  <b-tag type="is-danger">{{machine.process.zombie}}</b-tag>
                </b-tooltip>
                <b-tooltip position="is-bottom" type="is-light" label="总计">
                  <b-tag type="is-white">{{machine.process.total}}</b-tag>
                </b-tooltip>
              </b-taglist>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';
  import DiskList from '@/components/DiskList.vue'

  @Component({
    components: {
      DiskList,
    },
  })
  export default class cpuInfo extends Vue {
    @Prop() private machine!: any;
    @Prop() private hideProcess!: boolean;

    calcCpu(machine: any) {
      var count = 0;
      machine.cpus.forEach((cpu: any) => {
        if (cpu < 50) count += 1;
      });
      return count;
    }

    humanize(size: number) {
      var i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
