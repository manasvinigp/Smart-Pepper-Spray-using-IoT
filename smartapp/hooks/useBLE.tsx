import { useState, useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid, Alert } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useBLE = () => {
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const initializeBleManager = async () => {
      if (!BleManagerModule) {
        console.error('BleManagerModule is not available.');
        return;
      }

      try {
        await BleManager.start({ showAlert: false });
      } catch (error) {
        console.error('BleManager failed to start:', error);
      }
    };

    initializeBleManager();

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    const handleDiscoverPeripheral = (device: any) => {
      if (device && device.id) {
        setDevices((prevDevices) => {
          const deviceExists = prevDevices.some((d) => d.id === device.id);
          if (!deviceExists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    };

    const handleStopScan = () => {
      setScanning(false);
    };

    const handleDisconnectedPeripheral = (data: any) => {
      Alert.alert('Bluetooth', 'Disconnected from the device');
      setConnectedDevice(null);
    };

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);

    return () => {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      bleManagerEmitter.removeAllListeners('BleManagerStopScan');
      bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (Object.values(granted).some(result => result !== PermissionsAndroid.RESULTS.GRANTED)) {
          Alert.alert('Permissions', 'Some permissions are not granted');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    }
  };

  const startScan = () => {
    if (!BleManager) {
      console.error('BleManager is not initialized.');
      return;
    }

    setScanning(true);
    setDevices([]);

    BleManager.scan([], 10, true)
      .then(() => {
        console.log("Scanning started");
      })
      .catch((err) => {
        console.error("Scan error:", err);
        setScanning(false);
      });
  };

  const connectToDevice = async (deviceId: string) => {
    if (!BleManager || !deviceId) {
      console.error('BleManager is not initialized or deviceId is null.');
      return;
    }

    try {
      await BleManager.connect(deviceId);
      setConnectedDevice(deviceId);

      // Retrieve services and characteristics
      await BleManager.retrieveServices(deviceId);

      // Notify the user
      const connectedDevice = devices.find(d => d.id === deviceId);
      Alert.alert('Bluetooth', `Connected to ${connectedDevice?.name ?? 'device'}`);
    } catch (error) {
      console.error("Failed to connect:", error);
      Alert.alert('Bluetooth', 'Failed to connect to the device');
    }
  };

  const disconnectDevice = async () => {
    if (!BleManager || !connectedDevice) {
      console.error('BleManager is not initialized or no device is connected.');
      return;
    }

    try {
      await BleManager.disconnect(connectedDevice);
      setConnectedDevice(null);
      Alert.alert('Bluetooth', 'Disconnected from the device');
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const readCharacteristic = async (serviceUUID: string, characteristicUUID: string) => {
    if (!BleManager || !connectedDevice) {
      console.error('BleManager is not initialized or no device is connected.');
      return null;
    }

    try {
      const data = await BleManager.read(connectedDevice, serviceUUID, characteristicUUID);
      return data;
    } catch (error) {
      console.error("Failed to read characteristic:", error);
      return null;
    }
  };

  const writeCharacteristic = async (serviceUUID: string, characteristicUUID: string, data: any) => {
    if (!BleManager || !connectedDevice) {
      console.error('BleManager is not initialized or no device is connected.');
      return;
    }

    try {
      await BleManager.write(connectedDevice, serviceUUID, characteristicUUID, data);
      console.log("Wrote to characteristic");
    } catch (error) {
      console.error("Failed to write to characteristic:", error);
    }
  };

  return {
    scanning,
    devices,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnectDevice,
    readCharacteristic,
    writeCharacteristic,
  };
};

export default useBLE;
