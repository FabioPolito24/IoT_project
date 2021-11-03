/*
  Optical Heart Rate Detection (PBA Algorithm) using the MAX30105 Breakout
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 2nd, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  This is a demo to show the reading of heart rate or beats per minute (BPM) using
  a Penpheral Beat Amplitude (PBA) algorithm.

  It is best to attach the sensor to your finger using a rubber band or other tightening
  device. Humans are generally bad at applying constant pressure to a thing. When you
  press your finger against the sensor it varies enough to cause the blood in your
  finger to flow differently which causes the sensor readings to go wonky.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected

  The MAX30105 Breakout can handle 5V or 3.3V I2C logic. We recommend powering the board with 5V
  but it will also run at 3.3V.
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "MAX30105.h"

#include "heartRate.h"

MAX30105 particleSensor;

LiquidCrystal_I2C lcd(0x27,16,2);

const byte RATE_SIZE = 4; //Increase this for more averaging. 4 is good.
const byte SEND_RATE = 150; // Indicates the rate at which the BPM are sent to the bridge
byte rates[RATE_SIZE]; //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; //Time at which the last beat occurred
byte counter = 0;

float beatsPerMinute;
int beatAvg;
int erase = 0;

// states
// 0: Finger off, 1: Finger on
int iState;
int futureState;

unsigned long lasttime;
int iReceived;
int greenPin = 4;
int buzzerPin = 2;

void setup()
{
  Serial.begin(9600);
  //Serial.println("Initializing...");

  lcd.init();
  lcd.init();
  lcd.backlight(); 
  lcd.setCursor(0,0);
  lcd.print("Initializing...");

  //delay(5000);

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) //Use default I2C port, 400kHz speed
  {
    //Serial.println("MAX30105 was not found. Please check wiring/power. ");
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("MAX30102 was");
    lcd.setCursor(0,1);
    lcd.print("not found");
    while (1);
  }
  //Serial.println("Place your index finger on the sensor with steady pressure.");

  particleSensor.setup(); //Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A); //Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); //Turn off Green LED

  lcd.clear();

  // Initialize pins
  pinMode(greenPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // initial state
  iState = 0;
  
}

void loop()
{
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true)
  {
    //We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20)
    {
      rates[rateSpot++] = (byte)beatsPerMinute; //Store this reading in the array
      rateSpot %= RATE_SIZE; //Wrap variable

      //Take average of readings
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // Future state estimation
  futureState = iState;   // default: no changes

  if (iState==0 && irValue > 50000) futureState=1;
  else if (iState==1 && irValue < 50000) futureState=0;

  // On entry and on exit actions
  if ((iState== 1) && (futureState==0)){
    counter = 0;
    beatsPerMinute = 0;
    beatAvg = 0;
    Serial.write(0xff);
    Serial.write(0x00);
    Serial.write(0xfe);
    }

  // State transition [clock edge]
  iState=futureState;

 // Update the output
 switch(iState){  //state A
    case 0:
      //Serial.print(" No finger?");
      beatsPerMinute = 0;
      beatAvg = 0;
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("No finger?"); 
      break;
    case 1:
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("BPM=");
      lcd.print(beatsPerMinute);
      lcd.setCursor(0,1);
      lcd.print("Avg=");
      lcd.print(beatAvg);
      if (counter++ == SEND_RATE){
        counter = 0;
        Serial.write(0xff);
        Serial.write(0x01);
        Serial.write((char)(beatAvg));
        Serial.write(0xfe);
      } 
      break;
    }
 
  if (Serial.available()>0){
    iReceived = Serial.read();

    if (iReceived == 'g'){
      digitalWrite(4, HIGH);
      lasttime = millis();
      tone(buzzerPin, 262, 500);
    }
  }
  if (millis() - lasttime > 2000){
    digitalWrite(4, LOW);
  }
  
}
