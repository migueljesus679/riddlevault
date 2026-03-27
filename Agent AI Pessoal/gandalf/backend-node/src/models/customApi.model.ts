import mongoose, { Schema } from 'mongoose';

const endpointSchema = new Schema({
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], required: true },
  path: { type: String, required: true },
  description: { type: String, default: '' },
  headers: { type: Schema.Types.Mixed, default: {} },
  body: { type: Schema.Types.Mixed },
});

const customApiSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  baseUrl: { type: String, required: true },
  auth: {
    type: { type: String, enum: ['none', 'apikey', 'bearer', 'oauth2'], default: 'none' },
    key: { type: String },
    value: { type: String },
    headerName: { type: String, default: 'Authorization' },
  },
  endpoints: [endpointSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const CustomApi = mongoose.model('CustomApi', customApiSchema);
