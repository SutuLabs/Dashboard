export default {

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

  deletePlot(machineName: string, plotId: string) {

    const url = `http://10.177.0.165:5000/server/plot?name=${machineName}&id=${plotId}`;
    const username = 'test';
    const password = 'test';

    const headers = new Headers();

    headers.append('Content-Type', 'text/json');
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    return fetch(url, {
      method: 'DELETE',
      headers: headers,
    });
  },

  save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  sortDisks(machine: { [id: string]: [] }) {
    if (machine.disks) machine.disks.sort((a: { [id: string]: string }, b: { [id: string]: string }) => a.path.localeCompare(b.path));
    return machine;
  },

  stopRefresh(intervals: number[]) {
    for (let i = 0; i < intervals.length; i++) {
      clearInterval(intervals[i]);
    }
    return []; 
  },
}