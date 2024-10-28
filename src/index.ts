import express from 'express';
import sequelize from './config/database';
import User from './models/User';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import senderRoutes from './routes/senderRoutes';
import messageTemplateRoutes from './routes/messageTemplateRoutes';
import scheduleMessageRoutes from './routes/ScheduleMessageRoutes';
import sendMessageRoutes from './routes/sendMessageRoutes';
import contactRoutes from './routes/contactRoutes';
import groupRoutes from './routes/groupRoutes';
import optRoutes from './routes/otpRoutes';
import contactGroupRoutes from './routes/ContactGroupRoutes';
import apiKeysRoutes from  './routes/apiKeysRoutes';
import developerRoutes from './routes/developerSendMessageRoute'; // Adjust path as needed
import WalletHistory from './routes/walletHistoryRoutes'; // Adjust path as needed
import PackagesController from './routes/packagesRoute'; // Adjust path as needed
import BundleHistory from './routes/bundleHistoryRoutes';
import CreditUsageRoute from './routes/creditusageRoute';
import CreditUsageOrderRoute from  './routes/creditusageorderRoute';
import checkExpiredBundles from './Controller/expirycheck';
import { OtpController } from './Controller/otpController';
const app = express();
app.use(cors({
  origin: true, // Allow all domains for testing, you can restrict it later
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Allow specific HTTP methods
  allowedHeaders: 'Content-Type, Authorization' // Allow specific headers
}));

const port = 5000;
 
app.use(express.json());
checkExpiredBundles()
app.use('/auth', authRoutes);
app.use('/senders', senderRoutes);
app.use('/message-templates', messageTemplateRoutes);
app.use('/schedule-messages', scheduleMessageRoutes);
app.use('/send-messages', sendMessageRoutes);
app.use('/contacts', contactRoutes);
app.use('/groups', groupRoutes);
app.use('/contactgroups', contactGroupRoutes);
app.use('/apikeys', apiKeysRoutes);
app.use('/api', developerRoutes);
app.use('/wallet', WalletHistory);
app.use('/otp', optRoutes);
 
app.use('/packages', PackagesController);
app.use('/creditusage', CreditUsageRoute);
app.use('/creditusageorder', CreditUsageOrderRoute);
app.use('/bundle', BundleHistory);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  
  try {
     sequelize.sync({ alter: true }); // Sync all models
    console.log('Database & tables created!');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
});

