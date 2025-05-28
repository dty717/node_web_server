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
