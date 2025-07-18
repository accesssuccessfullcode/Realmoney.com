const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWinnings: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'game_win', 'game_loss'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Game Result Schema
const gameResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, required: true },
  betAmount: { type: Number, required: true },
  winAmount: { type: Number, default: 0 },
  result: { type: String, enum: ['win', 'loss'], required: true },
  commission: { type: Number, default: 0 },
  gameData: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const GameResult = mongoose.model('GameResult', gameResultSchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Cash (Deposit)
app.post('/api/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit amount is 100' });
    }

    // Update user balance
    const user = await User.findById(req.user.userId);
    user.balance += amount;
    user.totalDeposits += amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'deposit',
      amount,
      description: 'Cash deposit',
      status: 'completed'
    });
    await transaction.save();

    res.json({
      message: 'Deposit successful',
      newBalance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw Cash
app.post('/api/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);

    if (amount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (amount < 50) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is 50' });
    }

    // Update user balance
    user.balance -= amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'withdrawal',
      amount,
      description: 'Cash withdrawal',
      status: 'completed'
    });
    await transaction.save();

    res.json({
      message: 'Withdrawal successful',
      newBalance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Play Game
app.post('/api/games/play', authenticateToken, async (req, res) => {
  try {
    const { gameType, betAmount, gameData } = req.body;
    const user = await User.findById(req.user.userId);

    if (betAmount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (betAmount < 10) {
      return res.status(400).json({ error: 'Minimum bet amount is 10' });
    }

    let gameResult;
    let winAmount = 0;
    let commission = 0;

    // Game logic based on game type
    switch (gameType) {
      case 'coin_flip':
        const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
        if (coinResult === gameData.choice) {
          gameResult = 'win';
          winAmount = betAmount * 1.8; // 80% return
          commission = winAmount * 0.5; // 50% commission
        } else {
          gameResult = 'loss';
          commission = betAmount * 0.5; // 50% commission from loss
        }
        break;

      case 'number_guess':
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        if (randomNumber === gameData.guess) {
          gameResult = 'win';
          winAmount = betAmount * 9; // 9x multiplier
          commission = winAmount * 0.5;
        } else {
          gameResult = 'loss';
          commission = betAmount * 0.5;
        }
        break;

      case 'lucky_wheel':
        const wheelResult = Math.floor(Math.random() * 8) + 1;
        const multipliers = [0, 1.5, 2, 3, 5, 2, 1.5, 0];
        if (multipliers[wheelResult - 1] > 0) {
          gameResult = 'win';
          winAmount = betAmount * multipliers[wheelResult - 1];
          commission = winAmount * 0.5;
        } else {
          gameResult = 'loss';
          commission = betAmount * 0.5;
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid game type' });
    }

    // Update user balance
    user.balance -= betAmount;
    if (gameResult === 'win') {
      user.balance += winAmount;
      user.totalWinnings += winAmount;
    }
    user.gamesPlayed += 1;
    await user.save();

    // Create game result record
    const gameResultRecord = new GameResult({
      userId: req.user.userId,
      gameType,
      betAmount,
      winAmount,
      result: gameResult,
      commission,
      gameData
    });
    await gameResultRecord.save();

    // Create transaction records
    const gameTransaction = new Transaction({
      userId: req.user.userId,
      type: gameResult === 'win' ? 'game_win' : 'game_loss',
      amount: gameResult === 'win' ? winAmount : -betAmount,
      description: `${gameType} game ${gameResult}`,
      status: 'completed'
    });
    await gameTransaction.save();

    res.json({
      message: `Game ${gameResult}!`,
      result: gameResult,
      winAmount,
      commission,
      newBalance: user.balance,
      gameData: gameResultRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Game History
app.get('/api/games/history', authenticateToken, async (req, res) => {
  try {
    const gameHistory = await GameResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(gameHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Transactions
app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin route to get total commission
app.get('/api/admin/commission', authenticateToken, async (req, res) => {
  try {
    const totalCommission = await GameResult.aggregate([
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ]);
    
    const todayCommission = await GameResult.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ]);

    res.json({
      totalCommission: totalCommission[0]?.total || 0,
      todayCommission: todayCommission[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});