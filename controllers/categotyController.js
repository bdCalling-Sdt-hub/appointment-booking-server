const Response = require("../helpers/response");
const CategoryModel = require("../models/Category.model");
const User = require("../models/User");

const createCategory = async (req, res) => {
  try {
    const adminId = req.userId;
    const roll = req.userRole;
    if (roll !== "admin")
      return res.status(403).json({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      });
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        status: "Failed",
        statusCode: 404,
      });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Category Name is required",
        status: "Failed",
        statusCode: 400,
      });
    }
    let image = {};

    if (req.file) {
      image = {
        publicFileURL: `images/users/${req.file.filename}`,
        path: `public/images/users/${req.file.filename}`,
      };
    }

    const newCategory = await CategoryModel.create({
      name,
      image,
    });

    res.status(200).json(
      Response({
        message: "Category created successfully",
        data: newCategory,
        status: "Success",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

const getAllCategories = async (req, res) => {
  try {
    // const userId = req.userId;
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res
    //     .status(404)
    //     .json(
    //       Response({
    //         message: "User not found",
    //         status: "Failed",
    //         statusCode: 404,
    //       })
    //     );
    // }

    const categories = await CategoryModel.find({ isDeleted: false });

    res
      .status(200)
      .json(
        Response({
          message: "Categories fetched successfully",
          data: categories,
          status: "Success",
          statusCode: 200,
        })
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const roll = req.userRole;
    if (roll !== "admin")
      return res
        .status(403)
        .json(
          Response({
            message: "You are not authorized to perform this action",
            status: "Failed",
            statusCode: 403,
          })
        );

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(
          Response({
            message: "User not found",
            status: "Failed",
            statusCode: 404,
          })
        );
    }

    const { categoryId } = req.body;
    if (!categoryId) {
      return res
        .status(400)
        .json(
          Response({
            message: "Category ID is required",
            status: "Failed",
            statusCode: 400,
          })
        );
    }

    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .json(
          Response({
            message: "Category not found",
            status: "Failed",
            statusCode: 404,
          })
        );
    }

    category.isDeleted = true;
    await category.save();
    res
      .status(200)
      .json(
        Response({
          message: "Category deleted successfully",
          status: "Success",
          statusCode: 200,
        })
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

const getSingleCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(
          Response({
            message: "User not found",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if(user?.role !== "admin"){
      return res
        .status(403)
        .json(
          Response({
            message: "You are not authorized to perform this action",
            status: "Failed",
            statusCode: 403,
          })
        );
    }

    const { categoryId } = req.params;
    console.log(categoryId);
    if (!categoryId) {
      return res
        .status(400)
        .json(
          Response({
            message: "Category ID is required",
            status: "Failed",
            statusCode: 400,
          })
        );
    }

    const category = await CategoryModel.findOne(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(
          Response({
            message: "Category not found",
            status: "Failed",
            statusCode: 404,
          })
        );
    }

    res
      .status(200)
      .json(
        Response({
          message: "Category fetched successfully",
          data: category,
          status: "Success",
          statusCode: 200,
        })
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

module.exports = { createCategory, getAllCategories, deleteCategory,getSingleCategory };
