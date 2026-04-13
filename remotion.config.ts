import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Set default codec
Config.setCodec("h264");
Config.setAudioCodec("aac");
