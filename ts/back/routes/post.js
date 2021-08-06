"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path = require("path");
var express = require("express");
var AWS = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");
var comment_1 = require("../models/comment");
var hashtag_1 = require("../models/hashtag");
var image_1 = require("../models/image");
var post_1 = require("../models/post");
var user_1 = require("../models/user");
var middleware_1 = require("./middleware");
var router = express.Router();
AWS.config.update({
    region: 'ap-northeast-2',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});
var upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'react-nodebird',
        key: function (req, file, cb) {
            cb(null, "original/" + +new Date() + path.basename(file.originalname));
        }
    }),
    limits: { fileSize: 20 * 1024 * 1024 }
});
router.post('/', middleware_1.isLoggedIn, upload.none(), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var hashtags, newPost, promises, result, promises, images, image, fullPost, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 12, , 13]);
                hashtags = req.body.content.match(/#[^\s]+/g);
                return [4 /*yield*/, post_1["default"].create({
                        content: req.body.content,
                        UserId: req.user.id
                    })];
            case 1:
                newPost = _a.sent();
                if (!hashtags) return [3 /*break*/, 4];
                promises = hashtags.map(function (tag) { return hashtag_1["default"].findOrCreate({
                    where: { name: tag.slice(1).toLowerCase() }
                }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, newPost.addHashtags(result.map(function (r) { return r[0]; }))];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                if (!req.body.image) return [3 /*break*/, 10];
                if (!Array.isArray(req.body.image)) return [3 /*break*/, 7];
                promises = req.body.image.map(function (image) { return image_1["default"].create({ src: image }); });
                return [4 /*yield*/, Promise.all(promises)];
            case 5:
                images = _a.sent();
                return [4 /*yield*/, newPost.addImages(images)];
            case 6:
                _a.sent();
                return [3 /*break*/, 10];
            case 7: return [4 /*yield*/, image_1["default"].create({ src: req.body.image })];
            case 8:
                image = _a.sent();
                return [4 /*yield*/, newPost.addImage(image)];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [4 /*yield*/, post_1["default"].findOne({
                    where: { id: newPost.id },
                    include: [{
                            model: user_1["default"],
                            attributes: ['id', 'nickname']
                        }, {
                            model: image_1["default"]
                        }, {
                            model: user_1["default"],
                            as: 'Likers',
                            attributes: ['id']
                        }]
                })];
            case 11:
                fullPost = _a.sent();
                return [2 /*return*/, res.json(fullPost)];
            case 12:
                e_1 = _a.sent();
                console.error(e_1);
                return [2 /*return*/, next(e_1)];
            case 13: return [2 /*return*/];
        }
    });
}); });
router.post('/images', upload.array('image'), function (req, res) {
    console.log(req.files);
    res.json(req.files.map(function (v) { return v.location; }));
});
router.get('/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, post_1["default"].findOne({
                        where: { id: req.params.id },
                        include: [{
                                model: user_1["default"],
                                attributes: ['id', 'nickname']
                            }, {
                                model: image_1["default"]
                            }]
                    })];
            case 1:
                post = _a.sent();
                return [2 /*return*/, res.json(post)];
            case 2:
                e_2 = _a.sent();
                console.error(e_2);
                return [2 /*return*/, next(e_2)];
            case 3: return [2 /*return*/];
        }
    });
}); });
router["delete"]('/:id', middleware_1.isLoggedIn, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, post_1["default"].findOne({ where: { id: req.params.id } })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                return [4 /*yield*/, post_1["default"].destroy({ where: { id: req.params.id } })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.send(req.params.id)];
            case 3:
                e_3 = _a.sent();
                console.error(e_3);
                return [2 /*return*/, next(e_3)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get('/:id/comments', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, comments, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, post_1["default"].findOne({ where: { id: req.params.id } })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                return [4 /*yield*/, comment_1["default"].findAll({
                        where: {
                            PostId: req.params.id
                        },
                        order: [['createdAt', 'ASC']],
                        include: [{
                                model: user_1["default"],
                                attributes: ['id', 'nickname']
                            }]
                    })];
            case 2:
                comments = _a.sent();
                return [2 /*return*/, res.json(comments)];
            case 3:
                e_4 = _a.sent();
                console.error(e_4);
                return [2 /*return*/, next(e_4)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/:id/comment', middleware_1.isLoggedIn, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, newComment, comment, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, post_1["default"].findOne({ where: { id: req.params.id } })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                return [4 /*yield*/, comment_1["default"].create({
                        PostId: post.id,
                        UserId: req.user.id,
                        content: req.body.content
                    })];
            case 2:
                newComment = _a.sent();
                return [4 /*yield*/, post.addComment(newComment.id)];
            case 3:
                _a.sent();
                return [4 /*yield*/, comment_1["default"].findOne({
                        where: {
                            id: newComment.id
                        },
                        include: [{
                                model: user_1["default"],
                                attributes: ['id', 'nickname']
                            }]
                    })];
            case 4:
                comment = _a.sent();
                return [2 /*return*/, res.json(comment)];
            case 5:
                e_5 = _a.sent();
                console.error(e_5);
                return [2 /*return*/, next(e_5)];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post('/:id/like', middleware_1.isLoggedIn, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, post_1["default"].findOne({ where: { id: req.params.id } })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                return [4 /*yield*/, post.addLiker(req.user.id)];
            case 2:
                _a.sent();
                return [2 /*return*/, res.json({ userId: req.user.id })];
            case 3:
                e_6 = _a.sent();
                console.error(e_6);
                return [2 /*return*/, next(e_6)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router["delete"]('/:id/like', middleware_1.isLoggedIn, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, post_1["default"].findOne({ where: { id: req.params.id } })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                return [4 /*yield*/, post.removeLiker(req.user.id)];
            case 2:
                _a.sent();
                return [2 /*return*/, res.json({ userId: req.user.id })];
            case 3:
                e_7 = _a.sent();
                console.error(e_7);
                return [2 /*return*/, next(e_7)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/:id/retweet', middleware_1.isLoggedIn, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var post, retweetTargetId, exPost, retweet, retweetWithPrevPost, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, post_1["default"].findOne({
                        where: { id: req.params.id },
                        include: [{
                                model: post_1["default"],
                                as: 'Retweet'
                            }]
                    })];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).send('포스트가 존재하지 않습니다.')];
                }
                if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
                    return [2 /*return*/, res.status(403).send('자신의 글은 리트윗할 수 없습니다.')];
                }
                retweetTargetId = post.RetweetId || post.id;
                return [4 /*yield*/, post_1["default"].findOne({
                        where: {
                            UserId: req.user.id,
                            RetweetId: retweetTargetId
                        }
                    })];
            case 2:
                exPost = _a.sent();
                if (exPost) {
                    return [2 /*return*/, res.status(403).send('이미 리트윗했습니다.')];
                }
                return [4 /*yield*/, post_1["default"].create({
                        UserId: req.user.id,
                        RetweetId: retweetTargetId,
                        content: 'retweet'
                    })];
            case 3:
                retweet = _a.sent();
                return [4 /*yield*/, post_1["default"].findOne({
                        where: { id: retweet.id },
                        include: [{
                                model: user_1["default"],
                                attributes: ['id', 'nickname']
                            }, {
                                model: post_1["default"],
                                as: 'Retweet',
                                include: [{
                                        model: user_1["default"],
                                        attributes: ['id', 'nickname']
                                    }, {
                                        model: image_1["default"]
                                    }]
                            }]
                    })];
            case 4:
                retweetWithPrevPost = _a.sent();
                return [2 /*return*/, res.json(retweetWithPrevPost)];
            case 5:
                e_8 = _a.sent();
                console.error(e_8);
                return [2 /*return*/, next(e_8)];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
