<template>
  <div>
    <div v-for="disk in disks" v-bind:key="disk.path">
      <div v-if="disk.size > 1024 * 1024">
        <b-progress :type="'is-' + getDiskProgressType(disk.used, disk.size)" :value="disk.used" :max="disk.size" show-value>
          <span class="has-text-white">{{ disk.path }}</span>
          <span class="has-text-white px-6"
            >{{ humanize(disk.used * 1024) }}/{{ humanize((disk.used + disk.available) * 1024) }}</span
          >
          <span class="has-text-white"
            >{{ humanize(disk.available * 1024) }} ( {{ Math.floor(disk.available / 106430464) }} )
            <span v-if="abnormals && abnormals.indexOf(disk.path) > -1">🔥</span>
            <b-button type="is-warning is-small" @click="unmount(disk.path.slice(6))">unmount</b-button>
          </span>
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
import getInfo from '@/services/getInfo'
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'

@Component
export default class DiskList extends Vue {
  @Prop() private disks!: any[];
  @Prop() private abnormals!: string[];
  @Prop() private machinename!: string ;

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

  unmount(name: string) {
    console.log(this.machinename);
    this.$buefy.dialog.confirm({
      title: '确认卸载',
      message: `试图在机器[${this.machinename}]上卸载[${name}]，确认吗？`,
      cancelText: '取消',
      confirmText: '确定',
      type: 'is-success',
      onConfirm: () => {
        var t = Snackbar.open({
          type: 'is-primary',
          message: `卸载[${name}]中`,
          indefinite: true,
          queue: false
        })
        getInfo.unmountPartition(this.machinename, name)
          .then((resp: Response) => {
            t.close();
            if (resp.ok) {
              Snackbar.open({
                type: 'is-success',
                message: '卸载成功',
              });
            } else {
              Snackbar.open({
                type: 'is-danger',
                message: '卸载失败',
                indefinite: true,
              });
            }
          }).catch(() => {
            t.close();
            Snackbar.open({
              type: 'is-danger',
              message: '卸载失败',
              indefinite: true,
            });
          });
      }
    })
  }
}
</script>