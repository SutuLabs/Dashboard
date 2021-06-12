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

    <b-collapse class="card" animation="slide" v-for="(machine, index) of machines" :key="index" :open="isOpen == index"
      @open="isOpen = index">
      <template #trigger="props">
        <div class="card-header" role="button">
          <p class="card-header-title">
            {{ machine.name }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'menu-down' : 'menu-up'">
            </b-icon>
          </a>
        </div>
      </template>
      <div class="card-content">
        <div class="content">
          <b-table v-if="machine.disks" :data="machine.disks" detailed :show-detail-icon="false" detail-key="sn"
            custom-detail-row striped :mobile-cards="false">
            <b-table-column label="#" width="40" header-class="has-text-info" v-slot="props">
              <a class="has-text-light"
                @click="props.toggleDetails(props.row)">{{machine.disks.indexOf(props.row)+1}}</a>
            </b-table-column>
            <b-table-column field="sn" label="Name" width="40" header-class="has-text-info" cell-class="has-text-info"
              v-slot="props">
              <a :id="props.row.sn" class="has-text-info" @click="props.toggleDetails(props.row)">{{ props.row.sn }}</a>
            </b-table-column>
            <b-table-column label="Model" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{props.row.model}}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Block" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  {{props.row.blockDevice}}
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Partitions" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <span class="has-text-grey">
                  <span v-for="part in props.row.parts" :key="part.uuid">
                    {{part.label}}
                  </span>
                </span>
              </template>
            </b-table-column>
            <b-table-column label="Ops" width="40" header-class="has-text-info" v-slot="props">
              <template>
                <b-button v-if="!props.row.parts && numbers && numbers[props.row.sn] && numbers[props.row.sn]"
                  size="is-small"
                  @click="create(machine.name, props.row.blockDevice, numbers && numbers[props.row.sn])">
                  Create Partition
                  <span v-if="numbers && numbers[props.row.sn]" class="has-text-info">[{{numbers[props.row.sn]}}]</span>
                </b-button>
                <b-button
                  v-if="props.row.parts && props.row.parts.length > 0 && numbers && numbers[props.row.sn] && numbers[props.row.sn] != props.row.parts[0].label"
                  size="is-small"
                  @click="rename(machine.name, props.row.blockDevice, props.row.parts[0].label, numbers[props.row.sn])">
                  Rename Partition
                  <span v-if="numbers && numbers[props.row.sn]"
                    class="has-text-info">[{{props.row.parts[0].label}}->{{numbers[props.row.sn]}}]</span>
                </b-button>
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
                          <td>{{part.label}}</td>
                          <td>{{part.mountPoint}}</td>
                          <td>{{part.name}}</td>
                          <td>{{part.size}}</td>
                          <td>{{part.uuid}}</td>
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
        } [],
        sn: string,
        model: string,
        smart: any,
      } []
    } [] = [];
    @Prop() private machineNames!: string[];
    private numbers: any = {};
    private isOpen = 0;
    private forceGetDiskInfo = false;
    private machineSelected = '';

    load() {
      getInfo.getInfo(`serial-number`)
        .then(response => response.json())
        .then(json => {
          this.numbers = json;
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

    pushWithReplace < T extends {
      [index: string]: any
    } > (arr: Array < T > , o: T, k: string) {
      var fi = arr.findIndex((f: T) => f[k] === o[k]);
      fi != -1 ? arr.splice(fi, 1, o) : arr.push(o);
      return this;
    }

    sortDisks() {
      this.machines.forEach(m => {
        if (!m.disks) return;
        m.disks.sort((a, b) => !a.parts || !b.parts ? 0 : a.parts[0].label.localeCompare(b.parts[0].label));
      });
      console.log(this.machines)
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
  }
</script>