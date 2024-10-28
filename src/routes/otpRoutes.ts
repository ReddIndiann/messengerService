import express from 'express';
import { OtpController } from '../Controller/otpController';
import { UserController } from '../Controller/RegistrationProcess';
const router = express.Router();

router.post('/sendotp', OtpController.requestOtp);
router.post('/verifyotp', OtpController.verifyOtp);
router.post('/sendotpemail', OtpController.requestOtpEmail);
router.post('/verifyotpemail', OtpController.verifyOtpEmail);



router.post('/sendotpreg', UserController.sendOtp);
router.post('/verifyotpreg', UserController.verifyOtp);
router.post('/sendotpnumber', UserController.requestOtp);
router.post('/verifyotpnumber', UserController.verifyOtpnumber);

export default router; 
