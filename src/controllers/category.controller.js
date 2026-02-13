const Category = require('../models/category.model');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name'
      });
    }

    const category = await Category.create({ name, description, status });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
