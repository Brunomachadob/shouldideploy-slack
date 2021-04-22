const { createServer } = require('http');
const { get } = require('https');

const { PORT = 3000 } = process.env;

const HOST = 'https://shouldideploy.today';
const DEFAULT_TZ = 'UTC';
const DEFAULT_MESSAGE = "Failed to query API. This shouldn't be a good sign.";

const COLORS = {
    true: '#36a64f',
    false: '#ff4136'
};

const THUMB_URL = {
    true: `${HOST}/yes.png`,
    false: `${HOST}/no.png`
};

const FOOTER_ICON = {
    true: `${HOST}/dots.png`,
    false: `${HOST}/dots-red.png`,
};

createServer(async (_, res) => {
    let apiResponse;

    try {
        apiResponse = await request(`${HOST}/api`);
    } catch (err) {
        console.error(err);
        apiResponse = { shouldideploy: false, message: DEFAULT_MESSAGE, timezone: DEFAULT_TZ }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(buildSlackResponse(apiResponse)));
}).listen(PORT);

function buildSlackResponse({ shouldideploy, message, timezone }) {
    const time = new Date().toLocaleString('en-US', {
        timeZone: timezone
    });

    return {
        "attachments": [
            {
                "text": message,
                "color": COLORS[shouldideploy],
                "thumb_url": THUMB_URL[shouldideploy],
                "footer": `Should I deploy today | ${timezone}`,
                "footer_icon": FOOTER_ICON[shouldideploy],
                "ts": new Date(time).getTime()
            }
        ]
    }
}

function request(url) {
    return new Promise((resolve, reject) => {
        get(url, (resp) => {
            let data = '';
    
            resp.on('data', (chunk) => {
              data += chunk;
            });
          
            resp.on('end', () => {
              resolve(JSON.parse(data));
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}
