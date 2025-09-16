const HTTP_STATUS = require("../../config/statusCodes");
const categorieSchema = require("../../models/categorySchema");

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const categories = async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const search = escapeRegex(req.query.search || "");
    const status = req.query.status || "all";

    // Base query
    let query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    // Apply status filter
    if (status === "listed") query.status = "listed";
    if (status === "unlisted") query.status = "unlisted";

    // Fetch paginated categories
    const categories = await categorieSchema
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await categorieSchema.countDocuments(query); 
    console.log(categories)
    res.render("Home/category", {
      categories,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  categories,
};
