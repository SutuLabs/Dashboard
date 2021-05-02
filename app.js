Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
var app = new Vue({
    el: '#app',
    data: function () {
        let notes = JSON.parse(localStorage.getItem("NOTES") || JSON.stringify({}));

        return {
            farm: null,
            plot: null,
            options: {
                chart: {
                    id: 'vuechart-example'
                },
                xaxis: {
                    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
                }
            },
            series: [{
                name: 'series-1',
                data: [30, 40, 45, 50, 49, 60, 70, 91]
            }],
            columns: [
                {
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
                });

        }
    },
    computed: {},
})