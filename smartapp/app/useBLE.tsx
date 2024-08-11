import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

const useBLE = () => {
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [manager] = useState(new BleManager());

  useEffect(() => {
    const handleStateChange = (state: State) => {
      if (state === 'PoweredOn') {
        console.log('Bluetooth is on');
      } else {
        console.log('Bluetooth is off or not available');
      }
    };

    const subscription = manager.onStateChange(handleStateChange, true);

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    return () => {
      subscription.remove();
    };
  }, [manager]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (err) {
        console.error('Failed to request permissions:', err);
      }
    }
  };

  const startScan = async () => {
    if (!scanning) {
      setScanning(true);
      setDevices([]);

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          return;
        }

        if (device) {
          setDevices((prevDevices) => {
            const deviceExists = prevDevices.some((d) => d.id === device.id);
            if (!deviceExists) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        manager.stopDeviceScan();
        setScanning(false);
      }, 10000);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const device = await manager.connectToDevice(deviceId);
      setConnectedDevice(device);
      await device.discoverAllServicesAndCharacteristics();
      Alert.alert('Bluetooth', `Connected to ${device.name || 'device'}`);
    } catch (error) {
      console.error('Failed to connect:', error);
      Alert.alert('Bluetooth', 'Failed to connect to the device');
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        Alert.alert('Bluetooth', 'Disconnected from the device');
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  };

  const readCharacteristic = async (serviceUUID: string, characteristicUUID: string) => {
    if (!connectedDevice) return null;
    try {
      const characteristic = await connectedDevice.readCharacteristicForService(serviceUUID, characteristicUUID);
      return characteristic.value;
    } catch (error) {
      console.error('Failed to read characteristic:', error);
      return null;
    }
  };

  const writeCharacteristic = async (serviceUUID: string, characteristicUUID: string, data: any) => {
    if (!connectedDevice) return;
    try {
      await connectedDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, data);
      console.log('Wrote to characteristic');
    } catch (error) {
      console.error('Failed to write to characteristic:', error);
    }
  };

  const selectAndConnectDevice = (deviceId: string) => {
    connectToDevice(deviceId);
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
    selectAndConnectDevice,
  };
};

export default useBLE;
