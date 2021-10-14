import time
import pandas as pd

from random import seed
from random import randint

import serial
from datetime import datetime
import numpy as np
import urllib.request
import requests
import threading

## configuration
PORTNAME = 'COM3'
seed(datetime.now().strftime("%d"))


# class for sending the glucose data every interval
class RepeatedTimer(object):
    def __init__(self, interval, function, i, date):
        self._timer = None
        self.interval = interval
        self.function = function
        self.i = i
        self.date = date
        self.is_running = False
        self.next_call = time.time()
        self.start()

    def _run(self):
        self.is_running = False
        self.start()
        self.i += 1
        self.function(self.i, self.date)

    def start(self):
        if not self.is_running:
            self.next_call += self.interval
            self._timer = threading.Timer(self.next_call - time.time(), self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False


class Bridge():

    def __init__(self):
        self.userID = 1

        self.data = pd.read_csv("glucose_sensor_refined_data.csv")
        value = randint(0, len(self.data))
        sample = self.data.iloc[value]["Date"]
        self.data = self.data[self.data['Date'] == sample]
        now = datetime.now()
        self.date = now.strftime("%Y-%m-%d")

    def setup(self):

        # open serial port
        self.ser = serial.Serial(PORTNAME, 9600, timeout=0)
        # self.ser.open()

        # internal input buffer
        self.inbuffer = []

        # buffer that contains the bpm received from the microcontroller
        self.bpm_buffer = []

        # delete the glucose data relative to the current day to avoid inconsistencies
        # url = f'https://fabioiot.pythonanywhere.com/api/measurements/?date={date}'
        # r = requests.delete(url)
        # print(r.text)
        # print(r.status_code)

        # start the periodic sending of glucose data
        self.rt = RepeatedTimer(300, self.sendGlucose, 0, self.date)

    def loop(self):
        # infinite loop
        while (True):
            # look for a byte from serial
            if self.ser.in_waiting > 0:
                # data available from the serial port
                lastchar = self.ser.read(1)

                if lastchar == b'\xfe':  # EOL
                    print("\nValue received")
                    self.useData()
                    self.inbuffer = []
                else:
                    # append
                    self.inbuffer.append(lastchar)

    def sendBpm(self, bpm):
        print("inside sendBpm")
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M:%S")
        type = "H"
        value = round(bpm)
        user = self.userID

        payload = {'date': date, 'time': time, 'type': type, 'value': value, 'user': user}
        url = 'https://fabioiot.pythonanywhere.com/api/measurements/'
        try:
            r = requests.post(url, data=payload, timeout=60)
            # r = requests.post(url, data=json.dumps(payload), timeout=10) # use this if the API need json
            print('-' * 10)
            print(r.json())
            print(r.status_code)
            print('-' * 10)
        except:
            print("Server non raggiungibile bpm")
            print('-' * 10)
            print(r.status_code)
            print('-' * 10)

        return r.status_code

    def sendGlucose(self, i, date):
        try:
            row = self.data.iloc[i]
            time = row['Time']
            type = "G"
            value = row['Sensor Glucose (mg/dL)']
            user = 1

            payload = {'date': date, 'time': time, 'type': type, 'value': value, 'user': user}
            url = 'https://fabioiot.pythonanywhere.com/api/measurements/'
            r = requests.post(url, data=payload, timeout=60)
            print('-' * 10)
            print(r.json())
            print(r.status_code)
            print('-' * 10)
        except:
            print("Server non raggiungibile glucose")
            print('-' * 10)
            print(r.status_code)
            print('-' * 10)

    def useData(self):
        # I have received a line from the serial port. I can use it
        if len(self.inbuffer) < 2:  # at least header, size, footer
            return False
        # split parts
        if self.inbuffer[0] != b'\xff':
            return False

        numval = int.from_bytes(self.inbuffer[1], byteorder='little')
        if numval == 0:
            self.bpm_buffer = []
        else:
            for i in range(numval):
                val = int.from_bytes(self.inbuffer[i + 2], byteorder='little')
                if val > 20:
                    self.bpm_buffer.append(val)
                strval = "Sensor %d: %d " % (i, val)
                print(strval)
            if len(self.bpm_buffer) == 10:
                avg_bpm = 0
                for bpm in self.bpm_buffer:
                    avg_bpm += bpm
                avg_bpm /= 10
                print("the mean of BPM is " + str(avg_bpm))
                t = threading.Thread(target=self.sendBpm, args=[avg_bpm])
                t.start()
                self.ser.write(b'g')
                self.bpm_buffer = []


if __name__ == '__main__':
    br = Bridge()
    br.setup()
    br.loop()
