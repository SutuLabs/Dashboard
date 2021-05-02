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
        load() {

            let url = 'http://10.177.0.165:5000/server/info';
            let username = 'test';
            let password = 'test';

            let headers = new Headers();

            headers.append('Content-Type', 'text/json');
            headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

            fetch(url, {
                    method: 'GET',
                    headers: headers,
                })
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    this.plot = json.plot;
                    this.farm = json.farm;
                    this.plot.jobs.forEach(_ => _.progress = this.calcProgress(_.phase))
                    this.calcMap();
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
        calcMap() {
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