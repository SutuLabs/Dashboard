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
        if (time < 1) return "少于一分钟";
        else return "大约 " + time.toFixed(0).toString() + " 分钟";
      } else {

        if (min < 1) return hour.toString() + " 小时";
        else return hour.toString() + " 小时 " + min.toString() + " 分钟";
      }
    } else if (day < 31) {
      return day.toFixed(0).toString() + " 天";
    } else {
      const month = Math.floor(day / 30);
      const temp_day = Math.floor(day - month * 30);
      if (month < 12) {
        return month.toString() + " 个月 " + temp_day.toString() + " 天";
      } else {
        const year = Math.floor(day / 365);
        if (year < 1) return "近一年"
        else {
          const temp_month = Math.floor((day - year * 365) / 30);
          if (temp_month < 1) return year.toString() + " 年";
          else {
            return year.toString() + " 年 " + temp_month.toString() + " 个月";
          }
        }
      }
    }
  }
}