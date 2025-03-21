// utils/pagination.js
const paginate = async (
  model,
  { page = 1, limit = 10, include, where = {} }
) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await model.findAndCountAll({
    where,
    limit,
    offset,
    include,
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      perPage: limit,
    },
  };
};

module.exports = paginate;
