var soap = require('soap');
var EventEmitter = require('events');

var ERROR_CODES = {
    auth: 'Błąd uwierzytelnienia',
    noExists: 'Miejscowość nie istnieje w tej bazie danych',

}
class Client extends EventEmitter {
    constructor(url, key, range) {
        super();
        this.url = url;
        this.key = key;
        this.range = range;
        this.isReady = false;
        this.client = null;
        this.createClient();
    }
    createClient() {
        var self = this;
        soap.createClient(self.url, function (err, client) {
            self.emit('connect', err ? err : null);
            if (!err) {
                self.isReady = true;
                self.client = client;
            }
        });
    }
    getLightnings(coords) {
        var self = this;
        if (self.isReady) {

            if (!isEmpty(coords, 2)) {
                return;
            }

            if (!isObject(coords)) {
                return;
            }

            return new Promise(function (resolve, reject) {
                self.client.szukaj_burzy({
                    x: coords.x,
                    y: coords.y,
                    promien: self.range,
                    klucz: self.key
                }, function (err, result) {
                    if (err) {
                        return reject(ERROR_CODES.auth);
                    };
                    resolve({
                        liczba: Number(result.return.liczba.$value),
                        odleglosc: Number(result.return.odleglosc.$value),
                        okres: Number(result.return.okres.$value)
                    });
                });
            })
        }
    }
    getCoordsByName(city) {
        var self = this;
        if (self.isReady) {
            if (!isString(city)) {
                return;
            };

            return new Promise(function (resolve, reject) {
                if (self.isReady) {
                    self.client.miejscowosc({
                        nazwa: specialCharacter(city),
                        klucz: self.key
                    }, function (err, result) {
                        if (err) {
                            return reject(ERROR_CODES.auth);
                        };

                        var x = result.return.x.$value;
                        var y = result.return.y.$value;

                        if (deepEqualNumber(x, 0) || deepEqualNumber(y, 0)) {
                            return reject(ERROR_CODES.noExists);
                        };
                        resolve({
                            x, y
                        })
                    });
                }
            });
        }
    }
    getWarnings(coords) {
        var self = this;
        if (self.isReady) {
            if (!isEmpty(coords, 2)) {
                return;
            };

            if (!isObject(coords)) {
                return;
            };

            return new Promise(function (resolve, reject) {
                self.client.ostrzezenia_pogodowe({
                    x: coords.x,
                    y: coords.y,
                    klucz: self.key
                }, function (err, result) {
                    if (err) {
                        return reject(ERROR_CODES.auth);
                    };
                    resolve({
                        mroz: result.return.mroz.$value,
                        upal: result.return.upal.$value,
                        wiatr: result.return.wiatr.$value,
                        opad: result.return.opad.$value,
                        burza: result.return.burza.$value,
                        traba: result.return.traba.$value
                    });
                });
            })
        }
    }
    series(arr) {
        var self = this;
        if (Array.isArray(arr) && self.isReady) {
            var result = {};
            return new Promise(function (resolve, reject) {
                var locations = arr.filter(function (city) {
                    return typeof city === 'string';
                }).filter(function (city, index, arr) {
                    return index === arr.indexOf(city);
                });

                function next() {
                    var city = locations.shift();
                    if (city) {
                        self.getCoordsByName(city).then(function (coords) {
                            self.getLightnings(coords).then(function (lightnings) {
                                result[city] = lightnings;
                                next();
                            }).catch(function (err) {
                                reject(err);
                            });
                        }).catch(function (err) {
                            reject(err);
                        })
                    }else{
                        resolve(result);
                    }
                }
                next();
            });
        }
    }
}


function deepEqualNumber(a, b) {
    return Number(a) === Number(b);
}

function isString(str) {
    return typeof str === 'string';
}

function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function isEmpty(obj, count) {
    if (isObject(obj) && Object.keys(obj).length >= (count || 1)) {
        return true
    }
    return false;
}

function specialCharacter(str) {
    var character = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
    };
    return String(str).replace(/[<>&"]/g, function (c) {
        return character[c];
    });
}

module.exports = Client;