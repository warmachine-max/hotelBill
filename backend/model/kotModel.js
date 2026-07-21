import mongoose from 'mongoose';

const kotSchema = new mongoose.Schema(
  {
    tableNo: { type: String, required: true },
    ref: { type: String, default: '' },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 }
      }
    ],
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
  },
  { timestamps: true }
);

export default mongoose.model('KOT', kotSchema);