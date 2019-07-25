"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
require('isomorphic-fetch');
const app = express().use(express.json());
const port = 3000;
const google = `https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8`;
app.get('/detect', (req, res) => __awaiter(this, void 0, void 0, function* () {
    // res.send('hello world!')
    console.log('body: ', req.body);
    const { strokes, width = 800, height = 800 } = req.body;
    const json = yield fetch(google, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            options: 'enable_pre_space',
            requests: [{
                    writing_guide: {
                        writing_area_width: width,
                        writing_area_height: height
                    },
                    ink: strokes,
                    language: 'en_US'
                }]
        })
    }).then(resp => resp.json());
    console.log('json: ', json);
    res.send(json);
    // req.
}));
app.listen(port, () => console.log(`server running on port ${port}`));
