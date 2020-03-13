class DateUtils {
    /**
     * UTC转换时间格式
     * @param {*} date 
     * @param {*} formateStr 
     */
    formate (date, zone, formateStr = 'yyyy-MM-dd  hh:mm:ss') {
        if (zone) {
            let localUtc = new Date().getTimezoneOffset() * 60 //（方法是获取分钟）
            date = date - localUtc
        }
        if (typeof date === 'number') {
            date = new Date(date * 1000)
        }
        if (typeof date === 'string') {
            date = new Date(date)
        }
        const o = {
          'M+': date.getMonth() + 1,                    //月份
          'd+': date.getDate(),                         //日
          'h+': date.getHours(),     //小时
          'm+': date.getMinutes(),                      //分
          's+': date.getSeconds(),                      //秒
          'q+': Math.floor((date.getMonth() + 3) / 3),  //季度
          'S': date.getMilliseconds()                   //毫秒
        }
        if (/(y+)/.test(formateStr)) {
          formateStr = formateStr.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))          
        }
        for (let k in o) {
          if (new RegExp('(' + k + ')').test(formateStr)) {
            formateStr = formateStr.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))            
          }
        }
        return formateStr
    }
}

export default new DateUtils()
