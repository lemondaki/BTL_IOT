
//----------- File này để publish test thử:-----------// 
const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');
client.on("connect", function () {
    setInterval(function () {
        let temp = Math.floor(Math.random() * 50);
        let humi = Math.floor(Math.random() * 50);
        let light = Math.floor(Math.random() * 50);
        let objdata = {
            Temperature: temp, 
            Humidity: humi, 
            Light: light 
        } 
        client.publish('MCB/sensor/temperature/humidity/light', JSON.stringify(objdata));
        console.log(objdata);
    }, 2000)
});
