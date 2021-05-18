<template>
  <div class="calculator">
    <b-loading v-model="calcLoading" :is-full-page="false"></b-loading>
    <div class="box" v-if="calculator!=null">
      <p class="title is-5">你的算力</p>
      <p>(of size 101.4GiB, k=32)</p>
      <b-field>
        <b-slider size="is-small" v-model="slider" :min="0" :max="99" :tooltip="false"
                  :custom-formatter="(val) => this.sliderValue[parseInt(val)].toString()" v-on:input="setNPlot()">
        </b-slider>
      </b-field>
      <div class="columns">
        <div class="column">
          <b-field>
            <b-input size="is-small" v-model="nPlot" :lazy="true" v-on:input="setSlider()"></b-input>
            <p class="control">
              <span class="button is-small">块农田</span>
            </p>
          </b-field>
        </div>
        <!-- TODO -->
        <div v-if="calculator" class="column" style="visibility: hidden;">
          <b-field>
            <p class="control">
              <span class="button is-small">Assume 1 XCH =</span>
            </p>
            <b-input size="is-small" v-model="calculator.XCHprice" :lazy="true" v-on:input="calculate()"></b-input>
            <p class="control">
              <span class="button is-small">USD</span>
            </p>
          </b-field>
        </div>
      </div>
    </div>

    <div v-if="calculator!=null">
      <b-tabs type="is-boxed" expanded>
        <b-tab-item label="Simplified">
          <div class="box">
            <div class="title is-4">Network</div>
            <nav class="level">
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Total network space</div>
                  <div class="title is-5">{{ calculator.totalNetSpace }}PiB</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Owned network space</div>
                  <div class="title is-5">{{ calculator.ownedNetSpace }}%</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Expected time to win</div>
                  <div class="title is-5">{{ calculator.expectTimeWin }}</div>
                </div>
              </div>
            </nav>
          </div>
          <div class="box">
            <div class="title is-4">Estimated Earnings</div>
            <nav class="level">
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Hourly XCH</div>
                  <div class="title is-5">{{ calculator.estimatedEarning.XCH.hour.toFixed(2) }}/hour</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Daily XCH</div>
                  <div class="title is-5">{{ calculator.estimatedEarning.XCH.day.toFixed(2) }}/day</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Monthly XCH</div>
                  <div class="title is-5">{{ calculator.estimatedEarning.XCH.month.toFixed(2) }}/month</div>
                </div>
              </div>
            </nav>
            <nav class="level">
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Hourly USD</div>
                  <div class="title is-5">${{ calculator.estimatedEarning.USD.hour.toFixed(2) }}/hour</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Daily USD</div>
                  <div class="title is-5">${{ calculator.estimatedEarning.USD.day.toFixed(2) }}/day</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">Monthly USD</div>
                  <div class="title is-5">${{ calculator.estimatedEarning.USD.month.toFixed(2) }}/month</div>
                </div>
              </div>
            </nav>
          </div>
        </b-tab-item>

        <b-tab-item label="Advanced" id="advanced">
          <div class="box">
            <div class="title is-4">Earnings over time</div>
            <div class="columns">
              <div class="column is-half">
                <b-field horizontal label="Time Frame">
                  <b-select size="is-small" v-model="calculator.timeFrameUnit" v-on:input="calculate()">
                    <option value="1month">1 Month</option>
                    <option value="3month">3 Months</option>
                    <option value="6month">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="3year">3 Years</option>
                    <option value="5year">5 Years</option>
                  </b-select>
                </b-field>
              </div>
              <div class="column is-half">
                <b-field horizontal label="Start Date">
                  <b-select size="is-small" v-model="calculator.startDate" v-on:input="calculate()">
                    <option value="today">Today</option>
                    <option value="mainet">Mainnet Launch</option>
                  </b-select>
                </b-field>
              </div>
            </div>
          </div>
          <div v-if="calculator.calculatorMap">
            <apexchart height="400" :options="calculator.calculatorMap.chartOptions"
                       :series="calculator.calculatorMap.series"></apexchart>
          </div>
          <div class="box">
            <div class="title is-4">Plots</div>
            <div class="columns">
              <div class="column is-one-third">
                <b-field label="Initial size of plots">
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.initSize"
                           v-on:input="calculate()" disabled></b-input>
                  <b-select size="is-small" v-model="calculator.initSizeUnit" disabled>
                    <option value="gib">GiB</option>
                  </b-select>
                </b-field>
              </div>
              <div class="column is-one-third">
                <b-field label="Plotting Speed">
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.plottingSpeed"
                           v-on:input="calculate()"></b-input>
                  <b-select size="is-small" v-model="calculator.plottingSpeedUnit">
                    <option value="gib">GiB</option>
                  </b-select>
                </b-field>
                <div>Space plotted per day</div>
              </div>
              <div class="column is-one-third">
                <b-field label="Max size of plots">
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.maxSize"
                           v-on:input="calculate()" :disabled="calculator.unlimited"></b-input>
                  <b-select size="is-small" v-model="calculator.maxSizeUnit" :disabled="calculator.unlimited">
                    <option value="gib">GiB</option>
                  </b-select>
                </b-field>
                <b-field>
                  <b-checkbox v-model="calculator.unlimited" v-on:input="calculate()">Unlimited</b-checkbox>
                </b-field>
              </div>
            </div>
          </div>
          <div class="box">
            <div class="title is-4">Network Space</div>
            <div class="columns">
              <div class="column is-one-third">
                <b-field label="Initial size of network">
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.initNetSize"
                           v-on:input="calculate()"></b-input>
                  <b-select size="is-small" v-model="calculator.initNetSizeUnit">
                    <option value="eib">EiB</option>
                  </b-select>
                </b-field>
              </div>
              <div class="column is-one-third">
                <b-field label="Network growth">
                  <p class="control">
                    <span class="button  is-small">%</span>
                  </p>
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.growthRate"
                           v-on:input="calculate()"></b-input>
                  <b-select size="is-small" v-model="calculator.growthRatePeriod">
                    <option value="weekly">Weekly</option>
                  </b-select>
                </b-field>
              </div>
              <div class="column is-one-third">
                <b-field>
                  <b-checkbox v-model="calculator.unbounded" v-on:input="calculate()">Unbounded growth</b-checkbox>
                </b-field>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third">
                <b-field label="Days of exponential growth">
                  <b-input size="is-small" :lazy="true" v-model="calculator.exponentialGrowth"
                           v-on:input="calculate()"></b-input>
                </b-field>
              </div>
              <div class="column is-one-third">
                <b-field label="Days of stabilization">
                  <b-input size="is-small" :lazy="true" v-model="calculator.stabilization" v-on:input="calculate()">
                  </b-input>
                </b-field>
              </div>
              <div class="column is-one-third">
                <b-field label="Stabilized daily growth">
                  <b-input size="is-small" :lazy="true" expanded v-model="calculator.stableDaily"
                           v-on:input="calculate()"></b-input>
                  <b-select size="is-small" v-model="calculator.stableDailyUnit">
                    <option value="pib">PiB</option>
                  </b-select>
                </b-field>
              </div>
            </div>
          </div>
          <div class="box">
            <div class="title is-4">Estimated Total Earnings</div>
            <nav class="level">
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">XCH after {{ calculator.timeFrame }} months</div>
                  <div class="title is-5">{{ calculator.totalXCH.toFixed(2) }}</div>
                </div>
              </div>
              <div class="level-item has-text-centered">
                <div>
                  <div class="heading">USD after {{ calculator.timeFrame }} {{ calculator.timeFrameUnit }}</div>
                  <div class="title is-5">${{ calculator.totalEarningUSD.toFixed(2) }}</div>
                </div>
              </div>
            </nav>
          </div>
        </b-tab-item>
      </b-tabs>

      <div class="box">
        <div class="title is-4">Exchange Rate</div>
        <b-field>
          <p class="control">
            <span class="button  is-small">Assume 1 XCH =</span>
          </p>
          <b-input size="is-small" v-model="calculator.XCHprice" :lazy="true" v-on:input="calculate()"></b-input>
          <p class="control">
            <span class="button  is-small">USD</span>
          </p>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import getInfo from '@/services/getInfo';

  @Component
  export default class calculator extends Vue {
    farm = null;
    calculator = null; 
    calcLoading = true;
    nPlot = null;
    slider = 0;
    sliderValue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 55, 64, 80, 105, 141, 190, 254, 335, 435, 536, 637, 738, 839, 940, 1041, 1142, 1243, 1344, 1445, 1596, 1747, 1898, 2049, 2200, 2351, 2502, 2653, 2804, 2955, 3226, 3497, 3768, 4039, 4310, 4581, 4852, 5123, 5394, 5665, 6098, 6531, 6964, 7397, 7830, 8263, 8696, 9129, 9562, 10000];
    setSliderFlag = false;
    averageBlockTime = 18.75; // in seconds (last paragraph in https://docs.google.com/document/d/1tmRIb7lgi4QfKkNaxuKOBHRmwbVlGL4f7EsBDr_5xZE/edit#heading=h.z0v0b3hmk4fl)

    mounted() {
      this.load();
    }

    load() {
      getInfo.getInfo("farmer")
        .then(response => response.json())
        .then(json => {
          this.farm = json;
          getInfo.sortDisks(this.farm);
          this.calculate();
        });
    }
    setSlider() {
      this.setSliderFlag = true;
      var nPlot = parseInt(this.nPlot);
      if (nPlot >= 10000) {
        this.slider = 99;
      } else {
        for (var i = 0; i < 99; i++) {
          if (nPlot >= this.sliderValue[i] && nPlot < this.sliderValue[i + 1]) {
            this.slider = i;
          }
        }
      }
      this.calculate();
    }
    setNPlot() {
      if (!this.setSliderFlag) {
        this.nPlot = this.sliderValue[this.slider];
        this.calculate();
      } else {
        this.setSliderFlag = false;
      }
    }
    formatTime(time) {
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
    calculate() {
      this.calcLoading = false;
      const unitPlotSize = 101.4;
      var nPlot = (this.nPlot == null || this.nPlot < 0) ? 1 : this.nPlot;
      var rawTotalNetSpace = this.farm.node.space; //EiB
      var totalNetSpace = 0;
      totalNetSpace = rawTotalNetSpace * 1024;
      var ownedNetSpace = (nPlot * unitPlotSize) / (rawTotalNetSpace * Math.pow(1024, 3)) * 100;
      var proportion = (nPlot * unitPlotSize) / (rawTotalNetSpace * Math.pow(1024, 3));
      var expectTimeWin = ((this.averageBlockTime / 60) / proportion); // in minutes (reference:https://github.com/Chia-Network/chia-blockchain/blob/95d6030876fb19f6836c6c6eeb41273cf7c30d93/chia/cmds/farm_funcs.py#L246-L247)

      // Advanced info 
      if (!this.calculator) this.calculator = {
        timeFrame: 6,
        startDate: "today",
        plottingSpeed: 0.0,
        maxSize: 1014.0,
        unlimited: true,
        initNetSize: rawTotalNetSpace, // EiB 
        growthRate: 15,
        unbounded: false,
        exponentialGrowth: 30,
        stabilization: 150,
        stableDaily: 5.000,
        timeFrameUnit: "6month",
        initSizeUnit: "gib",
        plottingSpeedUnit: "gib",
        maxSizeUnit: "gib",
        initNetSizeUnit: "eib",
        growthRatePeriod: "weekly",
        stableDailyUnit: "pib",
        XCHprice: 500, // TODO: get real time chia price

      };
      this.calculator.totalNetSpace = totalNetSpace.toFixed(2);
      this.calculator.ownedNetSpace = ownedNetSpace.toFixed(5);
      this.calculator.initSize = 101.4 * nPlot;
      this.calculator.estimatedEarning = {
        XCH: {
          hour: 2 / (expectTimeWin / 60),
          day: 2 / (expectTimeWin / (60 * 24)),
          month: 2 / (expectTimeWin / (60 * 24 * 30)),
        },
        USD: {
          hour: 2 / (expectTimeWin / 60) * this.calculator.XCHprice,
          day: 2 / (expectTimeWin / (60 * 24)) * this.calculator.XCHprice,
          month: 2 / (expectTimeWin / (60 * 24 * 30)) * this.calculator.XCHprice,
        }
      };

      this.calculator.expectTimeWin = (nPlot == 0) ? "Never" : this.formatTime(expectTimeWin);
      if (this.calculator.maxSize < this.calculator.initSize) this.calculator.maxSize = this.calculator.initSize;

      var netSpaceData = [];
      var plotSizeData = [];
      var ownedSpaceData = [];
      var dailyEarningData = [];
      var totalEarningData = [];
      var timeFrameCategory = [];

      function get_days(startDate, n, unit) {
        var date1, date2;
        if (startDate == "today") {
          date1 = new Date();
          date2 = new Date();
        } else {
          date1 = new Date(2021, 4, 2);
          date2 = new Date(2021, 4, 2);
        }
        unit = unit.slice(1);
        if (unit == "year") {
          date2.setFullYear(date1.getFullYear() + n);
        } else if (unit == "month") {
          date2.setMonth(date1.getMonth() + n);
        }
        var timeDif = date2.getTime() - date1.getTime();
        return Math.floor(timeDif / (1000 * 3600 * 24));
      }

      var i;
      var nDays = get_days(this.calculator.startDate, parseInt(this.calculator.timeFrameUnit), this.calculator.timeFrameUnit);
      var startDate;
      if (this.calculator.startDate == "today") {
        startDate = new Date()
      } else {
        startDate = new Date(2021, 4, 2)
      }
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
            newSize = newSize + this.calculator.plottingSpeed;
          }
        } else {
          newSize = newSize + this.calculator.plottingSpeed;
        }
        plotSizeData.push([timeFrameCategory[i], newSize.toFixed(3)])
      }

      // graph of owned space 
      for (i = 0; i < nDays; i++) {
        var newOwnedSpace = plotSizeData[i][1] / (netSpaceData[i][1] * Math.pow(1024, 3)) * 100; // percentage 
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
      this.calculator.totalEarningUSD = this.calculator.XCHprice * this.calculator.totalXCH;

      this.calculator.calculatorMap = {
        series: [{
          name: "Network Space",
          data: netSpaceData,
        },
        {
          name: "Size of Plots",
          data: plotSizeData,
        },
        {
          name: "Owned Space",
          data: ownedSpaceData,
        },
        {
          name: "Daily Earning",
          data: dailyEarningData,
        },
        {
          name: "Total Earning",
          data: totalEarningData,
        }
        ],
        chartOptions: {
          chart: {
            type: "line",
            height: 400,
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
                formatter: function (val) {
                  return val + " (EiB)"
                }
              },
            },
            {
              title: {
                formatter: function (val) {
                  return val + " (GiB)"
                }
              },
            },
            {
              title: {
                formatter: function (val) {
                  return val + " (%)"
                }
              },
            },
            {
              title: {
                formatter: function (val) {
                  return val + " (XCH)"
                }
              },
            },
            {
              title: {
                formatter: function (val) {
                  return val + " (XCH)"
                }
              },
            }
            ]
          }
        }
      }
    }
}</script>