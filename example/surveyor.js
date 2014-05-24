'use strict';

var readline = require('readline');
var UltrasonicSensor = require('../index.js');
var util = require('util');

function Surveyor(echoPin, triggerPin) {
    this.ultrasonicSensor = new UltrasonicSensor(echoPin, triggerPin);
    this.min = Infinity;
    this.max = -Infinity;
    this.correct = 0;
    this.incorrect = 0;
    this.start = Date.now();
}

Surveyor.prototype.main = function () {
    var self = this;

    setTimeout(function () {
        var distanceCm = self.ultrasonicSensor.getDistanceCm();

        if (distanceCm === -1) {
            self.incorrect += 1;
        } else {
            self.correct += 1;

            self.setMax(distanceCm);
            self.setMin(distanceCm);
        }

        self.print(distanceCm);

        self.main();
    }, 60);
};

Surveyor.prototype.print = function (distanceCm) {
    var format = 'distance: %s, min: %s, max: %s, correct: %d, incorrect: %d ' +
        '(%s seconds)';

    var min = this.min.toFixed(2);
    var max = this.max.toFixed(2);
    var time = ((Date.now() - this.start) / 1000).toFixed(2);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    var message = util.format(
        format, distanceCm.toFixed(2), min, max, this.correct, this.incorrect,
        time
    );

    process.stdout.write(message);
};

Surveyor.prototype.setMax = function (distanceCm) {
    if (distanceCm > this.max) {
        this.max = distanceCm;
    }
};

Surveyor.prototype.setMin = function (distanceCm) {
    if (distanceCm < this.min) {
        this.min = distanceCm;
    }
};

function parsePin(string, defaultPin) {
    var pin = parseInt(string, 10);

    if (isNaN(pin)) {
        return defaultPin;
    }

    return pin;
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('echoPin (default 24): ', function (string) {
    var echoPin = parsePin(string, 24);

    rl.question('triggerPin (default 23): ', function (string) {
        var triggerPin = parsePin(string, 23);

        rl.close();

        new Surveyor(echoPin, triggerPin).main();
    });
});
