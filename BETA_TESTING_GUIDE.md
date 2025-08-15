# MYCO2.app Beta Testing Guide

## 🎯 Welcome Beta Testers!

Thank you for joining the MYCO2.app beta testing program! Your feedback is crucial in making this the most amazing eco-crypto app ever created. This guide will help you test all features effectively and provide valuable feedback.

## 📱 Getting Started

### Installation
1. **Download Expo Go** app from your device's app store
2. **Scan the QR code** provided by the development team
3. **Wait for the app to load** (first load may take 30-60 seconds)
4. **Create your account** using a valid email address

### Initial Setup
1. **Register** with your email and create a strong password
2. **Complete your profile** with a username
3. **Explore the home screen** to familiarize yourself with the interface
4. **Check all 5 tabs** in the bottom navigation

## 🧪 Testing Scenarios

### 1. Authentication Testing (Priority: HIGH)

#### Test Cases:
- [ ] **Registration**: Create account with valid email/password
- [ ] **Login**: Sign in with correct credentials
- [ ] **Invalid Login**: Try wrong password (should show error)
- [ ] **Session Persistence**: Close app and reopen (should stay logged in)
- [ ] **Logout**: Sign out and verify you're logged out

#### What to Look For:
- Clear error messages for invalid inputs
- Smooth transitions between screens
- Proper form validation
- Loading indicators during authentication

### 2. Activity Tracking Testing (Priority: HIGH)

#### Test Cases:
- [ ] **Quick Log Activity**: Log each of the 5 activity types
- [ ] **Photo Verification**: Take photos for activities (try both camera and gallery)
- [ ] **Quantity Input**: Test different quantities (0.5, 1, 5, 10)
- [ ] **Notes Field**: Add notes to activities
- [ ] **Points Calculation**: Verify points are calculated correctly
- [ ] **Achievement Notifications**: Watch for achievement popups

#### Expected Results:
- Walking/Biking: 10 points, 2.5kg CO2 per unit
- Public Transit: 8 points, 3.2kg CO2 per unit
- Plant-Based Meals: 6 points, 1.8kg CO2 per unit
- Recycling: 5 points, 1.2kg CO2 per unit
- Energy Saving: 7 points, 2.1kg CO2 per unit

#### Photo Verification Bonus:
- Photo-verified activities should earn **2x points**
- GPS location should be captured automatically
- Photos should upload successfully to cloud storage

### 3. Achievements System Testing (Priority: MEDIUM)

#### Test Cases:
- [ ] **View Achievements**: Navigate to achievements screen
- [ ] **Progress Tracking**: Check progress bars for incomplete achievements
- [ ] **Category Filtering**: Test all category filters (All, Points, Activities, etc.)
- [ ] **Achievement Unlocking**: Log activities until you unlock achievements
- [ ] **Social Sharing**: Try sharing an unlocked achievement

#### Expected Achievements:
- **First Steps**: Log 1 activity
- **Getting Started**: Log 5 activities
- **Eco Warrior**: Earn 1,000 points
- **Green Champion**: Earn 5,000 points
- **Planet Saver**: Earn 10,000 points
- **Carbon Crusher**: Save 50kg CO2
- **Climate Champion**: Save 100kg CO2
- **Photo Verified**: Upload first photo

### 4. Crypto Giveaways Testing (Priority: MEDIUM)

#### Test Cases:
- [ ] **Live Prices**: Check if Bitcoin and Ethereum prices are updating
- [ ] **Countdown Timers**: Verify countdown timers are working
- [ ] **Prize Calculations**: Check if prize values update with crypto prices
- [ ] **Giveaway Information**: Read through all giveaway details
- [ ] **Social Sharing**: Share giveaway information
- [ ] **How to Enter**: Check entry requirements

#### What to Verify:
- Prices should update every 30 seconds
- Countdown timers should be accurate
- Prize values should reflect current crypto prices
- All giveaway information should be clear and accurate

### 5. Profile & History Testing (Priority: LOW)

#### Test Cases:
- [ ] **Profile Information**: Check your profile details
- [ ] **Activity History**: View your logged activities
- [ ] **Photo Gallery**: View photos from verified activities
- [ ] **Statistics**: Check total points, CO2 saved, activities
- [ ] **Settings**: Test any available settings

## 🐛 Bug Reporting

### How to Report Bugs

#### High Priority Bugs (Report Immediately):
- App crashes or freezes
- Cannot log in or register
- Activities not saving
- Photos not uploading
- Points not calculating correctly

#### Medium Priority Bugs:
- UI layout issues
- Slow loading times
- Minor calculation errors
- Text or spelling errors

#### Low Priority Bugs:
- Cosmetic issues
- Suggestions for improvements
- Feature requests

### Bug Report Template:
```
**Bug Title**: Brief description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: What should happen

**Actual Result**: What actually happened

**Device Info**:
- Device: (iPhone 12, Samsung Galaxy S21, etc.)
- OS Version: (iOS 15.0, Android 11, etc.)
- App Version: Beta 1.0

**Screenshots**: (If applicable)

**Additional Notes**: Any other relevant information
```

### Where to Report:
- **Email**: [beta-feedback@myco2.app]
- **Slack Channel**: #beta-testing (if provided)
- **Google Form**: [Link to feedback form]

## 📊 Testing Focus Areas

### Week 1: Core Functionality
- **Focus**: Authentication, activity logging, basic navigation
- **Goal**: Ensure core features work reliably
- **Time**: 30-45 minutes of testing

### Week 2: Advanced Features
- **Focus**: Photo verification, achievements, crypto features
- **Goal**: Test all advanced functionality
- **Time**: 45-60 minutes of testing

### Week 3: Performance & Polish
- **Focus**: Speed, animations, edge cases
- **Goal**: Find performance issues and polish problems
- **Time**: 30-45 minutes of testing

## 🎯 Specific Test Scenarios

### Scenario 1: New User Journey
1. Download and install the app
2. Create a new account
3. Log your first activity (walking)
4. Take a photo for verification
5. Check if "First Steps" achievement unlocks
6. Explore all tabs in the app
7. Log 4 more activities to unlock "Getting Started"

### Scenario 2: Power User Testing
1. Log 20+ activities over several days
2. Mix quick logs and photo verifications
3. Try to unlock multiple achievements
4. Check leaderboard rankings
5. Share achievements on social media
6. Test all crypto giveaway features

### Scenario 3: Edge Case Testing
1. Try logging activities with quantity 0
2. Test with very large quantities (999)
3. Try uploading very large photos
4. Test with poor internet connection
5. Try rapid-fire activity logging
6. Test app behavior when phone is rotated

## 📈 Performance Testing

### What to Monitor:
- **App Startup Time**: Should be under 3 seconds
- **Photo Upload Speed**: Should complete within 10 seconds
- **Screen Transitions**: Should be smooth and responsive
- **Crypto Price Updates**: Should update every 30 seconds
- **Battery Usage**: Monitor for excessive battery drain

### Performance Issues to Report:
- App takes longer than 5 seconds to start
- Photos take longer than 15 seconds to upload
- Animations are choppy or laggy
- App uses excessive battery
- App becomes unresponsive

## 🔄 Feedback Categories

### 1. Usability Feedback
- Is the app easy to navigate?
- Are the instructions clear?
- Is the design intuitive?
- Are there any confusing elements?

### 2. Feature Feedback
- Which features do you love?
- Which features need improvement?
- What features are missing?
- How can we make the app more engaging?

### 3. Content Feedback
- Are the activity descriptions clear?
- Is the achievement system motivating?
- Are the giveaway terms understandable?
- Is any information missing or unclear?

### 4. Technical Feedback
- How is the app performance?
- Are there any bugs or glitches?
- How is the photo upload experience?
- Are the crypto prices accurate?

## 🏆 Beta Tester Rewards

### Recognition Program:
- **Top Bug Reporter**: Most valuable bug reports
- **Feature Champion**: Best feature suggestions
- **Community Helper**: Helps other beta testers
- **Endurance Tester**: Most comprehensive testing

### Rewards:
- **Early Access**: First access to new features
- **Special Badge**: Exclusive beta tester achievement
- **Crypto Bonus**: Extra entries in giveaways
- **Recognition**: Listed in app credits (optional)

## 📅 Testing Schedule

### Phase 1: Core Testing (Week 1)
- **Focus**: Basic functionality
- **Participants**: All beta testers
- **Feedback Due**: End of week 1

### Phase 2: Advanced Testing (Week 2)
- **Focus**: Advanced features and edge cases
- **Participants**: Experienced testers
- **Feedback Due**: End of week 2

### Phase 3: Polish Testing (Week 3)
- **Focus**: Performance and final polish
- **Participants**: Selected testers
- **Feedback Due**: End of week 3

## 📞 Support & Communication

### Getting Help:
- **FAQ**: Check the FAQ section first
- **Community**: Ask other beta testers
- **Direct Support**: Contact the development team

### Communication Channels:
- **Email Updates**: Weekly progress updates
- **Slack/Discord**: Real-time chat with team and testers
- **Video Calls**: Optional feedback sessions

### Response Times:
- **Bug Reports**: 24-48 hours
- **Feature Requests**: 3-5 days
- **General Questions**: 24 hours

## ✅ Testing Checklist

### Daily Testing (5-10 minutes):
- [ ] Log at least one activity
- [ ] Check for new achievements
- [ ] Verify crypto prices are updating
- [ ] Test one random feature

### Weekly Testing (30-45 minutes):
- [ ] Complete a full user journey
- [ ] Test photo verification
- [ ] Explore all app sections
- [ ] Submit feedback report

### Special Testing (As needed):
- [ ] Test after app updates
- [ ] Test specific bug fixes
- [ ] Test new features
- [ ] Participate in focused testing sessions

## 🎉 Thank You!

Your participation in the MYCO2.app beta testing program is invaluable. Together, we're building an app that will revolutionize how people think about environmental action and cryptocurrency rewards.

**Remember**: The goal is to find issues now so we can fix them before the public launch. Don't hesitate to report anything that seems off, no matter how small!

**Happy Testing! 🌱💚🚀**

---

*For questions about this guide or the testing process, contact the development team at beta-support@myco2.app*

