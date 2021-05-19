<template>
  <div class="home">
    <div class="is-hidden-mobile block">
      <div class="box">
        <div class="heading">当前币价</div>
        <div class="title is-3 has-text-success has-text-weight-bold">TODO</div>
      </div>
      <div class="columns">
        <div class="column">
          <div class="box">
            <div class="heading">全网容量</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">{{farm.farm.totalSize}}</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">奇亚币总量</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">TODO</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">总价值</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">TODO</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">收获的奇亚币</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">
              {{farm.farm.totalFarmed}}
            </div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">收获的奇亚币价值</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">TODO</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">难度系数</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">{{farm.node.difficulty}}</div>
            <div v-if="!farm" class="title is-5">Loading</div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div class="heading">最新的收割区块高度</div>
            <div v-if="farm" class="title is-5 has-text-success has-text-weight-bold">{{farm.node.height}}</div>
            <div v-if="!farm" class="title is-5">Loading</div>
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
    <div class="block">
      <calculatorSimplified/>
    </div>
    <div class="block">
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
          <diskMap />
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
      data: "",
    },
    {
      title: "全网容量",
      data: "",
    },
    {
      title: "奇亚币总量",
      data: "",
    },
    {
      title: "总价值",
      data: "",
    },
    {
      title: "收获的奇亚币",
      data: "",
    },
    {
      title: "难度系数",
      data: "",
    },
    {
      title: "最新的收割区块高度",
      data: "",
    },
    ];
    farm = null;
    plot = null;

    mounted() {
      getInfo.stopRefresh();
      this.load();
      this.autoRefresh();
    }

    // TODO: setintervals 
    load() {
      getInfo.getInfo("farmer")
        .then(response => response.json())
        .then(json => {
          this.farm = json;
          getInfo.sortDisks(this.farm);
          this.getNetInfo(this.farm);
        });
    }
    autoRefresh() {
      var temp;
      temp = setInterval(() => {
        getInfo.getInfo("farmer")
          .then(response => response.json())
          .then(json => {
            this.farm = json;
            getInfo.sortDisks(this.farm);
            this.getNetInfo(this.farm);
          });
      }, 5000);
      getInfo.intervals.push([temp,"farmer"]);
      temp = setInterval(() => {
        getInfo.save();
      }, 5000);
      getInfo.intervals.push([temp, "save"]);
    }
    getNetInfo(farm) {
      this.netInfoList = [{
        title: "当前币价",
        data: "TODO",
      },
      {
        title: "全网容量",
        data: farm.farm.totalSize,
      },
      {
        title: "奇亚币总量",
        data: "TODO",
      },
      {
        title: "总价值",
        data: "TODO",
      },
      {
        title: "收获的奇亚币",
        data: farm.farm.totalFarmed,
      },
      {
        title: "难度系数",
        data: farm.node.difficulty,
      },
      {
        title: "最新的收割区块高度",
        data: farm.node.height,
      },
      ];
    }
  }
</script>
