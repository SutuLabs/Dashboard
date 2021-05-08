Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
var app = new Vue({
    el: '#app',
    data: function () {
        let data = JSON.parse(localStorage.getItem("DATA") || JSON.stringify({}));

      return {
        farm: data.farm,
        plot: data.plot,

        diskMap: data.diskMap,
        errors: data.errors,
        events: data.events,
        calculator: null,
        nPlot: 1,
        activeTab: 0, 
      }
    },
    mounted: function () {
        this.load();
        setInterval(() => {
            this.getInfo('servers')
                .then(response => response.json())
                .then(json => {
                    var f = json.find(_ => _.name == 'Farmer');
                    var p = json.find(_ => _.name == 'Plotter');
                    this.sortDisks(f);
                    this.sortDisks(p);
                    Object.assign(this.farm, f);
                    Object.assign(this.plot, p);
                    this.calcCpuMap(this.farm);
                    this.calcCpuMap(this.plot);
                });
            this.getInfo('errors')
                .then(response => response.json())
                .then(json => {
                    this.errors = json;
                });
            this.getInfo('events')
                .then(response => response.json())
                .then(json => {
                    this.events = json;
                });
        }, 5000);
        setInterval(() => {
            this.save();
        }, 5000);
    },
    methods: {
        getInfo(path) {

            let url = `http://10.177.0.165:5000/server/${path}`;
            let username = 'test';
            let password = 'test';

            let headers = new Headers();

            headers.append('Content-Type', 'text/json');
            headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

            return fetch(url, {
                method: 'GET',
                headers: headers,
            });
        },
        load() {
            this.getInfo('plotter')
                .then(response => response.json())
                .then(json => {
                    this.plot = json;
                    this.sortDisks(this.plot);
                    this.plot.jobs.forEach(_ => _.progress = this.calcProgress(_.phase))
                    this.calcCpuMap(this.plot);
                    this.calcFarmPlotMap();
                });
            this.getInfo('farmer')
                .then(response => response.json())
                .then(json => {
                    this.farm = json;
                    this.sortDisks(this.farm);
                    this.calcCpuMap(this.farm);
                    this.calcFarmPlotMap();
                });
            this.calculate(); 
        },
        save() {
            localStorage.setItem("DATA", JSON.stringify({
                farm: this.farm,
                plot: this.plot,
                diskMap: this.diskMap,
                errors: this.errors,
                events: this.events,
            }));
        },
        sortDisks(machine) {
            if (machine.disks) machine.disks.sort((a, b) => a.path.localeCompare(b.path));
        },
        calcProgress(phase) {
            const p = Number(phase[0]);
            const n = Number(phase[2]);
            if (p == 1) return n * 5;
            if (p == 2) return 35 + n * 3;
            if (p == 3) return 56 + n * 5;
            if (p == 4) return 98;
        },
        calcCpuMap(machine) {
            machine.cpuMap = {
                data: [{
                    name: 'Cpu',
                    data: machine.cpus.map(_ => 100 - _),
                }],
                chartOptions: {
                    chart: {
                        type: 'bar',
                        height: 150
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            colors: {
                                ranges: [{
                                    from: 0,
                                    to: 100,
                                    color: "#FF0000"
                                }]
                            },
                            columnWidth: '55%',
                            endingShape: 'rounded'
                        },
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent']
                    },
                    xaxis: {
                        categories: machine.cpus.map((_, i) => i + 1),
                    },
                    yaxis: {
                        title: {
                            text: 'CPU Usage'
                        },
                        max: 100,
                        min: 0,
                        decimalsInFloat: 0,
                    },
                    fill: {
                        opacity: 1
                    },
                    tooltip: {
                        y: {
                            formatter: function (val) {
                                return val + " %"
                            }
                        }
                    }
                }
            };
        },
        calcFarmPlotMap() {
            if (!this.farm || !this.plot) return;
            const pn = this.farm.farm.plotCount;
            const tt = 12 + 40;
            const plots = this.plot.jobs.map(_ => Number(_.phase[0])).sort((a, b) => b - a);
            const series = new Array(10).fill().map((_, rowi) => ({
                name: rowi + 1,
                data: new Array(tt).fill().map((_, coli) => {
                    const idx = coli * 10 + rowi;
                    if (idx < pn) return 6;
                    if (idx - pn >= plots.length) return 0;
                    const curplot = plots[idx - pn];
                    return curplot;
                })
            }));


            this.diskMap = {
                series,
                chartOptions: {
                    chart: {
                        height: 350,
                        type: 'heatmap',
                    },
                    plotOptions: {
                        heatmap: {
                            shadeIntensity: 0.5,
                            radius: 0,
                            // useFillColorAsStroke: true,
                            colorScale: {
                                ranges: [{
                                        from: 0,
                                        to: 0,
                                        name: 'Empty',
                                        color: '#DDDDDD'
                                    },
                                    {
                                        from: 1,
                                        to: 1,
                                        name: 'Phase 1',
                                        color: '#FF0000'
                                    },
                                    {
                                        from: 2,
                                        to: 2,
                                        name: 'Phase 2',
                                        color: '#0000FF'
                                    },
                                    {
                                        from: 3,
                                        to: 3,
                                        name: 'Phase 3',
                                        color: '#FFB200'
                                    },
                                    {
                                        from: 4,
                                        to: 4,
                                        name: 'Phase 4',
                                        color: '#006600'
                                    },
                                    {
                                        from: 5,
                                        to: 5,
                                        name: 'Moving',
                                        color: '#128FD9'
                                    },
                                    {
                                        from: 6,
                                        to: 6,
                                        name: 'Harvesting',
                                        color: '#00A100'
                                    },
                                ]
                            }
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        width: 1
                    },
                    title: {
                        text: '磁盘工作情况'
                    },
                },
            };
        },
        humanize(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
        getDiskProgressType(used, size) {
            const perc = used / size;
            if (perc < 0.5) return 'success';
            if (perc < 0.7) return 'warning';
            return 'danger';
        },
        calculate() {
            const unitPlotSize = 101.4; 
            var nPlot = parseInt(this.nPlot); 
            var rawTotalNetSpace = this.farm.node.space; //EiB
            var totalNetSpace = 0; 
            totalNetSpace = parseFloat(rawTotalNetSpace)*1024; 
            var ownedNetSpace = (nPlot*unitPlotSize)/(totalNetSpace*1024*1024)*100; 
            var proportion = (nPlot*unitPlotSize)/(totalNetSpace*1024*1024)
            var averageBlockTime = 18.75; // in seconds
            var expectTimeWin = ((averageBlockTime/60)/proportion); // in minutes  

            // Advanced info 
            if(!this.calculator) {
                this.calculator = {
                    totalNetSpace: totalNetSpace.toFixed(2),
                    ownedNetSpace: ownedNetSpace.toFixed(5),
                    expectTimeWin: expectTimeWin.toFixed(2), 
                    timeFrame: 6, 
                    startDate: "today", 
                    initSize: 101.4*nPlot,
                    plottingSpeed: 0.0, 
                    maxSize: 1014.0, 
                    unlimited: true, 
                    initNetSize: parseFloat(rawTotalNetSpace), // EiB 
                    growthRate: 15, 
                    unbounded: false, 
                    exponentialGrowth: 30, 
                    stabilization: 150, 
                    stableDaily: 5.000, 
                }
            } else {
                this.calculator.totalNetSpace = totalNetSpace.toFixed(2);
                this.calculator.ownedNetSpace = ownedNetSpace.toFixed(5);
                this.calculator.expectTimeWin = expectTimeWin.toFixed(2); 
                this.calculator.initSize = 101.4*nPlot;
            }

            var netSpaceData = []; 
            var plotSizeData = []; 
            var ownedSpaceData = []; 
            var dailyEarningData = []; 
            var totalEarningData = []; 
            var timeFrameCategory = []; 
            
            function get_days(nMonth) {
                var date1 = new Date(); 
                var date2 = new Date(); 
                date2.setMonth(parseInt(date1.getMonth())+parseInt(nMonth)); 
                var timeDif = date2.getTime() - date1.getTime(); 
                return (timeDif/(1000 * 3600 * 24)).toFixed(0); 
            }

            var i; 
            var nDays = get_days(parseInt(this.calculator.timeFrame)); 
            for(i = 0; i < nDays; i++) {
                var date = new Date();
                timeFrameCategory.push(date.setDate(new Date().getDate()+i)); 
            }

            // graph of network space 
            var prevDayNetSpace = parseFloat(this.calculator.initNetSize); 
            for(i = 0; i < nDays; i++) {
                if (this.calculator.unbounded) {
                    if(i) {
                        prevDayNetSpace = prevDayNetSpace*(1+parseFloat(this.calculator.growthRate)/100/7);
                    } 
                } else {
                    if (i < parseInt(this.calculator.exponentialGrowth)) {
                        prevDayNetSpace = prevDayNetSpace*(1+parseFloat(this.calculator.growthRate)/100/7); 
                    } else if (i < parseInt(this.calculator.exponentialGrowth) + parseInt(this.calculator.stabilization)) {
                        prevDayNetSpace = prevDayNetSpace + parseFloat(this.calculator.stableDaily)/1024; 
                    } 
                };
                netSpaceData.push([timeFrameCategory[i], prevDayNetSpace.toFixed(3)]);
            };

            // graph of size of plots 
            var newSize = parseFloat(this.calculator.initSize)
            for(i = 0; i < nDays; i++) {
                if(!this.calculator.unlimited) {
                    if(newSize+parseFloat(this.calculator.plottingSpeed) <= parseFloat(this.calculator.maxSize)) {
                        newSize = newSize + parseFloat(this.calculator.plottingSpeed); 
                    }
                } else {
                    newSize = newSize + parseFloat(this.calculator.plottingSpeed); 
                }
                plotSizeData.push([timeFrameCategory[i], newSize.toFixed(3)])
            }

            // graph of owned space 
            for(i = 0; i < nDays; i++) {
                var newOwnedSpace = plotSizeData[i][1]/(netSpaceData[i][1]*Math.pow(1024,3)) *100; // percentage 
                ownedSpaceData.push([timeFrameCategory[i], newOwnedSpace]); 
            }

            // graph of daily earnings 
            for(i = 0; i < nDays; i++) {
                var dailyProportion = plotSizeData[i][1]/(netSpaceData[i][1]*Math.pow(1024,3)); 
                var dailyEarning = 2*(1-Math.pow((1-dailyProportion),4608)); 
                dailyEarningData.push([timeFrameCategory[i], dailyEarning]);
            }

            // graph of total earnings
            var tempSum = 0;  
            for(i = 0; i < nDays; i++) {
                tempSum = tempSum+dailyEarningData[i][1];
                totalEarningData.push([timeFrameCategory[i], tempSum]);
            }
            this.calculator.totalXCH = totalEarningData[nDays-1][1];
            this.calculator.XCHprice = 500;

            this.calculator.calculatorMap = {
                series: [
                    {
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
                    chart:{
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
                    }, 
                    yaxis: [
                        {
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
                    tooltip: {
                        y: [{
                            title: {
                                formatter: function (val) {return val + " (EiB)"}
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {return val + " (GiB)"}
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {return val + " (%)"}
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {return val + " (XCH)"}
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {return val + " (XCH)"}
                            },
                        }]
                    }
                }
            }
        }
    },
    computed: {},
})