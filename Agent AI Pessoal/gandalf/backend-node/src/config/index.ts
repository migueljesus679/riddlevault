import 'dotenv/config';

export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/gandalf',
  nodePort: parseInt(process.env.NODE_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  pythonApiUrl: process.env.PYTHON_API_URL || 'http://localhost:8000',
};
