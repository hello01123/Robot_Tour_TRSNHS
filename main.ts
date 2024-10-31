
const minSpeed = 20;       // Minimum speed when close to the target
const maxSpeed = 40;      // Maximum speed when far from the target
const slowdownThreshold = 20;  // Start slowing down within this angle

function mturn(a:number) {
    pins.digitalWritePin(DigitalPin.P16, 1) //M1 Dir
    pins.digitalWritePin(DigitalPin.P14, 0) //M1 Dir
    a = Math.map(a, 0, 100, 0, 1023)
    if (a<0){a = 0}else if(a > 1023){a = 1023}
    pins.analogWritePin(AnalogPin.P15, a)
    pins.analogWritePin(AnalogPin.P13, a)
}
function mrturn(a: number) {
    pins.digitalWritePin(DigitalPin.P16, 0) //M1 Dir
    pins.digitalWritePin(DigitalPin.P14, 1) //M1 Dir
    a = Math.map(a, 0, 100, 0, 1023)
    if (a < 0) { a = 0 } else if (a > 1023) { a = 1023 }
    pins.analogWritePin(AnalogPin.P15, a)
    pins.analogWritePin(AnalogPin.P13, a)
}
function stop() {
    pins.analogWritePin(AnalogPin.P15, 0)
    pins.analogWritePin(AnalogPin.P13, 0)
    pins.digitalWritePin(DigitalPin.P16, 0) //M1 Dir
    pins.digitalWritePin(DigitalPin.P14, 0) //M2 Dir
}
function forward(duration:number) {
    const targetHeading = input.compassHeading()-1;
    let error = 10;
    let start_time = control.millis()
    while (true) {
        const currentHeading = input.compassHeading();
        error = targetHeading - currentHeading;

        if (error > 180) {
            error -= 360;
        } else if (error < -180) {
            error += 360;
        }

        const absError = Math.abs(error);

        // Map error to speed for directional control
        let speed = 20
        speed = Math.map(speed,0,100,0,1023)
        // Determine motor directions based on heading error
        if (error < -1) {
            // Corre-ct towards the left
            pins.digitalWritePin(DigitalPin.P16, 1); // M1 Dir
            pins.digitalWritePin(DigitalPin.P14, 1); // M1 Dir
            pins.analogWritePin(AnalogPin.P15, speed);
            pins.analogWritePin(AnalogPin.P13, Math.floor(speed * 0.5)); // Slightly lower speed for right motor
        } else if (error > 1) {
            // Correct towards the right
            pins.digitalWritePin(DigitalPin.P16,1); // M1 Dir
            pins.digitalWritePin(DigitalPin.P14, 1); // M1 Dir
            pins.analogWritePin(AnalogPin.P15, Math.floor(speed * 0.5)); // Slightly lower speed for left motor
            pins.analogWritePin(AnalogPin.P13, speed);
        } else {
            pins.digitalWritePin(DigitalPin.P16, 1); // M1 Dir
            pins.digitalWritePin(DigitalPin.P14, 1); // M1 Dir
            pins.analogWritePin(AnalogPin.P15, speed);
            pins.analogWritePin(AnalogPin.P13, speed);
        }
        if(control.millis() - start_time > duration){
            stop()
            break
        }
    }
}
basic.forever(function on_forever() { })

function turn(targetHeading:number) {
    let error = 10;
    while (error > 0){
    const currentHeading = input.compassHeading();
    let error = targetHeading - currentHeading;

    if (error > 180) {
        error -= 360;
    } else if (error < -180) {
        error += 360;
    }

    const absError = Math.abs(error);
    if (absError > 0) {  // Only turn if error is greater than 5 degrees
        let speed = Math.max(minSpeed, Math.floor(maxSpeed * absError / slowdownThreshold));
        speed = Math.min(speed, maxSpeed);  // Cap speed at maxSpeed

        if (error > 0) {
            mturn(speed);
        } else {
            mrturn(speed);
        }
    } else {
        stop();  // Stop when within 5 degrees of target
    }
}
}
forward(2000)

//pause(2000)
//stop()
//turn(90)