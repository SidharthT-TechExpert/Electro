const offerSchema = require("../../models/OfferSchema");

const HTTP_STATUS = require("../../config/statusCodes");

const loadOfferPage = async (req, res) => {
  try {
    const limit = 8;
    const page = parseInt(req.query.page) || 1;
    const isActive = req.query.status || true;

    // Fetch active offers
    const offerData = await offerSchema
      .find({ isActive })
      .sort({ createAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await offerSchema.countDocuments(isActive);

    res.render("Home/offersPage", {
      offerData,
      title: "Offers Management",
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Load Offer Page Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

// Add Offers

const addOffer = async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      appliesTo,
      targetIds,
      startDate,
      endDate,
      isActive,
    } = req.body;

   console.log(req.body);
    // Basic validation
    if (
      !name ||
      !code ||
      !discountType ||
      !discountValue ||
      !appliesTo ||
      !isActive ||
      !startDate ||
      !endDate
    ) {
      return res
        .json({ message: "Missing required fields" });
    }
 

    // Create new offer
    const newOffer = new offerSchema({
      name,
      code,
      discountType,
      discountValue,
      appliesTo,
      targetIds,
      startDate,
      endDate,
      isActive,
    });

    await newOffer.save();

    res
      .json({ message: "Offer created successfully", offer: newOffer });
  } catch (error) {
    console.error("Add Offer Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

module.exports = {
  loadOfferPage,
  addOffer,
};
