import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser, IRegisterUser, IUpdateProfile } from "./auth.interface";
import config from "../../config";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../utils/appError";
import httpStatus from "http-status";
import { UserUpdateInput } from "../../../generated/prisma/models";

const registerUserIntoDb = async (payload: IRegisterUser) => {
  const { name, email, password, phone, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with this email already exists",
    );
  }


  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      role: role,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });
  return user;
};

const updateProfile = async (userId: string, payload: IUpdateProfile) => {
  const { name, phone, oldPassword, newPassword } = payload;

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const data: UserUpdateInput = {};

  if (name) {
    data.name = name;
  }

  if (phone !== undefined) {
    data.phone = phone;
  }

  if (newPassword) {
    if (!oldPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Old password is required to set a new password",
      );
    }

    const isOldPasswordMatched = await bcrypt.compare(
      oldPassword,
      isUserExist.password,
    );

    if (!isOldPasswordMatched) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    data.password = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    omit: { password: true },
  });

  return updatedUser;
};

export const authService = {
  registerUserIntoDb,
  loginUser,
  refreshToken,
  getMe,
  updateProfile,
};
