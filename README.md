# 🌱 MYCO2.app - Revolutionary Eco-Crypto Rewards Platform

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com)

> Turn sustainable activities into cryptocurrency prizes through skill-based eco-challenges.

## 🚀 **Quick Start with Expo.dev**

```bash
# Clone the repository
git clone https://github.com/BARRYPMARSHALL/MyCO2.git
cd MyCO2

# Install dependencies
npm install

# Start development server
expo start
```

## 🌱 Overview

MYCO2.app is a revolutionary mobile application that gamifies environmental action by rewarding users with cryptocurrency for eco-friendly activities. Users can track their environmental impact, earn points, unlock achievements, and participate in crypto giveaways while making a positive difference for the planet.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Secure User Registration** - Email/password authentication via Supabase
- **User Profiles** - Customizable profiles with eco-warrior rankings
- **Membership Levels** - Eco Starter → Eco Warrior → Green Champion → Planet Saver

### 📊 Activity Tracking
- **5 Eco-Friendly Activities**:
  - 🚶‍♂️ Walking/Biking (10 points, 2.5kg CO2 saved)
  - 🚌 Public Transit (8 points, 3.2kg CO2 saved)
  - 🥗 Plant-Based Meals (6 points, 1.8kg CO2 saved)
  - ♻️ Recycling (5 points, 1.2kg CO2 saved)
  - 💡 Energy Saving (7 points, 2.1kg CO2 saved)

### 📸 Photo Verification System
- **Camera Integration** - Take photos or select from gallery
- **GPS Location Tracking** - Automatic location verification
- **2x Points Bonus** - Double rewards for photo-verified activities
- **Secure Cloud Storage** - Photos stored in Supabase Storage

### 🏆 Achievements & Gamification
- **8 Achievement Categories** - Points, Activities, Environmental, Special
- **Progress Tracking** - Visual progress bars and completion percentages
- **Social Sharing** - Share achievements on social media
- **Membership Progression** - Clear path to next level with points needed

### 💰 Live Crypto Integration
- **Real-time Crypto Prices** - Live Bitcoin & Ethereum prices via CoinGecko API
- **Weekly Bitcoin Giveaway** - $1,000 worth of BTC every Sunday
- **Monthly Ethereum Giveaway** - $5,000 worth of ETH monthly
- **Mega Championship** - $100K mixed crypto annual prize
- **Live Countdown Timers** - Exact time until next draws

### 📈 Leaderboards & Competition
- **Global Rankings** - Points, CO2 saved, activities completed
- **Time-based Leaderboards** - Today, weekly, monthly, all-time
- **User Rank Display** - Shows exact position among all users
- **Real-time Updates** - Live leaderboard refreshing

### 📱 User Interface
- **Dark Theme Design** - Professional eco-friendly color scheme
- **Responsive Layout** - Optimized for all mobile screen sizes
- **Smooth Animations** - Animated counters and micro-interactions
- **Intuitive Navigation** - 5-tab bottom navigation system

## 🛠 Technical Architecture

### Frontend
- **React Native** - Cross-platform mobile development
- **JavaScript/ES6+** - Modern JavaScript features
- **React Hooks** - State management and lifecycle
- **Expo** - Development and deployment platform

### Backend
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database
- **Row Level Security** - User data protection
- **Real-time Subscriptions** - Live data updates

### APIs & Integrations
- **CoinGecko API** - Real-time cryptocurrency prices
- **Expo Camera** - Photo capture and gallery access
- **Expo Location** - GPS location services
- **Supabase Storage** - File upload and management

### Database Schema
```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Activity Types
activity_types (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  points_per_unit INTEGER,
  co2_saved_per_unit DECIMAL,
  icon TEXT
)

-- User Activities
user_activities (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_type_id INTEGER REFERENCES activity_types(id),
  quantity DECIMAL,
  points_earned INTEGER,
  co2_saved DECIMAL,
  notes TEXT,
  photo_url TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  verified BOOLEAN,
  created_at TIMESTAMP
)

-- Achievements
achievements (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  icon TEXT,
  points_required INTEGER,
  activities_required INTEGER,
  co2_required DECIMAL
)

-- User Achievements
user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id INTEGER REFERENCES achievements(id),
  unlocked_at TIMESTAMP
)
```

## 📱 App Screens

### 1. Home Screen
- **User Dashboard** - Points, CO2 saved, activities count
- **Live Global Stats** - Real-time community impact
- **Quick Actions** - Fast access to activity tracking
- **Membership Progress** - Current level and next milestone

### 2. Activity Tracking Screen
- **Activity Selection** - Choose from 5 eco-activities
- **Quick Log vs Photo Verify** - Option for 2x points with photos
- **Real-time Calculations** - Points and CO2 preview
- **Achievement Notifications** - Instant achievement unlocks

### 3. Achievements Screen
- **Achievement Categories** - Filter by type (Points, Activities, etc.)
- **Progress Tracking** - Visual progress bars
- **Social Sharing** - Share unlocked achievements
- **Membership Levels** - Current status and next level requirements

### 4. Crypto Giveaways Screen
- **Live Crypto Prices** - Real-time Bitcoin & Ethereum prices
- **Active Giveaways** - Weekly, Monthly, and Mega prizes
- **Countdown Timers** - Live countdown to next draws
- **Entry Requirements** - How to participate and win

### 5. Profile Screen
- **User Information** - Profile details and statistics
- **Activity History** - Complete timeline with photos
- **Settings** - Account management and preferences
- **Sign Out** - Secure logout functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally
- Supabase account and project
- Mobile device or emulator for testing

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MYCO2MobileApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
- Create a new Supabase project
- Copy your project URL and anon key
- Update `lib/supabase.js` with your credentials

4. **Set up database**
- Run the SQL scripts in the `database/` folder
- Import activity types and achievements data

5. **Start the development server**
```bash
npx expo start
```

6. **Run on device**
- Scan QR code with Expo Go app
- Or run on iOS/Android simulator

## 🗄 Database Setup

### 1. Create Tables
```bash
# Run these SQL files in order:
database/simple_schema.sql      # Basic table structure
database/data_inserts.sql       # Sample data
database/functions_and_policies.sql  # Security policies
database/storage_setup.sql      # File storage configuration
```

### 2. Configure Storage
- Enable storage in Supabase dashboard
- Create `activity-photos` bucket
- Set appropriate permissions for file uploads

### 3. Set up Authentication
- Enable email authentication in Supabase
- Configure email templates (optional)
- Set up social providers (optional)

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Configuration
- **CoinGecko API** - Free tier, no API key required
- **Rate Limits** - 30-second intervals for price updates
- **Fallback Data** - Hardcoded prices if API fails

## 📊 Performance Optimization

### Real-time Updates
- **Price Updates** - 30-second intervals for crypto prices
- **Leaderboard Refresh** - Manual refresh to avoid excessive API calls
- **Achievement Checks** - Triggered only after activity logging

### Image Optimization
- **Photo Compression** - Automatic compression before upload
- **Thumbnail Generation** - Smaller images for list views
- **Lazy Loading** - Images loaded on demand

### Database Optimization
- **Indexed Queries** - Optimized for leaderboard and stats queries
- **Row Level Security** - User data isolation
- **Connection Pooling** - Efficient database connections

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration with email/password
- [ ] User login with valid credentials
- [ ] Error handling for invalid credentials
- [ ] Automatic session persistence
- [ ] Secure logout functionality

#### Activity Tracking
- [ ] Log activities with quantity and notes
- [ ] Photo verification with camera/gallery
- [ ] GPS location capture
- [ ] Points and CO2 calculations
- [ ] Achievement notifications

#### Achievements
- [ ] Achievement progress tracking
- [ ] Automatic unlocking when requirements met
- [ ] Social sharing functionality
- [ ] Category filtering
- [ ] Membership level progression

#### Crypto Features
- [ ] Real-time price updates
- [ ] Countdown timer accuracy
- [ ] Prize value calculations
- [ ] Giveaway information display
- [ ] Social sharing for giveaways

#### Performance
- [ ] App startup time < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] Image loading and caching
- [ ] Network error handling
- [ ] Offline functionality (basic)

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Or use EAS Build (recommended)
npx eas build --platform all
```

### App Store Deployment
1. **iOS App Store**
   - Apple Developer account required
   - Follow App Store guidelines
   - Submit for review

2. **Google Play Store**
   - Google Play Developer account required
   - Follow Play Store policies
   - Upload APK/AAB file

### Beta Testing
- **TestFlight** (iOS) - Internal and external testing
- **Google Play Console** (Android) - Internal testing track
- **Expo Updates** - Over-the-air updates for testing

## 📈 Analytics & Monitoring

### Key Metrics to Track
- **User Engagement** - Daily/monthly active users
- **Activity Logging** - Activities per user per day
- **Photo Verification** - Percentage of verified activities
- **Achievement Unlocks** - Most popular achievements
- **Retention Rates** - User retention over time

### Error Monitoring
- **Crash Reporting** - Automatic crash detection
- **API Error Tracking** - Failed requests and timeouts
- **Performance Monitoring** - App performance metrics

## 🔒 Security & Privacy

### Data Protection
- **Encryption** - All data encrypted in transit and at rest
- **User Privacy** - Minimal data collection
- **GDPR Compliance** - User data rights and deletion
- **Secure Authentication** - Industry-standard practices

### API Security
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize all user inputs
- **SQL Injection Protection** - Parameterized queries
- **File Upload Security** - Validate file types and sizes

## 🤝 Contributing

### Development Guidelines
1. Follow React Native best practices
2. Use consistent code formatting (Prettier)
3. Write meaningful commit messages
4. Test all features before submitting
5. Update documentation for new features

### Code Structure
```
MYCO2MobileApp/
├── components/          # React Native components
├── lib/                # Utility libraries and APIs
├── database/           # SQL scripts and schema
├── assets/             # Images, icons, and static files
├── store-assets/       # App store screenshots and graphics
└── docs/              # Additional documentation
```

## 📞 Support

### Common Issues
1. **Supabase Connection** - Check URL and API key
2. **Photo Upload Fails** - Verify storage bucket permissions
3. **Crypto Prices Not Loading** - Check internet connection
4. **Achievement Not Unlocking** - Verify database triggers

### Getting Help
- Check the troubleshooting guide
- Review Supabase documentation
- Contact development team
- Submit bug reports with detailed information

## 📄 License

This project is proprietary software. All rights reserved.

## 🎯 Roadmap

### Version 2.0 Features
- [ ] Social features and friend connections
- [ ] Team challenges and competitions
- [ ] More cryptocurrency options
- [ ] Carbon offset marketplace
- [ ] AI-powered activity suggestions
- [ ] Wearable device integration

### Long-term Vision
- Global eco-warrior community
- Real environmental impact measurement
- Corporate sustainability partnerships
- Educational content and resources
- Blockchain-based reward system

---

**Built with ❤️ for the planet 🌍**

*MYCO2.app - Making environmental action rewarding and fun!*

