﻿<template>
  <div class="calculator">
    <div class="block">
      <diskSpaceCalculator />
    </div>

    <b-loading v-model="calcLoading" :is-full-page="false"></b-loading>

    <div class="card">
      <div class="card-header">
        <div class="card-header-title">
          <div class="has-text-info">奇亚币收益计算器 </div>
          <div class="heading">根据农田数量及当前币价，预估耕种收益。</div>
        </div>
      </div>
      <div class="card-content p-0">
        <div v-if="!calcLoading">
          <b-tabs type="is-boxed" expanded>
            <b-tab-item label="初级版">
              <calculatorSimplified :farm="farm" />
            </b-tab-item>

            <b-tab-item label="高级版" id="advanced">
              <div class="block columns is-gapless">
                <div class="column is-half columns is-mobile">
                  <div class="column is-half">
                    <b-field label="输入算力">
                      <b-input size="is-small" :lazy="true" expanded v-model="calculator.inputSize"
                               v-on:input="calculate()"></b-input>
                      <b-select size="is-small" v-model="calculator.initSizeUnit">
                        <option value="tib">TiB</option>
                        <option value="plot">Plot(s)</option>
                      </b-select>
                    </b-field>
                  </div>
                  <div class="column is-half">
                    <b-field label="时间周期">
                      <b-input size="is-small" :lazy="true" expanded v-model="calculator.timeFrame"
                               v-on:input="calculate()"></b-input>
                      <b-select size="is-small" v-model="calculator.timeFrameUnit">
                        <option value="month">月</option>
                        <option value="year">年</option>
                      </b-select>
                    </b-field>
                  </div>
                </div>
                <div class="column is-half columns is-mobile">
                  <div class="column is-half">
                    <b-field label="开始时间">
                      <b-datepicker size="is-small" v-model="calculator.startDate" placeholder="Click to select..." icon="calendar-today" trap-focus></b-datepicker>
                    </b-field>
                  </div>
                  <div class="column is-half">
                    <b-field label="币价(/XCH)">
                      <b-input size="is-small" :lazy="true" expanded v-model="calculator.XCHprice"
                               v-on:input="calculate()"></b-input>
                      <b-select size="is-small" v-model="calculator.XCHpriceUnit">
                        <option value="usdt">USDT</option>
                        <option value="rmb" hidden>RMB</option>
                      </b-select>
                    </b-field>
                  </div>
                </div>
              </div>

              <div class="block columns">
                <div class="column is-half">
                  <div class="box">
                    <p class="title is-5">我的容量</p>
                    <b-field horizontal label="初始容量">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.initSize"
                                 v-on:input="calculate()" disabled></b-input>
                        <b-select size="is-small" v-model="calculator.initSizeUnit" disabled>
                          <option value="tib">Tib</option>
                        </b-select>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="每日增长速度">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.plottingSpeed"
                                 v-on:input="calculate()"></b-input>
                        <b-select size="is-small" v-model="calculator.plottingSpeedUnit">
                          <option value="tib">TiB</option>
                        </b-select>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="最大增长至">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.maxSize"
                                 v-on:input="calculate()"></b-input>
                        <b-select size="is-small" v-model="calculator.maxSizeUnit">
                          <option value="tib">TiB</option>
                        </b-select>
                      </b-field>
                    </b-field>
                    <b-field grouped position="is-centered">
                      <b-checkbox v-model="calculator.unlimited" v-on:input="calculate()">无限增长</b-checkbox>
                    </b-field>
                  </div>
                </div>

                <div class="column is-half">
                  <div class="box">
                    <p class="title is-5">全网容量</p>
                    <b-field horizontal label="初始容量">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.initNetSize"
                                 v-on:input="calculate()"></b-input>
                        <b-select size="is-small" v-model="calculator.initNetSizeUnit">
                          <option value="eib">EiB</option>
                        </b-select>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="指数增长速率" grouped>
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.growthRate"
                                 v-on:input="calculate()"></b-input>
                        <p class="control">
                          <span class="button is-small">%</span>
                        </p>
                        <b-select size="is-small" v-model="calculator.growthRatePeriod">
                          <option value="weekly">每周</option>
                        </b-select>
                      </b-field>
                      <b-field>
                        <b-checkbox v-model="calculator.unbounded" v-on:input="calculate()">无限增长</b-checkbox>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="指数增长">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.exponentialGrowth"
                                 v-on:input="calculate()"></b-input>
                        <p class="control">
                          <span class="button is-small">天</span>
                        </p>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="每天稳定增长">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.stableDaily"
                                 v-on:input="calculate()"></b-input>
                        <b-select size="is-small" v-model="calculator.stableDailyUnit">
                          <option value="pib">PiB</option>
                        </b-select>
                      </b-field>
                    </b-field>
                    <b-field horizontal label="稳定增长">
                      <b-field>
                        <b-input size="is-small" :lazy="true" expanded v-model="calculator.stabilization" v-on:input="calculate()"></b-input>
                        <p class="control">
                          <span class="button is-small">天</span>
                        </p>
                      </b-field>
                    </b-field>
                  </div>
                </div>
              </div>

              <div class="box">
                <div class="title is-4">预估总收益</div>
                <nav class="level">
                  <div class="level-item has-text-centered">
                    <div>
                      <div class="heading">{{ calculator.timeFrame }}个月后收入奇亚币（XCH）数量</div>
                      <div class="title is-5">{{ calculator.totalXCH.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div class="level-item has-text-centered">
                    <div>
                      <div class="heading">{{ calculator.timeFrame }}个月后收入USDT数量</div>
                      <div class="title is-5">${{ calculator.totalEarningUSDT.toFixed(2) }}</div>
                    </div>
                  </div>
                </nav>
              </div>

              <div class="is-hidden-mobile" v-if="calculator.calculatorMap">
                <apexchart height="400" :options="calculator.calculatorMap.chartOptions"
                           :series="calculator.calculatorMap.series"></apexchart>
              </div>
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';
  import diskSpaceCalculator from '@/components/diskSpaceCalculator.vue';
  import calculatorSimplified from '@/components/calculatorSimplified.vue';

  @Component({
    components: {
      diskSpaceCalculator,
      calculatorSimplified
    },
  })
  export default class calculator extends Vue {
    farm: any;
    calculator: any; 
    calcLoading = true;
    slider = 0;
    sliderValue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 55, 64, 80, 105, 141, 190, 254, 335, 435, 536, 637, 738, 839, 940, 1041, 1142, 1243, 1344, 1445, 1596, 1747, 1898, 2049, 2200, 2351, 2502, 2653, 2804, 2955, 3226, 3497, 3768, 4039, 4310, 4581, 4852, 5123, 5394, 5665, 6098, 6531, 6964, 7397, 7830, 8263, 8696, 9129, 9562, 10000];
    setSliderFlag = false;
    averageBlockTime = 18.75; // in seconds (last paragraph in https://docs.google.com/document/d/1tmRIb7lgi4QfKkNaxuKOBHRmwbVlGL4f7EsBDr_5xZE/edit#heading=h.z0v0b3hmk4fl)
    intervals: number[] = [];

    mounted() {
      this.load();
      //this.autoRefresh();
    }

    load() {
      getInfo.getInfo("farmer")
        .then(response => response.json())
        .then(json => {
          this.farm = json[0];
          getInfo.sortDisks(this.farm);
          this.calculate();
        });
    }
    autoRefresh() {
      var temp;
      temp = window.setInterval(() => {
        getInfo.getInfo("farmer")
          .then(response => response.json())
          .then(json => {
            this.farm = json[0];
            getInfo.sortDisks(this.farm);
            this.calculate();
          });
      }, 5000);
      this.intervals.push(temp);
      temp = window.setInterval(() => {
        getInfo.save("farm", this.farm);
      }, 5000);
      this.intervals.push(temp);
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
    calculate(): void {
      this.calcLoading = false;
      const unitPlotSize = 101.4; // GiB
      var rawTotalNetSpace = parseFloat(this.farm.node.space); //EiB

      // Advanced info 
      if (!this.calculator) this.calculator = {
        inputSize: 1, //Tib
        inputSizeUnit: "tib",
        timeFrame: 6,
        timeFrameUnit: "month",
        startDate: new Date(2021, 4, 13),
        XCHprice: 500, // TODO: get real time chia price
        XCHpriceUnit: "usdt",
        initSizeUnit: "tib",
        plottingSpeed: 1.0,
        plottingSpeedUnit: "tib",
        maxSize: 40.0,
        maxSizeUnit: "tib",
        unlimited: true,
        initNetSize: rawTotalNetSpace, // EiB 
        initNetSizeUnit: "eib",
        growthRate: 15,
        growthRatePeriod: "weekly",
        unbounded: false,
        exponentialGrowth: 30,
        stabilization: 150,
        stableDaily: 5.000,
        stableDailyUnit: "pib",
      };
      
      if (this.calculator.inputSizeUnit == "tib") {
        this.calculator.initSize = parseFloat(this.calculator.inputSize);
      } else if (this.calculator.inputSizeUnit == "plot") {
        this.calculator.initSize = parseInt(this.calculator.inputSize) * unitPlotSize / Math.pow(1024, 1); //GiB to TiB
      }
      var proportion = this.calculator.initSize / (rawTotalNetSpace * Math.pow(1024, 3));
      var expectTimeWin = ((this.averageBlockTime / 60) / proportion); // in minutes (reference:https://github.com/Chia-Network/chia-blockchain/blob/95d6030876fb19f6836c6c6eeb41273cf7c30d93/chia/cmds/farm_funcs.py#L246-L247)
      
      if (this.calculator.maxSize < this.calculator.initSize) this.calculator.maxSize = this.calculator.initSize;

      var netSpaceData = [];
      var plotSizeData = [];
      var ownedSpaceData = [];
      var dailyEarningData = [];
      var totalEarningData = [];
      var timeFrameCategory = [];

      function get_days(startDate: string, n: number, unit: string) {
        var date1 = new Date(startDate);
        var date2 = new Date(startDate);
        if (unit == "year") {
          date2.setFullYear(date1.getFullYear() + n);
        } else if (unit == "month") {
          date2.setMonth(date1.getMonth() + n);
        }
        var timeDif = date2.getTime() - date1.getTime();
        return Math.floor(timeDif / (1000 * 3600 * 24));
      }

      var i;
      var nDays = get_days(this.calculator.startDate, parseInt(this.calculator.timeFrame), this.calculator.timeFrameUnit);
      var startDate = new Date(this.calculator.startDate);
      for (i = 0; i < nDays; i++) {
        var date = new Date();
        timeFrameCategory.push(date.setDate(startDate.getDate() + i));
      }

      // graph of network space 
      // TODO
      var prevDayNetSpace = this.calculator.initNetSize;
      for (i = 0; i < nDays; i++) {
        if (this.calculator.unbounded) {
          if (i) {
            prevDayNetSpace = prevDayNetSpace * (1 + this.calculator.growthRate / 100 / 7);
          }
        } else {
          if (i < this.calculator.exponentialGrowth) {
            prevDayNetSpace = prevDayNetSpace * (1 + this.calculator.growthRate / 100 / 7);
          } else if (i < this.calculator.exponentialGrowth + this.calculator.stabilization) {
            prevDayNetSpace = prevDayNetSpace + this.calculator.stableDaily / 1024;
          }
        }
        netSpaceData.push([timeFrameCategory[i], prevDayNetSpace.toFixed(3)]);
      }

      // graph of size of plots 
      var newSize = this.calculator.initSize
      for (i = 0; i < nDays; i++) {
        if (!this.calculator.unlimited) {
          if (newSize + this.calculator.plottingSpeed <= this.calculator.maxSize) {
            newSize = newSize + parseFloat(this.calculator.plottingSpeed);
          }
        } else {
          newSize = newSize + parseFloat(this.calculator.plottingSpeed);
        }
        plotSizeData.push([timeFrameCategory[i], newSize.toFixed(3)])
      }

      // graph of owned space 
      for (i = 0; i < nDays; i++) {
        var newOwnedSpace = plotSizeData[i][1] / (netSpaceData[i][1] * Math.pow(1024, 2)) * 100; // percentage; Tib to EiB 
        ownedSpaceData.push([timeFrameCategory[i], newOwnedSpace]);
      }

      // graph of daily earnings 
      // TODO 
      for (i = 0; i < nDays; i++) {
        var dailyProportion = plotSizeData[i][1] / (netSpaceData[i][1] * Math.pow(1024, 3));
        var dailyEarning = 2 * (1 - Math.pow((1 - dailyProportion), 4608)); // reference: https://thechiafarmer.com/2021/04/23/estimated-time-to-win-explained/
        dailyEarningData.push([timeFrameCategory[i], dailyEarning]);
      }

      // graph of total earnings
      var tempSum = 0;
      for (i = 0; i < nDays; i++) {
        tempSum = tempSum + dailyEarningData[i][1];
        totalEarningData.push([timeFrameCategory[i], tempSum]);
      }
      this.calculator.totalXCH = totalEarningData[nDays - 1][1];
      this.calculator.totalEarningUSDT = this.calculator.XCHprice * this.calculator.totalXCH;

      this.calculator.calculatorMap = {
        series: [{
          name: "网络容量",
          data: netSpaceData,
        },
        {
          name: "农田大小",
          data: plotSizeData,
        },
        {
          name: "拥有的空间",
          data: ownedSpaceData,
        },
        {
          name: "每日收益",
          data: dailyEarningData,
        },
        {
          name: "总收益",
          data: totalEarningData,
        }
        ],
        chartOptions: {
          chart: {
            type: "line",
            height: 400,
            toolbar: {
              show: false,
            }
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
          },
          xaxis: {
            type: 'datetime',
            labels: {
              style: {
                colors: 'white',
              }
            }
          },
          yaxis: [{
            seriesName: "Network Space",
            show: false,
            decimalsInFloat: 3,
          },
          {
            seriesName: "Size of Plots",
            show: false,
            decimalsInFloat: 3,
          },
          {
            seriesName: "Owned Space",
            show: false,
            decimalsInFloat: 5,
          },
          {
            seriesName: "Daily Earning",
            show: false,
            decimalsInFloat: 5,
          },
          {
            seriesName: "Total Earning",
            show: false,
            decimalsInFloat: 5,
          }
          ],
          legend: {
            labels: {
              colors: "white",
            }
          },
          tooltip: {
            theme: "dark",
            y: [{
              title: {
                formatter: function (val: number) {
                  return val + " (EiB)"
                }
              },
            },
            {
              title: {
                formatter: function (val: number) {
                  return val + " (TiB)"
                }
              },
            },
            {
              title: {
                formatter: function (val: number) {
                  return val + " (%)"
                }
              },
            },
            {
              title: {
                formatter: function (val: number) {
                  return val + " (XCH)"
                }
              },
            },
            {
              title: {
                formatter: function (val: number) {
                  return val + " (XCH)"
                }
              },
            }
            ]
          }
        }
      }
    }

    beforeDestroy() {
      this.intervals = getInfo.stopRefresh(this.intervals);
    }
  }
</script>