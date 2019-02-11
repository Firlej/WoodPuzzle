cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-admobpro.AdMob",
    "file": "plugins/cordova-plugin-admobpro/www/AdMob.js",
    "pluginId": "cordova-plugin-admobpro",
    "clobbers": [
      "window.AdMob"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-extension": "1.5.4",
  "cordova-plugin-admobpro": "2.37.2",
  "cordova-plugin-whitelist": "1.3.3"
};
// BOTTOM OF METADATA
});