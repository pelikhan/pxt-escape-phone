pins.onPulsed(DigitalPin.P0, PulseValue.High, function () {
    led.plot(0, 0)
})
function plotIndex(i: number, on: boolean) {
    row = Math.idiv(i, 5)
    col = i % 5
    if (on) {
        led.plot(col, row)
    } else {
        led.unplot(col, row)
    }
}
function codeDots() {
    if (code.length)
        basic.showString(code[code.length - 1]);
    else {
        basic.showString("-");
    }
}

pins.onPulsed(DigitalPin.P0, PulseValue.Low, function () {
    led.unplot(0, 0)
    if (lastPulseMs == 0) {
        pulseCount = 0
        lastPulseMs = input.runningTime()
    } else if (input.runningTime() - lastPulseMs > 85) {
        pulseCount += 1
        lastPulseMs = input.runningTime()
    }
})
let codeNumber = 0
let lastDigitMs = 0
let col = 0
let row = 0
let pulseCount = 0
let code = ""
let lastPulseMs = 0
lastPulseMs = 0
code = ""
pulseCount = 0

// decoding
basic.forever(function () {
    if (lastPulseMs > 0 && input.runningTime() - lastPulseMs >= 250) {
        led.plot(1, 0)
        if (pulseCount == 10) {
            pulseCount = 0
        }
        code = "" + code + convertToText(pulseCount)
        lastPulseMs = 0
        lastDigitMs = input.runningTime()
    } else if (lastPulseMs == 0 && (code.length > 0 && (code.length == 10 || input.runningTime() - lastDigitMs >= 3000))) {
        led.plot(2, 0)
        codeNumber = parseFloat(code)
        for (let index = 0; index < 2; index++) {
            const b = control.createBuffer(5);
            b[0] = escape.CODE;
            b.setNumber(NumberFormat.UInt32LE, 1, codeNumber);
            radio.sendBuffer(b);
            basic.pause(10)
        }
        basic.clearScreen()
        basic.showNumber(codeNumber)
        basic.clearScreen()
        code = ""
        lastPulseMs = 0
    } else {
        led.unplot(1, 0)
        led.unplot(2, 0)
    }
});

// display
basic.forever(function () {
    codeDots()
})