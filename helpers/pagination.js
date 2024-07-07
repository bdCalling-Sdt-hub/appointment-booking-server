const  pagination = async (totalItems, currentPage, pageSize) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    return {
        totalPages: totalPages,
        currentPage: currentPage,
        prevPage: prevPage,
        nextPage: nextPage,
        totalItems: totalItems,
    };
};

module.exports = pagination;