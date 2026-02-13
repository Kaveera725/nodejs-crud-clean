const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

// Routes
router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
