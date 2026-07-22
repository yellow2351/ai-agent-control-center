"use strict";
/**
 * This is a API server
 */
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var dotenv_1 = require("dotenv");
var url_1 = require("url");
var api_js_1 = require("./routes/api.js");
// for esm mode
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// load env
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
/**
 * API Routes
 */
app.use('/api', api_js_1.default);
/**
 * health
 */
app.use('/api/health', function (req, res, next) {
    res.status(200).json({
        success: true,
        message: 'ok',
    });
});
/**
 * error handler middleware
 */
app.use(function (error, req, res, next) {
    res.status(500).json({
        success: false,
        error: 'Server internal error',
    });
});
/**
 * 404 handler
 */
app.use(function (req, res) {
    res.status(404).json({
        success: false,
        error: 'API not found',
    });
});
exports.default = app;
