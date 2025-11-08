import express from "express";
import catalogRouter from "./api/catalog.routes";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import { ElasticSearchService } from "./services/elasticsearch.service";
import { AppEventListener } from "./utils/ElasticSearchListener";

const app = express();
app.use(express.json());
app.use(httpLogger); // http request logger

const elasticSearchInstance = new ElasticSearchService();
AppEventListener.instance.listen(elasticSearchInstance);

app.use("/api", catalogRouter);
app.use(HandleErrorWithLogger);

export default app;
