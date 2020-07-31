import * as core from "@actions/core";
import * as github from "@actions/github";
import {Octokit} from "@octokit/core";

import * as fs from "fs";
import * as path from "path";

import callbackGlob from "glob";
import * as mimeTypes from "mime-types";

async function glob(pattern: string): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    return callbackGlob(pattern, (err, files) => {
      if (err) return reject(err);
      else {
        if (files == null || files.length === 0) throw new Error("No files found.");
        else return resolve(files);
      }
    });
  });
}

async function uploadFile(octokit: Octokit, uploadUrl: string, assetPath: string): Promise<void> {
  const assetName: string = path.basename(assetPath);

  // Determine content-length for header to upload asset
  const contentLength = (filePath: fs.PathLike) => fs.statSync(filePath).size;

  // Guess mime type using mime-types package - or fallback to application/octet-stream
  const assetContentType = mimeTypes.lookup(assetName) || "application/octet-stream";

  //   // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
  const headers = {"content-type": assetContentType, "content-length": contentLength(assetPath)};

  // Upload a release asset
  // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
  // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
  await octokit.repos.uploadReleaseAsset({
    url: uploadUrl,
    headers,
    name: assetName,
    data: (fs.readFileSync(assetPath) as unknown) as string
  });
}

async function run(): Promise<void> {
  try {
    const uploadUrl = core.getInput("upload_url", {required: true});
    const targets = core.getInput("targets", {required: true});

    const token: string = process.env.GITHUB_TOKEN as string;
    const octokit = github.getOctokit(token);

    const files = await glob(targets);

    core.info(`Uploading files: ${JSON.stringify(files)}`);

    await Promise.all(
      files.map(async file => {
        core.info(`Uploading ${file} ...`);
        await uploadFile(octokit, uploadUrl, file);
      })
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
