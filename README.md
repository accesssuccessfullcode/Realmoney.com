# 🎮 Real Money Gaming App

A complete real money gaming application with mini-games, wallet system, and commission tracking. Built with React Native and Node.js, deployable on Termux.

## 🌟 Features

### 🎯 Mini Games
- **Coin Flip**: 50/50 chance, 1.8x multiplier
- **Number Guess**: 1/10 chance, 9x multiplier  
- **Lucky Wheel**: Variable chances, up to 5x multiplier

### 💰 Wallet System
- **Deposits**: Minimum ₹100
- **Withdrawals**: Minimum ₹50
- **Real-time balance updates**
- **Transaction history**

### 📊 Commission System
- **50% commission** on all game transactions
- **Real-time tracking**
- **Daily and total commission reports**

### 🔒 Security Features
- **JWT Authentication**
- **Password hashing with bcrypt**
- **Rate limiting**
- **Input validation**

## 🚀 Quick Setup (Termux)

1. **Download and install Termux** from F-Droid or Google Play
2. **Run the setup script**:
   ```bash
   ./termux-setup.sh
   ```
3. **Start the application**:
   ```bash
   ~/gaming-app/start-app.sh
   ```

## 📱 Manual Installation

### Prerequisites
- Node.js 16+ 
- MongoDB
- React Native CLI
- Android SDK (for APK building)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
npm install
npx react-native run-android
```

## 🎮 Game Rules

### Coin Flip
- Choose heads or tails
- 50% win probability
- Win 1.8x your bet amount
- House edge: 10%

### Number Guess
- Guess a number between 1-10
- 10% win probability  
- Win 9x your bet amount
- House edge: 10%

### Lucky Wheel
- Spin the wheel
- Multiple win segments
- Win up to 5x your bet
- Variable house edge

## 💻 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Wallet
- `GET /api/user/profile` - Get user profile
- `POST /api/wallet/deposit` - Deposit money
- `POST /api/wallet/withdraw` - Withdraw money
- `GET /api/wallet/transactions` - Transaction history

### Games
- `POST /api/games/play` - Play a game
- `GET /api/games/history` - Game history

### Admin
- `GET /api/admin/commission` - Commission statistics

## 🛠️ Project Structure

```
real-money-gaming-app/
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── src/                    # React Native source
│   ├── screens/           # App screens
│   ├── utils/             # Utilities
│   └── components/        # Reusable components
├── termux-setup.sh        # Termux deployment script
└── package.json           # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gaming_app
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### API Base URL
Update `src/utils/constants.js` for your deployment:
```javascript
export const API_BASE_URL = 'http://your-server:3000';
```

## 📊 Commission Tracking

The app automatically tracks commissions:
- **50% of every bet** goes to you as commission
- **Win or lose**, you earn commission
- **Real-time updates** in the profile section
- **Daily and total** commission reports

## 🎯 Monetization

### Revenue Streams
1. **Game Commissions**: 50% of all bets
2. **House Edge**: Built into game mathematics
3. **Transaction Fees**: Optional withdrawal fees

### Expected Earnings
- **₹100 bet** = ₹50 commission to you
- **₹1000 daily volume** = ₹500 daily commission
- **Scalable** with user growth

## 🔐 Security Best Practices

1. **Change default JWT secret** in production
2. **Use HTTPS** for production deployment
3. **Implement rate limiting** for API calls
4. **Regular backups** of MongoDB data
5. **Monitor transactions** for suspicious activity

## 📱 Building APK

Run the build script:
```bash
~/gaming-app/build-apk.sh
```

APK will be created at:
```
~/gaming-app/android/app/build/outputs/apk/release/app-release.apk
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB won't start**:
```bash
mongod --repair --dbpath ~/gaming-app/data/db
```

**Backend port already in use**:
```bash
killall node
~/gaming-app/start-app.sh
```

**React Native bundle error**:
```bash
npx react-native start --reset-cache
```

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  balance: Number,
  totalDeposits: Number,
  totalWinnings: Number,
  gamesPlayed: Number,
  createdAt: Date
}
```

### Transactions Collection
```javascript
{
  userId: ObjectId,
  type: String, // 'deposit', 'withdrawal', 'game_win', 'game_loss'
  amount: Number,
  description: String,
  status: String, // 'pending', 'completed', 'failed'
  createdAt: Date
}
```

### Game Results Collection
```javascript
{
  userId: ObjectId,
  gameType: String,
  betAmount: Number,
  winAmount: Number,
  result: String, // 'win', 'loss'
  commission: Number,
  gameData: Object,
  createdAt: Date
}
```

## 📈 Scaling Considerations

1. **Database Indexing**: Add indexes for user queries
2. **Load Balancing**: Use multiple server instances
3. **Caching**: Implement Redis for session management
4. **CDN**: Serve static assets via CDN
5. **Monitoring**: Add application monitoring

## 🎮 Game Mathematics

### House Edge Calculation
- **Coin Flip**: (1 - 0.5 × 1.8) = 10% house edge
- **Number Guess**: (1 - 0.1 × 9) = 10% house edge
- **Lucky Wheel**: Variable based on segments

### Commission Structure
- **Player loses**: You get 50% of bet amount
- **Player wins**: You get 50% of bet amount
- **Always profitable** regardless of game outcome

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section
2. Review server logs: `cd ~/gaming-app/backend && npm run dev`
3. Check MongoDB logs in the data directory

## ⚖️ Legal Disclaimer

This application is for educational purposes. Ensure compliance with local gambling laws and regulations before deployment. The developers are not responsible for any legal issues arising from the use of this application.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Termux deployment**

Ready to start earning? Run `./termux-setup.sh` and launch your gaming empire! 🚀