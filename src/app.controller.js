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

const bootsrtrap = async (app, express) => {
  app.use(express.json(), cors());
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
