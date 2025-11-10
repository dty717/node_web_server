## Installing MongoDB 5.0.5 on Raspberry Pi OS 64-bit

This guide summarizes the steps to install MongoDB 5.0.5 on Raspberry Pi OS 64-bit, using community-provided ARM64 binaries.

---

## Install and Use

Ensure you are running the latest version of Raspbian64 OS with all updates. Download and unzip the `raspbian_mongodb_4.4.8.gz` or `raspbian_mongodb_5.0.5.gz` file. You’ll have 3 files: `mongod`, `mongos`, and `mongo`. Move the executables to `/bin` and change owner and group to root. Ensure permissions are set to executable.

### For version 5.0.5:

```sh
sudo tar zxvf raspbian_mongodb_5.0.5.gz
sudo mv mongo* /bin
sudo chown root:root /bin/mongo*
sudo chmod 755 /bin/mongo*

```

Create the mongodb user:

```sh
sudo adduser --no-create-home --disabled-login mongodb
```

Create the configuration file `/etc/mongodb.conf` and add the following lines:

```yaml
# mongod.conf

# for documentation of all options, see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Where and how to store data.
storage:
  dbPath: /data/db
  journal:
    enabled: true
#  engine:
#  wiredTiger:

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1  # Enter 0.0.0.0,:: to bind to all IPv4 and IPv6 addresses


#security:

#operationProfiling:

#replication:

#sharding:

## Enterprise-Only Options

#auditLog:

#snmp:
```

Create the log file and data directory, and change owner and group:

```sh
sudo mkdir -p /var/log/mongodb/
sudo chown -R mongodb:mongodb /var/log/mongodb/
sudo mkdir /data
sudo chmod 777 /data
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /data/db

```

Create the systemd service file `/lib/systemd/system/mongodb.service`:

```ini
[Unit]
Description=An object/document-oriented database
Documentation=man:mongod(1)
After=network.target

[Service]
User=mongodb
Group=mongodb
# Other directives omitted
# (file size)
LimitFSIZE=infinity
# (cpu time)
LimitCPU=infinity
# (virtual memory size)
LimitAS=infinity
# (locked-in-memory size)
LimitMEMLOCK=infinity
# (open files)
LimitNOFILE=64000
# (processes/threads)
LimitNPROC=64000
ExecStart=/usr/bin/mongod --quiet --config /etc/mongodb.conf

[Install]
WantedBy=multi-user.target
```

You can now start/stop the mongodb service:

```sh
ps --no-headers -o comm 1
# using service base on init system
sudo service mongodb start
sudo service mongodb status
# or using systemd 
sudo mv /lib/systemd/system/mongodb.service /etc/systemd/system/mongodb.service
sudo systemctl daemon-reload
sudo systemctl enable mongodb
sudo systemctl restart mongodb
```

Example output:

```
● mongodb.service - An object/document-oriented database
     Loaded: loaded (/lib/systemd/system/mongodb.service; disabled; vendor preset: enabled)
     Active: active (running) ...
     Docs: man:mongod(1)
 Main PID: 1771 (mongod)
        Tasks: 33 (limit: 4164)
     CGroup: /mongodb.service
                     └─1771 /bin/mongod --quiet --config /mongodb.conf
```

If there is error
```
/usr/bin/mongod: error while loading shared libraries: libcrypto.so.1.1: cannot open shared object file: No such file or directory
```
install libssl1.1
```sh
sudo apt install libssl1.1
```

You can also run the MongoDB shell:

```sh
mongo
```

Example:

```
MongoDB shell version v5.0.5
connecting to: mongodb://127.0.0.1:27017/
> show databases;
admin   0.000GB
config  0.000GB
local   0.000GB
```

## Securing MongoDB

Recent versions of MongoDB require user authentication for network access. By default, your database is only accessible from the Raspberry Pi itself. However, it's recommended to set up a username and password for added security.

### Create an Admin User

Start the MongoDB shell:

```sh
mongo
```

Inside the shell, run the following commands (replace `SUPERSECRETPASSWORD` with a strong password):

```js
use admin
db.createUser({
    user: "admin",
    pwd: "SUPERSECRETPASSWORD",
    roles: [
        "userAdminAnyDatabase",
        "dbAdminAnyDatabase",
        "readWriteAnyDatabase"
    ]
})
exit
```

These roles allow the `admin` user to manage users and data across all databases. Use a secure, randomly generated password.

### Enable Authentication

Edit `/etc/mongodb.conf` and add the following lines (ensure correct YAML indentation):

```yaml
security:
    authorization: enabled
```

Restart MongoDB to apply changes:

```sh
sudo systemctl restart mongodb
```

### Test Authentication

Try connecting without authentication:

```sh
mongo
> db.adminCommand({listDatabases: 1})
```

You should see an error similar to:

```
"errmsg" : "command listDatabases requires authentication"
```

Now connect with your admin credentials:

```sh
mongo -u "admin" -p "SUPERSECRETPASSWORD"
> db.adminCommand({listDatabases: 1})
```

You should see a list of databases, confirming authentication is working.

<!-- sudo apt install libssl1.1 -->


> **Note:** This build is community-supported and not officially provided by MongoDB. For production, consider using a supported platform.
