import axios, { AxiosError } from 'axios';

interface MNotifyResponse {
  status: number;
  message: string;
  data?: any;
}

export const sendSMS = async (
  recipients: string[], 
  sender: string, 
  message: string
): Promise<MNotifyResponse> => {
  const endPoint = process.env.MNOTIFY_ENDPOINT;
  const apiKey = process.env.MNOTIFY_APIKEY;

  // Validate input parameters
  if (!endPoint || !apiKey) {
    throw new Error('Missing mNotify configuration: Endpoint or API Key');
  }

  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients specified');
  }

  if (!message) {
    throw new Error('Message content is empty');
  }

  try {
    // Prepare data for mNotify API
    const data = {
      recipient: recipients,
      sender: sender,
      message: message,
      is_schedule: 'false', // Assuming it's a one-time send, not scheduled
    };

    // Configure the request
    const url = `${endPoint}?key=${apiKey}`;
    const config = {
      method: 'post',
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: data,
    };

    // Send the message via mNotify API
    const response = await axios(config);

    // Log successful response
    console.log('mNotify API Response:', response.data);

    // Return a standardized response
    return {
      status: response.status,
      message: 'SMS sent successfully',
      data: response.data
    };

  } catch (error) {
    // Handle Axios-specific errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Log detailed error information
      console.error('mNotify API Error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });

      // Return a structured error response
      return {
        status: axiosError.response?.status || 500,
        message: axiosError.response?.data 
          ? JSON.stringify(axiosError.response.data) 
          : 'Failed to send SMS',
        data: axiosError.response?.data
      };
    }

    // Handle any other unexpected errors
    console.error('Unexpected error in SMS sending:', error);
    
    return {
      status: 500,
      message: 'Unexpected error occurred while sending SMS',
      data: error instanceof Error ? error.message : String(error)
    };
  }
};