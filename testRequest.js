const fetch = require('node-fetch');

async function getData() {
    const requests = [];
    try {
        for (let i = 125000; i <= 125000; i++) {
            for (let j = 120000; j <= 125152; j++) {
                const link = `https://www.myworkday.com/ringcentral/d/inst/1006$${j}/rel-task/2998$35326.htmld`;
                console.log('debug ~ file: index.js:10 ~ getData ~ link:', link);
                const response = fetch(link, {
                    "headers": {
                      "accept": "*/*",
                      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                      "cache-control": "no-cache",
                      "content-type": "application/x-www-form-urlencoded",
                      "pragma": "no-cache",
                      "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                      "sec-ch-ua-mobile": "?0",
                      "sec-ch-ua-platform": "\"macOS\"",
                      "sec-fetch-dest": "empty",
                      "sec-fetch-mode": "cors",
                      "sec-fetch-site": "same-origin",
                      "session-secure-token": "a9a62289-c31c-40fb-8522-a533d38d0818",
                      "stats-perf": "b84942b812c14306b7749f3d522550d5,602,0,",
                      "x-workday-client": "2023.48.13",
                      "cookie": "wd-browser-id=00f4ae17-929f-4065-9194-0e46818869d9; WorkdayLB_UI=1930268682.47670.0000; WorkdayLB_UIAUTHGWY=1953402890.58935.0000; WorkdayLB_SAS=67145994.21560.0000; UserSignedIn=1; WorkdayLB_UI_Apache=4031498.20992.0000; WorkdayLB_MICROSCOPE=1983287306.44600.0000; TS01db906f=01dc4a3ac8041f0b0ae9fbd64237b3886263a1163e9c7e36120b95207ebfeb4eeacb30fb702a431086b8da7cf9228755d7df7dfa7f; JSESSIONID=1CF58BD14728644FBDBFF037A1228609.authgwy-prod-k8n27kzd.prod-ui-auth.pr502.cust.ash.wd; wd-alt-sessionid=5ec6b358822ecdf9f5b2920d9ef0024ef54e057c46c5c68c4c4026cfba301cc1.authgwy-prod-k8n27kzd.prod-ui-auth.pr502.cust.ash.wd; SessionTimeoutMS=1701939910632; LastUserActivity=1701938743812",
                      "Referer": "https://www.myworkday.com",
                      "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                  });
                requests.push(response);
            }
        }
        const size = 30;
        const finalResults = [];
        const results = Array.from({ length: Math.ceil(requests.length / size) }, (_, i) =>
            requests.slice(i * size, i * size + size)
        );
        await results.reduce(
            (promiseChain, currentTask) =>
                promiseChain
                    .then((chainResults) => Promise.all(currentTask))
                    .then((res) => Promise.all(res.map((item) => item.text())))
                    .then((res) => {
                        finalResults.push(...res);
                        // const text = res.filter((item) => item.includes('ringcentral/inst'))
                        // .map((item) => {
                        //     try {
                        //         const data = JSON.parse(item);
                        //         return data.activePageTaskId || data.taskId;
                        //     } catch (error) {
                        //         console.log(error);
                        //         return item;
                        //     }
                        // }).join('\n');
                        // console.log('text for ', text);
                    }),
            Promise.resolve()
        );
        console.log('finalResults', finalResults.filter((item) => item.includes('ringcentral/inst')).map((item) => {
            try {
                const data = JSON.parse(item);
                return data.activePageTaskId || data.taskId;
            } catch (error) {
                console.log(error);
                return item;
            }
        }).join('\n'));
    } catch (error) {
        console.log(error);
    }
}

getData();
