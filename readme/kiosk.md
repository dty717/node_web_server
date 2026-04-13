# Pi Kiosk

This project sets up a Raspberry Pi to run a web browser in kiosk mode, displaying a specified URL.

## Overview

The Pi Kiosk project is designed to turn a Raspberry Pi into a simple kiosk system. It launches a Chromium browser in kiosk mode to display a specified web application or website.

## Requirements

- Raspberry Pi running Raspberry Pi OS (Lite or Desktop).
- Chromium browser installed on the Raspberry Pi.

## Setup Instructions

1. **Set the Kiosk URL**  
    Define the URL you want to display in kiosk mode. You can set this in an environment variable:
    ```bash
    export KIOSK_URL="http://192.168.2.140:5000/"
    ```

2. **Create a Startup Script**  
    Create a script to launch Chromium in kiosk mode:
    ```bash
    nano ~/start-kiosk.sh
    ```

    Add the following content to the script:
    ```bash
    #!/bin/bash
    /bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --app=$KIOSK_URL
    
    /bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --app=$KIOSK_URL --remote-debugging-port=9222
    ```

    Save and close the file.

3. **Make the Script Executable**  
    Make the script executable:
    ```bash
    chmod +x ~/start-kiosk.sh
    ```

4. **Set Up Autostart**  
    To configure the Raspberry Pi to run the script on boot, use the `rc.local` file. Edit the file with the following command:  
    ```bash
    sudo nano /etc/rc.local
    ```  

    Add the following line before the `exit 0` line:  
    ```bash
    /home/pi/start-kiosk.sh &
    ```  

    Save and close the file. This ensures the script runs automatically on startup.  

5. **Reboot the Raspberry Pi**  
    Reboot the Raspberry Pi to apply the changes:
    ```bash
    sudo reboot
    ```


## Notes

- To exit kiosk mode, press `Alt + F4` or switch to a terminal using `Ctrl + Alt + F1`.
- Ensure the Raspberry Pi has a stable network connection to access the specified URL.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/geerlingguy/pi-kiosk/blob/master/LICENSE) file for details.



This is a very common issue on the new Debian 13 "Trixie" update. 

Because Trixie uses a modern display protocol called **Wayland** (specifically the Labwc compositor), old tutorials that tell you to use `xinput` or `99-calibration.conf` will completely fail. Under Wayland, the graphical display and the physical touch matrix rotate independently. 

To fix this on the **Raspberry Pi Touch Display 2**, the most reliable method is to tell the hardware driver directly to rotate the touch axes to match your screen.

Here is how to apply the fix:

### **Step 1: Open the hardware configuration file**
Open your terminal and run the following command to edit your config file:
```bash
sudo nano /boot/firmware/config.txt
```

### **Step 2: Add the touch rotation parameters**
Scroll to the very bottom of the file (or look for the `[all]` section). You need to add a line that loads the official driver (`vc4-kms-dsi-ili9881-7inch`) along with specific commands to swap or invert the X and Y touch axes.

Add **ONE** of the following lines based on how you rotated your screen:

* **If you rotated 90° Clockwise (Standard Landscape/right):**
    ```ini
    dtoverlay=vc4-kms-dsi-ili9881-7inch,swapxy,invx
    ```
* **If you rotated 180° (Portrait Upside Down):**
    ```ini
    dtoverlay=vc4-kms-dsi-ili9881-7inch,invx,invy
    ```
* **If you rotated 270° Clockwise (Inverted Landscape/left):**
    ```ini
    dtoverlay=vc4-kms-dsi-ili9881-7inch,swapxy,invy
    ```

### **Step 3: Save and Reboot**
1. Press `Ctrl + X` to exit the nano editor.
2. Reboot your Raspberry Pi:
   ```bash
   sudo reboot
   ```

When the Pi boots back up, your touch input should perfectly match your display rotation. 

*(Note: If you find that dragging your finger up moves the mouse down, simply reopen the file and swap `invx` for `invy`—or vice versa—to flip the axis back to normal).*

---
Would you like me to explain how to natively map touch inputs inside your Wayland configuration files if you ever decide to use a third-party monitor instead of the official Touch Display 2?