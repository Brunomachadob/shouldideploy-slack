const { createServer } = require('http');
const { get } = require('https');

const { PORT = 3000 } = process.env

const HOST = 'https://shouldideploy.today';

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

createServer(async (req, res) => {
    try {
        const { timezone, shouldideploy, message } = await request(`${HOST}/api`);

        const time = new Date().toLocaleString('en-US', {
            timeZone: timezone
        });

        const slackMessageResponse = {
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
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(slackMessageResponse));
    } catch (err) {
        console.error(err);
        res.end('Failed to query API');
    }
}).listen(PORT);

async function request(url) {
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
