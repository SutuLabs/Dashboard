﻿<template>
  <div class="explorer">
    <template class="container" v-if="username == null">
      <b-notification type="is-danger" has-icon aria-close-label="Close notification" role="alert">
        尚未登录，无法查看！
      </b-notification>
      <b-button class="column is-1 is-offset-5 p-2" type="is-info" tag="router-link" :to="{ path: '/login' }">点击登录 </b-button>
    </template>
    <div v-else>
      <div v-if="farmer != null" class="m-2">
        <div class="content">
          <div class="container is-fluid mb-3" v-if="connectionStatus == 'failed'">
            <b-notification type="is-danger" has-icon aria-close-label="Close notification" role="alert">
              无法连接至服务器，请检查您的网络连接或联系管理员！
            </b-notification>
          </div>
          <b-field grouped group-multiline>
            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">连接状态</b-tag>
                <b-tag type="is-warning" v-if="connectionStatus == 'loading'">连接中...</b-tag>
                <b-tag type="is-success" v-else-if="connectionStatus == 'success'">连接成功</b-tag>
                <b-tag type="is-danger" v-else>连接失败</b-tag>
              </b-taglist>
            </div>
            <div class="control">
              <b-tooltip :label="'空间: ' + farmer.farmer.totalSize + '/' + farmer.node.space" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">农场状态</b-tag>
                  <b-tag type="is-success" v-if="farmer.farmer.status == 'Farming'">{{ farmer.farmer.status }}</b-tag>
                  <b-tag type="is-danger" v-else>{{ farmer.farmer.status }}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>
            <div class="control">
              <b-tooltip :label="'时间: ' + farmer.node.time" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">同步状态</b-tag>
                  <b-tag type="is-success" v-if="farmer.node.status == 'Full Node Synced'">
                    {{ farmer.node.status }}
                  </b-tag>
                  <b-tag type="is-danger" v-else>{{ farmer.node.status }}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>
            <div class="control">
              <b-tooltip :label="'挖币地址: ' + farmer.extended.targetAddress" position="is-bottom">
                <b-taglist attached>
                  <b-tag type="is-dark">地址</b-tag>
                  <b-tag
                    type="is-success"
                    v-if="farmer.extended.targetAddress == 'xch1ca2yhwkzdgfpww3289h6uxvsv562u69tuk0npzt0473ytn6naukqjhu922'"
                  >
                    正常
                  </b-tag>
                  <b-tag type="is-danger" v-else>非法：{{ farmer.extended.targetAddress }}</b-tag>
                </b-taglist>
              </b-tooltip>
            </div>
            <div class="control">
              <b-taglist v-if="plotters != null" attached>
                <b-tag type="is-dark">绘图机</b-tag>
                <b-tag v-if="checkStacking(plotters)" type="is-danger">{{ checkStacking(plotters) }}台堆积</b-tag>
                <b-tag v-else type="is-success">正常</b-tag>
              </b-taglist>
            </div>
            <div class="control">
              <b-taglist v-if="farmers != null" attached>
                <b-tag type="is-dark">收割机</b-tag>
                <b-tag v-if="checkDisksFull(harvesters)" type="is-danger">{{ checkDisksFull(harvesters) }}台容量不足</b-tag>
                <b-tag v-else type="is-success">正常</b-tag>
              </b-taglist>
            </div>
          </b-field>
        </div>

        <div class="columns is-tablet p-3 my-3 box">
          <div class="column is-half box has-background-dark has-text-weight-bold m-2">
            <div class="columns is-mobile ml-1">
              <div class="column">
                <div class="mb-5">
                  耕田数量
                  <div class="has-text-success is-size-4 mt-2 ">
                    {{ farmer.farmer.plotCount || plotCount }}
                  </div>
                </div>
                <div>
                  矿场算力
                  <div class="has-text-success is-size-4 mt-2 ">
                    <template v-if="farmer.farmer.totalSize == '0.000 GiB'">{{ harvestSpace }} TiB</template>
                    <template v-else>{{ farmer.farmer.totalSize }}</template>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="mb-5">
                  总共挖币
                  <div class="has-text-success is-size-4 mt-2  is-hidden-mobile">{{ farmer.farmer.totalFarmed }}</div>
                  <div class="has-text-success is-size-4 mt-2  is-hidden-tablet">{{ farmer.farmer.totalFarmed.toFixed(4) }}</div>
                </div>
                <div>
                  预计爆块时间
                  <div class="has-text-success is-size-4 mt-2 ">{{ estimatedTime }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="column has-background-dark box m-2 has-text-weight-bold">
            机器信息
            <div class="mt-3">
              <div class="columns is-mobile">
                <div class="column">收割机：</div>
                <div class="column">{{ harvesters && harvesters.length }}台</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">农夫机：</div>
                <div class="column">{{ farmers && farmers.length }}台</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">绘图机：</div>
                <div class="column">{{ plotters && plotters.length }}台</div>
              </div>
            </div>
          </div>
          <div class="column has-background-dark box m-2">
            <div class="is-size-7">
              <div class="columns is-mobile">
                <div class="column">最高高度：</div>
                <div class="column">{{ farmer.node.height }}</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">难度：</div>
                <div class="column">{{ farmer.node.difficulty }}</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">总算力：</div>
                <div class="column">{{ farmer.node.space }}</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">交易费用：</div>
                <div class="column">{{ farmer.farmer.txFees }}</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">奖励：</div>
                <div class="column">{{ farmer.farmer.rewards }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="block">
        <div id="plotters" class="card">
          <div class="card-header">
            <div class="card-header-title">
              Plotter
              <div v-if="plotters != null" class="has-text-info heading">
                共{{ plotters.length }}台，
                <span v-if="checkStacking(plotters)" class="has-text-danger">{{ checkStacking(plotters) }}台出现堆积</span>
                <span v-else>均运行正常</span>
              </div>
            </div>
          </div>
          <div v-if="plotters == null || plotPlan == null" class="card-content">Loading</div>
          <div v-else>
            <div class="p-4 sticky has-background-dark" v-if="legacyPlotter">
              <b-switch v-model="hideJobs">Hide Jobs</b-switch>
              <b-switch v-model="showPlan">Show Plan</b-switch>
              <b-switch v-model="hideProcess">Hide Process</b-switch>
              <b-button class="is-pulled-right" @click="applyPlotPlan(Object.keys(plotPlan))">Apply All</b-button>
              <b-button class="is-pulled-right" @click="cleanTemporary(plotters.map(_ => _.name))">Clean All</b-button>
            </div>
            <div class="is-hidden-mobile">
              <machine-table-detailed
                :machines="plotters"
                :type="'plotter'"
                :plotPlan="plotPlan"
                :hideJobs="hideJobs"
                :hideProcess="hideProcess"
                :showPlan="showPlan"
                :isMobile="false"
                ref="machine"
              />
            </div>
            <div class="is-hidden-tablet">
              <machine-table-detailed
                :machines="plotters"
                :type="'plotter'"
                :plotPlan="plotPlan"
                :hideJobs="hideJobs"
                :hideProcess="hideProcess"
                :showPlan="showPlan"
                :isMobile="true"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="block" v-if="farmers != null">
        <div class="columns is-desktop is-multiline">
          <div class="column is-half" v-for="machine in farmers" v-bind:key="machine.name">
            <nav class="card">
              <p class="panel-heading">
                {{ machine.name }}
              </p>
              <div class="card-content p-4">
                <cpu-info name="machine.name" :machine="machine" />
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div class="block">
        <div id="harvesters" class="card">
          <div class="card-header">
            <div class="card-header-title">
              Harvester
              <div v-if="harvesters != null" class="has-text-info heading">
                共{{ harvesters.length }}台，
                <span v-if="checkDisksFull(harvesters)" class="has-text-danger"
                  >{{ checkDisksFull(harvesters) }}台容量不足4TB</span
                >
                <span v-else>容量充足</span>
              </div>
            </div>
            <div class="card-header-icon">
              <b-button class="mx-2" @click="checkable = true" v-if="!checkable">批量启动</b-button>
              <b-button class="mx-2" @click="selectAllHarvester" v-if="checkable">全选</b-button>
              <b-button class="mx-2" @click="startDaemons" v-if="checkable">启动</b-button>
              <b-button class="mx-2" @click="checkable = false" v-if="checkable">取消</b-button>
            </div>
          </div>
          <div v-if="harvesters == null" class="card-content">Loading</div>
          <div v-else>
            <machine-table-detailed
              :machines="harvesters"
              :type="'harvester'"
              :plotPlan="{}"
              :hideJobs="true"
              :hideProcess="false"
              :showPlan="false"
              :isMobile="false"
              :checkable="checkable"
              ref="harvester"
            />
          </div>
        </div>
      </div>

      <div class="block card">
        <b-collapse :open="true" class="panel" animation="slide">
          <template #trigger="props">
            <div class="card-header" role="button">
              <div class="card-header-title">
                硬盘
                <div class="has-text-info heading" v-if="$refs.diskList">
                  <template v-if="$refs.diskList.numsOfDisks">
                    共{{ $refs.diskList.numsOfDisks }}个硬盘
                    <template v-if="$refs.diskList.hasAllDisks"> ,{{ $refs.diskList.numOfCacheDisks }}个缓存盘 </template>
                  </template>
                </div>
              </div>
              <a class="card-header-icon">
                <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
              </a>
            </div>
          </template>
          <b-tabs type="is-boxed" expanded>
            <b-tab-item label="硬盘信息">
              <disk-smart-map :machine-names="harvesters.map(_ => _.name)" ref="diskList" />
            </b-tab-item>
            <b-tab-item label="上传硬盘信息">
              <sn-uploader />
            </b-tab-item>
          </b-tabs>
        </b-collapse>
      </div>

      <event-list :errors="errors" :events="events" />

      <plots-map />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator'
import getInfo from '@/services/getInfo'
import getTime from '@/services/getTime'
import diskMap from '@/components/diskMap.vue'
import DiskList from '@/components/DiskList.vue'
import cpuInfo from '@/components/cpuInfo.vue'
import machineTableDetailed from '@/components/machineTableDetailed.vue'
import PlotsMap from '@/components/PlotsMap.vue'
import DiskSmartMap from '@/components/DiskSmartMap.vue'
import SnUploader from '@/components/SnUploader.vue'
import EventList from '@/components/EventList.vue'
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'
import * as signalR from "@microsoft/signalr";

export interface ErrorEntity { time: Date, machineName: string, level: "ERROR" | "WARNING", error: string }
export interface EligibleFarmerEventEntity { time: Date, machineName: string, eligibleNumber: number, proofs: number, duration: number, total: number }

@Component({
  components: {
    diskMap,
    DiskList,
    cpuInfo,
    machineTableDetailed,
    PlotsMap,
    DiskSmartMap,
    SnUploader,
    EventList,
  },
})
export default class monitor extends Vue {
  farmers: any = null;
  farmer: any = null;
  plotters: any = null;
  harvesters: any[] = [];
  errors: ErrorEntity[] = [];
  events: EligibleFarmerEventEntity[] = [];
  connectionStatus = 'loading';
  intervals: number[] = [];
  hideJobs = false;
  hideProcess = false;
  showPlan = false;
  plotPlan: any = null;
  username = localStorage.getItem('username');
  checkable = false;
  legacyPlotter = false;

  $refs!: {
    harvester: machineTableDetailed,
    machine: machineTableDetailed,
    diskList: DiskSmartMap
  }

  mounted() {
    if (this.username) {
      this.load();
      this.autoRefresh();
    }
  }

  load() {
    const connection = new signalR.HubConnectionBuilder()
      .withAutomaticReconnect()
      .withUrl("http://10.177.0.165:5000/hub/events", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    connection.on("Error", (error: ErrorEntity) => {
      this.errors.unshift(error);
      if (this.errors.length > 100)
        this.errors.splice(-1, 1);
    });

    connection.on("Event", (evt: EligibleFarmerEventEntity) => {
      this.events.unshift(evt);
      if (this.events.length > 100)
        this.events.splice(-1, 1);
    });

    connection.start().catch(err => console.warn(err));

    getInfo.getInfo('servers')
      .then(response => response.json())
      .then((servers: any) => {
        getInfo.getInfo('farmer')
          .then(response => response.json())
          .then(json => {
            this.farmers = json;
          })
          .then(() => {
            this.farmers.forEach((farmer: any) => {
              var m = servers.find((_: any) => _.name == farmer.name);
              this.assignMachine(farmer, m);
              getInfo.sortDisks(farmer);
            });
            this.farmer = this.farmers[0];
          })
        getInfo.getInfo('plotter')
          .then(response => response.json())
          .then(json => {
            this.plotters = json;
            this.plotters.forEach((plotter: any) => {
              plotter.jobs?.forEach((_: any) => _.progress = this.calcProgress(_.phase));
            });
          })
          .then(() => {
            this.plotters.forEach((plotter: any) => {
              var m = servers.find((_: any) => _.name == plotter.name);
              this.assignMachine(plotter, m);
              getInfo.sortDisks(plotter);
            });
          });
        getInfo.getInfo('harvester')
        .then(response => response.json())
        .then(json => {
          this.harvesters.forEach((machine: any) => {
            var m = json.find((_: any) => _.name == machine.name);
            Vue.set(machine, "totalPlot", m.totalPlot);
            Vue.set(machine, "lastPlotTime", m.lastPlotTime);
            Vue.set(machine, "abnormalFarmlands", m.abnormalFarmlands);
            Vue.set(machine, "danglingPartitions", m.danglingPartitions);
          })
        });
        servers.forEach((machine: any) => {
          if (/harvester(_s)?\d/.test(machine.name)) {
            this.harvesters.push(machine);
          }
          this.harvesters.sort((a, b) => (a.name > b.name) ? 1 : -1);
          this.harvesters.forEach((harvester: any) => {
            getInfo.sortDisks(harvester);
          })
        })
      }).then(() => {
        this.connectionStatus = 'success'
      }).catch(() => {
        this.connectionStatus = 'failed'
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
    if (!machine) return;
    Vue.set(vueObj, 'cpus', machine.cpus);
    Vue.set(vueObj, 'disks', machine.disks);
    Vue.set(vueObj, 'memory', machine.memory);
    Vue.set(vueObj, 'process', machine.process);
    Vue.set(vueObj, 'networkIoSpeed', machine.networkIoSpeed);
    Vue.set(vueObj, 'power', machine.power);
    Vue.set(vueObj, 'location', machine.location);
    Vue.set(vueObj, 'type', machine.type);
  }
  autoRefresh() {
    var temp: number = window.setInterval(() => {
      getInfo.getInfo('plotter')
        .then(response => response.json())
        .then(json => {
          if (!this.plotters) this.plotters = json;
          this.plotters.forEach((plotter: any) => {
            var m = json.find((_: any) => _.name == plotter.name);
            if (m) {
              Vue.set(plotter, "jobs", m.jobs);
              Vue.set(plotter, "fileCounts", m.fileCounts);
              Vue.set(plotter, "madmaxJob", m.madmaxJob);
              Vue.set(plotter, "files", m.files);
              plotter.jobs?.forEach((_: any) => _.progress = this.calcProgress(_.phase));
            }
          })

          let incomings: { [key: string]: any } = this.plotters.reduce((rv: { [key: string]: any }, x: { configuration: { rsyncdHost: string }, madmaxJob: { job: { copyingTarget: string } } }) => {
            // group by last segment
            if (x.configuration)
              (rv[x.configuration.rsyncdHost] = rv[x.configuration.rsyncdHost] || []).push(x);
            else if (x.madmaxJob?.job?.copyingTarget)
              (rv[x.madmaxJob.job.copyingTarget] = rv[x.madmaxJob.job.copyingTarget] || []).push(x);
            return rv;
          }, {});
          for (const key in incomings) {
            if (Object.prototype.hasOwnProperty.call(incomings, key)) {
              let seg = key.slice(key.lastIndexOf('.') + 1);
              let scdNet = key.substring(0, key.length - 3) + (parseInt(seg) + 1).toString();
              let inc = (incomings[key] || []).concat(incomings[scdNet] || []);
              let harvester = this.harvesters.find((_: any) => _.name.slice(_.name.lastIndexOf('-') + 1) == seg);
              let result = inc.map((_: any) => ({
                count: _.fileCounts && _.fileCounts.length > 0 && _.fileCounts[0]?.count,
                name: _.name,
                percent: _?.madmaxJob?.job?.copyingPercent,
                speed: _?.madmaxJob?.job?.copyingSpeed,
              }));
              if (harvester)
                Vue.set(harvester, 'incomings', result);
            }
          }
        });
      getInfo.getInfo('farmer')
        .then(response => response.json())
        .then(json => {
          if (!this.farmers) this.farmers = json;
          this.farmers.forEach((farmer: any) => {
            var m = json.find((_: any) => _.name == farmer.name);
            Vue.set(farmer, "farmer", m.farmer);
            Vue.set(farmer, "node", m.node);
          })
        });
      getInfo.getInfo('harvester')
        .then(response => response.json())
        .then(json => {
          this.harvesters.forEach((machine: any) => {
            var m = json.find((_: any) => _.name == machine.name);
            Vue.set(machine, "totalPlot", m.totalPlot);
            Vue.set(machine, "lastPlotTime", m.lastPlotTime);
            Vue.set(machine, "abnormalFarmlands", m.abnormalFarmlands);
            Vue.set(machine, "danglingPartitions", m.danglingPartitions);
          })
        });
      getInfo.getInfo('servers')
        .then(response => response.json())
        .then(json => {
          this.farmers.forEach((farmer: any) => {
            var m = json.find((_: any) => _.name == farmer.name);
            this.assignMachine(farmer, m);
            getInfo.sortDisks(farmer);
          });
          this.farmer = this.farmers[0];
          this.plotters.forEach((plotter: any) => {
            var m = json.find((_: any) => _.name == plotter.name);
            this.assignMachine(plotter, m);
            getInfo.sortDisks(plotter);
          });
          this.harvesters.forEach((harvester: any) => {
            var m = json.find((_: any) => _.name == harvester.name);
            this.assignMachine(harvester, m);
            getInfo.sortDisks(harvester);
          })
        }).then(() => {
          this.connectionStatus = 'success'
        }).catch(() => {
          this.connectionStatus = 'failed'
        });
      getInfo.getPlotPlan()
        .then(response => response.json())
        .then(json => {
          if (!this.plotPlan) this.plotPlan = json;
          json.forEach((plan: any) => {
            this.plotPlan[plan.name] = plan.plan;
          })
        })
    }, 5000);
    this.intervals.push(temp);
  }
  calcProgress(phase: any) {
    const p = Number(phase[0]);
    const n = Number(phase[2]);
    if (p == 1) return n * 5;
    if (p == 2) return 35 + n * 3;
    if (p == 3) return 56 + n * 5;
    if (p == 4) return 98;
  }
  cleanTemporary(names: string[]) {
    (this.$refs.machine as machineTableDetailed).cleanTemporary(names)
  }
  applyPlotPlan(plotList: string[]) {
    (this.$refs.machine as machineTableDetailed).applyPlotPlan(plotList)
  }
  startDaemons() {
    var harvester = this.$refs.harvester
    harvester.startDaemons(harvester.harvesterCheck)
  }
  checkStacking(plotters: any[]) {
    var count = 0;
    for (var i = 0; i < plotters.length; i++) {
      if (plotters[i].fileCounts[0] && plotters[i].fileCounts[0].count > 2) {
        count += 1
      }
    }
    return count;
  }
  checkDisksFull(machines: any[]) {
    var count = 0;
    for (var i = 0; i < machines.length; i++) {
      var availableSpace = 0;
      for (var j = 1; j < machines[i].disks.length; j++) {
        if (machines[i].disks[j].available >= 2 * 106430464) availableSpace += machines[i].disks[j].available;
      }
      if (availableSpace < 4 * Math.pow(1024, 3)) count += 1;
    }
    return count;
  }
  selectAllHarvester() {
    var harvester = this.$refs.harvester
    harvester.harvesterCheck = [];
    this.harvesters.forEach((_) => {
      harvester.harvesterCheck.push(_.name)
    })
  }

  get harvestSpace() {
    return ((this.plotCount * 101.4) / 1024).toFixed(2)
  }
  get plotCount() {
    return this.harvesters.reduce((sum, e) => sum + ((e && e.totalPlot) || 0), 0)
  }
  get estimatedTime() {
    return getTime.getEstimatedTime(parseFloat(this.harvestSpace), parseFloat(this.farmer.node.space))
  }
  beforeDestroy() {
    this.intervals = getInfo.stopRefresh(this.intervals);
  }
}
</script>

<style>
#errors .error-tooltip .tooltip-content {
  width: 600px;
}

#plotters .summary-progress progress {
  margin: 0;
}

#plotters .summary-progress .progress-wrapper {
  margin: 0.2em 0;
}

#harvesters .summary-progress progress {
  margin: 0;
}

#harvesters .summary-progress .progress-wrapper {
  margin: 0.2em 0;
}

#plotters .sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}

.single-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  display: block;
}
</style>