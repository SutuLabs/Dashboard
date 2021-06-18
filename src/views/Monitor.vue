<template>
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
              <b-taglist v-if="plotters != null" attached>
                <b-tag type="is-dark">收割机</b-tag>
                <b-tag v-if="checkStacking(plotters)" type="is-danger">{{ checkStacking(plotters) }}台堆积</b-tag>
                <b-tag v-else type="is-success">正常</b-tag>
              </b-taglist>
            </div>
            <div class="control">
              <b-taglist v-if="farmers != null" attached>
                <b-tag type="is-dark">绘图机</b-tag>
                <b-tag v-if="checkDisksFull(harvesters)" type="is-danger">{{ checkDisksFull(harvesters) }}台容量不足</b-tag>
                <b-tag v-else type="is-success">正常</b-tag>
              </b-taglist>
            </div>
          </b-field>
        </div>

        <div class="columns is-tablet m-1 box">
          <div class="column is-half box has-background-dark has-text-weight-bold m-1">
            <div class="columns is-mobile">
              <div class="column">
                <div class="mb-5">
                  耕田数量
                  <div class="has-text-success is-size-4 mt-2 has-text-centered-mobile">{{ farmer.farmer.plotCount }}</div>
                </div>
                <div>
                  矿场算力
                  <div class="has-text-success is-size-4 mt-2 has-text-centered-mobile">{{ harvestSpace }}Tib</div>
                </div>
              </div>
              <div class="column">
                <div class="mb-5">
                  总共挖币
                  <div class="has-text-success is-size-4 mt-2 has-text-centered-mobile">{{ farmer.farmer.totalFarmed }}</div>
                </div>
                <div>
                  预计爆块时间
                  <div class="has-text-success is-size-4 mt-2 has-text-centered-mobile">{{ estimatedTime }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="column has-background-dark box m-1 has-text-weight-bold">
            机器信息
            <div class="mt-3">
              <div class="columns is-mobile">
                <div class="column">绘图机：</div>
                <div class="column">{{ harvesters && harvesters.length }}台</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">农夫机：</div>
                <div class="column">{{ farmers && farmers.length }}台</div>
              </div>
              <div class="columns is-mobile">
                <div class="column">收割机：</div>
                <div class="column">{{ plotters && plotters.length }}台</div>
              </div>
            </div>
          </div>
          <div class="column has-background-dark box m-1">
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
            <div class="p-4 sticky has-background-dark">
              <b-switch v-model="hideJobs">Hide Jobs</b-switch>
              <b-switch v-model="showPlan">Show Plan</b-switch>
              <!-- <b-switch v-model="hideProcess">Hide Process</b-switch> -->
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
            />
          </div>
        </div>
      </div>

      <div class="block" id="errors">
        <div class="columns is-desktop">
          <div class="column is-half" v-if="errors != null">
            <nav class="panel">
              <p class="panel-heading">Errors</p>
              <div class="panel-block" v-for="err in sortedErrors" v-bind:key="sortedErrors.indexOf(err)">
                <b-tooltip type="is-light" size="is-large" multilined>
                  <b-tag type="is-info is-light">{{ err.time }}</b-tag>
                  <span class="has-text-danger">
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
                <b-tag type="is-info is-light">{{ evt.time }}</b-tag>
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

      <plots-map />
      <disk-smart-map :machine-names="harvesters.map(_ => _.name)" />
      <sn-uploader />
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
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'

@Component({
  components: {
    diskMap,
    DiskList,
    cpuInfo,
    machineTableDetailed,
    PlotsMap,
    DiskSmartMap,
    SnUploader,
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
  showPlan = false;
  plotPlan: any = null;
  username = localStorage.getItem('username');

  mounted() {
    if (this.username) {
      this.load();
      this.autoRefresh();
    }
  }

  load() {
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
              plotter.jobs.forEach((_: any) => _.progress = this.calcProgress(_.phase));
            });
          })
          .then(() => {
            this.plotters.forEach((plotter: any) => {
              var m = servers.find((_: any) => _.name == plotter.name);
              this.assignMachine(plotter, m);
              getInfo.sortDisks(plotter);
            });
          });
        servers.forEach((machine: any) => {
          if (/harvester(_s)?\d/.test(machine.name)) {
            this.harvesters.push(machine);
          }
          this.harvesters.forEach((harvester: any) => {
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
    if (!machine) return;
    Vue.set(vueObj, 'cpus', machine.cpus);
    Vue.set(vueObj, 'disks', machine.disks);
    Vue.set(vueObj, 'memory', machine.memory);
    Vue.set(vueObj, 'process', machine.process);
    Vue.set(vueObj, 'networkIoSpeed', machine.networkIoSpeed);
    Vue.set(vueObj, 'power', machine.power);
    Vue.set(vueObj, 'type', machine.type);
  }
  autoRefresh() {
    var temp;
    temp = setInterval(() => {
      getInfo.getInfo('plotter')
        .then(response => response.json())
        .then(json => {
          if (!this.plotters) this.plotters = json;
          this.plotters.forEach((plotter: any) => {
            var m = json.find((_: any) => _.name == plotter.name);
            if (m) {
              Vue.set(plotter, "jobs", m.jobs);
              Vue.set(plotter, "fileCounts", m.fileCounts);
              plotter.jobs.forEach((_: any) => _.progress = this.calcProgress(_.phase));
            }
          })

          let incomings: { [key: string]: any } = this.plotters.reduce((rv: { [key: string]: any }, x: { configuration: { rsyncdHost: string } }) => {
            // group by last segment
            (rv[x.configuration.rsyncdHost] = rv[x.configuration.rsyncdHost] || []).push(x);
            return rv;
          }, {});
          for (const key in incomings) {
            if (Object.prototype.hasOwnProperty.call(incomings, key)) {
              let inc = incomings[key];
              let seg = key.slice(key.lastIndexOf('.') + 1);
              let harvester = this.harvesters.find((_: any) => _.name.slice(_.name.lastIndexOf('-') + 1) == seg);
              let result = inc.map((_: any) => ({ count: _.fileCounts && _.fileCounts.length > 0 && _.fileCounts[0]?.count, name: _.name }));
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
  cleanTemporary(names: string[]) {
    (this.$refs.machine as machineTableDetailed).cleanTemporary(names)
  }
  applyPlotPlan(plotList: string[]) {
    (this.$refs.machine as machineTableDetailed).applyPlotPlan(plotList)
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
  get sortedErrors() {
    return this.errors.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.errNum);
  }
  get sortedEvents() {
    return this.events.sort((a: any, b: any) => a.time < b.time ? 1 : -1).slice(0, this.evtNum);
  }

  get harvestSpace() {
    return ((this.harvesters.reduce((sum, e) => sum + ((e && e.totalPlot) || 0), 0) * 101.4) / 1024).toFixed(2)
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
#errors .tooltip-content {
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
</style>