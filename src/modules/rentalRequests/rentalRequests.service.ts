import { count } from "node:console";
import {
  RentalRequestWhereInput,
  SortOrder,
} from "../../../generated/prisma/internal/prismaNamespace";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import {
  ICreateRentalRequest,
  IRentalRequestQuery,
  IUpdateRentalRequestStatus,
} from "./rentalRequests.interface";
import httpStatus from "http-status";
import { RentalStatus } from "../../../generated/prisma/enums";

const createRentalRequestIntoDB = async (
  tenantId: string,
  payload: ICreateRentalRequest,
) => {
  const { propertyId, moveInDate, moveOutDate } = payload;
  const isPropertyExist = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });
  if (!isPropertyExist || !isPropertyExist.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Property is not found");
  }
  if (isPropertyExist.availabilityStatus !== "AVAILABLE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This property is not available for rent right now",
    );
  }

  if (new Date(moveInDate) < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Move-in date cannot be in the past",
    );
  }
  if (moveOutDate && new Date(moveOutDate) <= new Date(moveInDate)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Move-out date must be after move-in date",
    );
  }

  const isDuplicateRentalRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: "PENDING",
    },
  });
  if (isDuplicateRentalRequest) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have a pending request for this property",
    );
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      propertyId,
      moveInDate: new Date(moveInDate),
      moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
      message: payload.message,
      tenantId,
    },
    include: {
      property: true,
      tenant: {
        omit: {
          password: true,
        },
      },
    },
  });
  return rentalRequest;
};
const getMyRentalRequestFromDB = async (
  tenantId: string,
  query: IRentalRequestQuery,
) => {
  const allowedSortBy = ["createdAt", "status", "moveInDate"];
  const allowedSortOrder = ["asc", "desc"];
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = allowedSortBy.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = allowedSortOrder.includes(query.sortOrder as string)
    ? (query.sortOrder as string)
    : "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      message: {
        contains: query.searchTerm,
        mode: "insensitive",
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      AND: andConditions,
      tenantId,
    },
    take: limit,
    skip: skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      property: { include: { category: true } },
      payment: true,
    },
  });

  const rentalRequestCount = await prisma.rentalRequest.count({
    where: {
      AND: andConditions,
      tenantId,
    },
  });
  return {
    data: rentalRequests,
    meta: {
      limit,
      page,
      count: rentalRequestCount,
      totalPage: Math.ceil(rentalRequestCount / limit),
    },
  };
};
const getRentalRequestByIdFromDB = async (
  tenantId: string,
  rentalRequestId: string,
) => {
  const isRentalRequestExist = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      property: { include: { category: true } },
      payment: true,
    },
  });

  if (!isRentalRequestExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (isRentalRequestExist.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this rental request",
    );
  }

  return isRentalRequestExist;
};
const getPropertiesRentalRequestFromDB = async (
  landlordId: string,
  query: IRentalRequestQuery,
) => {
  const allowedSortBy = ["createdAt", "status", "moveInDate"];
  const allowedSortOrder = ["asc", "desc"];
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = allowedSortBy.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = allowedSortOrder.includes(query.sortOrder as string)
    ? (query.sortOrder as string)
    : "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      message: {
        contains: query.searchTerm,
        mode: "insensitive",
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }
  if (query.propertyId) {
    andConditions.push({
      propertyId: query.propertyId,
    });
  }

  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      AND: andConditions,
      property: { landlordId: landlordId },
    },
    take: limit,
    skip: skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } },
      payment: true,
    },
  });

  const rentalRequestCount = await prisma.rentalRequest.count({
    where: {
      AND: andConditions,
      property: { landlordId: landlordId },
    },
  });
  return {
    data: rentalRequests,
    meta: {
      limit,
      page,
      count: rentalRequestCount,
      totalPage: Math.ceil(rentalRequestCount / limit),
    },
  };
};
const updateRentalRequest = async (
  rentalRequestId: string,
  landlordId: string,
  payload: IUpdateRentalRequestStatus,
) => {
  const { status } = payload;
  const isRentalRequestExist = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true },
  });

  if (!isRentalRequestExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (isRentalRequestExist.property.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to respond to this rental request",
    );
  }
  switch (isRentalRequestExist.status) {
    case "PENDING":
      if (status !== "APPROVED" && status !== "REJECTED") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot change status from PENDING to ${status}`,
        );
      }
      break;
    case "ACTIVE":
      if (status !== "COMPLETED") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot change status from ACTIVE to ${status}`,
        );
      }
      break;
    default:
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot change status from ${isRentalRequestExist.status}`,
      );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateRentalRequest = await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: { status, respondedAt: new Date() },
    });
    if (status === "APPROVED") {
      await tx.property.update({
        where: {
          id: isRentalRequestExist.propertyId,
        },
        data: {
          availabilityStatus: "PENDING_PAYMENT",
        },
      });
    }
    if (status === "COMPLETED") {
      await tx.property.update({
        where: { id: isRentalRequestExist.propertyId },
        data: { availabilityStatus: "AVAILABLE" },
      });
    }
    return updateRentalRequest;
  });
  return result;
};

export const rentalRequestService = {
  createRentalRequestIntoDB,
  getMyRentalRequestFromDB,
  getRentalRequestByIdFromDB,
  getPropertiesRentalRequestFromDB,
  updateRentalRequest,
};
