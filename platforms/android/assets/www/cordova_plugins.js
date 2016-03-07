cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/fr.drangies.cordova.serial/www/serial.js",
        "id": "fr.drangies.cordova.serial.Serial",
        "pluginId": "fr.drangies.cordova.serial",
        "clobbers": [
            "window.serial"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "id": "cordova-plugin-statusbar.statusbar",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/ionic-plugin-keyboard/www/android/keyboard.js",
        "id": "ionic-plugin-keyboard.keyboard",
        "pluginId": "ionic-plugin-keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "fr.drangies.cordova.serial": "0.0.2",
    "cordova-plugin-device": "1.1.1",
    "cordova-plugin-console": "1.0.2",
    "cordova-plugin-splashscreen": "3.1.0",
    "cordova-plugin-statusbar": "2.1.1",
    "ionic-plugin-keyboard": "1.0.8"
}
// BOTTOM OF METADATA
});