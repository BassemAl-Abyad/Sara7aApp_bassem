import connectDB from "./DB/connections.js";
import { connectRedis } from "./DB/redis.connection.js";
import { authRouter, userRouter } from "./Modules/index.js";
import { sendEmail } from "./Utils/Email/email.utils.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/Response/error.response.js";
import { successResponse } from "./Utils/Response/success.response.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CORS_ORIGIN, CORS_CREDENTIALS, CORS_METHODS, CORS_ALLOWED_HEADERS, NODE_ENV, MORGAN_FORMAT } from "../config/config.service.js";

const bootsrtrap = async (app, express) => {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...CORS_ORIGIN.split(',').map(origin => origin.trim())],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // HTTP request logger
  if (NODE_ENV !== 'test') {
    app.use(morgan(MORGAN_FORMAT));
  }

  const corsOptions = {
    origin: CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: CORS_CREDENTIALS,
    methods: CORS_METHODS.split(',').map(method => method.trim()),
    allowedHeaders: CORS_ALLOWED_HEADERS.split(',').map(header => header.trim()),
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  await connectDB();
  await connectRedis();

  // Send email to test nodemailer
  // await sendEmail({ to: "h6f3cn@gmail.com", subject: "Test" });
  app.get("/", (req, res) => {
    return successResponse({
      res,
      statusCode: 201,
      message: "Success!",
    });
  });
  app.use("/uploads", express.static("./src/uploads"))
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use((req, res, next) => {
    throw NotFoundException({ message: "Handler not found!" });
  });

  app.use(globalErrorHandler);
};

export default bootsrtrap;
