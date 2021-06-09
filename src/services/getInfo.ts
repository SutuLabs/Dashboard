export default {
  baseUrl: `http://10.177.0.165:5000`,

  getInfo(path: string) {
    const url = `${this.baseUrl}/server/${path}`;

    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  },

  deletePlot(machineName: string, plotId: string) {
    const url = `${this.baseUrl}/server/plot?name=${machineName}&id=${plotId}`;

    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  },

  getPlotPlan() {
    const url = `${this.baseUrl}/server/plotplan`;

    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  },

  applyPlotPlan(plans?: any[]) {
    const url = `${this.baseUrl}/server/plotplan`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(plans),
    });
  },

  createPartition(host: string, block: string, label: string) {
    const url = `${this.baseUrl}/server/create-part?host=${host}&block=${block}&label=${label}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  getHeaders() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const headers = new Headers();

    headers.append('Content-Type', 'text/json');
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    return headers;
  },

  save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  sortDisks(machine: { [id: string]: [] }) {
    if (machine.disks) machine.disks.sort((a: { [id: string]: string }, b: { [id: string]: string }) => a.path.localeCompare(b.path));
  },

  stopRefresh(intervals: number[]) {
    for (let i = 0; i < intervals.length; i++) {
      clearInterval(intervals[i]);
    }
    return [];
  },
}