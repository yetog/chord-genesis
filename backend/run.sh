#!/bin/bash
# Chord Genesis Audio Analysis Backend Startup Script

cd "$(dirname "$0")"

echo "========================================="
echo "Chord Genesis Audio Analysis API"
echo "========================================="

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Try to create/use venv
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv 2>/dev/null

    if [ $? -ne 0 ]; then
        echo ""
        echo "Note: Could not create venv. Installing globally."
        echo "For isolated environment, run: sudo apt install python3.10-venv"
        echo ""

        # Install dependencies globally
        echo "Installing dependencies..."
        pip3 install -r requirements.txt --quiet --user

        echo ""
        echo "Starting server on port 3020..."
        python3 main.py
        exit 0
    fi
fi

# Activate venv if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Run the server
echo ""
echo "Starting server on port 3020..."
echo "API docs: http://localhost:3020/docs"
echo ""
python main.py
