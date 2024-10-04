import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//use method is always used for using middleware or configuration settings

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(express.static("public"));

app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import communityPostRouter from "./routes/communityPost.routes.js";
import likeRouter from "./routes/like.routes.js"
import dislikeRouter from "./routes/dislike.routes.js"
import commentRouter from "./routes/comment.routes.js"

//routes declaration

/* user Routes */
app.use("/api/v1/users", userRouter);

/* Video Routes */
app.use("/api/v1/video", videoRouter);

/* communityPost Routes */
app.use("/api/v1/communityPost", communityPostRouter);

/* Like Routes */
app.use("/api/v1/like",likeRouter)

/* Dislike Routes */
app.use("/api/v1/dislike",dislikeRouter)

/* Comments Routes */
app.use("/api/v1/comment",commentRouter)

/*postman testing
 app.get('/',(req, res) => {
     res.status(200).json({
        message:"From the home page"
     })
})*/
export { app };
