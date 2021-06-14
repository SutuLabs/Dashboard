<template>
  <div>
    <b-field label="Disk List Retrieval">
      <b-select placeholder="Select a machine" v-model="machineSelected">
        <option value="" key="">All</option>
        <option v-for="option in machineNames" :value="option" :key="option">
          {{ option }}
        </option>
      </b-select>
      <b-button @click="load()">Get Disk Info</b-button>
      <b-checkbox v-model="forceGetDiskInfo">
        Force Get
      </b-checkbox>
    </b-field>

    <b-collapse v-if="machines" class="card" animation="slide" :open="isOpen == 999" @open="isOpen = 999">
      <template #trigger="props">
        <div class="card-header" role="button">
          <p class="card-header-title">
            All Disks
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"> </b-icon>
          </a>
        </div>
      </template>
      <div class="card-content">
        <div class="content">
          <b-table v-if="numbers" :data="numbers" striped :mobile-cards="false">
            <b-table-column label="#" width="40" header-class="has-text-info" v-slot="props">
              <a class="has-text-light" @click="props.toggleDetails(props.row)">{{ numbers.indexOf(props.row) + 1 }}</a>
            </b-table-column>
            <b-table-column
              field="sn"
              label="Name"
              width="40"
              header-class="has-text-info"
              cell-class="has-text-info"
              v-slot="props"
            >
              <a :id="props.row.sn" class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.sn }}</a>
            </b-table-column>
            <b-table-column field="id" label="Id" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ props.row.id }}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Host" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ props.row.host }}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="实际状态" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ hostDict && hostDict[props.row.sn] }}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Note" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ props.row.note }}
                </span>
              </template>
            </b-table-column>
          </b-table>
        </div>
      </div>
    </b-collapse>
    <b-collapse
      class="card"
      animation="slide"
      v-for="(machine, index) of machines"
      :key="index"
      :open="isOpen == index"
      @open="isOpen = index"
    >
      <template #trigger="props">
        <div class="card-header" role="button">
          <p class="card-header-title">
            {{ machine.name }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"> </b-icon>
          </a>
        </div>
      </template>
      <div class="card-content">
        <div class="content">
          <b-table
            v-if="machine.disks"
            :data="machine.disks"
            detailed
            :show-detail-icon="false"
            detail-key="sn"
            custom-detail-row
            striped
            :mobile-cards="false"
          >
            <b-table-column label="#" width="40" header-class="has-text-info" v-slot="props">
              <a class="has-text-light" @click="props.toggleDetails(props.row)">{{ machine.disks.indexOf(props.row) + 1 }}</a>
            </b-table-column>
            <b-table-column
              field="sn"
              label="Name"
              width="40"
              header-class="has-text-info"
              cell-class="has-text-info"
              v-slot="props"
            >
              <a :id="props.row.sn" class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.sn }}</a>
            </b-table-column>
            <b-table-column label="Model" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ props.row.model }}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Block" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{ props.row.blockDevice }}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Partitions" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  <span v-for="part in props.row.parts" :key="part.uuid">
                    {{ part.label }}
                  </span>
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Ops" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <template v-if="numbersDict && numbersDict[props.row.sn] && numbersDict[props.row.sn]">
                  <b-button
                    v-if="!props.row.parts"
                    size="is-small"
                    @click="create(machine.name, props.row.blockDevice, numbersDict[props.row.sn])"
                  >
                    Create Partition
                    <span class="has-text-info">[{{ numbersDict[props.row.sn] }}]</span>
                  </b-button>
                  <template v-if="props.row.parts && props.row.parts.length > 0">
                    <b-button
                      v-if="numbersDict[props.row.sn] != props.row.parts[0].label"
                      size="is-small"
                      @click="rename(machine.name, props.row.blockDevice, props.row.parts[0].label, numbersDict[props.row.sn])"
                    >
                      Rename Partition
                      <span class="has-text-info">[{{ props.row.parts[0].label }}->{{ numbersDict[props.row.sn] }}]</span>
                    </b-button>
                    <b-button
                      v-if="!props.row.parts[0].mountPoint"
                      size="is-small"
                      @click="mount(machine.name, props.row.blockDevice, props.row.parts[0].label)"
                    >
                      Mount Partition
                      <span class="has-text-info">[{{ props.row.parts[0].label }}]</span>
                    </b-button>
                  </template>
                </template>
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
                  </div>
                </td>
              </tr>
            </template>
          </b-table>
        </div>
      </div>
    </b-collapse>
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
      smart: any,
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

  load() {
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
        });
    } else {
      getInfo.getInfo(`disks?force=${this.forceGetDiskInfo}`)
        .then(response => response.json())
        .then(json => {
          this.machines = json;
          this.sortDisks();
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

    console.log(this.hostDict)
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
}
</script>