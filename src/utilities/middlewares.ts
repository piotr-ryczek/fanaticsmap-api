// @ts-nocheck
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import qs from 'qs';

import { config } from '@config/config';
import User from '@models/user';
import ApiError from '@utilities/apiError';
import errorCodes from '@config/errorCodes';

export const queryStringMiddleware = async (ctx, next) => {
  const { query } = ctx;

  ctx.queryParsed = qs.parse(query);

  await next();
}

export const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, type, userMessage } = error;

      ctx.status = status || 500;
      ctx.body = {
        message: userMessage,
        type,
      };
    } else {
      const { status, type, message } = errorCodes.Internal;

      ctx.status = status;
      ctx.body = {
        message,
        type,
      };
    }

    ctx.app.emit('error', error);
  }
};

export const isNotLogged = async (ctx, next) => {
  const { authorization } = ctx.headers;

  if (authorization) throw new ApiError(errorCodes.AuthorizationTokenExists);

  await next();
};

export const retrieveUser = async (ctx, next) => {
  const { authorization } = ctx.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) throw new ApiError(errorCodes.JWTToken);

  const [, token] = authorization.split(' ');

  const decodedToken = jwt.decode(token);

  if (!decodedToken) throw new ApiError(errorCodes.JWTToken);

  const { data: { email } } = decodedToken;

  if (!email) throw new ApiError(errorCodes.JWTToken);

  const user = await User.findOne({ email }).populate('role');

  if (!user) throw new ApiError(errorCodes.UserNotExists);

  Object.assign(ctx, {
    user,
  });

  await next();
};

export const hasCredential = credential => async (ctx, next) => {
  const { role: { credentials } } = ctx.user;

  if (!credentials.includes(credential)) throw new ApiError(errorCodes.NotAuthorized);

  await next();
};

export const checkMockPassword = async (ctx, next) => {
  const { request: { body } } = ctx;
  const { password } = body;

  if (!config.mockPassword) throw new ApiError(errorCodes.mockDisabled);
  if (md5(password) !== config.mockPassword) throw new ApiError(errorCodes.incorrectMockPassword);

  await next();
};

export const corsHandler = (ctx) => {
  const acceptedOrigins = [...config.frontendUrlsCors, ...config.adminUrlsCors];

  if (config.allowCorsLocalhost) {
    acceptedOrigins.push('http://localhost:3000', 'http://localhost:3001');
  }

  const { accept: { headers: { origin } } } = ctx;
  if (origin && !acceptedOrigins.includes(origin)) {
    return ctx.throw(`${origin} CORS error`);
  }

  return origin;
}

export const isItself = async (ctx, next) => {
  const {
    user: {
      _id: currentUserId,
    },
    params: {
      userId: toChangeUserId,
    },
  } = ctx;

  if (currentUserId.toString() !== toChangeUserId) throw new ApiError(errorCodes.UserNotItself);

  await next();
}