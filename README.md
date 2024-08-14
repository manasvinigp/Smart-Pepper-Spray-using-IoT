# Smart-Pepper-Spray-using-IoT

A smart pepper spray device is built using the Raspberry Pi Pico W, piezoelectric sensor, LED lights, and a buzzer. This device sends sensor readings to a ThingSpeak server, and a React Native application fetches the data at regular intervals. If the sensor data exceeds a certain threshold, the app activates a 30-second timer. Upon expiration, an emergency alert containing the user's geolocation is sent via SMS to the stored emergency contacts.

## Features

- **Piezoelectric Sensor**: Detects pressure and sends the data to the Raspberry Pi Pico W.
- **LED Lights & Buzzer**: Provide visual and auditory alerts when the device is activated.
- **ThingSpeak Integration**: Sensor data is uploaded to the ThingSpeak server for monitoring.
- **React Native Application**:
  - Fetches sensor data from ThingSpeak every 2 minutes.
  - Activates a 30-second timer if the sensor data exceeds the predefined threshold.
  - Provide option to deactivate timer in case of false alarms.
  - Sends an emergency alert with GPS location via SMS to stored contacts when the timer expires.
  - Stores emergency contacts using Async Storage.

## Hardware Components

- **Raspberry Pi Pico W**: The microcontroller used for collecting sensor data and sending it to the server.
- **Piezoelectric Sensor**: Detects the pressure when the pepper spray is used.
- **LED Lights**: Indicate the status of the device.
- **Buzzer**: Sounds an alarm when the device is activated.
- **Power Supply**: Battery pack or other suitable power supply for the Raspberry Pi Pico W.

## Software Components

### Raspberry Pi Pico W Firmware

- **Language**: MicroPython
- **Functionality**:
  - Collects data from the piezoelectric sensor.
  - Controls LED lights and buzzer based on sensor input.
  - Sends data to the ThingSpeak server via Wi-Fi.

### React Native Application

- **Build System**: Expo
- **Language**: TypeScript
- **Libraries**:
  - `expo-sms`: For sending SMS alerts.
  - `expo-location`: For obtaining the device's GPS location.
  - `async-storage`: For storing emergency contacts.
- **Functionality**:
  - Fetches sensor data from ThingSpeak API every 2 minutes.
  - Compares data with a predefined threshold.
  - Activates a 30-second timer if the threshold is exceeded.
  - Sends an SMS with geolocation to emergency contacts using the `expo-sms` library.

## Installation & Setup

### Hardware Setup

1. **Connect the Piezoelectric Sensor**: Wire the piezoelectric sensor to the appropriate GPIO pins on the Raspberry Pi Pico W.
2. **Wire the LED Lights and Buzzer**: Connect LED lights and a buzzer to the GPIO pins.
3. **Power the Raspberry Pi Pico W**: Use a battery pack or another suitable power supply.

### Software Setup
 
### Clone the Repository
   ```bash
   git clone https://github.com/yourusername/smart-pepper-spray-device.git
   cd smart-pepper-spray-device
   ```
### Raspberry Pi Pico W Setup

1. **Flash the MicroPython firmware** onto the Raspberry Pi Pico W.
2. **Upload the `main.py` script** to the Pico W using tools like Thonny or `ampy`.

### React Native Application

1. **Install the necessary dependencies**:
   ```bash
   npm install
   ```
2. **Run the application on your mobile device using Expo**:
   ```bash
   npx expo start
   ```
### ThingSpeak Setup

1. Create a ThingSpeak account and set up a new channel for storing the sensor data.
2. Update the hardware.py script with your ThingSpeak API key and channel ID.

### Configuration

- **Threshold Value**: Set the threshold value in the React Native app to trigger the timer when exceeded.
- **Emergency Contacts**: Add and manage emergency contacts in the app using Async Storage.
- **Timer**: The default timer duration is 30 seconds. Modify this if needed within the app's configuration.
