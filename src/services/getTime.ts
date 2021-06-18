export default {
  getEstimatedTime(initSize: number, rawTotalNetSpace: number, averageBlockTime = 18.75): string {
    const proportion = (initSize) / (rawTotalNetSpace * Math.pow(1024, 2));
    const expectTimeWin = ((averageBlockTime / 60) / proportion); // in minutes (reference:https://github.com/Chia-Network/chia-blockchain/blob/95d6030876fb19f6836c6c6eeb41273cf7c30d93/chia/cmds/farm_funcs.py#L246-L247)
    return this.formatTime(expectTimeWin);
  },

  formatTime(time: number): string {
    const day = time / (24 * 60);
    if (day < 1) {
      const hour = Math.floor(time / 60);
      const min = Math.floor(time - hour * 60);
      if (hour < 1) {
        if (time < 1) return "Less than 1 minute";
        else return "About " + time.toFixed(0).toString() + " minutes";
      } else {

        if (min < 1) return hour.toString() + " hours";
        else return hour.toString() + " hours " + min.toString() + " minutes";
      }
    } else if (day < 31) {
      return day.toFixed(0).toString() + " days";
    } else {
      const month = Math.floor(day / 30);
      const temp_day = Math.floor(day - month * 30);
      if (month < 12) {
        return month.toString() + " months " + temp_day.toString() + " days";
      } else {
        const year = Math.floor(day / 365);
        if (year < 1) return "Almost 1 year"
        else {
          const temp_month = Math.floor((day - year * 365) / 30);
          if (temp_month < 1) return year.toString() + " years";
          else {
            return year.toString() + " years " + temp_month.toString() + " months";
          }
        }
      }
    }
  }
}