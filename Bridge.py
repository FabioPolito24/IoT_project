### author: Roberto Vezzani

import serial
import numpy as np
import urllib.request

## configuration
PORTNAME='COM3  '

class Bridge():

    def setup(self):
        # open serial port
        self.ser = serial.Serial(PORTNAME, 9600, timeout=0)
        #self.ser.open()

        # internal input buffer
        self.inbuffer=[]

        # buffer that contains the bpm received from the microcontroller
        self.bpm_buffer = []
        self.bpm_counter = []


    def loop(self):
        # infinite loop
        while (True):
            #look for a byte from serial
            if self.ser.in_waiting>0:
                # data available from the serial port
                lastchar=self.ser.read(1)


                if lastchar==b'\xfe': #EOL
                    print("\nValue received")
                    self.useData()
                    self.inbuffer =[]
                else:
                    # append
                    self.inbuffer.append (lastchar)

    def useData(self):
        # I have received a line from the serial port. I can use it
        if len(self.inbuffer)<3:   # at least header, size, footer
            return False
        # split parts
        if self.inbuffer[0] != b'\xff':
            return False

        numval = int.from_bytes(self.inbuffer[1], byteorder='little')
        for i in range (numval):
            val = int.from_bytes(self.inbuffer[i+2], byteorder='little')
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
            self.ser.write(b'g')
            self.bpm_buffer = []




if __name__ == '__main__':
    br=Bridge()
    br.setup()
    br.loop()

