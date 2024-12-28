import easysnmp
import psutil
import json
from datetime import datetime

# Function to get SNMP data from a router/switch
def collect_snmp_data(device_ip):
    # SNMPv3 session configuration
    session = easysnmp.Session(
        hostname=device_ip,
        version=3,
        security_level='authPriv',  # Authentication and privacy (encryption)
        security_username='MyUser',  # SNMPv3 username
        auth_password='MyPassword',  # SNMPv3 authentication password
        auth_protocol='SHA',  # Authentication protocol
        privacy_password='MyEncryptionKey',  # SNMPv3 encryption password
        privacy_protocol='DES'  # Encryption protocol
    )
    data = {}

    try:
        # Collect uptime
        uptime = session.get('1.3.6.1.2.1.1.3.0')
        uptime_seconds = int(uptime.value) // 100
        uptime_days = uptime_seconds // 86400
        uptime_hours = (uptime_seconds % 86400) // 3600
        uptime_minutes = (uptime_seconds % 3600) // 60
        uptime_seconds = uptime_seconds % 60
        data['Uptime'] = f"{uptime_days} days, {uptime_hours} hours, {uptime_minutes} minutes, {uptime_seconds} seconds"

        # Collect system description
        description = session.get('1.3.6.1.2.1.1.1.0')
        data['Description'] = description.value

        # Collect CPU Load
        cpu_usage = session.walk('1.3.6.1.4.1.9.2.1.56')
        cpu_loads = [cpu.value for cpu in cpu_usage]
        data['CPU Load (SNMP)'] = ', '.join(cpu_loads)

       # Collect interface statistics
        interfaces_in = session.walk('1.3.6.1.2.1.2.2.1.10')
        interfaces_out = session.walk('1.3.6.1.2.1.2.2.1.16')
        interfaces_in_errors = session.walk('1.3.6.1.2.1.2.2.1.14')
        interfaces_out_errors = session.walk('1.3.6.1.2.1.2.2.1.20')
        interface_status = session.walk('1.3.6.1.2.1.2.2.1.8')  # Interface operational status

        # Collect IP addresses for interfaces
        ip_addresses = session.walk('1.3.6.1.2.1.4.20.1.1')  # List of IP addresses
        ip_to_interface = {}
        for ip in ip_addresses:
            interface_index = session.get(f'1.3.6.1.2.1.4.20.1.2.{ip.value}').value
            ip_to_interface[int(interface_index)] = ip.value  # Map interface index to IP address

        # Collect interface data
        interfaces_data = []
        for index in range(len(interfaces_in)-1):
            interface_index = index + 1  # SNMP interface index is 1-based
            interface_info = {
                "Interface": interface_index,
                "Inbound_Traffic": interfaces_in[index].value,
                "Outbound_Traffic": interfaces_out[index].value,
                "Inbound_Errors": interfaces_in_errors[index].value,
                "Outbound_Errors": interfaces_out_errors[index].value,
                "Status": "Up" if interface_status[index].value == "1" else "Down",  # 1 = Up, 2 = Down
                "IP_Address": ip_to_interface.get(interface_index, "N/A")  # Get IP or "N/A" if none exists
        }
            interfaces_data.append(interface_info)

        data['Interfaces'] = interfaces_data


    except Exception as e:
        print(f"Error collecting SNMP data from {device_ip}: {e}")
        return None

    return data

# Function to collect system performance using psutil
def collect_system_performance():
    performance_data = {}

    try:
        # Collect CPU usage
        performance_data['CPU-Usage'] = psutil.cpu_percent(interval=1)

        # Collect memory usage
        memory = psutil.virtual_memory()
        performance_data['RAM-Usage'] = memory.percent

        # Collect network statistics
        net = psutil.net_io_counters()
        performance_data['Bytes Sent'] = net.bytes_sent
        performance_data['Bytes Received'] = net.bytes_recv

    except Exception as e:
        print(f"Error collecting system performance data: {e}")
        return None

    return performance_data

# List of devices to monitor
devices = {
    "routers": ['172.168.100.1', '172.168.200.1'],  # Routers/Switches
    "pcs": ['172.168.100.3', '172.168.200.2']       # PCs/Servers
}

all_device_data = []

# Monitor routers
for router in devices["routers"]:
    snmp_data = collect_snmp_data(router)
    if snmp_data:
        # Add psutil data for the router
        system_performance = collect_system_performance()
        if system_performance:
            snmp_data.update(system_performance)
        snmp_data['IP'] = router
        snmp_data['Timestamp'] = datetime.now().isoformat()
        all_device_data.append(snmp_data)

# Monitor PCs
for pc in devices["pcs"]:
    system_performance = collect_system_performance()
    if system_performance:
        system_performance['IP'] = pc
        system_performance['Timestamp'] = datetime.now().isoformat()
        all_device_data.append(system_performance)

# Output collected data as JSON
print(json.dumps(all_device_data, indent=4))

