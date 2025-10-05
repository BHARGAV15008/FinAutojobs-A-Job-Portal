#!/bin/bash

# =============================================================================
# IP Address Detection Script
# =============================================================================

echo "🔍 Detecting your machine's IP address..."
echo "========================================"

# Function to get machine IP using multiple methods
get_machine_ip() {
    local ip=""
    local method=""
    
    echo "Trying different methods to detect IP..."
    
    # Method 1: ip route command (most reliable)
    if command -v ip &> /dev/null; then
        echo "  📡 Trying 'ip route' command..."
        ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
        if [ -n "$ip" ]; then
            method="ip route"
            echo "  ✅ Found IP using 'ip route': $ip"
            echo "$ip|$method"
            return
        fi
    fi
    
    # Method 2: ip addr command
    if command -v ip &> /dev/null; then
        echo "  📡 Trying 'ip addr' command..."
        ip=$(ip addr show 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)
        if [ -n "$ip" ]; then
            method="ip addr"
            echo "  ✅ Found IP using 'ip addr': $ip"
            echo "$ip|$method"
            return
        fi
    fi
    
    # Method 3: hostname command
    if command -v hostname &> /dev/null; then
        echo "  📡 Trying 'hostname -I' command..."
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [ -n "$ip" ]; then
            method="hostname -I"
            echo "  ✅ Found IP using 'hostname -I': $ip"
            echo "$ip|$method"
            return
        fi
    fi
    
    # Method 4: ifconfig command
    if command -v ifconfig &> /dev/null; then
        echo "  📡 Trying 'ifconfig' command..."
        ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1 | sed 's/addr://')
        if [ -n "$ip" ]; then
            method="ifconfig"
            echo "  ✅ Found IP using 'ifconfig': $ip"
            echo "$ip|$method"
            return
        fi
    fi
    
    # Method 5: Check specific network interfaces
    echo "  📡 Checking common network interfaces..."
    for interface in eth0 wlan0 enp0s3 wlp2s0 ens33; do
        if command -v ifconfig &> /dev/null; then
            ip=$(ifconfig "$interface" 2>/dev/null | grep "inet " | awk '{print $2}' | sed 's/addr://')
            if [ -n "$ip" ] && [ "$ip" != "127.0.0.1" ]; then
                method="ifconfig $interface"
                echo "  ✅ Found IP on interface $interface: $ip"
                echo "$ip|$method"
                return
            fi
        fi
    done
    
    # Method 6: Parse /proc/net/route
    if [ -f /proc/net/route ]; then
        echo "  📡 Checking /proc/net/route..."
        local default_interface=$(awk '/^[a-zA-Z0-9]+[ \t]+00000000/ {print $1; exit}' /proc/net/route 2>/dev/null)
        if [ -n "$default_interface" ] && command -v ifconfig &> /dev/null; then
            ip=$(ifconfig "$default_interface" 2>/dev/null | grep "inet " | awk '{print $2}' | sed 's/addr://')
            if [ -n "$ip" ]; then
                method="/proc/net/route + ifconfig"
                echo "  ✅ Found IP via route table: $ip"
                echo "$ip|$method"
                return
            fi
        fi
    fi
    
    echo "  ❌ Could not detect IP automatically"
    echo "|"
}

# Get IP and method
result=$(get_machine_ip)
ip=$(echo "$result" | cut -d'|' -f1)
method=$(echo "$result" | cut -d'|' -f2)

echo ""
if [ -n "$ip" ]; then
    echo "🎉 SUCCESS!"
    echo "=========="
    echo "📍 Your machine's IP address: $ip"
    echo "🔧 Detection method: $method"
    echo ""
    echo "📋 Network Information:"
    echo "======================"
    echo "Local access URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo ""
    echo "Network access URLs:"
    echo "  Frontend: http://$ip:3000"
    echo "  Backend:  http://$ip:5000"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run: ./setup-network.sh (it should work now)"
    echo "2. Or manually replace YOUR_MACHINE_IP with: $ip"
    echo ""
else
    echo "❌ MANUAL CONFIGURATION REQUIRED"
    echo "================================"
    echo "Could not automatically detect your IP address."
    echo ""
    echo "Please find your IP manually:"
    echo ""
    echo "Option 1 - Check network settings:"
    echo "  • Open network settings in your system"
    echo "  • Look for your active connection"
    echo "  • Note the IP address (usually 192.168.x.x or 10.x.x.x)"
    echo ""
    echo "Option 2 - Use network commands:"
    echo "  • Try: ip a"
    echo "  • Try: ifconfig"
    echo "  • Try: nmcli device show"
    echo ""
    echo "Option 3 - Check router admin panel:"
    echo "  • Open your router's web interface"
    echo "  • Look for connected devices"
    echo "  • Find your computer's IP"
    echo ""
    echo "Once you have your IP address:"
    echo "1. Edit frontend/.env and replace YOUR_MACHINE_IP with your IP"
    echo "2. Edit backend/.env and replace YOUR_MACHINE_IP with your IP"
    echo "3. Run the application with: ./start-network.sh"
fi

echo ""
echo "🔧 Available network interfaces:"
echo "==============================="
if command -v ip &> /dev/null; then
    ip addr show 2>/dev/null | grep -E "^[0-9]+:" | awk '{print $2}' | sed 's/://' | while read interface; do
        ip_addr=$(ip addr show "$interface" 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
        if [ -n "$ip_addr" ]; then
            echo "  📡 $interface: $ip_addr"
        fi
    done
elif command -v ifconfig &> /dev/null; then
    ifconfig 2>/dev/null | grep -E "^[a-zA-Z0-9]+" | awk '{print $1}' | sed 's/://' | while read interface; do
        ip_addr=$(ifconfig "$interface" 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | sed 's/addr://')
        if [ -n "$ip_addr" ]; then
            echo "  📡 $interface: $ip_addr"
        fi
    done
fi