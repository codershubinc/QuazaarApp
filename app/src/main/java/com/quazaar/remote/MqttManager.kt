package com.quazaar.remote

import android.content.Context
import org.eclipse.paho.client.mqttv3.*
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence

class MqttManager(
    private val context: Context,
    private val onMessageReceived: (topic: String, message: String) -> Unit
) {

    private lateinit var mqttClient: MqttClient

    fun connect(serverUri: String, clientId: String) {
        try {
            mqttClient = MqttClient(serverUri, clientId, MemoryPersistence())
            val options = MqttConnectOptions()
            options.isCleanSession = true
            mqttClient.connect(options)
            subscribe("quazaar/music")
        } catch (e: MqttException) {
            e.printStackTrace()
        }
    }

    fun disconnect() {
        try {
            mqttClient.disconnect()
        } catch (e: MqttException) {
            e.printStackTrace()
        }
    }

    private fun subscribe(topic: String) {
        try {
            mqttClient.subscribe(topic) { _, message ->
                onMessageReceived(topic, message.toString())
            }
        } catch (e: MqttException) {
            e.printStackTrace()
        }
    }
}