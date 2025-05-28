### Changing VNC Resolution (Using X11)

To change the resolution of your VNC session while using X11, you can follow these steps. This example demonstrates how to set the resolution to `800x480` at a refresh rate of `60Hz`.

#### Steps:

1. **Generate a modeline** using the `gtf` command:
    ```bash
    gtf 800 480 60
    ```
    This will output a modeline that you can use with `xrandr`.

2. **Add the new mode** to your display using `xrandr`:
    ```bash
    xrandr --newmode "800x480_60" 29.58  800 816 896 992  480 481 484 497  -HSync +Vsync
    ```

3. **Associate the new mode** with your display output:
    ```bash
    xrandr --addmode HDMI-1 "800x480_60"
    ```

4. **Apply the new resolution** to your display:
    ```bash
    xrandr --output HDMI-1 --mode 800x480_60
    ```

#### Example Code:

```bash
gtf 800 480 60

xrandr --newmode "800x480_60" 29.58  800 816 896 992  480 481 484 497  -HSync +Vsync

xrandr --addmode HDMI-1 "800x480_60"

xrandr --output HDMI-1 --mode 800x480_60
```

#### Notes:
- Replace `HDMI-1` with the name of your display output. You can find the name of your display output by running `xrandr` without any arguments.
- Ensure you have the necessary permissions to execute these commands.
- These changes are temporary and will reset after a reboot. To make them permanent, you can add the commands to your startup scripts.
- **Do not use these commands for DSI displays**, as they are not compatible.
- These instructions are specific to X11. If you are using Wayland, you will need to use a different method, as `xrandr` is not supported on Wayland.