exports.paginate = async (
  model,
  {
    page = 1,
    limit = 10,
    include,
    where = {},
    order = [["createdAt", "DESC"]],
    attributes,
    raw = true,
    nest = true,
    subQuery = false, // Tambahan default biar lebih efisien saat include
  }
) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    where,
    limit,
    offset,
    include,
    order,
    attributes,
    raw,
    nest,
    subQuery,
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
