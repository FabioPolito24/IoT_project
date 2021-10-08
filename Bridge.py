### author: Roberto Vezzani

import serial
from datetime import datetime
import numpy as np
import urllib.request
import requests

## configuration
PORTNAME = 'COM3'


class Bridge():

    def setup(self):

        self.userID = 1

        # open serial port
        self.ser = serial.Serial(PORTNAME, 9600, timeout=0)
        # self.ser.open()

        # internal input buffer
        self.inbuffer = []

        # buffer that contains the bpm received from the microcontroller
        self.bpm_buffer = []

        # variable used to keep track of the last time a BPM has been received
        self.lasttime = datetime.now()

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
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M:%S")
        type = "H"
        value = bpm
        user = self.userID

        payload = {'date': date, 'time': time, 'type': type, 'value': value, 'user': user}
        url = 'https://fabioiot.pythonanywhere.com/api'
        try:
            r = requests.post(url, data=payload, timeout=10)
            # r = requests.post(url, data=json.dumps(payload), timeout=10) use this if the API need json
            print('-' * 10)
            print(r.text)
            print(r.status_code)
            print('-' * 10)
        except:
            print("Server non raggiungibile")

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
                    #     if (datetime.now() - self.lasttime).total_seconds() > 180:
                    #         self.bpm_buffer = []
                    #         self.lasttime = datetime.now()
                    self.bpm_buffer.append(val)
                strval = "Sensor %d: %d " % (i, val)
                print(strval)
            if len(self.bpm_buffer) == 10:
                avg_bpm = 0
                for bpm in self.bpm_buffer:
                    avg_bpm += bpm
                avg_bpm /= 10
                print("the mean of BPM is " + str(avg_bpm))
                self.sendBpm(avg_bpm)
                self.ser.write(b'g')
                self.bpm_buffer = []


if __name__ == '__main__':
    br = Bridge()
    br.setup()
    br.loop()
