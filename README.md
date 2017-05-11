### 1.显示时间和日期的插件
1.直接在页面引用jQuery就可用jQuery了
2.设置body的width和height可以定制popup页面的大小

完成了第一个Chrome Extension插件编写，重点是manifest和jQuery的引入，另外是图标的生成，使用png_convert自定义脚本
```
#!/bin/sh 
for i in "16X16" "48X48" "64X64" "128X128"
do
    convert -resize $i $1 $i.png 
done 
```

### 2.显示时间的插件
1.https://developer.chrome.com/extensions/manifest
可以查看完整的字段

### 3.Content Script 
```
{
  "manifest_version":2,
  "name":"点不到的搜索",
  "version":"1.0",
  "description":"恶作剧一下下",
  "content_scripts":[
    {
      "matches":["*://www.google.com.hk/*"],
      "js":["js/cannot_touch.js"]
    }
  ]
}

// cannot_touch.js挺有意思的啊
function btn_move(el, mouseLeft, mouseTop){
    var leftRnd = (Math.random()-0.5)*20;
    var topRnd = (Math.random()-0.5)*20;
    var btnLeft = mouseLeft+(leftRnd>0?100:-100)+leftRnd;
    var btnTop = mouseTop+(topRnd>0?30:-30)+topRnd;
    btnLeft = btnLeft<100?(btnLeft+window.innerWidth-200):(btnLeft>window.innerWidth-100?btnLeftwindow.innerWidth+200:btnLeft);
    btnTop = btnTop<100?( btnTop+window.innerHeight-200):(btnTop>window.innerHeight-100?btnTopwindow.innerHeight+200:btnTop);
    el.style.position = 'fixed';
    el.style.left = btnLeft+'px';
    el.style.top = btnTop+'px';
}
function over_btn(e){
    if(!e){
        e = window.event;
    }
    btn_move(this, e.clientX, e.clientY);
}
// document.getElementById('lst-ib').onmouseover = over_btn;
document.getElementsByName("btnK")[0].onmouseover = over_btn;
console.log(document.getElementsByName("btnK")[0].value)

```

### 4.请求跨域
浏览器是不允许跨域的，申请permissions可以实现跨域

### 5.常住后台
未读邮件数量/后台播放音乐等
也是申请了一个permissions，另外使用了一下chrome.browserAction.setIcon({path:'some where'})
还使用了background字段，不需要界面 
```
function httpRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET",url,true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            callback(true);
        }
    }
    xhr.onerror = function () {
        callback(false);
    }
    xhr.send();
}

setInterval(function () {
    httpRequest('https://www.google.com.hk/',function (status) {
        chrome.browserAction.setIcon({path:'images/' + (status?'on.png':'off.png')});
        console.log(status);
    });
},5000)
```

### 6.OptionPage
localStorage只能存储字符串，数组和对象要先转成字符串再存储
这次我们使用选项界面让用户进行设置，实现天气预报插件
```
  "options_page":"options.html"
```

### 7.页面间通信
chrome.runtime.connect 
chrome.runtime.onConnect 
chrome.runtime.sendMessage
chrome.runtime.onMessage
Chrome提供的大部分API不支持在content_scripts中运行，单runtime.sendMessage和runtime.onMessage可以

```
// manifest.json 
{
  "manifest_version":2,
  "name":"内部通信案例",
  "version":"1.0",
  "description":"就是一个内部通信案例",
  "browser_action":{
    "default_popup":"popup.html"
  },
  "background":{
    "scripts":[
      "js/background.js"
    ]
  }
}

// popup.html
<script src="js/popup.js"></script>

// popup.js
chrome.runtime.sendMessage('Hello', function(response){
    document.write(response);
});
// background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message == 'Hello'){
        sendResponse('Hello from background.');
    }
});

//完成了一个交互
```

### 8.Google翻译
```
{
  "manifest_version":2,
  "name":"谷歌翻译",
  "version":"1.0",
  "description":"选中翻译",
  "background":{
    "scripts":[
      "js/background.js"
    ]
  },
  "icons":{
    "16":"images/16X16.png"
  },
  "content_scripts":[
    {
      "matches":["*://*/*"],
      "js":["js/content.js"]
    }
  ],
  "permissions":[
    "contextMenus"
  ]
}

// content.js属于content_script
window.onmouseup = function () {
    var selection = window.getSelection();
    if(selection.anchorOffset != selection.extentOffset){
        chrome.runtime.sendMessage(selection.toString());
    }
}
// background.js 属于background
chrome.contextMenus.create({
    'type':'normal',
    'title':'使用Google翻译……',
    'contexts':['selection'],
    'id':'cn',
    'onclick':translate
});

function translate(info, tab) {
    var url = 'http://translate.google.com.hk/#auto/zh-CN/' + info.selectionText;
    window.open(url, '_blank');
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    chrome.contextMenus.update('cn',{
        'title':'使用谷歌翻译"' + message + '"'
    });
});
```

### 9.桌面提醒案例
```
// manifest.json
{
  "name": "桌面提醒",
  "manifest_version" : 2,
  "description": "测试啊测试",
  "version" : "1.0",
  "browser_action":{
    "default_icon":"images/16X16.png",
    "default_title":"测试桌面提醒",
    "default_popup":"window.html"
  },
  "permissions" : [
     "notifications"
  ]
}

// window.html
<body>
		<h1>案例一下</h1>
        <div class="sample">
            <button id="onlyimage">我的桌面提醒</button>
            <span>去粗取精,只实现图片桌面提醒</span>
        </div>

		<script src="main.js"></script>
        <script src="jquery.js"></script>
        <script src="onlyimage.js"></script>
	</body>


// onlyimage.js
var notificationID = 0;
var imageObject = {
    type: "image",
    title: "你有新的消息提醒",
    message: "来自Google的问候",
    iconUrl: chrome.runtime.getURL("/images/64X64.png"),
    imageUrl: chrome.runtime.getURL("/images/tahoe-320x215.png")
}

$(window).load(function(){
    $("#onlyimage").on('click', function () {
        chrome.notifications.create("id" + notificationID++, imageObject, createCallback);
    })
})


function createCallback(notificationID) {
    console.log('创建成功' + notificationID + " notification");
}
```

### 10.多功能搜索框omnibox
```
// manifest.json 
{
  "name":"多功能搜索框",
  "manifest_version":2,
  "description":"展示一下多功能搜索框",
  "version":"1.0",
  "omnibox":{"keyword":"usd"},
  "background":{
    "scripts":[
      "js/background.js"
    ]
  },
  "icons":{
    "16":"images/16X16.png"
  },
  "permissions":[
    "*://query.yahooapis.com/*"
  ]
}
// background.js
function httpRequest(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET",url,true);
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
            callback(xhr.responseText);
        }
    }
    xhr.send();
}

function updateAmount(amount, exchange) {
    amount = Number(amount);
    if(isNaN(amount) || !amount){
        exchange([{
            'content':'$1 = ￥' + price,
            'description': '$1 = ￥' + price
        },{
            'conent':'￥1 = $' + (1/price).toFixed(6),
            'description':'￥1 = $' + (1/price).toFixed(6)
        }]);
    }else{
        exchange([{
            'content': '$'+amount+' = ¥'+(amount*price).toFixed(2),
            'description': '$'+amount+' = ¥'+(amount*price).toFixed(2)
        },{
            'content': '¥'+amount+' = $'+(amount/price).toFixed(6),
            'description': '¥'+amount+' = $'+(amount/price).toFixed(6)
        }]);
    }
}

function gotoYahoo(text, disposition){
    window.open('http://finance.yahoo.com/q?s=USDCNY=X');
}

var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20Rate%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDCNY%22)&env=store://datatables.org/alltableswithkeys&format=json';
var price;

httpRequest(url, function(r){
    price = JSON.parse(r);
    price = price.query.results.rate.Rate;
    price = Number(price);
});

chrome.omnibox.setDefaultSuggestion({'description':'看看当前美元价格'});

chrome.omnibox.onInputChanged.addListener(updateAmount);

chrome.omnibox.onInputEntered.addListener(gotoYahoo);
```



### 11.下载页面所有图片
```
// manifest.json 
{
  "manifest_version":2,
  "name":"保存所有图片",
  "version":"1.0",
  "description":"保存当前页面所有的图片",
  "icons":{
    "16":"16X16.png"
  },
  "background":{
    "scripts":["background.js"],
    "persistent":false
  },
  "permissions":[
    "activeTab",
    "contextMenus",
    "downloads"
  ]
}

// background.js 
chrome.runtime.onInstalled.addListener(function(){
    chrome.contextMenus.create({
        'id':'saveall',
        'type':'normal',
        'title':'保存所有图片'
    });
});

chrome.contextMenus.onClicked.addListener(function(info,tab){
    if(info.menuItemId == 'saveall'){
        var anwser = confirm("确定下载吗");
        if(anwser==false)return;
        chrome.tabs.executeScript(tab.id,{file:'main.js'},function(results){
            if(results && results[0] && results[0].length){
                results[0].forEach(function(url){
                    chrome.downloads.download({
                        url:url,
                        conflictAction:'uniquify',
                        saveAs:false
                    });
                });
            }
        });
    }
});

// main.js
[].map.call(document.getElementsByTagName('img'),function(img){
    return img.src;
})
```

### 12.http server
