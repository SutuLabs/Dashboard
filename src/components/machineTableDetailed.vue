<template>
  <div class="machineTableDetailed">
    <b-table :data="machines" ref="table" detailed :show-detail-icon="true" detail-key="name" custom-detail-row striped :mobile-cards="false">
      <b-table-column field="name" label="Name" width="40" v-slot="props">
        {{ props.row.name }}
      </b-table-column>
      <b-table-column label="Jobs" width="40" v-slot="props" :visible="isPlotter">
        <template>
          {{props.row.jobs.length}}
          <span class="is-hidden-mobile">
            <span :class="isDiffPlotPlan(props.row, ['jobNumber']) ? 'has-text-success':'has-text-grey'">/{{props.row.configuration.jobNumber}}</span>
            <span class="has-text-grey">
              [
            </span>
            <span :class="isDiffPlotPlan(props.row, ['staggerMinute']) ? 'has-text-success':'has-text-grey'">{{props.row.configuration.staggerMinute}}</span>
            <span class="has-text-grey">
              min]
            </span>
          </span>
        </template>
      </b-table-column>
      <b-table-column label="Moving" width="40" v-slot="props" :visible="isPlotter">
        <template>
          {{props.row.fileCounts[0].count}}
          <span class="is-hidden-mobile">
            <span class="has-text-grey">-></span>
            <span :class="isDiffPlotPlan(props.row, ['rsyncdHost']) ? 'has-text-success':'has-text-grey'">{{props.row.configuration.rsyncdHost}}</span>
            <span class="has-text-grey">@</span>
            <span :class="isDiffPlotPlan(props.row, ['rsyncdIndex']) ? 'has-text-success':'has-text-grey'">{{props.row.configuration.rsyncdIndex}}</span>
          </span>
        </template>
      </b-table-column>
      <b-table-column label="Plotting Progress" width="20%" v-slot="props" :visible="isPlotter && !isMobile">
        <div style="font-family: Courier New, Courier, monospace">
          {{ plottingProgress(props.row.jobs)}}
        </div>
      </b-table-column>
      <b-table-column field="network" label="Network" width="40" v-slot="props" :visible="isHarvester">
        <div v-if="parseFloat(props.row.networkIoSpeed) > 10240">{{ humanize(props.row.networkIoSpeed) }}</div>
        <div v-else>No active data transfer</div>
      </b-table-column>
      <b-table-column label="Disk Space" width="30%" v-slot="props">
        <template v-if="props.row.disks" :set="disk = getLargestDisk(props.row.disks)">
          <div class="summary-progress">
            <disk-list :disks="[getLargestDisk(props.row.disks)]" />
          </div>
        </template>
        <template v-else>
          No disks found
        </template>
      </b-table-column>

      <template slot="detail" slot-scope="props">
        <tr :set="machine = props.row">
          <td class="has-background-dark" colspan="6">
            <div v-if="isPlotter" :set="plot = machine">
              <div class="table-container pt-2">
                <table class="table is-striped">
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
                  <tbody v-if="plotPlan">
                    <tr>
                      <td>Current</td>
                      <td :class="isDiffPlotPlan(plot, ['jobNumber']) ? 'has-text-success':'has-text-grey'">{{plot.configuration.jobNumber}}</td>
                      <td :class="isDiffPlotPlan(plot, ['rsyncdHost']) ? 'has-text-success':'has-text-grey'">{{plot.configuration.rsyncdHost}}</td>
                      <td :class="isDiffPlotPlan(plot, ['rsyncdIndex']) ? 'has-text-success':'has-text-grey'">{{plot.configuration.rsyncdIndex}}</td>
                      <td :class="isDiffPlotPlan(plot, ['staggerMinute']) ? 'has-text-success':'has-text-grey'">
                        {{plot.configuration.staggerMinute}}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Plan</td>
                      <td :class="isDiffPlotPlan(plot, ['jobNumber']) ? 'has-text-success':'has-text-grey'">{{plotPlan[plot.name].jobNumber}}</td>
                      <td :class="isDiffPlotPlan(plot, ['rsyncdHost']) ? 'has-text-success':'has-text-grey'">{{plotPlan[plot.name].rsyncdHost}}</td>
                      <td :class="isDiffPlotPlan(plot, ['rsyncdIndex']) ? 'has-text-success':'has-text-grey'">{{plotPlan[plot.name].rsyncdIndex}}</td>
                      <td :class="isDiffPlotPlan(plot, ['staggerMinute']) ? 'has-text-success':'has-text-grey'">
                        {{plotPlan[plot.name].staggerMinute}}
                      </td>
                      <td>
                        <b-button size="is-small" @click="applyPlotPlan([plot.name])" :disabled="!isDiffPlotPlan(plot, ['jobNumber','rsyncdHost','rsyncdIndex','staggerMinute'])">Apply</b-button>
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
                      <th>操作</th>
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
                      <td>{{job.phase}}</td>
                      <td>{{job.tempSize}}</td>
                      <td>
                        <b-button size="is-small" @click="stopPlot(plot.name, job.id)">停止</b-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="block" v-if="machine.cpuMap">
              <cpu-info name="machine.name" :hideProcess="hideProcess" :machine="machine" />
            </div>
          </td>
        </tr>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'
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

    mounted() {
      if (this.type == "plotter") {
        this.isPlotter = true;
      } else {
        this.isHarvester = true;
      }
    }

    stopPlot(name: string, plotId: string) {
      this.$buefy.dialog.confirm({
        title: '确认停止任务',
        message: `停止机器[${name}]上的任务[${plotId}]，确认吗？`,
        cancelText: '取消',
        confirmText: '确定',
        type: 'is-success',
        onConfirm: () => {
          getInfo.deletePlot(name, plotId)
            .then(() => {
              Snackbar.open('删除命令已发送，等待半分钟看结果')
            }).catch(() => {
              Snackbar.open('删除失败，可能已经被删除，可能系统无法操作')
            });
        }
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
          getInfo.applyPlotPlan(plans)
            .then(() => {
              Snackbar.open('应用成功')
            }).catch(() => {
              Snackbar.open('应用失败')
            });
        }
      })
    }
    isDiffPlotPlan(plot: any, keys: string[]) {
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (plot.configuration[key] != this.plotPlan[plot.name][key]) {
          return true;
        }
      }
      return false;
    }
    getLargestDisk(disks: any[]) {
      if (disks && disks.length == 0) {
        return null;
      } else {
        var maxSize = 0;
        for (var i = 0; i < disks.length; i++) {
          if (disks[i].size > disks[maxSize].size) {
            maxSize = i;
          }
        }
        return disks[maxSize];
      }
    }
    humanize(size: number) {
      var i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    plottingProgress(jobs: {
      phase: string;
    }[]) {
      if (!jobs) { return "No jobs" }
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
  }
</script>