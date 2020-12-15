import _ from "lodash";

export function isNullOrEmpty(obj: any) {
    return _.isNull(obj) || _.isEmpty(obj);
}
/**
 * 获取格式化的时间
 * yyyy-MM-dd HH:mm:ss
 * @param {Date} originDate
 */
export function getFormatDate(originDate: Date | null = null) {
    var date = originDate ? originDate : new Date();
    var month: number | string = date.getMonth() + 1;
    var strDate: number | string = date.getDate();
    var hour: number | string = date.getHours();
    var minute: number | string = date.getMinutes();
    var second: number | string = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }
    var currentDate =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        strDate +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second;
    return currentDate;
}
