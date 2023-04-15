import axios, { isAxiosError } from "axios";
import crypto from 'crypto';
import { Router } from "express";
const router = Router();

router.post('/', (req, res) => {
    const url = req.body.url;
    const verifyToken = req.body.verifyToken;
    const encryptKeyRaw = req.body.encryptKey
    const ivRaw = req.body.iv;
    const challengeContent = req.body.challengeContent;

    if (url && encryptKeyRaw && ivRaw && challengeContent) {

        const str = JSON.stringify({
            s: 0,
            d: {
                type: 255,
                channel_type: "WEBHOOK_CHALLENGE",
                challenge: challengeContent,
                verify_token: verifyToken
            }
        });

        const iv = ivRaw.padEnd(16, '\0');
        const encryptKey = encryptKeyRaw.padEnd(32, '\0');
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptKey, iv);

        const encrypt = cipher.update(str, 'utf-8', 'base64') + cipher.final('base64');
        const content = Buffer.from(iv + encrypt, 'utf-8').toString('base64');

        const payload = {
            encrypt: content
        };

        axios({
            url,
            method: 'POST',
            data: payload,
            timeout: 10 * 1000,
            timeoutErrorMessage: 'Request timed out after 10 seconds'
        }).then((re) => {
            res.send({
                code: 200,
                message: re.status + ' ' + re.statusText,
                data: re.data
            })
        }).catch((e) => {
            if (isAxiosError(e)) {
                // console.log(e);
                if (e.response) {
                    res.send({
                        code: e.response.status,
                        message: e.response.status + ' ' + e.response.statusText
                    })
                } else {
                    res.send({
                        code: e.cause,
                        message: e.message,
                        // data: e.response || e.cause || e.toJSON()
                    })
                }
            } else {
                res.send({
                    code: 233,
                    message: e.message || e,
                    // data: e
                })
            }
        })
    }
});

export default router;