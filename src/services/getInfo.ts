export default {
  baseUrl: `http://10.177.0.165:5000`,

  getInfo(path: string) {
    const url = `${this.baseUrl}/server/${path}`;

    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  },

  uploadFile(path: string, formData: FormData): Promise<Response> {
    const url = `${this.baseUrl}/server/${path}`;

    return fetch(url, {
      method: 'PUT',
      body: formData,
      headers: this.getHeaders(false),
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

  cleanTemporary(names: string[]) {
    const url = `${this.baseUrl}/server/temporary`;

    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(names),
    });
  },

  startHarvesterDaemons(names?: any[]) {
    const url = `${this.baseUrl}/server/daemons/harvesters`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(names),
    });
  },

  mountAll(names?: any[]) {
    const url = `${this.baseUrl}/server/mount`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(names),
    });
  },

  createPartition(host: string, block: string, label: string) {
    const url = `${this.baseUrl}/server/create-part?host=${host}&block=${block}&label=${label}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  renamePartition(host: string, block: string, oldLabel: string, newLabel: string) {
    const url = `${this.baseUrl}/server/rename-part?host=${host}&block=${block}&oldLabel=${oldLabel}&newLabel=${newLabel}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  mountPartition(host: string, block: string, label: string) {
    const url = `${this.baseUrl}/server/mount-part?host=${host}&block=${block}&label=${label}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  unmountPartition(host: string, label: string) {
    const url = `${this.baseUrl}/server/unmount-part?host=${host}&label=${label}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  removeNtfsPartition(host: string, block: string) {
    const url = `${this.baseUrl}/server/remove-ntfs-part?host=${host}&block=${block}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  enableSmart(host: string, block: string) {
    const url = `${this.baseUrl}/server/enable-smart?host=${host}&block=${block}`;

    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  removePlotDir(host: string, path: string) {
    const url = `${this.baseUrl}/server/plot-dir?host=${host}&path=${path}`;

    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  },

  removePlots(host: string, plots: string[]) {
    const url = `${this.baseUrl}/server/plots?host=${host}`;

    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(plots),
    });
  },

  getHeaders(isJson = true): Headers {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const headers = new Headers();

    if (isJson) {
      headers.append('Content-Type', 'text/json');
    }

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

  getChiaPrice() {
    const url = `${this.baseUrl}/misc/prices`;

    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  },
}