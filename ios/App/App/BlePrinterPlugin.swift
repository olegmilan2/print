import Foundation
import Capacitor
import CoreBluetooth

@objc(BlePrinterPlugin)
public class BlePrinterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BlePrinterPlugin"
    public let jsName = "BlePrinter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "connect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnect", returnType: CAPPluginReturnPromise)
    ]

    private var discoveredPeripherals: [UUID: CBPeripheral] = [:]
    private var discoveredDevices: [[String: String]] = []

    private let bleManager = POSBLEManager.sharedInstance()
    private var connectedPeripheral: CBPeripheral?

    private var scanCall: CAPPluginCall?
    private var connectCall: CAPPluginCall?

    private var scanTimer: Timer?

    public override func load() {
        bleManager?.delegate = self
    }

    @objc func scan(_ call: CAPPluginCall) {
        guard let bleManager else {
            call.reject("Xprinter BLE SDK недоступен.")
            return
        }
        discoveredPeripherals.removeAll()
        discoveredDevices.removeAll()

        scanTimer?.invalidate()
        scanCall = call

        bleManager.startScan()

        let timeoutMs = max(1000, call.getInt("timeout") ?? 6000)
        scanTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(timeoutMs) / 1000.0, repeats: false) { [weak self] _ in
            self?.finishScan()
        }
    }

    @objc func connect(_ call: CAPPluginCall) {
        guard let bleManager else {
            call.reject("Xprinter BLE SDK недоступен.")
            return
        }

        guard let id = call.getString("deviceId"), let uuid = UUID(uuidString: id) else {
            call.reject("Не передан корректный deviceId.")
            return
        }

        guard let peripheral = discoveredPeripherals[uuid] else {
            call.reject("Устройство не найдено. Выполните поиск снова.")
            return
        }

        connectCall = call
        connectedPeripheral = peripheral
        bleManager.connectDevice(peripheral)
    }

    @objc func write(_ call: CAPPluginCall) {
        guard let bleManager else {
            call.reject("Xprinter BLE SDK недоступен.")
            return
        }

        guard bleManager.printerIsConnect() else {
            call.reject("Сначала подключите Bluetooth-принтер.")
            return
        }

        guard let base64 = call.getString("base64"), let data = Data(base64Encoded: base64) else {
            call.reject("Пустые или некорректные данные печати.")
            return
        }

        bleManager.writeCommand(with: data)
        call.resolve()
    }

    @objc func disconnect(_ call: CAPPluginCall) {
        guard let bleManager, connectedPeripheral != nil else {
            call.resolve()
            return
        }
        bleManager.disconnectRootPeripheral()
        cleanupConnectionState()
        call.resolve()
    }

    private func finishScan() {
        guard let call = scanCall else { return }
        bleManager?.stopScan()
        scanTimer?.invalidate()
        scanTimer = nil

        call.resolve([
            "devices": discoveredDevices
        ])
        scanCall = nil
    }

    private func cleanupConnectionState() {
        connectedPeripheral = nil
    }
}

extension BlePrinterPlugin: POSBLEManagerDelegate {
    public func poSbleUpdatePeripheralList(_ peripherals: [Any]!, rssiList: [Any]!) {
        guard let list = peripherals as? [CBPeripheral] else { return }
        discoveredPeripherals.removeAll()
        discoveredDevices = list.map { peripheral in
            discoveredPeripherals[peripheral.identifier] = peripheral
            return [
                "id": peripheral.identifier.uuidString,
                "name": peripheral.name ?? "Unknown device"
            ]
        }
    }

    public func poSbleConnect(_ peripheral: CBPeripheral!) {
        connectCall?.resolve([
            "id": peripheral.identifier.uuidString,
            "name": peripheral.name ?? "Unknown device"
        ])
        connectCall = nil
    }

    public func poSbleFail(toConnect peripheral: CBPeripheral!, error: (any Error)!) {
        connectCall?.reject(error?.localizedDescription ?? "Не удалось подключиться к устройству.")
        connectCall = nil
        cleanupConnectionState()
    }

    public func poSbleDisconnectPeripheral(_ peripheral: CBPeripheral!, error: (any Error)!) {
        if connectedPeripheral?.identifier == peripheral.identifier {
            cleanupConnectionState()
        }
    }

    public func poSbleCentralManagerDidUpdateState(_ state: Int) {
        // 5 == CBManagerState.poweredOn
        if state != 5 {
            finishScan()
        }
    }
}
