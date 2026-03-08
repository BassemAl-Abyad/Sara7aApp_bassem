import connectDB from "./DB/connections.js";
import { authRouter, userRouter } from "./Modules/index.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/Response/error.response.js";
import { successResponse } from "./Utils/Response/success.response.js";
import cors from "cors";

const bootsrtrap = async (app, express) => {
  app.use(express.json(), cors());
  await connectDB();
  app.get("/", (req, res) => {
    return successResponse({
      res,
      statusCode: 201,
      message: "Success!",
    });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);

  app.all("/*dummy", (req, res) => {
    throw NotFoundException({ message: "Handler not found!" });
  });

  app.use(globalErrorHandler);
};

export default bootsrtrap;
