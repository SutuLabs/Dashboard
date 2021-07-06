<template>
  <div class="block" id="errors">
    <div class="columns is-desktop">
      <div class="column is-half" v-if="errors != null">
        <nav class="panel">
          <p class="panel-heading">Errors</p>
          <div class="panel-block" v-for="err in sortedErrors" v-bind:key="sortedErrors.indexOf(err)">
            <b-tooltip :label="'时间: ' + err.time" position="is-bottom">
              <b-tag :type="new Date() - new Date(err.time + 'Z') > 1000 * 60 ? 'is-dark' : 'is-info'">{{
                err.machineName
              }}</b-tag>
            </b-tooltip>
            <b-button v-if="isRemovable(err.error)" size="is-small" class="is-danger" @click="remove(err.machineName, err.error)"
              >处理</b-button
            >
            <b-tooltip class="error-tooltip" type="is-light" size="is-large" multilined>
              <span class="single-line" :class="err.level == 'ERROR' ? 'has-text-danger' : 'has-text-warning'">
                {{ shorten(err.error) }}
              </span>
              <template v-slot:content>
                <p class="is-size-7">{{ err.error }}</p>
              </template>
            </b-tooltip>
          </div>
        </nav>
        <b-button rounded @click="errNum += 10" :disabled="errNum >= errors.length">Expand</b-button>
        <b-button rounded @click="errNum = 10" :disabled="errNum == 10">Shrink</b-button>
      </div>

      <div class="column is-half" v-if="events != null">
        <nav class="panel">
          <p class="panel-heading">Events</p>
          <div class="panel-block" v-for="evt in sortedEvents" v-bind:key="sortedEvents.indexOf(evt)">
            <b-tooltip :label="'时间: ' + evt.time" position="is-bottom">
              <b-tag type="is-info">{{ evt.machineName }}</b-tag>
            </b-tooltip>
            <span class="has-text-danger" v-if="evt.proofs > 0">
              {{ evt.eligibleNumber }}/{{ evt.total }} 个图块被选中，发现 {{ evt.proofs }} 个证明, 时长: {{ evt.duration }} s
            </span>
            <span class="has-text-info" v-else>
              {{ evt.eligibleNumber }}/{{ evt.total }} 个图块被选中，发现 {{ evt.proofs }} 个证明, 时长: {{ evt.duration }} s
            </span>
          </div>
        </nav>
        <b-button rounded @click="evtNum += 10" :disabled="evtNum >= events.length">Expand</b-button>
        <b-button rounded @click="evtNum = 10" :disabled="evtNum == 10">Shrink</b-button>
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
import { ErrorEntity, EligibleFarmerEventEntity } from '@/views/Monitor.vue'
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'

@Component
export default class EventList extends Vue {
  @Prop() private errors!: ErrorEntity[];
  @Prop() private events!: EligibleFarmerEventEntity[];

  evtNum = 10;
  errNum = 10;
  rePlot = /\/farm\/A\d{1,4}\/plot-k\d{2}-\d{4}(-\d{2}){4}-[0-9a-f]{64}\.plot/;

  removePlot(host: string, plot: string) {
    const name = `${host}@${plot}`;
    this.confirmAndExecute({
      confirmTitle: '确认删除Plot',
      confirmMessage: `准备删除 ${name}，确认吗？`,
      workingMessage: `正在删除 ${name}`,
      successMessage: `${name}已删除`,
      failureMessage: '删除失败',
    },
      () => getInfo.removePlots(host, [plot])
    );
  }

  // copied from DiskSmartMap temporarily, should combine to somewhere common
  confirmAndExecute(options: { confirmTitle: string, confirmMessage: string, confirmType?: 'success' | 'danger', workingMessage: string, successMessage: string, failureMessage: string }, operation: () => Promise<Response>) {
    this.$buefy.dialog.confirm({
      title: options.confirmTitle,
      message: options.confirmMessage,
      cancelText: '取消',
      confirmText: '确定',
      type: options.confirmType == 'danger' ? 'is-danger' : 'is-success',
      onConfirm: () => {
        var t = Snackbar.open({
          type: 'is-info',
          message: options.workingMessage,
          indefinite: true,
          queue: false
        })
        operation()
          .then(resp => {
            t.close();
            if (resp.ok) {
              Snackbar.open({
                type: 'is-success',
                message: options.successMessage,
                indefinite: true,
                queue: false
              })
            } else {
              Snackbar.open({
                type: 'is-danger',
                message: options.failureMessage,
                indefinite: true,
              });
            }
          }).catch(() => {
            t.close();
            Snackbar.open({
              type: 'is-danger',
              message: options.failureMessage,
              indefinite: true,
            });
          });
      }
    })
  }

  remove(host: string, message: string) {
    const plot = message.match(this.rePlot);
    if (!plot) return;

    this.removePlot(host, plot[0]);
  }

  shorten(err: any) {
    return err.replace(/plot-k(?<k>\d{2})-\d{2}(?<time>(\d{2}-){5})(?<id>[0-9a-f]{4})[0-9a-f]{60}\.plot/g, '$<k>-$<time>$<id>.plot');
  }

  isRemovable(message: string): boolean {
    const plot = message.match(this.rePlot);
    if (!plot || plot.length == 0) return false;

    const msg = message.replace(this.rePlot, '');
    if (msg == 'Have multiple copies of the plot , not adding it.') return true;
    if (msg.startsWith('Failed to open file ')) return true;

    return false;
  }

  get sortedErrors() {
    return this.errors.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.errNum);
  }

  get sortedEvents() {
    return this.events.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.evtNum);
  }
}
</script>