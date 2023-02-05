const NextServer = require("next/dist/server/next-server").default;
const path = require("path");
const { S3 } = require("@aws-sdk/client-s3");

class S3CachingNextServer extends NextServer {
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

module.exports = {
  S3CachingNextServer,
};
