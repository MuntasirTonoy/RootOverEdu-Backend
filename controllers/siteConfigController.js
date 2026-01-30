const SiteConfig = require("../models/SiteConfig");

// @desc    Get site config by key
// @route   GET /api/config/:key
// @access  Public
const getSiteConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOne({ key: req.params.key });
    if (!config) {
      // Return default values if not found, to avoid null errors on frontend
      return res.status(200).json({});
    }
    res.json(config.value);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update or Create site config
// @route   POST /api/admin/config
// @access  Private/Admin
const updateSiteConfig = async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ message: "Key and Value are required" });
  }

  try {
    const config = await SiteConfig.findOneAndUpdate(
      { key },
      { value, updatedAt: Date.now() },
      { new: true, upsert: true }, // Create if not exists
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getSiteConfig,
  updateSiteConfig,
};
