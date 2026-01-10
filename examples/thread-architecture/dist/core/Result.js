"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = void 0;
const success = (data) => ({
    success: true,
    data,
});
exports.success = success;
const failure = (error) => ({
    success: false,
    error,
});
exports.failure = failure;
//# sourceMappingURL=Result.js.map