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

