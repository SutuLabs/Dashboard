<template>
  <div class="calculatorSimplified">
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
        <div class="block">
          <div class="columns">
            <div class="column is-one-quarter">
              <p class="title is-5">输入您拥有的算力或田数</p>
            </div>
            <div class="column is-one-quarter">
              <p v-if="basicCalc.unit=='tib'">（约为{{ (basicCalc.n/101.4*1024).toFixed(0) }}plots）</p>
              <p v-if="basicCalc.unit=='plots'">（约为{{ (basicCalc.n*101.4/1024).toFixed(0) }}Tib）</p>
            </div>
          </div>
          <b-field>
            <b-input size="is-small" type="number" v-model="basicCalc.n" :lazy="true" v-on:input="basicCalculate()"></b-input>
            <b-select size="is-small" v-model="basicCalc.unit" v-on:input="basicCalculate()">
              <option value="tib">TiB</option>
              <option value="plots">Plots</option>
            </b-select>
          </b-field>
        </div>
        <div class="block">
          <div class="columns">
            <div class="column is-one-quarter">
              <p class="title is-5">输入您的单T成本</p>
            </div>
            <div class="column is-one-quarter">
              <p v-if="basicCalc.costUnit=='USDT'">（当前平均算力成本为18.09U/TB）</p>
              <p v-if="basicCalc.costUnit=='RMB'">（当前平均算力成本为120.00元/TB）</p>
            </div>
            <div class="column is-one-quarter">
              <p>TODO: 单T成本计算标准</p>
            </div>
          </div>
          <b-field>
            <b-input size="is-small" v-model="basicCalc.unitCost" :lazy="true" v-on:input="basicCalculate()">
            </b-input>
            <b-select size="is-small" v-model="basicCalc.costUnit" v-on:input="basicCalculate()">
              <option value="USDT">USDT</option>
              <option value="RMB">RMB</option>
            </b-select>
            <p class="control">
              <span class="button is-small">/TB</span>
            </p>
          </b-field>
        </div>
        <div class="columns">
          <div class="column is-one-third">
            <div class="box">
              <div class="heading">预计爆块时间</div>
              <div class="title is-5">{{ basicCalc.estimatedTime }}</div>
            </div>
          </div>
          <div class="column is-one-third">
            <div class="box">
              <div class="heading">日均收益</div>
              <div class="title is-5">{{ basicCalc.dailyEarningXCH.toFixed(2) }}</div>
              <div v-if="basicCalc.costUnit=='USDT'">约{{ basicCalc.dailyEarning.toFixed(2) }}USDT/天</div>
              <div v-if="basicCalc.costUnit=='RMB'">约{{ basicCalc.dailyEarning.toFixed(2) }}元/天</div>
            </div>
          </div>
          <div class="column is-one-third">
            <div class="box">
              <div class="heading">预计回本时间</div>
              <div class="title is-5">{{ basicCalc.timeToEarnCost.toFixed(0) }}天</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';

  @Component
  export default class calculatorSimplified extends Vue {
    basicCalc = {
      n: 1,
      unit: "tib",
      unitCost: 18.09,
      costUnit: "USDT",
      estimatedTime: "0",
      dailyEarningXCH: 0,
      dailyEarning: 0,
      timeToEarnCost: 0, //days
      chiaPrice: 500,
    };
    averageBlockTime = 18.75; // in seconds (last paragraph in https://docs.google.com/document/d/1tmRIb7lgi4QfKkNaxuKOBHRmwbVlGL4f7EsBDr_5xZE/edit#heading=h.z0v0b3hmk4fl)
    /* farm = {
      node: {
        space: ""},
    }; */
    farm: any; 

    mounted() {
      this.load(); 
    }

    load() {
      getInfo.getInfo("farmer")
        .then(response => response.json())
        .then(json => {
          this.farm = json;
        })
        .then(_ => {
          this.basicCalculate();
        });
    }

    formatTime(time: number) {
      var day;
      day = time / (24 * 60);
      if (day < 1) {
        var hour, min;
        hour = Math.floor(time / 60);
        if (hour < 1) {
          if (time < 1) return "Less than 1 minute";
          else return "About " + time.toFixed(0).toString() + " minutes";
        } else {
          min = Math.floor(time - hour * 60);
          if (min < 1) return hour.toString() + " hours";
          else return hour.toString() + " hours " + min.toString() + " minutes";
        }
      } else if (day < 31) {
        return day.toFixed(0).toString() + " days";
      } else {
        var month, temp_day;
        month = Math.floor(day / 30);
        temp_day = Math.floor(day - month * 30);
        if (month < 12) {
          return month.toString() + " months " + temp_day.toString() + " days";
        } else {
          var year;
          year = Math.floor(day / 365);
          if (year < 1) return "Almost 1 year"
          else {
            var temp_month = Math.floor((day - year * 365) / 30);
            if (temp_month < 1) return year.toString() + " years";
            else {
              return year.toString() + " years " + temp_month.toString() + " months";
            }
          }
        }
      }
    }

    basicCalculate(): void {
      var initSize; //Tib
      var unitCost = this.basicCalc.unitCost;
      var rawTotalNetSpace = parseFloat(this.farm.node.space); //EiB

      if (this.basicCalc.unit == "tib") {
        initSize = this.basicCalc.n;
      } else {
        initSize = this.basicCalc.n * 101.4 / 1024;
      }
      var proportion = (initSize) / (rawTotalNetSpace * Math.pow(1024, 2));
      var expectTimeWin = ((this.averageBlockTime / 60) / proportion); // in minutes (reference:https://github.com/Chia-Network/chia-blockchain/blob/95d6030876fb19f6836c6c6eeb41273cf7c30d93/chia/cmds/farm_funcs.py#L246-L247)
      this.basicCalc.estimatedTime = this.formatTime(expectTimeWin);

      var dailyEarningXCH = 2 * (1 - Math.pow((1 - proportion), 4608)); // XCH reference: https://thechiafarmer.com/2021/04/23/estimated-time-to-win-explained/
      var dailyEarning = dailyEarningXCH * this.basicCalc.chiaPrice; // TODO: get chia price from coinbase
      this.basicCalc.dailyEarningXCH = dailyEarningXCH;
      this.basicCalc.dailyEarning = dailyEarning;
      // simplified version: without considering network growth
      var totalCost = unitCost * initSize;
      this.basicCalc.timeToEarnCost = (totalCost / (dailyEarning));
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
