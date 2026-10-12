class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle string query mappings
    if (queryObj.category && queryObj.category === 'all') delete queryObj.category;
    if (queryObj.petType && queryObj.petType === 'all') delete queryObj.petType;
    if (queryObj.lifeStage && queryObj.lifeStage === 'all') delete queryObj.lifeStage;
    if (queryObj.brand && queryObj.brand === 'all') delete queryObj.brand;

    if (queryObj.inStockOnly === 'true' || queryObj.inStockOnly === true) {
      queryObj.inStock = true;
      queryObj.stockCount = { $gt: 0 };
      delete queryObj.inStockOnly;
    }

    if (queryObj.maxPrice) {
      queryObj.price = { $lte: Number(queryObj.maxPrice) };
      delete queryObj.maxPrice;
    }

    // Advanced filtering: gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    if (this.queryString.search) {
      const q = this.queryString.search.trim();
      this.query = this.query.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { shortDesc: { $regex: q, $options: 'i' } },
          { batchNumber: { $regex: q, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sortBy) {
      const sortMap = {
        price_asc: 'price',
        price_desc: '-price',
        rating: '-rating',
        expiry_near: 'expiryDate',
        newest: '-createdAt',
      };
      const sortBy = sortMap[this.queryString.sortBy] || '-createdAt';
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
