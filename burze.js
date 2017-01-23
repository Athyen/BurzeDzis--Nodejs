var soap = require('soap');
var EventEmitter = require('events');

var ERROR_CODES = {
    notReady: 'Client nie jest poprawnie połączony',
    auth: 'Błąd uwierzytelnienia',
    cityNoExists: 'Miejscowość nie istnieje w tej bazie danych',

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
    getLightnings(coords, cb) {
        var self = this;
        if (self.isReady) {

            if (!isEmpty(coords, 2)) {
                return;
            }

            if (!isObject(coords)) {
                return;
            }

            if (!isFunction(cb)) {
                return;
            }

            self.client.szukaj_burzy({
                x: coords.x,
                y: coords.y,
                promien: self.range,
                klucz: self.key
            }, function (err, result) {
                if (err) {
                    return handleError(ERROR_CODES.auth, 2, cb);
                };

                cb({
                    success: {
                        liczba: Number(result.return.liczba.$value),
                        odleglosc: Number(result.return.odleglosc.$value),
                        okres: Number(result.return.okres.$value)
                    }
                });

            });
        } else {
            return handleError(ERROR_CODES.notReady, 1, cb);
        }
    }
    getCoordsByName(city, cb) {
        var self = this;
        if (self.isReady) {

            if (!isFunction(cb)) {
                return;
            }
            self.client.miejscowosc({
                nazwa: specialCharacter(city),
                klucz: self.key
            }, function (err, result) {
                if (err) {
                    return handleError(ERROR_CODES.auth, 2, cb);
                };

                var x = result.return.x.$value;
                var y = result.return.y.$value;

                if (deepEqualNumber(x, 0) || deepEqualNumber(y, 0)) {
                    return handleError(ERROR_CODES.cityNoExists, 3, cb);
                }

                cb({
                    success: {
                        x: x,
                        y: y
                    }
                });
            });
        } else {
            return handleError(ERROR_CODES.notReady, 1, cb);
        }
    }
    getWarnings(coords, cb) {
        var self = this;
        if (self.isReady) {

            if (!isEmpty(coords, 2)) {
                return new Error();
            }

            if (!isObject(coords)) {
                return new Error();
            }

            if (!isFunction(cb)) {
                return new Error();
            }


            self.client.ostrzezenia_pogodowe({
                x: coords.x,
                y: coords.y,
                klucz: self.key
            }, function (err, result) {
                if (err) {
                    return handleError(ERROR_CODES.auth, 2, cb);
                };

                cb({
                    mroz: result.return.mroz.$value,
                    upal: result.return.upal.$value,
                    wiatr: result.return.wiatr.$value,
                    opad: result.return.opad.$value,
                    burza: result.return.burza.$value,
                    traba: result.return.traba.$value
                });
            })

        } else {
            return handleError(ERROR_CODES.notReady, 1, cb);
        }
    }
}

function deepEqualNumber(a, b) {
    return Number(a) === Number(b);
}

function isFunction(fn) {
    return typeof fn === 'function';
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

function handleError(error, code, cb) {
    return cb({
        error: error,
        code: code
    });
}
module.exports = Client;