const NextServer = require("next/dist/server/next-server");
const { createServer } = require("http");
const serverlessHttp = require("serverless-http");
const { config } = require("./.next/required-server-files.json");

const next = new NextServer.default({
  hostname: "localhost",
  port: 3000,
  dir: ".",
  dev: false,
  minimalMode: true,
  conf: {
    ...config,
  },
});

const port = process.env.PORT || "3000";
const handle = next.getRequestHandler();

// https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
if (!process.env.AWS_EXECUTION_ENV?.startsWith("AWS_Lambda_")) {
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
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
}

module.exports = {
  handler: serverlessHttp(next.getRequestHandler(), {
    binary: ["*/*"],
  }),
};
