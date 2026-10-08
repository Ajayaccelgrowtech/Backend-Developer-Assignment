const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  return { page, limit, skip, sort, sortBy, sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc' };
};

const formatPaginatedResponse = (totalRecords, page, limit) => {
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  return {
    currentPage: page,
    pageSize: limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse
};
