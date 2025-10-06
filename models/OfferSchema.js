const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: false },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  appliesTo: { type: String, enum: ['product', 'category'], required: true },
  targetIds: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'appliesTo' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
}, { timestamps: true });


module.exports = mongoose.model('Offer', offerSchema);