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
    const imgMatches = new Promise((res, rej) => {
        if (!file) {
            return { imgMatch: undefined, imgProbability: undefined };
        }
        let imgMatch, imgProbability;
        const simpleHTR = child_process_1.spawn('python3', ['src/main.py', `--htr=${file.path}`]);
        simpleHTR.stdout.setEncoding('utf8');
        simpleHTR.stdout.on('data', data => {
            if (pylog('stdout: ', data)) {
                const lines = data.split('\n');
                for (const line of lines) {
                    const recogIdx = line.indexOf('Recognized: ');
                    if (recogIdx !== -1) {
                        imgMatch = line.slice(13, line.indexOf('"', 13));
                    }
                    const probIdx = line.indexOf('Probability: ');
                    if (probIdx !== -1) {
                        try {
                            const prob = line.slice(13);
                            imgProbability = parseFloat(prob);
                            res({ imgMatch, imgProbability });
                        }
                        catch (parseError) {
                            console.log('parse error: ', parseError);
                            rej(parseError);
                        }
                    }
                }
            }
        });
        simpleHTR.stderr.setEncoding('utf8');
        simpleHTR.stderr.on('data', data => {
            pylog('stderr: ', data);
        });
        simpleHTR.on('close', code => {
            console.log('exited with code: ', code);
        });
    });
    const strokeMatches = yield fetch(google, {
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
    }).then(resp => resp.json())
        .then(googleResponse => {
        let imgMatches;
        if (Array.isArray(googleResponse) && googleResponse[0] === 'SUCCESS') {
            const [code, details] = googleResponse;
            const [id, results] = details[0];
            imgMatches = results;
            console.log('[Google Response]: ', code, id, results, details.slice(1));
        }
        else {
            console.log('[Google Response]: ', googleResponse);
        }
        return imgMatches;
    });
    const imgResponse = yield imgMatches;
    const response = Object.assign({ strokeMatches }, imgResponse);
    console.log('replying with: ', response);
    res.send(JSON.stringify(response));
}));
app.listen(port, () => console.log(`server running on port ${port}`));
const pylog = (place, value) => {
    if (!value.includes('deprecat')) {
        console.log(place, value);
        return true;
    }
    return false;
};
