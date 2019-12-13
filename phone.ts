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
    for (let index = 0; index <= 4; index++) {
        led.plot(index, 2)
    }
    for (let index2 = 0; index2 <= 9; index2++) {
        plotIndex(15 + index2, index2 < code.length)
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
radio.setGroup(1)
lastPulseMs = 0
code = ""
pulseCount = 0
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
        for (let index = 0; index < 1; index++) {
            radio.sendNumber(codeNumber)
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
    codeDots()
})