<template>
  <div class="explorer">
    <b-notification v-if="username==null" type="is-danger" has-icon aria-close-label="Close notification" role="alert">
      尚未登录，无法查看！
    </b-notification>
    <div v-if="farmer!=null" class="box">
      <div class="card-content">
        <div class="content">
          <b-field grouped group-multiline>
            <div class="container is-fluid mb-3">
              <b-notification v-if="connectionStatus=='failed'" type="is-danger" has-icon
                aria-close-label="Close notification" role="alert">
                无法连接至服务器，请检查您的网络连接或联系管理员！
              </b-notification>
            </div>
            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">连接状态</b-tag>
                <b-tag type="is-warning" v-if="connectionStatus=='loading'">连接中...</b-tag>
                <b-tag type="is-success" v-else-if="connectionStatus=='success'">连接成功</b-tag>
                <b-tag type="is-danger" v-else>连接失败</b-tag>
              </b-taglist>
            </div>
            <div class="control">
              <b-tooltip :label="'时间: ' + farmer.node.time" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">同步状态</b-tag>
                  <b-tag type="is-success" v-if="farmer.node.status == 'Full Node Synced'">
                    {{farmer.node.status}}
                  </b-tag>
                  <b-tag type="is-danger" v-else>{{farmer.node.status}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'空间: ' + farmer.farmer.totalSize + '/' + farmer.node.space" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">农场状态</b-tag>
                  <b-tag type="is-success" v-if="farmer.farmer.status == 'Farming'">{{farmer.farmer.status}}</b-tag>
                  <b-tag type="is-danger" v-else>{{farmer.farmer.status}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'期望成功值: ' + farmer.farmer.expectedToWin" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">耕田数量</b-tag>
                  <b-tag type="is-primary">{{farmer.farmer.plotCount}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'最后挖币高度: ' + farmer.farmer.lastFarmedHeight" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">总共挖币</b-tag>
                  <b-tag type="is-danger">{{farmer.farmer.totalFarmed}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">Farmer</b-tag>
                <b-tag v-if='farmers' type="is-info">{{farmers.length}}</b-tag>
              </b-taglist>
            </div>

            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">Plotter</b-tag>
                <b-tag v-if='plotters' type="is-info">{{plotters.length}}</b-tag>
              </b-taglist>
            </div>

            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">Harvester</b-tag>
                <b-tag v-if='harvesters' type="is-info">{{harvesters.length}}</b-tag>
              </b-taglist>
            </div>

            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">用户</b-tag>
                <b-tag v-if='username' type="is-info">{{username}}</b-tag>
                <b-tag v-else type="is-danger">未登录</b-tag>
              </b-taglist>
            </div>

          </b-field>

          <b-collapse :open="false" position="is-bottom" aria-id="contentIdForA11y1">
            <template #trigger="props">
              <a aria-controls="contentIdForA11y1">
                <b-icon :icon="!props.open ? 'menu-down' : 'menu-up'"></b-icon>
                {{ !props.open ? '显示全部' : '隐藏' }}
              </a>
            </template>
            <b-field grouped group-multiline>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">高度</b-tag>
                  <b-tag type="is-info">{{farmer.node.height}}</b-tag>
                </b-taglist>
              </div>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">空间</b-tag>
                  <b-tag type="is-primary is-light">{{farmer.farmer.totalSize}}</b-tag>
                  <b-tag type="is-light">{{farmer.node.space}}</b-tag>
                </b-taglist>
              </div>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">难度</b-tag>
                  <b-tag type="is-light">{{farmer.node.difficulty}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">交易费用</b-tag>
                  <b-tag type="is-light">{{farmer.farmer.txFees}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">奖励</b-tag>
                  <b-tag type="is-light">{{farmer.farmer.rewards}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">期望成功值</b-tag>
                  <b-tag type="is-light">{{farmer.farmer.expectedToWin}}</b-tag>
                </b-taglist>
              </div>

            </b-field>
          </b-collapse>
        </div>
      </div>
    </div>

    <!--<div class="box">-->
    <!-- <diskMap /> -->
    <!--</div>-->

    <div id="summary" class="box">
      <div v-if="plotters == null || plotPlan == null">Loading</div>
      <div v-else>
        <b-field grouped group-multiline>
          <div class="control">
            <b-switch v-model="hideJobs">Hide Jobs</b-switch>
          </div>
          <div class="control">
            <b-switch v-model="hideProcess">Hide Process</b-switch>
          </div>
          <div class="control">
            <b-button @click="applyPlotPlan(Object.keys(plotPlan))">Apply All</b-button>
          </div>
        </b-field>

        <b-table :data="plotters" ref="table" detailed :show-detail-icon="true" detail-key="name" custom-detail-row striped>
          <b-table-column field="name" label="Name" width="40" v-slot="props">
            {{ props.row.name }}
          </b-table-column>
          <b-table-column label="Jobs" width="40" v-slot="props">
            <template>
              {{props.row.jobs.length}} /
              <span :class="togglePlanClass(props.row, 'jobNumber')">{{props.row.configuration.jobNumber}}</span>
              <span class="has-text-grey">
                [
              </span>
              <span :class="togglePlanClass(props.row, 'staggerMinute')">{{props.row.configuration.staggerMinute}}</span>
              <span class="has-text-grey">
                m]
              </span>
            </template>
          </b-table-column>
          <b-table-column label="Moving" width="40" v-slot="props">
            <template>
              {{props.row.fileCounts[0].count}}
              <span class="has-text-grey">-></span>
              <span :class="togglePlanClass(props.row, 'rsyncdHost')">{{props.row.configuration.rsyncdHost}}</span>
              <span class="has-text-grey">@</span>
              <span :class="togglePlanClass(props.row, 'rsyncdIndex')">{{props.row.configuration.rsyncdIndex}}</span>
            </template>
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
            <tr :set="plot = props.row">
              <td colspan="5">
                <div class="card">
                  <table class="table">
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
                        <td :class="togglePlanClass(plot, 'jobNumber')">{{plot.configuration.jobNumber}}</td>
                        <td :class="togglePlanClass(plot, 'rsyncdHost')">{{plot.configuration.rsyncdHost}}</td>
                        <td :class="togglePlanClass(plot, 'rsyncdIndex')">{{plot.configuration.rsyncdIndex}}</td>
                        <td :class="togglePlanClass(plot, 'staggerMinute')">
                          {{plot.configuration.staggerMinute}}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Plan</td>
                        <td :class="togglePlanClass(plot, 'jobNumber')">{{plotPlan[plot.name].jobNumber}}</td>
                        <td :class="togglePlanClass(plot, 'rsyncdHost')">{{plotPlan[plot.name].rsyncdHost}}</td>
                        <td :class="togglePlanClass(plot, 'rsyncdIndex')">{{plotPlan[plot.name].rsyncdIndex}}</td>
                        <td :class="togglePlanClass(plot, 'staggerMinute')">
                          {{plotPlan[plot.name].staggerMinute}}
                        </td>
                        <td>
                          <b-button size="is-small" @click="applyPlotPlan([plot.name])">Apply</b-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table v-if="!hideJobs" class="table is-striped is-hoverable">
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
                        <td>
                          {{(job.wallTime).split(':')[0]}}<span class="has-text-grey">
                            h
                          </span>{{(job.wallTime).split(':')[1]}}<span class="has-text-grey"> min</span>
                        </td>
                        <td>{{job.phase}}</td>
                        <td>{{job.tempSize}}</td>
                        <td>
                          <b-button size="is-small" @click="stopPlot(plot.name, job.id)">停止</b-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="p-4" v-if="plot.cpuMap">
                    <cpu-info name="plot.name" :hideProcess="hideProcess" :machine="plot" />
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </b-table>
      </div>
    </div>

    <div class="block" v-if="harvesters!=[] && farmers!=null">
      <div class="columns is-desktop is-multiline">
        <div class="column is-half" v-for="machine in [...farmers, ...harvesters]" v-bind:key="machine.name">
          <nav class="card">
            <p class="panel-heading">
              {{machine.name}}
            </p>

            <div class="card-content p-4" v-if="machine.cpuMap">
              <cpu-info name="machine.name" :machine="machine" />
            </div>
          </nav>
        </div>
      </div>
    </div>

    <div class="block" id="errors">
      <div class="columns is-desktop">
        <div class="column is-half" v-if="errors!=null">
          <nav class="panel">
            <p class="panel-heading">Errors</p>
            <div class="panel-block" v-for="err in sortedErrors" v-bind:key="sortedErrors.indexOf(err)">
              <b-tooltip type="is-light" size="is-large" multilined>
                <b-tag type="is-info is-light">{{err.time}}</b-tag>
                <span class="has-text-danger">
                  {{shorten(err.error)}}
                </span>
                <template v-slot:content>
                  <p class="is-size-7">{{err.error}}</p>
                </template>
              </b-tooltip>
            </div>
          </nav>
          <b-button rounded @click="errNum+=10" :disabled="errNum>=errors.length">Expand</b-button>
          <b-button rounded @click="errNum=10" :disabled="errNum==10">Shrink</b-button>
        </div>

        <div class="column is-half" v-if="events!=null">
          <nav class="panel">
            <p class="panel-heading">Events</p>
            <div class="panel-block" v-for="evt in sortedEvents" v-bind:key="sortedEvents.indexOf(evt)">
              <b-tag type="is-info is-light">{{evt.time}}</b-tag>
              <span class="has-text-danger" v-if="evt.proofs > 0">
                {{evt.eligibleNumber}}/{{evt.total}} 个图块被选中，发现 {{evt.proofs}} 个证明, 时长:
                {{evt.duration}} s
              </span>
              <span class="has-text-info" v-else>
                {{evt.eligibleNumber}}/{{evt.total}} 个图块被选中，发现 {{evt.proofs}} 个证明, 时长:
                {{evt.duration}} s
              </span>
            </div>
          </nav>
          <b-button rounded @click="evtNum+=10" :disabled="evtNum>=events.length">Expand</b-button>
          <b-button rounded @click="evtNum=10" :disabled="evtNum==10">Shrink</b-button>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
  .b-tooltip.is-multiline.is-large .tooltip-content {
    width: 600px;
  }
</style>

<script lang="ts">
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';
  import diskMap from '@/components/diskMap.vue'
  import DiskList from '@/components/DiskList.vue'
  import cpuInfo from '@/components/cpuInfo.vue'
  import {
    SnackbarProgrammatic as Snackbar
  } from 'buefy'

  @Component({
    components: {
      diskMap,
      DiskList,
      cpuInfo,
    },
  })
  export default class monitor extends Vue {
    farmers: any = null;
    farmer: any = null;
    plotters: any = null;
    harvesters: any[] = [];
    errors: any = null;
    events: any = null;
    evtNum = 10;
    errNum = 10;
    connectionStatus = 'loading';
    intervals: number[] = [];
    hideJobs = false;
    hideProcess = false;
    plotPlan: any = null;
    username = localStorage.getItem('username');
    plottingProgressOpen = false;

    mounted() {
      this.load();
      this.autoRefresh();
      if (localStorage.getItem("plottingProgressOpen") != 'true') {
        localStorage.setItem("plottingProgressOpen", this.plottingProgressOpen.toString());
      } else {
        this.plottingProgressOpen = Boolean(localStorage.getItem("plottingProgressOpen"));
      }
    }

    load() {
      var server: any;
      getInfo.getInfo('servers')
        .then(response => response.json())
        .then(json => {
          server = json;
        })
        .then(() => {
          getInfo.getInfo('farmer')
            .then(response => response.json())
            .then(json => {
              this.farmers = json;
            })
            .then(() => {
              this.farmers.forEach((farmer: any) => {
                var m = server.find((_: any) => _.name == farmer.name);
                this.assignMachine(farmer, m);
                this.calcCpuMap(farmer);
                getInfo.sortDisks(farmer);
              });
              this.farmer = this.farmers[0];
            })
          getInfo.getInfo('plotter')
            .then(response => response.json())
            .then(json => {
              this.plotters = json;
              this.plotters.forEach((plotter: any) => {
                plotter.jobs.forEach((_: any) => _.progress = this.calcProgress(_.phase));
              });
            })
            .then(() => {
              this.plotters.forEach((plotter: any) => {
                var m = server.find((_: any) => _.name == plotter.name);
                this.assignMachine(plotter, m);
                this.calcCpuMap(plotter);
                getInfo.sortDisks(plotter);
              });
            });
          server.forEach((machine: any) => {
            if (/harvester\d/.test(machine.name)) {
              this.harvesters.push(machine);
            }
            this.harvesters.forEach((harvester: any) => {
              this.calcCpuMap(harvester);
              getInfo.sortDisks(harvester);
            })
          })
        }).then(() => {
          this.connectionStatus = 'success'
        }).catch(() => {
          this.connectionStatus = 'failed'
        });
      getInfo.getInfo('errors')
        .then(response => response.json())
        .then(json => {
          this.errors = json;
        });
      getInfo.getInfo('events')
        .then(response => response.json())
        .then(json => {
          this.events = json;
        });
      getInfo.getPlotPlan()
        .then(response => response.json())
        .then(json => {
          this.plotPlan = {}
          json.forEach((plan: any) => {
            this.plotPlan[plan.name] = plan.plan;
          })
        })
    }
    assignMachine(vueObj: any, machine: any) {
      Vue.set(vueObj, 'cpus', machine.cpus);
      Vue.set(vueObj, 'disks', machine.disks);
      Vue.set(vueObj, 'memory', machine.memory);
      Vue.set(vueObj, 'process', machine.process);
      Vue.set(vueObj, 'networkIoSpeed', machine.networkIoSpeed);
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
    autoRefresh() {
      var temp;
      temp = setInterval(() => {
        getInfo.getInfo('plotter')
          .then(response => response.json())
          .then(json => {
            this.plotters.forEach((plotter: any) => {
              var m = json.find((_: any) => _.name == plotter.name);
              Vue.set(plotter, "jobs", m.jobs);
              Vue.set(plotter, "fileCounts", m.fileCounts);
              plotter.jobs.forEach((_: any) => _.progress = this.calcProgress(_.phase));
            })
          });
        getInfo.getInfo('farmer')
          .then(response => response.json())
          .then(json => {
            this.farmers.forEach((farmer: any) => {
              var m = json.find((_: any) => _.name == farmer.name);
              Vue.set(farmer, "farmer", m.farmer);
              Vue.set(farmer, "node", m.node);
            })
          });
        getInfo.getInfo('servers')
          .then(response => response.json())
          .then(json => {
            this.farmers.forEach((farmer: any) => {
              var m = json.find((_: any) => _.name == farmer.name);
              this.assignMachine(farmer, m);
              this.calcCpuMap(farmer);
              getInfo.sortDisks(farmer);
            });
            this.farmer = this.farmers[0];
            this.plotters.forEach((plotter: any) => {
              var m = json.find((_: any) => _.name == plotter.name);
              this.assignMachine(plotter, m);
              this.calcCpuMap(plotter);
              getInfo.sortDisks(plotter);
            });
            this.harvesters.forEach((harvester: any) => {
              var m = json.find((_: any) => _.name == harvester.name);
              this.assignMachine(harvester, m);
              this.calcCpuMap(harvester);
              getInfo.sortDisks(harvester);
            })
          }).then(() => {
            this.connectionStatus = 'success'
          }).catch(() => {
            this.connectionStatus = 'failed'
          });
        getInfo.getInfo('errors')
          .then(response => response.json())
          .then(json => {
            this.errors = json;
          });
        getInfo.getInfo('events')
          .then(response => response.json())
          .then(json => {
            this.events = json;
          });
        getInfo.getPlotPlan()
          .then(response => response.json())
          .then(json => {
            json.forEach((plan: any) => {
              this.plotPlan[plan.name] = plan.plan;
            })
          })
      }, 5000);
      this.intervals.push(temp);
      // temp = setInterval(() => {
      //   getInfo.save("farmer", this.farmer);
      //   getInfo.save("plot", this.plot);
      //   getInfo.save("errors", this.errors);
      //   getInfo.save("events", this.events);
      // }, 5000);
      // this.intervals.push(temp);
    }
    calcProgress(phase: any) {
      const p = Number(phase[0]);
      const n = Number(phase[2]);
      if (p == 1) return n * 5;
      if (p == 2) return 35 + n * 3;
      if (p == 3) return 56 + n * 5;
      if (p == 4) return 98;
    }
    calcCpuMap(machine: any) {
      machine.cpuMap = {
        data: [{
          name: 'Cpu',
          data: machine.cpus.map((_: any) => 100 - _),
        }],
        chartOptions: {
          chart: {
            type: 'bar',
            height: 150,
            animations: {
              enabled: false
            },
            toolbar: {
              show: false,
            }
          },
          plotOptions: {
            bar: {
              horizontal: false,
              colors: {
                ranges: [{
                  from: 0,
                  to: 100,
                  color: '#00FF01'
                }]
              },
              columnWidth: '55%',
              endingShape: 'rounded'
            },
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
          },
          xaxis: {
            categories: machine.cpus.map((_: any, i: number) => i + 1),
            labels: {
              style: {
                colors: 'white',
              }
            }
          },
          yaxis: {
            title: {
              text: 'CPU Usage',
              style: {
                color: 'white',
              }
            },
            labels: {
              style: {
                colors: 'white',
              }
            },
            max: 100,
            min: 0,
            decimalsInFloat: 0,
          },
          fill: {
            opacity: 1
          },
          tooltip: {
            theme: "dark",
            y: {
              formatter: function (val: number) {
                return val.toString() + " %"
              }
            }
          }
        }
      };
      machine.cpuRadialBar = {
        data: [(machine.memory.used / machine.memory.total * 100).toFixed(1)],
        chartOptions: {
          chart: {
            height: 150,
            type: 'radialBar',
            animations: {
              enabled: false
            },
            toolbar: {
              show: false,
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 135,
              track: {
                background: '#A9A9A9',
                startAngle: -135,
                endAngle: 135,
              },
              dataLabels: {
                name: {
                  show: false,
                  color: "#FFFFFF",
                },
                value: {
                  fontSize: "16px",
                  show: true,
                  color: "#FFFFFF",
                },
              },
            },
          },
          fill: {
            colors: [function ({
              value
            }: any) {
              if (value < 55) {
                return '#00FF00'
              } else if (value >= 55 && value < 80) {
                return '#FFFF00'
              } else {
                return '#FF0000'
              }
            }],
          },
          stroke: {
            lineCap: "butt"
          },
          labels: ['内存情况'],
        },
      }
    }
    shorten(err: any) {
      var temp: string;
      if (err.includes("plot")) {
        err = err.split("plot");
        temp = err[0] + err[err.length - 1];
        return temp;
      } else if (err.includes("id")) {
        temp = err.slice(0, err.lastIndexOf("id")) + "<id>" + err.slice(err.indexOf(","), err.length - 1);
        return temp;
      } else {
        return err;
      }
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
    togglePlanClass(plot: any, key: string) {
      var condition = {
        'has-text-success': plot.configuration[key] != this.plotPlan[plot.name][key],
        'has-text-grey': plot.configuration[key] == this.plotPlan[plot.name][key]
      }
      return condition;
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
    // get tempDirSet() {
    //   return [...new Set(this.plot.jobs.map((_: any) => _.tempDir))].sort();
    // }
    get sortedErrors() {
      return this.errors.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.errNum);
    }
    get sortedEvents() {
      return this.events.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.evtNum);
    }

    beforeDestroy() {
      this.intervals = getInfo.stopRefresh(this.intervals);
      localStorage.setItem("plottingProgressOpen", this.plottingProgressOpen.toString());
    }
  }
</script>

<style>
  #summary .summary-progress progress {
    margin: 0;
  }

  #summary .summary-progress .progress-wrapper {
    margin: 0.2em 0;
  }
</style>