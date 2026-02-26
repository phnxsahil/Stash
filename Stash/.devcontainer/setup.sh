#!/bin/bash

echo "🚀 Setting up Stash development environment..."

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y ffmpeg

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.backend.txt

# Create .env from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual credentials!"
fi

# Make scripts executable
chmod +x .devcontainer/setup.sh

echo "✅ Setup complete! Environment is ready."
echo ""
echo "📋 Next steps:"
echo "  1. Update .env with your API credentials"
echo "  2. Run 'npm run dev' to start the frontend"
echo "  3. Run 'python main.py' to start the backend"
echo ""
echo "🎵 Happy coding!"
