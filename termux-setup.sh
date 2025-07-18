#!/bin/bash

# Real Money Gaming App - Termux Setup Script
echo "🎮 Setting up Real Money Gaming App in Termux..."

# Update packages
echo "📦 Updating packages..."
pkg update -y
pkg upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
pkg install -y nodejs npm git mongodb

# Setup directories
echo "📁 Setting up directories..."
mkdir -p ~/gaming-app
cd ~/gaming-app

# Copy application files (assuming they're already in current directory)
echo "📋 Copying application files..."
if [ -d "/workspace" ]; then
    cp -r /workspace/* ~/gaming-app/
fi

# Install backend dependencies
echo "🛠️ Installing backend dependencies..."
cd ~/gaming-app/backend
npm install

# Install frontend dependencies  
echo "🛠️ Installing frontend dependencies..."
cd ~/gaming-app
npm install

# Setup MongoDB
echo "🗃️ Setting up MongoDB..."
mkdir -p ~/gaming-app/data/db

# Create startup script
echo "📝 Creating startup script..."
cat > ~/gaming-app/start-app.sh << 'EOF'
#!/bin/bash

echo "🎮 Starting Real Money Gaming App..."

# Start MongoDB
echo "🗃️ Starting MongoDB..."
mongod --dbpath ~/gaming-app/data/db --port 27017 --bind_ip 127.0.0.1 &
MONGO_PID=$!

# Wait for MongoDB to start
sleep 5

# Start backend server
echo "🚀 Starting backend server..."
cd ~/gaming-app/backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo "✅ App started successfully!"
echo "📱 Backend running on: http://localhost:3000"
echo "🎮 You can now run the React Native app"
echo ""
echo "To stop the app, run: ~/gaming-app/stop-app.sh"

# Save PIDs for stopping later
echo $MONGO_PID > ~/gaming-app/mongo.pid
echo $BACKEND_PID > ~/gaming-app/backend.pid

# Keep script running
wait
EOF

# Create stop script
echo "📝 Creating stop script..."
cat > ~/gaming-app/stop-app.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Real Money Gaming App..."

# Stop backend
if [ -f ~/gaming-app/backend.pid ]; then
    BACKEND_PID=$(cat ~/gaming-app/backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm ~/gaming-app/backend.pid
    echo "🚀 Backend stopped"
fi

# Stop MongoDB
if [ -f ~/gaming-app/mongo.pid ]; then
    MONGO_PID=$(cat ~/gaming-app/mongo.pid)
    kill $MONGO_PID 2>/dev/null
    rm ~/gaming-app/mongo.pid
    echo "🗃️ MongoDB stopped"
fi

echo "✅ App stopped successfully!"
EOF

# Make scripts executable
chmod +x ~/gaming-app/start-app.sh
chmod +x ~/gaming-app/stop-app.sh

# Create React Native bundle for Android
echo "📱 Creating React Native bundle..."
cd ~/gaming-app
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Create APK build script
echo "📱 Creating APK build script..."
cat > ~/gaming-app/build-apk.sh << 'EOF'
#!/bin/bash

echo "📱 Building APK..."

cd ~/gaming-app

# Install Android development tools
if [ ! -d "$HOME/android-sdk" ]; then
    echo "📥 Downloading Android SDK..."
    pkg install -y wget unzip
    cd ~
    wget https://dl.google.com/android/repository/commandlinetools-linux-7583922_latest.zip
    unzip commandlinetools-linux-7583922_latest.zip
    mkdir -p android-sdk/cmdline-tools
    mv cmdline-tools android-sdk/cmdline-tools/latest
    rm commandlinetools-linux-7583922_latest.zip
fi

# Setup environment variables
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses and install required packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"

# Generate Android project if not exists
if [ ! -d "android" ]; then
    npx react-native init TempProject
    cp -r TempProject/android ~/gaming-app/
    rm -rf TempProject
fi

# Update constants for localhost
sed -i "s|http://localhost:3000|http://10.0.2.2:3000|g" src/utils/constants.js

# Build the APK
cd android
./gradlew assembleRelease

echo "✅ APK built successfully!"
echo "📱 APK location: ~/gaming-app/android/app/build/outputs/apk/release/app-release.apk"
EOF

chmod +x ~/gaming-app/build-apk.sh

# Create README for Termux
cat > ~/gaming-app/TERMUX-README.md << 'EOF'
# 🎮 Real Money Gaming App - Termux Setup

## ✅ Installation Complete!

Your real money gaming app has been set up successfully in Termux.

## 🚀 Starting the App

To start the app:
```bash
~/gaming-app/start-app.sh
```

## 🛑 Stopping the App

To stop the app:
```bash
~/gaming-app/stop-app.sh
```

## 📱 Building APK

To build an Android APK:
```bash
~/gaming-app/build-apk.sh
```

## 🔧 Features

- **Mini Games**: Coin Flip, Number Guess, Lucky Wheel
- **Wallet System**: Deposit (min ₹100), Withdraw (min ₹50)
- **Commission System**: 50% commission on all games
- **User Authentication**: Secure login/registration
- **Real-time Balance Updates**

## 🎯 Game Details

### Coin Flip
- 50% win chance
- 1.8x multiplier
- Choose heads or tails

### Number Guess  
- 10% win chance
- 9x multiplier
- Guess number 1-10

### Lucky Wheel
- Variable win chances
- Up to 5x multiplier
- Spin the wheel of fortune

## 💰 Commission Structure

- **You earn 50% commission** on all game transactions
- Commission is tracked in the profile section
- Real-time commission updates

## 📋 Requirements

- Android device for APK installation
- Termux app
- At least 2GB free storage
- Internet connection

## 🌐 API Endpoints

Backend runs on `http://localhost:3000` with endpoints:
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/wallet/deposit` - Add cash
- `/api/wallet/withdraw` - Withdraw cash
- `/api/games/play` - Play games
- `/api/admin/commission` - Get commission data

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation

## 📞 Support

For issues or questions, check the logs:
```bash
cd ~/gaming-app/backend
npm run dev
```
EOF

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📱 Your Real Money Gaming App is ready!"
echo ""
echo "🚀 To start the app: ~/gaming-app/start-app.sh"
echo "🛑 To stop the app: ~/gaming-app/stop-app.sh"
echo "📱 To build APK: ~/gaming-app/build-apk.sh"
echo ""
echo "📖 Check ~/gaming-app/TERMUX-README.md for detailed instructions"
echo ""
echo "💰 Features:"
echo "   • Mini games with real money betting"
echo "   • 50% commission on all transactions"
echo "   • Minimum deposit: ₹100"
echo "   • Minimum withdrawal: ₹50"
echo "   • Secure user authentication"
echo ""
echo "🎮 Games included:"
echo "   • Coin Flip (1.8x multiplier)"
echo "   • Number Guess (9x multiplier)"  
echo "   • Lucky Wheel (up to 5x multiplier)"
echo ""
echo "✅ Ready to deploy!"