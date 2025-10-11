const HTTP_STATUS = require("../../config/statusCodes");
const userSchema = require("../../models/userSchema");

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const customer = async (req, res) => {
  try {
    const limit = 8;
    const page = parseInt(req.query.page) || 1;
    const search = escapeRegex(req.query.search || "");
    const status = req.query.status || "all";

    // Base query
    let query = {
      isAdmin: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Apply status filter
    if (status === "active") query.isBlocked = false;
    if (status === "blocked") query.isBlocked = true;

    // Fetch paginated customers
    const customers = await userSchema
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await userSchema.countDocuments(query);
    const user = await userSchema.findOne({_id:req.session.adminId});

    res.render("Home/customersList", {
      customers,
      user,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.error(error); 
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const customerBlock = async (req, res) => {
  try {
    const { _id, isBlocked } = req.query;
    const user = await userSchema.findByIdAndUpdate(
       _id ,
      { $set: { isBlocked: isBlocked === "true" } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked,
    });

    user.save();
  } catch (error) {
    console.error("Customer Block Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

module.exports = {
  customer,
  customerBlock,
};
