// plugins/react-native-ble-manager.plugin.js

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withReactNativeBleManager(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Add permissions to the AndroidManifest.xml
    androidManifest.manifest.usesPermission.push(
      { $: { android: 'android.permission.BLUETOOTH' } },
      { $: { android: 'android.permission.BLUETOOTH_ADMIN' } },
      { $: { android: 'android.permission.ACCESS_FINE_LOCATION' } },
      { $: { android: 'android.permission.ACCESS_BACKGROUND_LOCATION' } },
      { $: { android: 'android.permission.BLUETOOTH_SCAN' } },
      { $: { android: 'android.permission.BLUETOOTH_CONNECT' } },
      { $: { android:'android.permission.BLUETOOTH_ADVERTISE' } }
    );

    return config;
  });
};
