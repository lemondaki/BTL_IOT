//-----------require modules to use-----------//
var mysql = require('mysql');
var express = require('express');
var mqtt = require('mqtt');
   
//----------khởi tạo server express js--------//
const app = express();
app.use(express.static('./public'));    // có quyền truy cập vào thư mục công khai 
app.set('view engine', "ejs");
app.set('views', './views');
var server = require('http').Server(app);
var io = require("socket.io")(server);     // yêu cầu thư viện socket.io cho server
server.listen(5500);          // server lắng nghe trên port 5500, nếu có resquest sẽ trả về respond     
app.get('/', (req, res) => {
    res.render('home');     // Render ra content HTML từ file home.ejs
});


//----------- khai báo kết nối database mysql -------------//
var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ducducduc",
    database: "mcb"
});


//-------------- kết nối server mqtt hivemq và subscribe vào topic -------------//
var client = mqtt.connect('mqtt://broker.hivemq.com'); 
client.on('connect', function () {
    console.log('Connected to Mqtt Broker Hivemq');
});
client.on('error', function (error) { 
    console.log(error);
});
client.on('connect', function () {
    client.subscribe("MCB/sensor/temperature/humidity/light"); 
    console.log("Client has subscribed successfully");
});
 

//--------------server lắng nghe client connection, nếu có sẽ thực hiện hàm------------//
io.on("connection", (socket) => { 
    console.log('user connected');
    socket.on("Led", function (data) {
        client.publish('MCB/device/led', data);
        io.sockets.emit("statusLed", data);  
    })
    socket.on("Air", function (data) {
        client.publish('MCB/device/air', data);
        io.sockets.emit("statusAir", data);
    }) 
    socket.on('disconnect', () => { 
        console.log('user disconnect');   
    }) 
}); 


//-----------------Kết nối database và tạo ra 1 TABLE mới--------------//
database.connect(function (err) { 
    if (err) throw err;
    console.log("🟢 Connected to Mysql database!");
    var sql = "CREATE TABLE IF NOT EXISTS datasensor(ID int(10) not null primary key auto_increment, Temperature int(3) not null, Humidity int(3) not null, Light int(5) not null,Create_at datetime default CURRENT_TIMESTAMP not null)"
    database.query(sql, function (err) {
        if (err)
            throw err;
        console.log("Table created");
    });
})


//-------nhận dữ liệu từ server mqtt hivemq và emit-gửi dữ liệu cho client qua websocket-------//
let temp, humi, light;
let objData = {};
client.on('message', function (topic, message) {  
        objData = JSON.parse(message);
        temp = objData.Temperature;
        humi = objData.Humidity;
        light = objData.Light; 
        io.sockets.emit('fulldata', objData);           // emit-gửi data cho client
          
        // lưu dữ liệu vào database  
        if (temp && humi && light) { 
            var sql = `INSERT INTO datasensor (Temperature,Humidity,Light) VALUES (${temp}, ${humi},${light})`;
            // let showtop = `SELECT * FROM datasensor ORDER BY Temperature DESC LIMIT 5`;
            database.query(sql, function (err, result) {
                if (err) throw err;
                console.log(`✔ INSERTED: Temp:${temp}, Humidi:${humi}, Light:${light}`); 
            });  
        }  
})

 
 