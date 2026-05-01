import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import linksRouter from "./links";
import cardsRouter from "./cards";
import connectionsRouter from "./connections";
import analyticsRouter from "./analytics";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/profile", profilesRouter);
router.use("/links", linksRouter);
router.use("/cards", cardsRouter);
router.use("/connections", connectionsRouter);
router.use("/analytics", analyticsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
