//---------------import các function từ file main.js để sử dụng--------------//
import { OnOffAir, onOffLight, SaveStatusLight, SaveStatusAir } from "./main.js";

//connect den server 
var socket = io('http://192.168.0.114:5500/');

//---------------------------SOCKET IO ON EVENT--------------------------//
socket.on("fulldata", function (data) {
    document.querySelector('.temperature__value').innerText = data.Temperature;
    document.querySelector('.humidity__value').innerText = data.Humidity;
    document.querySelector('.light__value').innerText = data.Light;
})
//-----Socket io lắng nghe event + Save currentStatus to LocalStorage---------------//
socket.on("statusLed", function (data) {
    localStorage.setItem('statusLed', data);
    let currentStatus = localStorage.getItem('statusLed');
    SaveStatusLight(currentStatus);
})
SaveStatusLight(localStorage.getItem('statusLed'));


socket.on("statusAir", function (data) {
    localStorage.setItem('statusAir', data);
    let currentStatus = localStorage.getItem('statusAir');
    console.log(currentStatus);
    SaveStatusAir(currentStatus);
})
SaveStatusAir(localStorage.getItem('statusAir'));


//-------------------SOCKET IO EMIT EVENT--------------------------//
document.querySelector('.buttonToggleLight').onclick = function () {
    onOffLight();
    var statusLight = document.querySelector('.statusLight').innerText;
    socket.emit("Led", statusLight);
}

document.querySelector('.buttonToggleAir').onclick = function () {
    OnOffAir();
    var statusAir = document.querySelector('.statusBtnAir').innerText;
    socket.emit("Air", statusAir);
}

//--------------------------HIỂN THỊ ĐỒ THỊ CHART THEO DÕI-----------------//
var chart = Highcharts.chart('chart', {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Đồ thị quan sát nhiệt độ, độ ẩm, ánh sáng',
        align: 'center'
    },
    subtitle: {
        text: 'Source: ductq',
        align: 'left'
    },
    xAxis: [{
        type: 'time',
        categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value} lux',
            style: {
                color: '#53A6D8'
            }
        },
        title: {
            text: 'Ánh sáng',
            style: {
                color: '#53A6D8'
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Độ ẩm',
            style: {
                color: '#000'
            }
        },
        labels: {
            format: '{value} %',
            style: {
                color: '#000'
            }
        }

    }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Nhiệt độ',
            style: {
                color: '#FE676E'
            }
        },
        labels: {
            format: '{value} °C',
            style: {
                color: '#FE676E'
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || // theme
            'rgba(255,255,255,0.25)'
    },
    series: [{
        name: 'Độ ẩm',
        type: 'column',
        yAxis: 1,
        color: '#BFB8DA',
        data: [],
        tooltip: {
            valueSuffix: '%'
        }

    }, {
        name: 'Nhiệt độ',
        type: 'spline',
        color: '#FE676E',
        yAxis: 2,
        data: [],
        marker: {
            enabled: false
        },
        tooltip: {
            valueSuffix: '°C'
        }

    }, {
        name: 'Ánh sáng',
        type: 'spline',
        color: '#53A6D8',
        dashStyle: 'shortdot',
        data: [],
        tooltip: {
            valueSuffix: ' lux'
        }
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    floating: false,
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    x: 0,
                    y: 0
                },
                yAxis: [{
                    labels: {
                        align: 'right',
                        x: 0,
                        y: -6
                    },
                    showLastLabel: false
                }, {
                    labels: {
                        align: 'left',
                        x: 0,
                        y: -6
                    },
                    showLastLabel: false
                }, {
                    visible: false
                }]
            }
        }]
    }
});

//---------------- NHẬN DỮ LIỆU QUA WEBSOCKET VÀ NẠP VÀO CÁC ĐỒ THỊ DƯỚI DẠNG MẢNG -----------//
let arrTemp = [];
let arrHumi = [];
let arrLight = [];
socket.on("fulldata", function (data) {
    if (arrTemp.length >= 10) arrTemp.shift();
    arrTemp.push(data.Temperature);
    chart.series[1].setData(arrTemp);

    if (arrHumi.length >= 10) arrHumi.shift();
    arrHumi.push(data.Humidity);
    chart.series[0].setData(arrHumi);

    if (arrLight.length >= 10) arrLight.shift();
    arrLight.push(data.Light);
    chart.series[2].setData(arrLight);
})


