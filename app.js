Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
var app = new Vue({
    el: '#app',
    data: function () {
        let notes = JSON.parse(localStorage.getItem("NOTES") || JSON.stringify({}));

        return {
            farm: null,
            plot: null,

            diskMap: null,

            columns: [{
                    field: 'id',
                    label: 'ID',
                },
                {
                    field: 'tempDir',
                    label: 'tmp',
                },
                {
                    field: 'phase',
                    label: 'Phase',
                },
                {
                    field: 'memorySize',
                    label: 'mem',
                },
                {
                    field: 'wallTime',
                    label: 'wall',
                }
            ]
        }
    },
    mounted: function () {
        this.load();
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
                    console.log(json);
                    this.plot = json;
                    this.plot.jobs.forEach(_ => _.progress = this.calcProgress(_.phase))
                    this.calcCpuMap(this.plot);
                    this.calcFarmPlotMap();
                });
            this.getInfo('farmer')
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    this.farm = json;
                    this.calcCpuMap(this.farm);
                    this.calcFarmPlotMap();
                });

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
            console.log(machine.cpuMap)
        },
        calcFarmPlotMap() {
            if (!this.farm || !this.plot) return;
            const pn = this.farm.farm.plotCount;
            const tt = 12;
            const plots = this.plot.jobs.map(_ => Number(_.phase[0])).sort((a, b) => a - b);
            console.log(plots, this.plot.jobs);
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
                                        color: '#FFA100'
                                    },
                                    {
                                        from: 2,
                                        to: 2,
                                        name: 'Phase 2',
                                        color: '#FF00FF'
                                    },
                                    {
                                        from: 3,
                                        to: 3,
                                        name: 'Phase 3',
                                        color: '#FF0000'
                                    },
                                    {
                                        from: 4,
                                        to: 4,
                                        name: 'Phase 4',
                                        color: '#FFB200'
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
            console.log(this.diskMap);
        },

    },
    computed: {},
})