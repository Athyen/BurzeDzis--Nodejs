var key = 'your key API';
var url = 'https://burze.dzis.net/soap.php?WSDL';
var range = 300;
var lightnings = require('./burze.js');

lightnings(url, key, range, function (client) {
    client.lightning('Katowice').then(function (e) {
        console.log(e)
    }).catch(function (e) {
        console.log(e)
    })
    //    client.lightningSeries(['Katowice', 'Warszawa', 'Kraków', 'Poznań']).then(function (lightnings) {
    //        console.log(lightnings)
    //    }).catch(function (err) {
    //        console.log(err)
    //    })
    //
    //
    //        client.warnings('Katowice').then(function (warnings) {
    //            console.log(warnings)
    //        })
});
