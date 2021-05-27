<template>
  <div class="explorer">
    <div v-if="farmer!=null" class="box">
      <div class="card-content">
        <div class="content">
          <b-field grouped group-multiline>
            <div class="container is-fluid mb-3" >
              <b-notification v-if="connectionStatus=='failed'" type="is-danger" has-icon aria-close-label="Close notification" role="alert" >
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

    <div class="block">
      <b-collapse class="card" animation="slide" :open="true">
        <template #trigger="props">
          <div class="card-header" role="button">
            <p class="card-header-title">Plotting Progress</p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
            </a>
          </div>
        </template>
        <div class="card-content">
          <div v-if="plotters==null" class="content">Loading</div>

          <div v-else class="content">
            <div class="columns is-desktop is-multiline is-3">
              <div v-for="plot in plotters" :key="plot.name" class="column is-half">
                <div class="title">[{{plot.name}}]: {{plot.jobs.length}} Jobs [{{plot.fileCounts[0].count}} Moving]</div>
                <div class="">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Job number</th>
                        <th>Rsyncd Host</th>
                        <th>Rsyncd Index</th>
                        <th>Stagger Minute</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{plot.configuration.jobNumber}}</td>
                        <td>{{plot.configuration.rsyncdHost}}</td>
                        <td>{{plot.configuration.rsyncdIndex}}</td>
                        <td>{{plot.configuration.staggerMinute}}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="table is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th>--------</th>
                        <th>id</th>
                        <th>工作时长 </th>
                        <th>工作进度</th>
                        <th>容量</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tr v-for="job in plot.jobs" v-bind:key="job.id">
                      <td>
                        <b-progress format="percent" :max="100">
                          <template #bar>
                            <b-progress-bar v-if="job.progress > 0" :value="job.progress > 35 ? 35 : job.progress"
                              type="is-danger">
                            </b-progress-bar>
                            <b-progress-bar v-if="job.progress > 35" :value="job.progress > 56 ? 21 : job.progress - 35"
                              type="is-info">
                            </b-progress-bar>
                            <b-progress-bar v-if="job.progress > 56" :value="job.progress > 91 ? 35 : job.progress - 56"
                              type="is-warning">
                            </b-progress-bar>
                            <b-progress-bar v-if="job.progress > 91" :value="job.progress - 91" type="is-success">
                            </b-progress-bar>
                          </template>
                        </b-progress>
                      </td>
                      <td>{{job.id}}</td>
                      <td>{{job.wallTime}}</td>
                      <td>{{job.phase}}</td>
                      <td>{{job.tempSize}}</td>
                      <td>
                        <b-button @click="stopPlot(plot.name, job.id)">停止</b-button>
                      </td>
                    </tr>
                  </table>

                  <div class="card-content p-4" v-if="plot.cpuMap">
                    <!--<apexchart height="150" :options="machine.cpuMap.chartOptions" :series="machine.cpuMap.data">
                    </apexchart>-->

                    <div class="columns is-multiline">
                      <div class="column is-half">
                        <disk-list :disks="plot.disks" />
                      </div>
                      <div class="column is-half columns is-mobile">
                        <div class="column is-one-quarter">
                          <!--<b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                            <div>
                              <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">内存情况</div>
                              <apexchart height="150" :options="machine.cpuRadialBar.chartOptions"
                                         :series="machine.cpuRadialBar.data"></apexchart>
                            </div>
                            <template v-slot:content>
                              <div>已用：{{plot.memory.used}}GB</div>
                              <div>总共：{{plot.memory.total}}GB</div>
                            </template>
                          </b-tooltip>-->
                          <div class="block">
                            <b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                              <div>
                                <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">内存</div>
                                <div>{{(plot.memory.used/plot.memory.total*100).toFixed(2)}}%</div>
                              </div>
                              <template v-slot:content>
                                <div>已用：{{plot.memory.used}}GB</div>
                                <div>总共：{{plot.memory.total}}GB</div>
                              </template>
                            </b-tooltip>
                          </div>
                        </div>
                        <div class="column is-one-quarter">
                          <div class="block">
                            <b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                              <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">CPU</div>
                              <div>{{calcCpu(plot)}}/{{plot.cpus.length}}</div>
                              <template v-slot:content>
                                <div>超过50%</div>
                              </template>
                            </b-tooltip>
                          </div>
                        </div>
                        <div class="column is-half">
                          <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">进程情况</div>
                          <template>
                            <b-taglist attached>
                              <b-tooltip position="is-bottom" type="is-light" label="进行中">
                                <b-tag type="is-success">{{plot.process.running}}</b-tag>
                              </b-tooltip>
                              <b-tooltip position="is-bottom" type="is-light" label="待进行">
                                <b-tag type="is-info">{{plot.process.sleeping}}</b-tag>
                              </b-tooltip>
                              <b-tooltip position="is-bottom" type="is-light" label="预警">
                                <b-tag type="is-warning">{{plot.process.stopped}}</b-tag>
                              </b-tooltip>
                              <b-tooltip position="is-bottom" type="is-light" label="问题">
                                <b-tag type="is-danger">{{plot.process.zombie}}</b-tag>
                              </b-tooltip>
                              <b-tooltip position="is-bottom" type="is-light" label="总计">
                                <b-tag type="is-white">{{plot.process.total}}</b-tag>
                              </b-tooltip>
                            </b-taglist>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
    </div>

    <div class="block" v-if="harvesters!=[] && farmers!=null">
      <div class="columns is-desktop is-multiline">
        <div class="column is-half" v-for="machine in [...farmers, ...harvesters]" v-bind:key="machine.name">
          <nav class="card">
            <p class="panel-heading">
              {{machine.name}}
            </p>

            <div class="card-content p-4" v-if="machine.cpuMap">
              <!--<apexchart height="150" :options="machine.cpuMap.chartOptions" :series="machine.cpuMap.data">
              </apexchart>-->

              <div class="columns is-multiline">
                <div class="column is-half">
                  <disk-list :disks="machine.disks" />
                </div>
                <div class="column is-half columns is-mobile">
                  <div class="column is-one-quarter">
                    <!--<b-tooltip position="is-bottom" type="is-light" size="is-small" multilined>
                      <div>
                        <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">内存情况</div>
                        <apexchart height="150" :options="machine.cpuRadialBar.chartOptions"
                                   :series="machine.cpuRadialBar.data"></apexchart>
                      </div>
                      <template v-slot:content>
                        <div>已用：{{machine.memory.used}}GB</div>
                        <div>总共：{{machine.memory.total}}GB</div>
                      </template>
                    </b-tooltip>-->
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
                  <div class="column is-one-quarter">
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
                  <div class="column is-half">
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
  import {
    SnackbarProgrammatic as Snackbar
  } from 'buefy'

  @Component({
    components: {
      diskMap,
      DiskList,
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

    mounted() {
      this.load();
      this.autoRefresh();
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
            })
          })
        }).then(() => {
          this.connectionStatus = 'success'
        }).catch(() => {
          this.connectionStatus = 'failed'
        });
    }
    assignMachine(vueObj: any, machine: any) {
      Vue.set(vueObj, 'cpus', machine.cpus);
      Vue.set(vueObj, 'disks', machine.disks);
      Vue.set(vueObj, 'memory', machine.memory);
      Vue.set(vueObj, 'process', machine.process);
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
            })
          }).then(()=>{
            this.connectionStatus = 'success'
          }).catch(()=>{
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
    calcCpu(machine: any) {
      var count = 0;
      machine.cpus.forEach((cpu: any) => {
        if (cpu > 50) count += 1;
      });
      return count;
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
    }
  }
</script>