let codeNumber = -1
let lastDigitMs = 0
let col = 0
let row = 0
let code = ""
let pulseCount = 0
let lastPulseMs = 0

function reset() {
    codeNumber = -1;
    code = ""
    lastPulseMs = 0
    pulseCount = 0;
    basic.clearScreen()
}
reset();

// pulse edge tracking
pins.onPulsed(DigitalPin.P0, PulseValue.High, function () {
    led.plot(0, 0)
})
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

function sendCode() {
    for (let index = 0; index < 2; index++) {
        const b = control.createBuffer(5);
        b[0] = escape.CODE;
        b.setNumber(NumberFormat.UInt32LE, 1, codeNumber);
        radio.sendBuffer(b);
        basic.pause(10)
    }
}

// pulse decoding
basic.forever(function () {
    if (lastPulseMs > 0
        && input.runningTime() - lastPulseMs >= 250) {
        // received a digit
        led.plot(1, 0)
        // 0 is encoded as 10 pulses
        if (pulseCount == 10)
            pulseCount = 0
        code += convertToText(pulseCount)
        lastPulseMs = 0
        lastDigitMs = input.runningTime()
    } else if (lastPulseMs == 0
        && code.length > 0
        && (code.length == 10 || input.runningTime() - lastDigitMs >= 3000)) {
        led.plot(2, 0)
        codeNumber = parseFloat(code)
        basic.clearScreen();
        sendCode();
        basic.pause(1000);
        reset();
    } else {
        led.unplot(1, 0)
        led.unplot(2, 0)
    }
});

// display loop
basic.forever(function () {
    if (codeNumber > -1) {
        led.toggle(Math.randomRange(0, 4), Math.randomRange(0, 4))
    } else if (code.length) // display last digit
        basic.showString(code[code.length - 1]);
    else // waiting for numbers
        basic.showString("-");
})