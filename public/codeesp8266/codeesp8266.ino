#include <ESP8266WiFi.h>
#include <Wire.h>
#include <PubSubClient.h>
#include "ArduinoJson.h"
#include "DHT.h"
#define LED 16  // DO-GPIO16
#define Air 12  // D6-GPIO12
#define DHTPIN 14   // D5-GPIO14

int BH1750address = 0x23;
byte buff[2];
#define DHTTYPE DHT11 
DHT dht(DHTPIN, DHTTYPE);

#define wifi_ssid "Wiship"
#define wifi_password "123456789"
#define mqtt_server "broker.hivemq.com"
#define led_topic "MCB/device/led"
#define air_topic "MCB/device/air"
#define topic1 "MCB/sensor/temperature/humidity/light"

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Wire.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  pinMode(LED, OUTPUT);
  pinMode(Air, OUTPUT);
}

//-------------- Get MAC Address of Device to show when connecting...------------//
String macToStr(const uint8_t *mac) {
  String result;
  for (int i = 0; i < 6; ++i) {
    result += String(mac[i], 16);
    if (i < 5)
      result += ':';
  }
  return result;
}


//------------------ Wifi connection Setup ----------------//
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(wifi_ssid);
  WiFi.begin(wifi_ssid, wifi_password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Generate client name based on MAC address and last 8 bits of microsecond counter
    String clientName;
    clientName += "esp8266-";
    uint8_t mac[6];
    WiFi.macAddress(mac);
    clientName += macToStr(mac);
    clientName += "-";
    clientName += String(micros() & 0xff, 16);
    Serial.print("Connecting to ");
    Serial.print(mqtt_server);
    Serial.print(" as ");
    Serial.println(clientName);

    // CLIENT CONNECT AND SUBCRIBE TO THE TOPIC
    if (client.connect((char *)clientName.c_str())){
      Serial.println("connected");
      client.subscribe(led_topic);
      client.subscribe(air_topic);
    }
    else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}


//-------------- Get Data from MQTT BROKER to Turn ON OFF Light, Air ------------//
void callback(char *topic, byte *payload, unsigned int length) {
  char status[20];
  Serial.println("-------new message from broker-----");
  Serial.print("topic: ");
  Serial.println(topic);
  Serial.print("message: ");
  Serial.write(payload, length);
  Serial.println();
  for (int i = 0; i < length; i++) {
    status[i] = payload[i];
  }
  Serial.println(status);

  //---------------CONTROL DEVICE LED-------------//
  if (String(topic) == led_topic) {
    if (String(status) == "OFF") {
      digitalWrite(LED, LOW);
      Serial.println("LED OFF");
    }
    else if (String(status) == "ON") {
      digitalWrite(LED, HIGH);
      Serial.println("LED ON");
    }
  }

//---------------CONTROL DEVICE AIR CONDITIONER-------------//
   if (String(topic) == air_topic) {
    if (String(status) == "OFF") {
      digitalWrite(Air, LOW);
      Serial.println("LED OFF");
    }
    else if (String(status) == "ON") {
      digitalWrite(Air, HIGH);
      Serial.println("LED ON");
    }
  }
}


//-------------------READ AND PUBLISH DATA TO MQTT------------------//
long lastMsg = 0;
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  // millis() RETURN TIME milies from start time run arduino to current time
  long now = millis();
  if (now - lastMsg >= 0) {    // sau mỗi 1000 milies sẽ thực hiện đọc và publish data
    lastMsg = millis();
    int h = dht.readHumidity();
    int t = dht.readTemperature();
    // Read light
    int i;
    uint16_t val = 0;
    BH1750_Init(BH1750address);
    delay(200);
    if (2 == BH1750_Read(BH1750address)) {
      val = ((buff[0] << 8) | buff[1]) / 1.2;
    }
    delay(150);
    
    // Check if any reads failed and exit early (to try again).
    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Compute heat index in Celsius (isFahreheit = false)
    float hic = dht.computeHeatIndex(t, h, false);
    StaticJsonDocument<100> doc;
    doc["Temperature"] = t;
    doc["Humidity"] = h;
    doc["Light"] = val;
    char buffer[100];
    serializeJson(doc, buffer);
    client.publish(topic1, buffer);     // pulish data dưới dạng JOSON Obj:
    Serial.println(buffer);
  }
}


//----------------function read data of Light sensor--------------//
int BH1750_Read(int address) {
  int i = 0;
  Wire.beginTransmission(address);
  Wire.requestFrom(address, 2);
  while (Wire.available()) {
    buff[i] = Wire.read();
    i++;
  }
  Wire.endTransmission();
  return i;
}
void BH1750_Init(int address) {
  Wire.beginTransmission(address);
  Wire.write(0x10);
  Wire.endTransmission();
}
