export default {
  farm: null,
  plot: null,
  diskMap: null, 
  errors: null,
  events: null,
  intervals: [],

  getInfo(path: string) {

    const url = `http://10.177.0.165:5000/server/${path}`;
    const username = 'test';
    const password = 'test';

    const headers = new Headers();

    headers.append('Content-Type', 'text/json');
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    return fetch(url, {
      method: 'GET',
      headers: headers,
    });
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
  sortDisks(machine: { [id: string]: [] }) {
    if (machine.disks) machine.disks.sort((a: { [id: string]: string }, b: { [id: string]: string }) => a.path.localeCompare(b.path));
  },
  stopRefresh() {
    for (let i = 0; i < this.intervals.length; i++) {
      clearInterval(this.intervals[i][0]);
    }
    this.intervals.length = 0;
  },
}