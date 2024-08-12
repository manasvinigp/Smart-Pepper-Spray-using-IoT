import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

const manager = new BleManager();

const useBLE = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device>({} as Device); // Initialize with an empty object
    const [isScanning, setIsScanning] = useState(false);

  // Request Bluetooth and Location permissions
  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
  
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);
  
        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
  
    showErrorToast('Permissions have not been granted');
    return false;
  };

  // Show error toast
  const showErrorToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      // Handle iOS toast or error message display
      console.error(message);
    }
  };

  // Start scanning for devices
  const startScan = async () => {
    const hasPermission = await requestBluetoothPermission();
    if (!hasPermission) return;

    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        setIsScanning(false);
        return;
      }

      if (scannedDevice && !devices.find(d => d.id === scannedDevice.id)) {
        setDevices(prevDevices => [...prevDevices, scannedDevice]);
      }
    });
  };

  // Stop scanning for devices
  const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
  };

  // Connect to a device
 // Connect to a device
  const connectToDevice = async (device: Device) => {
    try {
      const connectedDevice = await device.connect();
      setConnectedDevice(connectedDevice);
      await connectedDevice.discoverAllServicesAndCharacteristics();
    } catch (error) {
      console.error('Connection failed', error);
    }
  };
  
  const handleSomeAction = () => {
    if (connectedDevice) {
      // Use connectedDevice safely
    }
  };
  
  
  // Disconnect from a device
  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice({} as Device); // Reset to default value
    }
  };
  

  useEffect(() => {
    const handleStateChange = (state: State) => {
      if (state === State.PoweredOn) {
        startScan();
      } else {
        stopScan();
      }
    };

    const stateChangeSubscription = manager.onStateChange(handleStateChange, true);

    return () => {
      stateChangeSubscription.remove();  // Remove the state change listener
      stopScan();  // Ensure scanning is stopped
    };
  }, []);

  return {
    devices,
    connectedDevice,
    isScanning,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
  };
};

export default useBLE;
