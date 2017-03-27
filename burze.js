var soap = require('soap');

var lightnings = (function (url, auth, range, success) {
    'use strict';
    var codes = {};

    if (!isValidURL(url)) {
        throw new TypeError('invalid url');
    }

    function Methods(client) {

        this.lightning = function (name) {
            return new Promise(function (resolve, reject) {
                city(name, function (err, coords) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    client.szukaj_burzy({
                        x: coords.x,
                        y: coords.y,
                        promien: range,
                        klucz: auth
                    }, function (err, warnings) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            liczba: Number(warnings.return.liczba.$value),
                            odleglosc: Number(warnings.return.odleglosc.$value),
                            okres: Number(warnings.return.okres.$value)
                        })
                    })
                })
            });
        }
        this.lightningSeries = function (arr) {
            var self = this;
            return new Promise(function (resolve, reject) {
                if (Array.isArray(arr) && arr.length !== 0) {
                    var all = {};
                    arr.filter(function (city) {
                        return typeof city === 'string';
                    }).filter(function (city, index, arr) {
                        return index === arr.indexOf(city);
                    });

                    function fire() {
                        if (arr.length !== 0) {
                            var city = arr.shift();
                            self.lightning(city).then(function (warnings) {
                                all[city] = warnings;
                                fire();
                            }).catch(reject);
                        } else {
                            resolve(all)
                        }
                    }
                    fire();
                } else {
                    resolve({});
                }
            })
        }
        this.warnings = function (name) {
            return new Promise(function (resolve, reject) {
                city(name, function (err, coords) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    client.ostrzezenia_pogodowe({
                        x: coords.x,
                        y: coords.y,
                        klucz: auth
                    }, function (err, warnings) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            mroz: warnings.return.mroz.$value,
                            upal: warnings.return.upal.$value,
                            wiatr: warnings.return.wiatr.$value,
                            opad: warnings.return.opad.$value,
                            burza: warnings.return.burza.$value,
                            traba: warnings.return.traba.$value
                        });
                    });
                })
            })
        }

        function city(name, callback) {
            client.miejscowosc({
                nazwa: name,
                klucz: auth
            }, function (err, response) {
                if (err) {
                    return callback(err);
                };
                var x = response.return.x.$value;
                var y = response.return.y.$value;
                if (Number(x) === 0 && Number(y) === 0) {
                    callback("miejscowość: " + name.toUpperCase() + " nie istnieje");
                    return;
                }
                callback(null, {
                    x: x,
                    y: y
                })
            })
        }
    }
    soap.createClient(url, function (err, client) {
        if (!err) {
            success.call(null, new Methods(client));
            return;
        }
        throw new Error(err);
    });

    function isValidURL(url) {
        return url.search(/(http|https):\/\/\w+/) === 0;
    }
});


module.exports = lightnings;
