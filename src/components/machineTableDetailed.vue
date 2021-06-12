<template>
  <div class="machineTableDetailed">
    <b-table :data="machines" ref="table" detailed :show-detail-icon="false" detail-key="name" custom-detail-row striped
      :mobile-cards="false">
      <b-table-column label="#" width="40" header-class="has-text-info" v-slot="props">
        <a class="has-text-light" @click="props.toggleDetails(props.row)">{{machines.indexOf(props.row)+1}}</a>
      </b-table-column>
      <b-table-column field="name" label="Name" width="40" header-class="has-text-info" cell-class="has-text-info"
        v-slot="props">
        <a :id="props.row.name" class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.name }}</a>
      </b-table-column>
      <b-table-column :label="`Power (${machines.reduce((sum, e) => sum + e.power,0)})`" width="40"
        header-class="has-text-info" v-slot="props" :visible="isPlotter && !isMobile">
        <template>
          <span class="has-text-grey">
            {{props.row.power}}
          </span>
        </template>
      </b-table-column>
      <b-table-column :label="`Jobs (${machines.reduce((sum, e) => sum + (e.jobs && e.jobs.length || 0),0)})`"
        width="40" header-class="has-text-info" v-slot="props" :visible="isPlotter">
        <template>
          {{(props.row.jobs||[]).length}}
          <span v-if="props.row.configuration" class="is-hidden-mobile">
            <span
              :class="isDiffPlotPlan(props.row, ['jobNumber']) ? 'has-text-danger':'has-text-grey'">/{{props.row.configuration.jobNumber}}</span>
            <span class="has-text-grey">
              [
            </span>
            <span
              :class="isDiffPlotPlan(props.row, ['staggerMinute']) ? 'has-text-danger':'has-text-grey'">{{props.row.configuration.staggerMinute}}</span>
            <span class="has-text-grey">
              m]
            </span>
          </span>
        </template>
      </b-table-column>
      <b-table-column label="Moving" width="40" header-class="has-text-info" v-slot="props" :visible="isPlotter">
        <template>
          <template v-if="props.row.fileCounts && props.row.fileCounts.length > 0 && props.row.fileCounts[0]">
            {{props.row.fileCounts[0].count}}
          </template>
          <span v-if="props.row.configuration" class="is-hidden-mobile">
            <span class="has-text-grey">-></span>
            <span :class="isDiffPlotPlan(props.row, ['rsyncdHost']) ? 'has-text-danger':'has-text-grey'"
              :title="plotPlan[props.row.name] && plotPlan[props.row.name]['rsyncdHost'].slice(-3)">{{props.row.configuration.rsyncdHost.slice(-3)}}</span>
            <span class="has-text-grey">@</span>
            <span
              :class="isDiffPlotPlan(props.row, ['rsyncdIndex']) ? 'has-text-danger':'has-text-grey'">{{props.row.configuration.rsyncdIndex}}</span>
          </span>
        </template>
      </b-table-column>
      <b-table-column label="Plotting Progress" width="20%" header-class="has-text-info" v-slot="props"
        :visible="isPlotter && !isMobile">
        <div style="font-family: Courier New, Courier, monospace">
          {{ plottingProgress(props.row.jobs)}}
        </div>
      </b-table-column>
      <b-table-column field="network" label="Network" width="40" header-class="has-text-info" v-slot="props"
        :visible="isHarvester">
        <div v-if="parseFloat(props.row.networkIoSpeed) > 10240">{{ humanize(props.row.networkIoSpeed) }}</div>
        <div v-else>无传输</div>
      </b-table-column>
      <b-table-column label="Disk Space" width="30%" header-class="has-text-info" v-slot="props" :visible="isPlotter">
        <template v-if="props.row.disks">
          <div class="summary-progress">
            <disk-list :disks="[ getProperDisk(props.row.disks) ]" />
          </div>
        </template>
        <template v-else>
          No disks found
        </template>
      </b-table-column>
      <b-table-column field="totalPlot" :label="`田数 (${machines.reduce((sum, e) => sum + e.totalPlot,0)})`" width="40"
        header-class="has-text-info" v-slot="props" :visible="isHarvester">
        <div>{{ props.row.totalPlot }}</div>
      </b-table-column>
      <b-table-column field="network" label="剩余硬盘" width="40" header-class="has-text-info" v-slot="props"
        :visible="isHarvester">
        <div>
          {{ diskAvailable(props.row.disks).length }}/{{ props.row.disks.length }}
          <span v-if="props.row.abnormalFarmlands && props.row.abnormalFarmlands.length > 0"
            class="has-text-danger">[{{props.row.abnormalFarmlands.length}}]</span>
        </div>
      </b-table-column>
      <b-table-column field="network" label="剩余容量" width="40" header-class="has-text-info" v-slot="props"
        :visible="isHarvester">
        <div class="has-text-success">
          {{ humanize(diskAvailable(props.row.disks).reduce((a, b) => a + b, 0)) }}
          <span
            class="has-text-light">({{ diskAvailable(props.row.disks).reduce((a, b) => a + Math.floor(b / 106430464 / 1024), 0)}})</span>
        </div>
      </b-table-column>
      <b-table-column label="动作" width="40" header-class="has-text-info" :visible="isHarvester">
        <template v-slot:header>
          收割机
          <b-button size="is-small" @click="startDaemons(machines.map(_=>_.name))">启动所有</b-button>
        </template>
        <template v-slot="props">
          <b-button size="is-small" @click="startDaemons([props.row.name])">启动</b-button>
        </template>
      </b-table-column>


      <template slot="detail" slot-scope="props">
        <tr>
          <td class="has-background-dark" colspan="8">
            <template v-if="isPlotter">
              <div v-for="plot in [ props.row ]" :key="plot.name">
                <div class="table-container pt-2">
                  <table class="table is-striped" v-if="plotPlan && plot.configuration">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Job number</th>
                        <th>Rsyncd Host</th>
                        <th>Rsyncd Index</th>
                        <th>Stagger Minute</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Current</td>
                        <td :class="isDiffPlotPlan(plot, ['jobNumber']) ? 'has-text-danger':'has-text-grey'">
                          {{plot.configuration.jobNumber}}</td>
                        <td :class="isDiffPlotPlan(plot, ['rsyncdHost']) ? 'has-text-danger':'has-text-grey'">
                          {{plot.configuration.rsyncdHost}}</td>
                        <td :class="isDiffPlotPlan(plot, ['rsyncdIndex']) ? 'has-text-danger':'has-text-grey'">
                          {{plot.configuration.rsyncdIndex}}</td>
                        <td :class="isDiffPlotPlan(plot, ['staggerMinute']) ? 'has-text-danger':'has-text-grey'">
                          {{plot.configuration.staggerMinute}}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Plan</td>
                        <td :class="isDiffPlotPlan(plot, ['jobNumber']) ? 'has-text-danger':'has-text-grey'">
                          {{plotPlan[plot.name].jobNumber}}</td>
                        <td :class="isDiffPlotPlan(plot, ['rsyncdHost']) ? 'has-text-danger':'has-text-grey'">
                          {{plotPlan[plot.name].rsyncdHost}}</td>
                        <td :class="isDiffPlotPlan(plot, ['rsyncdIndex']) ? 'has-text-danger':'has-text-grey'">
                          {{plotPlan[plot.name].rsyncdIndex}}</td>
                        <td :class="isDiffPlotPlan(plot, ['staggerMinute']) ? 'has-text-danger':'has-text-grey'">
                          {{plotPlan[plot.name].staggerMinute}}</td>
                        <td>
                          <b-button size="is-small" @click="cleanTemporary([plot.name])">Clean</b-button>
                          <b-button size="is-small" @click="applyPlotPlan([plot.name])">
                            Apply</b-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="!hideJobs" class="table-container">
                  <table class="table is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th class="is-hidden-mobile"></th>
                        <th>id</th>
                        <th>工作时长 </th>
                        <th>工作进度</th>
                        <th>容量</th>
                        <th>
                          <b-button @click="mulCheck=!mulCheck">{{ mulCheck==false?'批量操作':'取消操作' }}</b-button>
                          <b-button :disabled="!mulCheck" @click=stopPlot(plot.name,mulstop)>停止</b-button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="job in plot.jobs" v-bind:key="job.id">
                        <td class="is-hidden-mobile" width="25%">
                          <b-progress format="percent" :max="100">
                            <template #bar>
                              <b-progress-bar v-if="job.progress > 0" :value="job.progress > 35 ? 35 : job.progress"
                                type="is-danger">
                              </b-progress-bar>
                              <b-progress-bar v-if="job.progress > 35"
                                :value="job.progress > 56 ? 21 : job.progress - 35" type="is-info">
                              </b-progress-bar>
                              <b-progress-bar v-if="job.progress > 56"
                                :value="job.progress > 91 ? 35 : job.progress - 56" type="is-warning">
                              </b-progress-bar>
                              <b-progress-bar v-if="job.progress > 91" :value="job.progress - 91" type="is-success">
                              </b-progress-bar>
                            </template>
                          </b-progress>
                        </td>
                        <td>{{job.id}}</td>
                        <td v-if="job.wallTime.includes(':')">
                          {{(job.wallTime).split(':')[0]}}<span class="has-text-grey">
                            h
                          </span>{{(job.wallTime).split(':')[1]}}<span class="has-text-grey"> min</span>
                        </td>
                        <td v-else>
                          {{job.wallTime.slice(0,-1)}}<span class="has-text-grey">s</span>
                        </td>
                        <td>{{job.phase.replace(':','-')}}</td>
                        <td>{{job.tempSize}}</td>
                        <td v-if="!mulCheck">
                          <a @click="stopPlot(plot.name, job.id)">
                            <b-icon icon="window-close"></b-icon>
                          </a>
                        </td>
                        <td v-else>
                          <b-checkbox v-model="mulstop" :native-value="job.id" :disabled='!mulCheck'></b-checkbox>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <template v-if="isHarvester">
              <div v-for="harvester in [ props.row ]" :key="harvester.name">
                <div class="content">
                  <b-field grouped group-multiline>
                    <div v-for="ab in harvester.abnormalFarmlands" :key="ab" class="control">
                      <b-taglist attached>
                        <b-tag type="is-danger">{{ab}}</b-tag>
                      </b-taglist>
                    </div>
                  </b-field>
                </div>
              </div>
            </template>

            <div class="block">
              <cpu-info name="props.row.name" :hideProcess="hideProcess" :machine="props.row" />
            </div>
          </td>
        </tr>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
  import {
    Component,
    Vue,
    Prop
  } from 'vue-property-decorator'
  import getInfo from '@/services/getInfo'
  import cpuInfo from '@/components/cpuInfo.vue'
  import diskList from '@/components/DiskList.vue'
  import {
    SnackbarProgrammatic as Snackbar
  } from 'buefy'

  @Component({
    components: {
      cpuInfo,
      diskList,
    }
  })
  export default class machineTableDetailed extends Vue {
    @Prop() private machines!: any[];
    @Prop() private plotPlan!: any;
    @Prop() private type!: string;
    @Prop() private hideJobs!: boolean;
    @Prop() private hideProcess!: boolean;
    @Prop() private isMobile!: boolean;

    isPlotter = false;
    isHarvester = false;
    mulCheck = false;
    mulstop: any = [];

    mounted() {
      if (this.type == "plotter") {
        this.isPlotter = true;
      } else {
        this.isHarvester = true;
      }
    }
    stopPlot(name: string, plotId: string[]) {
      var id = this.machines
        .filter((_) => _.name == name)
        .map((_) => _.jobs.map((_: any) => _.id))[0]
        .filter((_: any) => plotId.indexOf(_) > -1)
      this.$buefy.dialog.confirm({
        title: '确认停止任务',
        message: `停止机器[${name}]上的任务[${id}]，确认吗？`,
        cancelText: '取消',
        confirmText: '确定',
        type: 'is-success',
        onConfirm: () => {
          id.map((_: any) => {
            getInfo
              .deletePlot(name, _)
              .then(() => {
                Snackbar.open('删除命令已发送，等待半分钟看结果')
              })
              .catch(() => {
                Snackbar.open('删除失败，可能已经被删除，可能系统无法操作')
              })
          })
        },
      })
    }
    applyPlotPlan(plotList: string[]) {
      var plans: any[] = [];
      plotList.forEach((plot: string) => {
        plans.push({
          name: plot,
          plan: this.plotPlan[plot],
        })
      })
      this.$buefy.dialog.confirm({
        title: '确认应用计划',
        message: `应用机器[${plotList}]的计划，确认吗？`,
        cancelText: '取消',
        confirmText: '确定',
        type: 'is-success',
        onConfirm: () => {
          var t = Snackbar.open({
            type: 'is-primary',
            message: `应用[${plotList}]中`,
            indefinite: true,
            queue: false
          })
          getInfo.applyPlotPlan(plans)
            .then(() => {
              t.close();
              Snackbar.open({
                type: 'is-success',
                message: '应用成功',
              });
            }).catch(() => {
              t.close();
              Snackbar.open({
                type: 'is-error',
                message: '应用失败',
                indefinite: true,
              });
            });
        }
      })
    }
    cleanTemporary(names: string[]) {
      this.$buefy.dialog.confirm({
        title: '确认清理',
        message: `清理机器[${names}]，确认吗？`,
        cancelText: '取消',
        confirmText: '确定',
        type: 'is-success',
        onConfirm: () => {
          var t = Snackbar.open({
            type: 'is-primary',
            message: `清理[${names}]中`,
            indefinite: true,
            queue: false
          })
          getInfo.cleanTemporary(names)
            .then(() => {
              t.close();
              Snackbar.open({
                type: 'is-success',
                message: '清理成功',
              });
            }).catch(() => {
              t.close();
              Snackbar.open({
                type: 'is-error',
                message: '清理失败',
                indefinite: true,
              });
            });
        }
      })
    }
    startDaemons(names: string[]) {
      this.$buefy.dialog.confirm({
        title: '确认启动',
        message: `启动机器[${names}]的进程，确认吗？`,
        cancelText: '取消',
        confirmText: '确定',
        type: 'is-success',
        onConfirm: () => {
          var t = Snackbar.open({
            type: 'is-primary',
            message: `启动[${names}]中`,
            indefinite: true,
            queue: false
          })
          getInfo.startHarvesterDaemons(names)
            .then((resp) => {
              t.close();
              if (resp.ok) {
                Snackbar.open({
                  type: 'is-success',
                  message: '启动成功',
                });
              } else {
                Snackbar.open({
                  type: 'is-danger',
                  message: '启动失败',
                  indefinite: true,
                });
              }
            }).catch(() => {
              t.close();
              Snackbar.open({
                type: 'is-danger',
                message: '启动失败',
                indefinite: true,
              });
            });
        }
      })
    }
    isDiffPlotPlan(plot: any, keys: string[]) {
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (this.plotPlan[plot.name] && plot.configuration[key] != this.plotPlan[plot.name][key]) return true
      }
      return false;
    }
    getProperDisk(disks: any[]) {
      if (!disks || disks.length == 0) {
        return null;
      }

      var priv = ["/data/tmp", "/data", "/"];
      for (let i = 0; i < priv.length; i++) {
        const path = priv[i];
        var idx = disks.findIndex(_ => _.path == path);
        if (idx >= 0) return disks[idx];

      }

      var maxSizeIdx = 0;
      for (var i = 0; i < disks.length; i++) {
        if (disks[i].size > disks[maxSizeIdx].size) {
          maxSizeIdx = i;
        }
      }
      return disks[maxSizeIdx];
    }
    humanize(size: number) {
      if (size == 0) return 0;
      var i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    plottingProgress(jobs: {
      phase: string;
    } []) {
      if (!jobs) {
        return "No jobs"
      }
      var summary = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0],
      ]
      const symbols = ['_', '.', ':'];
      for (var i = 0; i < jobs.length; i++) {
        var phase = jobs[i].phase.split(':')
        if (parseInt(phase[0]) % 2 == 1) {
          summary[parseInt(phase[0]) - 1][parseInt(phase[1]) - 1] += 1; //steps of phase 1 and 3 starts from 1
        } else {
          summary[parseInt(phase[0]) - 1][parseInt(phase[1])] += 1; //steps of phase 2 and 4 starts from 0 
        }
      }
      var result = "["
      for (var key = 0; key < 4; key++) {
        result = result + (key + 1).toString()
        for (i = 0; i < summary[key].length; i++) {
          if (summary[key][i] < 3) {
            result = result + symbols[summary[key][i]]
          } else {
            result = result + "*"
          }
        }
      }
      result = result + ']'
      return result
    }
    getHarvesterName(host: string) {
      return "harvester" + host.slice(-1) + '-' + host.slice(-3);
    }
    diskAvailable(disks: any[]) {
      var toReturn: any[] = [];
      disks.forEach((disk: any) => {
        if (disk.available >= 2 * 106430464) toReturn.push(disk.available * 1024);
      })
      return toReturn;
    }
  }
</script>