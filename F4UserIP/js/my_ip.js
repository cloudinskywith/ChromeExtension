function httpRequst(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET',url,true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState==4){
            callback(xhr.responseText);
        }
    }
    xhr.send();
}

httpRequst('http://www.liaobaocheng.com/my_ip',function (ip) {
    document.getElementById('ip_div').innerText = ip;
})