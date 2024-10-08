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
import contactGroupRoutes from './routes/ContactGroupRoutes';
import apiKeysRoutes from  './routes/apiKeysRoutes';
import developerRoutes from './routes/developerSendMessageRoute'; // Adjust path as needed


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.100.126:3000','192.168.137.1'],
  // origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const port = 5000;
 
app.use(express.json());

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



app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  
  try {
    await sequelize.sync({ alter: true }); // Sync all models
    console.log('Database & tables created!');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
});
