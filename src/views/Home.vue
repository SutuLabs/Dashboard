<template>
  <div class="home">
    <template class="container" v-if="username==null">
      <b-notification type="is-danger" has-icon aria-close-label="Close notification" role="alert">
        尚未登录，无法查看！
      </b-notification>
    </template>
    <div class="is-hidden-mobile block">
      <div class="box is-hidden">
        <div class="heading">当前币价</div>
        <div class="title is-3 has-text-success has-text-weight-bold">TODO</div>
      </div>
      <div class="columns">
        <div class="column" v-for="item in netInfoList" :key="netInfoList.indexOf(item)">
          <div class="box">
            <div class="heading">{{item.title}}</div>
            <div class="title is-5 has-text-success has-text-weight-bold">{{item.data}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="block is-hidden-tablet">
      <b-carousel-list :data="netInfoList" :items-to-show="2">
        <template #item="list">
          <div class="box">
            <div class="heading">{{list.title}}</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">{{list.data}}</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </template>
      </b-carousel-list>
    </div>
    <div class="block" v-if="farm">
      <div class="card">
        <router-link to="/calculator">
          <div class="card-header">
            <div class="card-header-title">
              <div class="has-text-info">奇亚币收益计算器 </div>
              <div class="heading">根据农田数量及当前币价，预估耕种收益。</div>
            </div>
          </div>
        </router-link>
        <div class="card-content">
          <calculatorSimplified :farm="farm" />
        </div>
      </div>
    </div>
    <div class="block" hidden>
      <div class="columns">
        <div class="column is-half">
          <div class="box">
            <div class="title is-5">全网大小(PiB)</div>
            <div>TODO</div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="title is-5">chia价格(USD)</div>
            <div>TODO</div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-half">
          <div class="box">
            <div class="title is-5">每日营收(1TiB)</div>
            <div>TODO</div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="title is-5">收获时间(1TiB)</div>
            <div>TODO</div>
          </div>
        </div>
      </div>
    </div>
    <div class="block">
      <div class="card">
        <router-link to="/monitor">
          <div class="card-header">
            <div class="card-header-title">
              <div class="has-text-info">矿场监控</div>
              <div class="heading">实时查看并监控矿场工作状态及数据</div>
            </div>
          </div>
        </router-link>
        <div class="card-content">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import calculatorSimplified from '@/components/calculatorSimplified.vue'; // @ is an alias to /src
  import diskMap from '@/components/diskMap.vue';
  import getInfo from '@/services/getInfo'

  @Component({
    components: {
      calculatorSimplified,
      diskMap,
    },
  })
  export default class Home extends Vue {
    netInfoList = [{
      title: "当前币价",
      data: "Loading",
    },
    {
      title: "全网容量",
      data: "Loading",
    },
    /*{
      title: "奇亚币总量",
      data: "Loading",
    },
    {
      title: "收获的奇亚币",
      data: "Loading",
    },*/
    {
      title: "难度系数",
      data: "Loading",
    },
    {
      title: "最新的收割区块高度",
      data: "Loading",
    },
    /*{
      title: "全网耗电量",
      data: "Loading",
    },*/
    ];
    farm :any= null;
    intervals: number[] = [];
    username = localStorage.getItem("username")
    chiaPrice = '';

    mounted() {
      if(this.username){
        this.load();
        this.autoRefresh();
      }
    }

    load() {
      getInfo.getChiaPrice()
        .then(response => response.json())
        .then(json =>{
          let price = json
          this.chiaPrice = '$ ' + price[0].price.toFixed(2) 
        });
      getInfo.getInfo("farmer")
        .then(response => response.json())
        .then(json => {
          if (json[0].farmer.status == "Full Node Synced" || json[0].farmer.status == "Farming") {
            this.farm = json[0];
          } else if (json[1].farmer.status == "Full Node Synced" || json[1].farmer.status == "Farming") {
            this.farm = json[1];
          }
          getInfo.sortDisks(this.farm);
          this.getNetInfo(this.farm);

        });
    }
    autoRefresh() {
      var temp;
      temp = window.setInterval(() => {
        getInfo.getChiaPrice()
          .then(response => response.json())
          .then(json =>{
            let price = json
            this.chiaPrice = '$ ' + price[0].price.toFixed(2)  
          });
        getInfo.getInfo("farmer")
          .then(response => response.json())
          .then(json => {
            if (json[0].farmer.status == "Full Node Synced" || json[0].farmer.status == "Farming") {
              this.farm = json[0];
            } else if (json[1].farmer.status == "Full Node Synced" || json[1].farmer.status == "Farming") {
              this.farm = json[1];
            }
            getInfo.sortDisks(this.farm);
            this.getNetInfo(this.farm);
          });
      }, 5000);
      this.intervals.push(temp);
      temp = window.setInterval(() => {
        getInfo.save("farm", this.farm);
      }, 5000);
      this.intervals.push(temp);
    }
    getNetInfo(farm:any) {
      this.netInfoList = [{
        title: "当前币价",
        data: this.chiaPrice,
      },
      {
        title: "全网容量",
        data: farm.node.space,
      },
      /*{
        title: "奇亚币总量",
        data: "TODO($TOTAL_VALUE TODO)",
      },
      {
        title: "收获的奇亚币",
        data: farm.farmer.totalFarmed + "($VALUE TODO)",
      },*/
      {
        title: "难度系数",
        data: farm.node.difficulty,
      },
      {
        title: "最新的收割区块高度",
        data: farm.node.height,
      },
      /*{
        title: "全网耗电量",
        data: "TODO",
      },*/
      ];
    }

    beforeDestroy() {
      this.intervals = getInfo.stopRefresh(this.intervals);
    }
  }
</script>
