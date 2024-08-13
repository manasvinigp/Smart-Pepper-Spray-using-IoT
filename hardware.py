import network
import urequests
from machine import Pin, ADC, PWM
import time

# Wi-Fi credentials
ssid = 'ABCDE'  # Replace with your Wi-Fi SSID
password = 'xxxxxx'  # Replace with your Wi-Fi password

# ThingSpeak API credentials
api_key = 'XXXXXXXXXXXXXXXX'  # Replace with your ThingSpeak API key
url = 'https://api.thingspeak.com/update'

# Setup ADC for piezoelectric sensor
sensor = ADC(Pin(26))  # Adjust pin according to your wiring

# Setup LEDs and Buzzer
led1 = Pin(15, Pin.OUT)
led2 = Pin(16, Pin.OUT)  # Adjust pin according to your wiring
buzzer = PWM(Pin(17))    # Initialize PWM on the pin connected to the buzzer

threshold_value = 30000  # Set the threshold value
blink_interval = 0.1    # Interval for LED blinking (in seconds)

# Connect to Wi-Fi
def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while not wlan.isconnected():
        print('Connecting to Wi-Fi...')
        time.sleep(1)
    print('Connected to Wi-Fi:', wlan.ifconfig())

connect_wifi(ssid, password)

last_sent_value = None  # To track the last value sent to ThingSpeak

while True:
    sensor_value = sensor.read_u16()  # Read the sensor value (0-65535)
    print("Sensor Value:", sensor_value)
    
    if sensor_value > threshold_value:
        # Activate buzzer
        buzzer.freq(1000)  # Set the frequency to 1kHz
        buzzer.duty_u16(32768)  # 50% duty cycle to create a square wave

        # Alternate LED blinking
        while sensor.read_u16() > threshold_value:
            led1.value(1)
            led2.value(0)
            time.sleep(blink_interval)
            led1.value(0)
            led2.value(1)
            time.sleep(blink_interval)

        # Send data to ThingSpeak if sensor value has changed
        if sensor_value != last_sent_value:
            try:
                response = urequests.get(f'{url}?api_key={api_key}&field1={sensor_value}')
                print('Data sent to ThingSpeak:', response.text)
                response.close()
                last_sent_value = sensor_value  # Update last sent value
            except Exception as e:
                print("Error sending data to ThingSpeak:", e)
    else:
        # Turn off LEDs and Buzzer when the sensor value drops below the threshold
        led1.value(0)
        led2.value(0)
        buzzer.duty_u16(0)  # Stop the buzzer

    time.sleep(0.1)  # Short delay to avoid rapid looping