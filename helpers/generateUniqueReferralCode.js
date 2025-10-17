const { v4: uuidv4 } = require("uuid");
const userSchema = require('../models/userSchema');

// helper function
async function generateUniqueReferralCode() {
  const prefix = "ELECTRO";

  while (true) {
    // Generate random code
    const unique = uuidv4()
      .replace(/[^A-Z0-9]/gi, "")
      .slice(0, 6)
      .toUpperCase();

    const referralCode = prefix + unique;

    // Check if already exists
    const existingUser = await userSchema.findOne({
      myReferalCode: referralCode,
    });

    //  If not found — it's unique
    if (!existingUser) return referralCode;

    // Otherwise loop again
  }
}

module.exports = generateUniqueReferralCode