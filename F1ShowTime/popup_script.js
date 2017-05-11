var timeId = "time";
var dateId = "date";
var days = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六'];
var months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

var consoleGreeting = "hello from popup_script.js";

function setTimeAndDate(timeElement, dateElement){
    var date = new Date();
    var minutes = (date.getMinutes() < 10 ?'0':'') + date.getMinutes();
    var time = date.getHours() + ":" + minutes;
    var date = days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
    // timeElement.innerHTML = time;
    // dateElement.innerHTML = date;
    timeElement.text(time);
    dateElement.text(date);
}


console.log(consoleGreeting);
document.addEventListener("DOMContentLoaded",function(cl){
    // var timeElement = document.getElementById("time")
    // var dateElement = document.getElementById("date")
    // setTimeAndDate(timeElement,dateElement);
    // setTimeAndDate($("#time"),$("#date"));
})
$(function(){
    setTimeAndDate($("#time"),$("#date"));
});
