# Uploading Firmware HEX to a 3D Printer Using Raspberry Pi 4

## Prerequisites

- **Raspberry Pi 4** (Raspberry Pi OS or OctoPi)
- **AVR-based 3D printer mainboard** (e.g., ATmega2560-based: RAMPS, Anet, Creality, etc.)
- **HEX firmware file** (e.g., `firmware.hex`)
- **USB cable** (to connect Pi to printer)
- **AVRDUDE** (firmware flashing tool)

---

## Step 1: Install AVRDude

```bash
sudo apt update
sudo apt install avrdude
```

---

## Step 2: Identify the Serial Port

Plug in your 3D printer and check the port:

```bash
ls /dev/ttyUSB* /dev/ttyACM*
```

Example output:
```
/dev/ttyUSB0
```
or
```
/dev/ttyACM0
```
_Note the port name for the next step._

---

## Step 3: Upload the HEX File

Replace `/dev/ttyUSB0` with your port and `firmware.hex` with your file path:

```bash
avrdude -v -p atmega2560 -c wiring -P /dev/ttyUSB0 -b 115200 -D -U flash:w:firmware.hex:i
```

---

## Step 4: Verify Flashing

If successful, you’ll see:

```
avrdude done.  Thank you.
```

Your printer should now boot with the new firmware.

---

## Step 5: Test the Firmware with Node.js

You can use Node.js and the `serialport` package to send a simple G-code command and check the response:

1. Install the package:

    ```bash
    npm install serialport
    ```

2. Create a test script (`test-firmware.js`):

    ```js
    const { SerialPort } = require('serialport');

    const port = new SerialPort({
      path: '/dev/ttyUSB0', // Replace with your port
      baudRate: 250000,
      autoOpen: true
    });

    port.on('open', () => {
      console.log('Serial port opened');
    });

    port.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    port.on('error', (err) => {
      console.error('Error:', err.message);
    });

    setTimeout(() => {
      port.write('M115\n'); // M115 requests firmware info
      setTimeout(() => port.close(), 2000); // Close after 2 seconds
    }, 3000); // Wait 3 seconds before sending

    ```

3. Run the script:

    ```bash
    node test-firmware.js
    ```

If the firmware is working, you should see a response with firmware information.