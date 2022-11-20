const NextServer = require("next/dist/server/next-server").default;
const { createServer } = require("http");
const serverlessHttp = require("serverless-http");
const { config } = require("./.next/required-server-files.json");
const { parse } = require("url");
const path = require("path");
const { S3, S3Client } = require("@aws-sdk/client-s3");

require("dotenv").config({ path: ".env.local" });

class S3CachingServer extends NextServer {
  prefix = "";
  bucket = undefined;
  s3 = undefined;
  baseDir = undefined;

  constructor(nextOptions, baseDir, bucket, prefix) {
    super(nextOptions);
    this.prefix = prefix ?? "";
    this.bucket = bucket;
    this.baseDir = baseDir ? path.resolve(baseDir) : undefined;
    this.s3 = new S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_REGION || "eu-west-1",
    });
    console.info("Caching to", bucket, "prefix", prefix);
  }

  getKey(fileName) {
    if (this.baseDir) {
      fileName = path.resolve(fileName);
      if (fileName.startsWith(this.baseDir)) {
        return fileName.substring(this.baseDir.length);
      } else {
        throw new Error("File " + fileName + " is outside " + this.baseDir);
      }
    } else {
      return fileName;
    }
  }

  getCacheFilesystem() {
    const cacheFs = super.getCacheFilesystem();
    return {
      readFile: async (f) => {
        console.info("readFile", f);
        try {
          const result = await this.s3.getObject({
            Bucket: this.bucket,
            Key: this.prefix + this.getKey(f),
          });
          return String(result.Body);
        } catch (e) {
          console.info("Not found in S3", f, "error", e);
        }
        return cacheFs.readFile(f);
      },
      readFileSync: (f) => {
        throw new Error("Unsupported CacheFs.readFileSync: " + f);
      },
      writeFile: async (f, d) => {
        console.info("writeFile", f);
        await this.s3.putObject({
          Bucket: this.bucket,
          Key: this.prefix + this.getKey(f),
          Body: d,
        });
      },
      mkdir: (dir) => {
        console.info("mkdir", dir);
      },
      stat: async (f) => {
        console.info("stat", f);
        try {
          const result = await this.s3.headObject({
            Bucket: this.bucket,
            Key: this.prefix + this.getKey(f),
          });

          return {
            mtime: result.LastModified,
          };
        } catch (e) {
          console.info("Not found in S3", f, "error", e);
        }
        return cacheFs.stat(f);
      },
    };
  }
}

const next = new (process.env.CACHE_BUCKET ? S3CachingServer : NextServer)(
  {
    hostname: "localhost",
    port: 3000,
    dir: __dirname, // path.resolve(__dirname, ".next/standalone"),
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
