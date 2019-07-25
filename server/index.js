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
const child_process_1 = require("child_process");
const multer = require("multer");
require('isomorphic-fetch');
const port = 3000;
const google = `https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8`;
const upload = multer({ dest: 'uploads/' });
const app = express()
    .use(express.json());
//the trace is an array of strokes
const defaultStrokes = [
    [
        [300, 310, 320, 330, 340],
        [320, 320, 320, 320, 320] // y coordinate
        // each pair of (x, y) coordinates represents one sampling point
    ],
    [
        [320, 320, 320, 320, 320],
        [300, 310, 320, 330, 340]
    ]
];
app.post('/htr', upload.single('image'), (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { file, body } = req;
    console.log('body: ', body);
    console.log('file: ', file);
    const { strokes = defaultStrokes, width = 800, height = 800 } = body;
    if (file) {
        // const command = `cd src/ && python3 --htr='../${file.path}}'`
        // console.log('command: ', command)
        const simpleHTR = child_process_1.spawn('python3', ['src/main.py', `--htr='${file.path}'`]);
        simpleHTR.stdout.setEncoding('utf8');
        simpleHTR.stdout.on('data', data => {
            console.log('stdout: ', data);
        });
        simpleHTR.stderr.setEncoding('utf8');
        simpleHTR.stderr.on('data', data => {
            console.log('stderr: ', data);
        });
        simpleHTR.on('close', code => {
            console.log('exited with code: ', code);
        });
    }
    const googleResponse = yield fetch(google, {
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
    if (Array.isArray(googleResponse)) {
        const [code, details] = googleResponse;
        console.log('[Google Response]: ', code, details);
    }
    else {
        console.log('[Google Response]: ', googleResponse);
    }
    res.send(googleResponse);
}));
app.listen(port, () => console.log(`server running on port ${port}`));
