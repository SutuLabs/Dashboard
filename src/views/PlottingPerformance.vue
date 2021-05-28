<template>
  <div class="block">
    <b-collapse class="card" animation="slide" :open="true">
      <template #trigger="props">
        <div class="card-header" role="button">
          <p class="card-header-title">P盘效率</p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
          </a>
        </div>
      </template>
      <div class="card-content">
        <b-dropdown aria-role="list" v-model="selectedOS">
          <template #trigger>
            <b-button type="is-primary">选择操作系统</b-button>
          </template>
          <b-dropdown-item value="all">All</b-dropdown-item>
          <b-dropdown-item value="WSL">WSL</b-dropdown-item>
          <b-dropdown-item value="Windows">Windows</b-dropdown-item>
          <b-dropdown-item value="Ubuntu">Ubuntu</b-dropdown-item>
          <b-dropdown-item value="Else">Else</b-dropdown-item>
        </b-dropdown>
        <b-select class="is-inline-block" v-model="perPage">
          <option value="10">10个每页</option>
          <option value="20">20个每页</option>
          <option value="50">50个每页</option>
          <option value="100">100个每页</option>
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
</template>

<script lang="ts">
interface computerInfo {
  User: string
  'System Name': string
  OS: string
  'Motherboard / SAS Adapter (Server)': string
  CPU: string
  DRAM: string
  'Temp Drive': string
  'Time Phase 1 (s)': string
  'Total Time per Plot (s)': string
  'Time (min)': string
  'Time (hr)': string
  'GiB Written': string
  'GiB/min': string
  '// Plots': string
  'TiB/day (all // Plots)': string
  'Total Price (USD)': string
  '$/TiB/day': string
  version: string
  '-r (Threads)': string
  '-b (Memory)': string
  Buckets: string
  Stagger: string
  'Stripe Size': string
  '-e (Bitfield Disabled)': string
  Comment: string
  'Time phase 3-4': string
}
  import { Component, Vue } from 'vue-property-decorator';
  import data from './../assets/ChiaPlottingPerformance.json';

  @Component({
    filters: {
      shorten: function (value:any, len = 10) {
        if (!value) return ''
        let padding = '...';
        let left = Math.ceil((len - padding.length) / 2);
        let right = len - padding.length - left;
        return value.length >= len ? value.substr(0, left) + padding + value.substr(-right) : value;
      },
    },
  })
  export default class monitor extends Vue {
    plottingPerformances:computerInfo[] = [];
    selectedOS = '';
    perPage = 10;

    mounted() {
      this.plottingPerformances = data; 
    }
    get selectedPerformance() {
      if (this.selectedOS === 'all') {
        return this.plottingPerformances;
      } else if (this.selectedOS === 'Else') {
      return this.plottingPerformances.filter((_) => {
        return (
          _.OS.match('[U|u|lu]buntu') == null &&
          _.OS.match('[w|W]indows') == null
        )
        })
      } else {
        return this.plottingPerformances.filter(_ => {
           return _.OS.indexOf(this.selectedOS.slice(1)) > -1
        })
      }
    }
  }
</script>