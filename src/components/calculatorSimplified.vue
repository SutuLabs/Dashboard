﻿<template>
  <div class="calculatorSimplified">
    <div class="block">
      <div class="block">
        <p class="title is-5">
          输入您拥有的算力或田数
          <span class="is-size-7" v-if="basicCalc.unit=='tib'">（约为{{ (basicCalc.n/101.4*1024).toFixed(0) }}plots）</span>
          <span class="is-size-7" v-if="basicCalc.unit=='plots'">（约为{{ (basicCalc.n*101.4/1024).toFixed(0) }}Tib）</span>
        </p>
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
        <div class="column">
          <p class="title is-5">
            输入您的单T成本
            <span class="is-size-7" v-if="basicCalc.costUnit=='USDT'">（当前平均算力成本为18.09U/TB）</span>
            <span class="is-size-7" v-if="basicCalc.costUnit=='RMB'">（当前平均算力成本为120.00元/TB）</span>
          </p>
        </div>
        <div hidden>
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
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';
  import getTime from '@/services/getTime'

  @Component
  export default class calculatorSimplified extends Vue {
    @Prop() private farm!: any;

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

    mounted() {
      this.load(); 
    }

    load() {
      this.basicCalculate();
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
      this.basicCalc.estimatedTime = getTime.getEstimatedTime(initSize,rawTotalNetSpace,this.averageBlockTime);
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
