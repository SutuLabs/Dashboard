<template>
  <div class="explorer">
    <div v-if="farm!=null" class="box">
      <div class="card-content">
        <div class="content">
          <b-field grouped group-multiline>
            <div class="control">
              <b-tooltip :label="'时间: ' + farm.node.time" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">同步状态</b-tag>
                  <b-tag type="is-success" v-if="farm.node.status == 'Full Node Synced'">
                    {{farm.node.status}}
                  </b-tag>
                  <b-tag type="is-danger" v-else>{{farm.node.status}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'空间: ' + farm.farm.totalSize + '/' + farm.node.space" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">农场状态</b-tag>
                  <b-tag type="is-success" v-if="farm.farm.status == 'Farming'">{{farm.farm.status}}</b-tag>
                  <b-tag type="is-danger" v-else>{{farm.farm.status}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'期望成功值: ' + farm.farm.expectedToWin" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">耕田数量</b-tag>
                  <b-tag type="is-primary">{{farm.farm.plotCount}}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>

            <div class="control">
              <b-tooltip :label="'最后挖币高度: ' + farm.farm.lastFarmedHeight" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">总共挖币</b-tag>
                  <b-tag type="is-danger">{{farm.farm.totalFarmed}}</b-tag>
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
                  <b-tag type="is-info">{{farm.node.height}}</b-tag>
                </b-taglist>
              </div>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">空间</b-tag>
                  <b-tag type="is-primary is-light">{{farm.farm.totalSize}}</b-tag>
                  <b-tag type="is-light">{{farm.node.space}}</b-tag>
                </b-taglist>
              </div>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">难度</b-tag>
                  <b-tag type="is-light">{{farm.node.difficulty}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">交易费用</b-tag>
                  <b-tag type="is-light">{{farm.farm.txFees}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">奖励</b-tag>
                  <b-tag type="is-light">{{farm.farm.rewards}}</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">期望成功值</b-tag>
                  <b-tag type="is-light">{{farm.farm.expectedToWin}}</b-tag>
                </b-taglist>
              </div>

            </b-field>
          </b-collapse>
        </div>
      </div>
    </div>

    <div class="box">
      <diskMap />
    </div>

    <div class="block">
      <b-collapse class="card" animation="slide" :open="false">
        <template #trigger="props">
          <div class="card-header" role="button">
            <p class="card-header-title">Plotting Progress</p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
            </a>
          </div>
        </template>
        <div class="card-content">
          <div v-if="plot==null" class="content">Loading</div>
          <div v-if="plot!=null" class="content">
            <div class="title is-5">{{plot.jobs.length}} Jobs</div>
            <div class="columns is-multiline is-desktop">
              <div class="column" v-for='dir in tempDirSet' v-bind:key="dir">
                <table class="table is-striped is-hoverable">
                  <thead>
                    <tr></tr>
                    <tr>
                      <th>{{dir}}</th>
                      <th>id</th>
                      <th>工作时长 </th>
                      <th>工作进度</th>
                      <th>容量</th>
                    </tr>
                  </thead>
                  <tr v-for="job in plot.jobs" v-bind:key="job.id">
                    <div v-if="job.tempDir==dir">
                      <td>
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
                    </div>
                    <td>{{job.id}}</td>
                    <td>{{job.wallTime}}</td>
                    <td>{{job.phase}}</td>
                    <td>{{job.tempSize}}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
    </div>

    <div class="block" v-if="plot!=null && farm!=null">
      <div class="columns is-desktop">
        <div class="column is-half" v-for="machine in [plot, farm]" v-bind:key="machine.name">
          <nav class="card">
            <p class="panel-heading">
              {{machine.name}}
            </p>

            <div class="card-content p-4">
              <apexchart height="150" :options="machine.cpuMap.chartOptions" :series="machine.cpuMap.data">
              </apexchart>

              <div class="columns is-multiline">
                <div class="column is-5">
                  <template>
                    <div v-for="disk in machine.disks" v-bind:key="disk.path">
                      <div v-if="disk.size > 1024*1024">
                        <b-progress :type="'is-' + getDiskProgressType(disk.used, disk.size)" :value="disk.used"
                                    :max="disk.size" show-value>
                          <div class="has-text-white">
                            {{disk.path}}:
                            {{humanize(disk.used*1024)}}/{{humanize((disk.used+disk.available)*1024)}}
                            [{{Math.floor(disk.available / 106430464)}}]
                          </div>
                        </b-progress>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="column is-7 columns is-mobile">
                  <div class="column is-5">
                    <b-tooltip position="is-bottom" type="is-light" multilined>
                      <div>
                        <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">内存情况</div>
                        <apexchart height="150" :options="machine.cpuRadialBar.chartOptions"
                                   :series="machine.cpuRadialBar.data"></apexchart>
                      </div>
                      <template v-slot:content>
                        <div>已用：{{machine.memory.used}}GB</div>
                        <div>总共：{{machine.memory.total}}GB</div>
                      </template>
                    </b-tooltip>
                  </div>
                  <div class="column is-7">
                    <div class="block mb-2 is-size-6 has-text-weight-bold has-text-centered">进程情况</div>
                    <table class="table is-fullwidth is-narrow">
                      <tr>
                        <td class="has-background-success-dark is-size-7">进行中</td>
                        <td class="is-size-7">{{machine.process.running}}</td>
                      </tr>
                      <tr>
                        <td class="has-background-info-dark is-size-7">待进行</td>
                        <td class="is-size-7">{{machine.process.sleeping}}</td>
                      </tr>
                      <tr>
                        <td class="has-background-warning-dark is-size-7">预警</td>
                        <td class="is-size-7">{{machine.process.stopped}}</td>
                      </tr>
                      <tr>
                        <td class="has-background-danger-dark is-size-7">问题</td>
                        <td class="is-size-7">{{machine.process.zombie}}</td>
                      </tr>
                      <tr>
                        <td class="has-text-white is-size-7">总计</td>
                        <td class="is-size-7">{{machine.process.total}}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>

    <div class="block">
      <div class="columns is-desktop">
        <div class="column is-half" v-if="errors!=null">
          <nav class="panel">
            <p class="panel-heading">Errors</p>
            <div class="panel-block" v-for="err in sortedErrors" v-bind:key="err.time">
              <span class="panel-icon">
                <i class="fas fa-error" aria-hidden="true"></i>
              </span>
              <b-tag type="is-info is-light">{{err.time}}</b-tag>
              <span class="has-text-danger">
                {{err.error}}
              </span>
            </div>
          </nav>
          <b-button rounded @click="errNum+=10" :disabled="errNum>=errors.length">Expand</b-button>
          <b-button rounded @click="errNum=10" :disabled="errNum==10">Shrink</b-button>
        </div>

        <div class="column is-half" v-if="events!=null">
          <nav class="panel">
            <p class="panel-heading">Events</p>
            <div class="panel-block" v-for="evt in sortedEvents" v-bind:key="evt.time">
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

    <div class="block">
      <b-collapse class="card" animation="slide" :open="false">
        <template #trigger="props">
          <div class="card-header" role="button">
            <p class="card-header-title">Chia plotting performance</p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
            </a>
          </div>
        </template>
        <div class="card-content">
          <b-dropdown aria-role="list" v-model="selectedOS">
            <template #trigger>
              <b-button type="is-primary">Select OS</b-button>
            </template>
            <b-dropdown-item value="all">All</b-dropdown-item>
            <b-dropdown-item value="WSL">WSL</b-dropdown-item>
            <b-dropdown-item value="Windows">Windows</b-dropdown-item>
            <b-dropdown-item value="Ubuntu">Ubuntu</b-dropdown-item>
            <b-dropdown-item value="Else">Else</b-dropdown-item>
          </b-dropdown>
          <b-select class="is-inline-block" v-model="perPage">
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </b-select>
          <template>
            <b-table :data="selectedPerformance" :row-class="(row) =>'has-background-dark'" :mobile-cards="false"
                     :per-page="perPage" paginated detailed custom-detail-row>
              <b-table-column field="User" label="名字" v-slot="props">
                {{props.row.User | shorten}}
              </b-table-column>
              <b-table-column field='OS' label="操作系统" v-slot="props">
                {{
                    props.row['OS'].match('WSL') ? 'WSL':false ||
                    props.row['OS'].match('[Lu|U]buntu')? 'Ubuntu':false ||
                    props.row['OS'].match('Fedora')? 'Fedora':false ||
                    props.row['OS'].match('Windows')? 'Windows':false ||
                    '其他'
                }}
              </b-table-column>
              <b-table-column field='TiB/day (all // Plots)' label="TiB/day" v-slot="props">
                {{props.row['TiB/day (all // Plots)']}}
              </b-table-column>
              <template #detail="props">
                <tr>
                  <td colspan="4">
                    <div class="box">
                      <div>CPU：{{props.row.CPU}}</div>
                      <div>操作系统：{{props.row['OS']}}</div>
                      <div>主板：{{props.row["Motherboard / SAS Adapter (Server)"]}}</div>
                      <div>内存：{{props.row.DRAM}}</div>
                      <div>硬盘：{{props.row["Temp Drive"]}}</div>
                      <div>时长(h)：{{props.row["Time (hr)"]}}</div>
                      <div>同时P图：{{props.row["// Plots"]}}</div>
                      <div v-if="props.row['Comment']">其他说明：{{props.row['Comment']}}</div>
                    </div>
                  </td>
                </tr>
              </template>
            </b-table>
          </template>
        </div>
      </b-collapse>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';
  import diskMap from '@/components/diskMap.vue'

  @Component({
    components: {
      diskMap,
    },
  })
  export default class monitor extends Vue {
    farm = null; 
    plot = null;
    errors = null; 
    events = null;
    evtNum = 10;
    errNum = 10;
    plottingPerformances = [];
    selectedOS = '';
    perPage = 10;

    mounted() {
      getInfo.stopRefresh();
      this.load();
      this.loadlist();
      this.autoRefresh(); 
    }

    load() {
      getInfo.getInfo('farmer')
        .then(response => response.json())
        .then(json => {
          this.farm = json;
          getInfo.sortDisks(this.farm);
          this.calcCpuMap(this.farm);
        });
      getInfo.getInfo('plotter')
        .then(response => response.json())
        .then(json => {
          this.plot = json;
          getInfo.sortDisks(this.plot);
          this.plot.jobs.forEach(_ => _.progress = this.calcProgress(_.phase));
          this.calcCpuMap(this.plot);
        });
    }
    autoRefresh() {
      var temp;
      temp = setInterval(() => {
        getInfo.getInfo('servers')
          .then(response => response.json())
          .then(json => {
            var f = json.find(_ => _.name == 'Farmer');
            var p = json.find(_ => _.name == 'Plotter');
            getInfo.sortDisks(f);
            getInfo.sortDisks(p);
            Object.assign(this.farm, f);
            Object.assign(this.plot, p);
            this.calcCpuMap(this.farm);
            this.calcCpuMap(this.plot);
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
      getInfo.intervals.push([temp,"monitor"]);
      temp = setInterval(() => {
        getInfo.save();
      }, 5000);
      getInfo.intervals.push([temp,"save"]);
    }
    calcProgress(phase) {
      const p = Number(phase[0]);
      const n = Number(phase[2]);
      if (p == 1) return n * 5;
      if (p == 2) return 35 + n * 3;
      if (p == 3) return 56 + n * 5;
      if (p == 4) return 98;
    }
    calcCpuMap(machine) {
      machine.cpuMap = {
        data: [{
          name: 'Cpu',
          data: machine.cpus.map(_ => 100 - _),
        }],
        chartOptions: {
          chart: {
            type: 'bar',
            height: 150
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
            categories: machine.cpus.map((_, i) => i + 1),
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
              formatter: function (val) {
                return val + " %"
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
              value,
              seriesIndex,
              w
            }) {
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
    humanize(size) {
      var i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    getDiskProgressType(used, size) {
      const perc = used / size;
      if (perc < 0.5) return 'success';
      if (perc < 0.7) return 'warning';
      return 'danger';
    }
    loadlist() {
      var url = "ChiaPlottingPerformance.json" //TODO
      fetch(url, {
        method: 'GET',
      })
        .then((resp) => resp.json())
        .then((json) => {
          this.plottingPerformances = json;
        });
    }
    get tempDirSet() {
      return [...new Set(this.plot.jobs.map(_ => _.tempDir))].sort();
    }
    get sortedErrors() {
      return this.errors.sort((a, b) => a.time < b.time ? 1 : -1).slice(0, this.errNum);
    }
    get sortedEvents() {
      return this.events.sort((a, b) => a.time < b.time ? 1 : -1).slice(0, this.evtNum);
    }
    get selectedPerformance() {
      if (this.selectedOS === 'all') {
        return this.plottingPerformances;
      } else if (this.selectedOS === 'Else') {
        return this.plottingPerformances.filter(_ => {
          return _.OS.indexOf('Ubuntu') == -1 && _.OS.indexOf('Windows') == -1;
        })
      } else {
        return this.plottingPerformances.filter(_ => {
          return _.OS.indexOf(this.selectedOS) > -1;
        })
      }
    }
  }
</script>