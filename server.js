const NextServer = require("next/dist/server/next-server").default;
const { createServer } = require("http");
const serverlessHttp = require("serverless-http");
const { config } = require("./.next/required-server-files.json");
const { parse } = require("url");
const path = require("path");
const { S3, S3Client } = require("@aws-sdk/client-s3");
const { S3CachingNextServer } = require("./S3CachingNextServer");

require("dotenv").config({ path: ".env.local" });

const next = new (process.env.CACHE_BUCKET ? S3CachingNextServer : NextServer)(
  {
    hostname: "localhost",
    port: 3000,
    dir: __dirname,
    dev: false,
    conf: {
      ...config,
      experimental: {
        ...config.experimental,
        // Implements ISR class
        //  incrementalCacheHandlerPath: path.resolve(__dirname + "/isr.js"),
      },
    },
  },
  __dirname,
  process.env.CACHE_BUCKET,
  process.env.CACHE_PREFIX || "cache/"
);

const nextHandler = next.getRequestHandler();
const serverHandler = async (req, res) => {
  const parsedUrl = parse(req.url, true);
  return await nextHandler(req, res, parsedUrl);
};

// https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
if (!process.env.AWS_EXECUTION_ENV?.startsWith("AWS_Lambda_")) {
  const server = createServer(async (req, res) => {
    try {
      await serverHandler(req, res);
    } catch (err) {
      console.warn("Handler failed", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  server.on("error", (err) => {
    console.warn("Failed to launch server", err);
    throw new Error("Failed to launch server: " + new Error(err.message || String(err)));
  });

  server.on("listening", async () => {
    // https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
    if (process.send) {
      process.send("ready");
    }

    console.info("Started server on port " + port);
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port);

  process.on("SIGINT", () => {
    console.warn("SIGINT: Shutting down...");
    if (server) {
      server.close();
    }
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    console.info("SIGTERM: Shutting down...");
    if (server) {
      server.close();
    }
    process.exit(0);
  });
} else {
  console.error("Starting as serverless handler");
}

module.exports = {
  serverless: serverlessHttp(nextHandler, {
    binary: ["*/*"],
  }),
};
