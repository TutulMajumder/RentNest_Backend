import {
  CategoryUpdateInput,
  CategoryWhereInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import httpStatus from "http-status";
import {
  ICategoryQuery,
  ICreateCategory,
  IUpdateCategory,
} from "./category.interface";

import slugify from "slugify";

const createCategoryToDB = async (payload: ICreateCategory) => {
  const { name, description } = payload;
  const isCategoryExist = await prisma.category.findUnique({
    where: { name },
  });

  if (isCategoryExist) {
    throw new Error(`Category already exist`);
  }

  const slug = slugify(name, { lower: true, strict: true });

  const category = await prisma.category.create({
    data: {
      name: name,
      slug: slug,
      description: description,
    },
  });

  return category;
};

const findAllCategoryFromDB = async (query: ICategoryQuery) => {
  const allowedSortFields = ["name", "createdAt"];
  const allowedSortOrders = ["asc", "desc"];
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = allowedSortFields.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = allowedSortOrders.includes(query.sortOrder as string)
    ? (query.sortOrder as string)
    : "desc";

  const andConditions: CategoryWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.name) {
    andConditions.push({
      name: query.name,
    });
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true, AND: andConditions },
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalCategoryCount = await prisma.category.count({
    where: {
      isActive: true,
      AND: andConditions,
    },
  });

  return {
    data: categories,
    meta: {
      page: page,
      limit: limit,
      total: totalCategoryCount,
      totalPages: Math.ceil(totalCategoryCount / limit),
    },
  };
};

const findSingleCategoryFromDB = async (categoryId: string) => {
  const isCategoryExist = await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
  });
  if (!isCategoryExist.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found.");
  }

  return isCategoryExist;
};

const updateCategoryToDB = async (id: string, payload: IUpdateCategory) => {
  const { name, description, isActive } = payload;

  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist) {
    throw new Error(`Category not exist`);
  }
  if (!isCategoryExist.isActive && isActive !== true) {
    throw new Error("Category is deleted. Reactivate it first.");
  }

  const data: CategoryUpdateInput = {};

  if (name) {
    const isDuplicateCategory = await prisma.category.findUnique({
      where: {
        name,
      },
    });
    if (isDuplicateCategory && isDuplicateCategory.id !== id) {
      throw new Error(`Category ${name} already exists`);
    }
    data.name = name;
    data.slug = slugify(name, { lower: true, strict: true });
  }

  if (description !== undefined) {
    data.description = description;
  }

  if (isActive !== undefined) {
    data.isActive = isActive;
  }

  const category = await prisma.category.update({
    where: {
      id,
    },
    data,
  });

  return category;
};

const deleteCategoryFromDB = async (id: string) => {
  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist) {
    throw new Error(`Category not exist`);
  }
  if (!isCategoryExist.isActive) {
    throw new Error("Category is already deleted");
  }
  await prisma.category.update({
    where: {
      id,
    },
    data: { isActive: false },
  });
  return null;
};

export const categoryService = {
  createCategoryToDB,
  findAllCategoryFromDB,
  findSingleCategoryFromDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
};
