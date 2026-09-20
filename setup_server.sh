#!/bin/bash
set -e

echo "=== 1. Configurando Firewall interno de Oracle ==="
sudo iptables -I INPUT 6 -m state --state NEW -p tcp -m multiport --dports 80,443,8000,5173 -j ACCEPT || true
which netfilter-persistent && sudo netfilter-persistent save || true

echo "=== 2. Instalando Docker ==="
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu

echo "=== 3. Verificando versiones ==="
sudo docker --version
sudo docker compose version
echo "=== Docker instalado exitosamente! ==="
