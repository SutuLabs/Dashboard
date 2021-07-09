<template>
  <div>
    <div class="columns">
      <b-field class="ml-5">
        <b-select placeholder="Select a machine" v-model="machineSelected">
          <option value="" key="">All</option>
          <option v-for="option in machineNames" :value="option" :key="option">
            {{ option }}
          </option>
        </b-select>
        <b-button @click="load()">查看</b-button>
        <b-checkbox v-model="forceGetDiskInfo"> Force Get </b-checkbox>
      </b-field>
      <div class="column is-offset-8">
        <b-field grouped>
          <b-select v-model="perPage" :disabled="!isPaginated">
            <option :value="20">15</option>
            <option :value="40">20</option>
            <option :value="60">40</option>
            <option :value="80">60</option>
          </b-select>
          <b-switch v-model="isPaginated">
            <span>{{ isPaginated ? "分页" : "不分页" }}</span>
          </b-switch>
        </b-field>
      </div>
    </div>
    <div class="card-content">
      <div class="content">
        <b-table
          v-if="allDisks"
          :data="allDisks"
          detailed
          :paginated="isPaginated"
          :show-detail-icon="false"
          detail-key="sn"
          custom-detail-row
          striped
          :mobile-cards="false"
          default-sort-direction="desc"
          :per-page="perPage"
        >
          <b-table-column field="label" label="编号" width="40" header-class="has-text-info" v-slot="props" searchable sortable>
            <a class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.label }}</a>
          </b-table-column>
          <b-table-column
            field="sn"
            label="序列号"
            width="40"
            header-class="has-text-info"
            cell-class="has-text-info"
            v-slot="props"
            searchable
          >
            <a :id="props.row.sn" class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.sn }}</a>
          </b-table-column>
          <b-table-column field="model" label="型号" width="40" header-class="has-text-info" v-slot="props" searchable>
            <span class="has-text-light">
              {{ props.row.model }}
            </span>
          </b-table-column>
          <b-table-column
            field="planHarvester"
            :label="'Harvester(' + this.resultOfCheck + ')'"
            width="40"
            header-class="has-text-info"
            v-slot="props"
            searchable
          >
            <template v-if="props.row.planHarvester != '' || props.row.currentHarvester != ''">
              <b-tooltip type="is-light" size="is-large" multilined>
                <span class="has-text-light" v-if="checkHarvester(props.row.planHarvester, props.row.currentHarvester)">
                  {{ props.row.planHarvester }}
                </span>
                <span class="has-text-light" v-else>
                  <b-tag class="has-background-danger-dark">
                    {{ props.row.currentHarvester || "无" }}
                    <span class="has-text-dark">
                      {{ " ( " + (props.row.planHarvester || "无") + " ) " }}
                    </span>
                  </b-tag>
                </span>
                <template v-slot:content>
                  <b-taglist attached>
                    <b-tag type="is-dark">实际挂载目标：</b-tag>
                    <b-tag v-if="hostDict[props.row.sn]" type="is-info">{{ hostDict[props.row.sn] }}</b-tag>
                    <b-tag v-else type="is-info">无</b-tag>
                  </b-taglist>
                  <b-taglist attached>
                    <b-tag type="is-dark">期望挂载目标：</b-tag>
                    <b-tag v-if="props.row.planHarvester" type="is-info">{{ props.row.planHarvester }}</b-tag>
                    <b-tag v-else type="is-info">无</b-tag>
                  </b-taglist>
                </template>
              </b-tooltip>
            </template>
          </b-table-column>
          <b-table-column field="blockDevice" label="Block" width="40" header-class="has-text-info" v-slot="props">
            <template>
              <span class="has-text-light">
                {{ props.row.blockDevice }}
              </span>
            </template>
          </b-table-column>
          <b-table-column field="temperature" label="磁盘状态" width="40" header-class="has-text-info" v-slot="props" sortable>
            <template v-if="props.row.temperature">
              <b-tooltip type="is-light" size="is-large" multilined>
                <b-tag type="is-link" class="has-text-light"
                  >{{ props.row.smart.powerOnHours }} | {{ props.row.smart.powerCycleCount }} |
                  {{ props.row.temperature }}℃</b-tag
                >
                <span v-if="props.row.temperature && props.row.temperature > 43">🔥</span>
                <span v-if="props.row.temperature && props.row.temperature > 50">🔥</span>
                <template v-slot:content>
                  <b-taglist attached>
                    <b-tag type="is-dark">电源启动次数</b-tag>
                    <b-tag type="is-info">{{ props.row.smart.powerCycleCount }}</b-tag>
                  </b-taglist>
                  <b-taglist attached>
                    <b-tag type="is-dark">启动时间</b-tag>
                    <b-tag type="is-info">{{ props.row.smart.powerOnHours }}</b-tag>
                  </b-taglist>
                  <b-taglist attached>
                    <b-tag type="is-dark">温度</b-tag>
                    <b-tag type="is-info">{{ props.row.smart.temperature }}</b-tag>
                  </b-taglist>
                </template>
              </b-tooltip>
            </template>
          </b-table-column>
          <b-table-column label="Ops" width="40" header-class="has-text-info" v-slot="props">
            <template>
              <template v-if="numbersDict && numbersDict[props.row.sn] && numbersDict[props.row.sn]">
                <b-button
                  v-if="!props.row.parts"
                  size="is-small"
                  @click="create(findMachineName(props.row.sn), props.row.blockDevice, numbersDict[props.row.sn])"
                >
                  Create Partition
                  <span class="has-text-info">[{{ numbersDict[props.row.sn] }}]</span>
                </b-button>
                <template v-if="props.row.parts && props.row.parts.length > 0">
                  <b-button
                    v-if="numbersDict[props.row.sn] != props.row.parts[0].label"
                    size="is-small"
                    @click="
                      rename(
                        findMachineName(props.row.sn),
                        props.row.blockDevice,
                        props.row.parts[0].label,
                        numbersDict[props.row.sn]
                      )
                    "
                  >
                    Rename Partition
                    <span class="has-text-info">[{{ props.row.parts[0].label }}->{{ numbersDict[props.row.sn] }}]</span>
                  </b-button>
                  <b-button
                    v-if="!props.row.parts[0].mountPoint"
                    size="is-small"
                    @click="mount(findMachineName(props.row.sn), props.row.blockDevice, props.row.parts[0].label)"
                  >
                    Mount Partition
                    <span class="has-text-info">[{{ props.row.parts[0].label }}]</span>
                  </b-button>
                  <b-button
                    v-if="
                      !props.row.parts[0].mountPoint &&
                        numbersDict[props.row.sn] != props.row.parts[0].label &&
                        props.row.model == 'TOSHIBA MD04ABA400V'
                    "
                    size="is-small"
                    type="is-danger"
                    @click="removeNtfsPart(findMachineName(props.row.sn), props.row.blockDevice)"
                  >
                    删除异常分区
                  </b-button>
                  <b-button
                    v-if="!props.row.smart || !props.row.smart.values || props.row.smart.values.length == 0"
                    size="is-small"
                    @click="enableSmart(findMachineName(props.row.sn), props.row.blockDevice)"
                  >
                    启用SMART
                  </b-button>
                </template>
              </template>
            </template>
          </b-table-column>
          <b-table-column label="备注" width="40" header-class="has-text-info" v-slot="props">
            <template>
              <span class="has-text-grey">
                <span>
                  {{
                    (numbers.filter(number => number.id == props.row.label)[0] &&
                      numbers.filter(number => number.id == props.row.label)[0].note) ||
                      ""
                  }}
                </span>
              </span>
            </template>
          </b-table-column>
          <template slot="detail" slot-scope="props">
            <tr>
              <td class="has-background-dark" colspan="8">
                <div class="table-container pt-2">
                  <table class="table is-striped" v-if="props.row.parts">
                    <thead>
                      <tr>
                        <th>label</th>
                        <th>mount point</th>
                        <th>name</th>
                        <th>size</th>
                        <th>uuid</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="part in props.row.parts" :key="part.label">
                        <td>{{ part.label }}</td>
                        <td>{{ part.mountPoint }}</td>
                        <td>{{ part.name }}</td>
                        <td>{{ part.size }}</td>
                        <td>{{ part.uuid }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="mb-3 p-3">
                    <div class="columns is-multiline is-mobile">
                      <div class="column is-2" v-for="(kvp, idx) in props.row.smart.values" :key="props.row.sn + idx + kvp.key">
                        <div class="columns">
                          <div class="column has-background-primary">{{ kvp.key }}</div>
                        </div>
                        <div class="columns">
                          <div class="column has-background-link">{{ kvp.value }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </b-table>
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
import getInfo from '@/services/getInfo';
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'
import {
  Dictionary
} from 'vue-router/types/router';

interface Disk {
  blockDevice: string,
  parts: {
    name: string,
    label: string,
    mountPoint: string,
    size: string,
    uuid: string,
  }[],
  sn: string,
  model: string,
  smart: {
    powerCycleCount: number,
    powerOnHours: number,
    temperature: string,
    values: {
      key: string,
      value: string
    }[],
  }
  label?: string,
  temperature?: string,
  planHarvester?: string,
  currentHarvester?: string,
}
@Component
export default class DiskSmartMap extends Vue {
  private machines: {
    name: string,
    disks: {
      blockDevice: string,
      parts: {
        name: string,
        label: string,
        mountPoint: string,
        size: string,
        uuid: string,
      }[],
      sn: string,
      model: string,
      smart: {
        powerCycleCount: number,
        powerOnHours: number,
        temperature: string,
        values: {
          key: string,
          value: string
        }[]
      },
    }[]
  }[] = [];
  @Prop() private machineNames!: string[];
  private numbers: {
    id: string,
    sn: string,
    host: string,
    note: string
  }[] = [];
  private numbersDict: Dictionary<string> = {};
  private hostDict: Dictionary<string> = {};

  private isOpen = 0;
  private forceGetDiskInfo = false;
  private machineSelected = '';
  private perPage = 20
  private isPaginated = true
  public hasAllDisks = false

  load() {
    this.machines = []
    getInfo.getInfo(`serial-number`)
      .then(response => response.json())
      .then(json => {
        this.numbers = json;
        this.numbersDict = this.numbers.reduce((dict, cur, idx) => (dict[cur.sn] = cur.id, dict), {} as Dictionary<string>);
      });
    if (this.machineSelected) {
      getInfo.getInfo(`disk/${this.machineSelected}`)
        .then(response => response.json())
        .then(json => {
          this.pushWithReplace(this.machines, json, 'name')
          this.sortDisks();
          this.hasAllDisks = false
        });
    } else {
      getInfo.getInfo(`disks?force=${this.forceGetDiskInfo}`)
        .then(response => response.json())
        .then(json => {
          this.machines = json;
          this.sortDisks();
          this.hasAllDisks = true
        });
    }
  }

  pushWithReplace<T extends {
    [index: string]: any
  }>(arr: Array<T>, o: T, k: string) {
    var fi = arr.findIndex((f: T) => f[k] === o[k]);
    fi != -1 ? arr.splice(fi, 1, o) : arr.push(o);
    return this;
  }

  sortDisks() {
    this.machines.forEach(m => {
      if (!m.disks) return;
      m.disks.sort((a, b) => !a.parts || !b.parts ? 0 : a.parts[0].label.localeCompare(b.parts[0].label));
    });

    this.hostDict = this.machines
      .flatMap(m => m.disks ? m.disks.map(d => ({ d, m })) : [])
      .reduce((dict, cur, idx) => (dict[cur.d.sn] = cur.m.name, dict), {} as Dictionary<string>);
  }

  humanize(size: number) {
    if (size == 0) return 0;
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  simplify(name: string) {
    return name.replace(/-([0-9a-f]{8})[0-9a-f]{56}.plot/, "-$1.plot");
  }

  create(host: string, block: string, label: string) {
    var t = Snackbar.open({
      type: 'is-primary',
      message: `creating ${host} ${block} ${label}`,
      indefinite: true,
      queue: false
    })
    getInfo.createPartition(host, block, label)
      .then(_ => {
        t.close();
        Snackbar.open({
          type: 'is-success',
          message: `success fully created ${host} ${block} ${label}`,
          indefinite: true,
          queue: false
        })
      });
  }

  rename(host: string, block: string, oldLabel: string, newLabel: string) {
    var t = Snackbar.open({
      type: 'is-primary',
      message: `renaming ${host} ${block} ${oldLabel} -> ${newLabel}`,
      indefinite: true,
      queue: false
    })
    getInfo.renamePartition(host, block, oldLabel, newLabel)
      .then(_ => {
        t.close();
        Snackbar.open({
          type: 'is-success',
          message: `success fully renamed ${host} ${block} ${oldLabel} -> ${newLabel}`,
          indefinite: true,
          queue: false
        })
      });
  }

  mount(host: string, block: string, label: string) {
    var t = Snackbar.open({
      type: 'is-primary',
      message: `mounting ${host} ${block} ${label}`,
      indefinite: true,
      queue: false
    })
    getInfo.mountPartition(host, block, label)
      .then(_ => {
        t.close();
        Snackbar.open({
          type: 'is-success',
          message: `success fully mounted ${host} ${block} ${label}`,
          indefinite: true,
          queue: false
        })
      });
  }

  removeNtfsPart(host: string, block: string) {
    this.$buefy.dialog.confirm({
      title: '确认移除',
      message: `将彻底移除机器[${host}]的分区[${block}]（数据删除后将无法找回！！！），请务必确认该盘属于特殊情况，确认吗？`,
      cancelText: '取消',
      confirmText: '确定',
      type: 'is-success',
      onConfirm: () => {
        var t = Snackbar.open({
          type: 'is-danger',
          message: `删除 ${host} 上磁盘 ${block} 的分区ing`,
          indefinite: true,
          queue: false
        })
        getInfo.removeNtfsPartition(host, block)
          .then(resp => {
            t.close();
            if (resp.ok) {
              Snackbar.open({
                type: 'is-success',
                message: `${host}\\${block}已删除`,
                indefinite: true,
                queue: false
              })
            } else {
              Snackbar.open({
                type: 'is-danger',
                message: '移除失败',
                indefinite: true,
              });
            }
          }).catch(() => {
            t.close();
            Snackbar.open({
              type: 'is-danger',
              message: '移除失败',
              indefinite: true,
            });
          });
      }
    })
  }

  enableSmart(host: string, block: string) {
    this.confirmAndExecute({
      confirmTitle: '确认启用SMART',
      confirmMessage: `启用SMART（可查看温度等，无副作用），确认吗？`,
      workingMessage: `正在启用 ${host} 上磁盘 ${block} 的SMART`,
      successMessage: `${host}\\${block}的SMART已启用`,
      failureMessage: '启用失败',
    },
      () => getInfo.enableSmart(host, block)
    );
  }

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
  get allDisks() {
    var disks: Disk[] = []
    this.machines.forEach(machine => {
      machine.disks && machine.disks.forEach(disk => {
        if (disk.parts[0].size.search('M') != -1) return
        let newDisk: Disk = disk
        let number = this.numbers.filter((number) => number.sn == disk.sn)[0]
        newDisk.label = disk.parts[0].label
        newDisk.temperature = disk.smart.temperature
        if (number)
          newDisk.planHarvester = number.host
        newDisk.currentHarvester = 'sh' + (this.hostDict && this.hostDict[disk.sn]).slice(this.hostDict[disk.sn].length - 5, this.hostDict[disk.sn].length - 4)
        disks.push(newDisk)
      })
    })
    if (!this.machineSelected) {
      this.numbers.forEach(number => {
        if (!this.hostDict[number.sn]) {
          let newDisk = {
            blockDevice: '',
            parts: [],
            model: '',
            sn: number.sn,
            smart: {
              powerCycleCount: 0,
              powerOnHours: 0,
              temperature: '',
              values: [{
                key: '',
                value: '',
              }]
            },
            label: number.id,
            currentHarvester: '',
            planHarvester: number.host,
            temperature: ''
          }
          disks.push(newDisk)
        }
      })
    }
    return disks;
  }
  checkHarvester(plan: string, actual: string) {
    if (plan == '缓存盘') return true
    else if (plan == '' && actual == '') return true
    else {
      return plan == actual
    }
  }
  get numOfCacheDisks() {
    var num = 0
    this.numbers.forEach(number => {
      number.host == '缓存盘' ? num++ : num
    })
    return num
  }
  get numsOfDisks() {
    return this.allDisks.length
  }
  get resultOfCheck() {
    var num = 0
    this.allDisks.forEach(machine => {
      if (!this.checkHarvester(machine.planHarvester || '', machine.currentHarvester || '')) num++
    })
    return num
  }
  findMachineName(sn: string): string {
    this.machines.forEach(_ => {
      _.disks.forEach(x => {
        if (x.sn == sn) {
          return _.name
        }
      })
    })
    return '';
  }
}
</script>