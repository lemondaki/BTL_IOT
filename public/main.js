 //-------------function status Light On Off:------------//
var isTurnOnLight = false;
var isTurnOnAir = false;
function statusLightOff() {
    document.querySelector('.light__off').src = "/images/pic_bulboff.gif";
    document.querySelector('.control-light').classList.add('bg-info')
    document.querySelector('.control-light').classList.remove('bg-dark')
    document.querySelector('.circleBtnLight').style = `transform: translateX(2px)`;
    document.querySelector('.buttonToggleLight').style.backgroundColor = '#ccc';
    document.querySelector('.statusLight').textContent = 'OFF';
    isTurnOnLight = false;
}

function statusLightOn() {
    document.querySelector('.light__off').src = "/images/pic_bulbon.gif";
    document.querySelector('.control-light').classList.remove('bg-info')
    document.querySelector('.control-light').classList.add('bg-dark')
    document.querySelector('.circleBtnLight').style = `transform: translateX(25px)`;
    document.querySelector('.buttonToggleLight').style.backgroundColor = '#1ED760';
    document.querySelector('.statusLight').textContent = 'ON';
    isTurnOnLight = true;
}

function statusAirOff() {
    document.querySelector('.airConditioner__on').src = "/images/air.png";
    document.querySelector('.control-air').classList.add('bg-secondary')
    document.querySelector('.control-air').classList.remove('bg-dark')
    document.querySelector('.control-air').style = "border-top:1px solid transparent";
    document.querySelector('.circleBtnAir').style = `transform: translateX(2px)`;
    document.querySelector('.buttonToggleAir').style.backgroundColor = '#ccc';
    document.querySelector('.statusBtnAir').textContent = 'OFF';
    isTurnOnAir = false;
}

function statusAirOn() {
    document.querySelector('.control-air').classList.remove('bg-secondary')
    document.querySelector('.control-air').classList.add('bg-dark')
    document.querySelector('.control-air').style = "border-top:1px solid #fff";
    document.querySelector('.circleBtnAir').style = `transform: translateX(25px)`;
    document.querySelector('.buttonToggleAir').style.backgroundColor = '#1ED760';
    document.querySelector('.statusBtnAir').textContent = 'ON';
    isTurnOnAir = true;
}


//------------------Function Turn On Off light---------------//
function onOffLight() {
    if (isTurnOnLight) {
        if (confirm('B???n c?? mu???n t???t ????n kh??ng?')) {
            statusLightOff()
        }
    }
    else {
        if (confirm('B???n c?? mu???n b???t ????n kh??ng?')) {
            statusLightOn()
        }
    }
}

//---------------- Function Turn On Off Air Conditioner ------------//
function OnOffAir() {
    if (isTurnOnAir) {
        if (confirm('B???n c?? mu???n t???t ??i???u h??a kh??ng?')) {
            statusAirOff();
        }
    }
    else {
        if (confirm('B???n c?? mu???n b???t ??i???u h??a kh??ng?')) {
            statusAirOn();
        }
    }
}

//------------------ Function Save status Light when load page because currentStatus be saved in localStorage ---------------//
function SaveStatusLight(currentStatus) {
    if (currentStatus === "OFF") {
        statusLightOff();
        isTurnOnLight = false;
    }
    if (currentStatus === "ON") {
        statusLightOn();
        isTurnOnLight = true;
    }
}

//------------------ Function Save status AirConditionner when load page ---------------//
function SaveStatusAir(currentStatus) {
    if (currentStatus === "OFF") {
        statusAirOff();
        isTurnOnAir = false;
    }
    if (currentStatus === "ON") {
        statusAirOn();
        isTurnOnAir = true;
    }
}


//---------------- export: xu???t c??c function, ????? c?? th??? s??? d???ng c??c function ??? c??c file js kh??c ------------------//
export {
    statusLightOff, statusLightOn, statusAirOff, statusAirOn, OnOffAir, onOffLight, SaveStatusLight, SaveStatusAir
};

