const https = require('https');

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error('Missing GOOGLE_API_KEY environment variable.');
    process.exit(1);
}

function listModels(version) {
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/${version}/models?key=${API_KEY}`,
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`\n--- Models for ${version} ---`);
            if (res.statusCode !== 200) {
                console.log(`Error ${res.statusCode}: ${data}`);
                return;
            }
            try {
                const json = JSON.parse(data);
                if (json.models) {
                    json.models.forEach(m => {
                        console.log(`- ${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
                    });
                } else {
                    console.log('No models found or unexpected format.');
                }
            } catch (e) {
                console.log('Error parsing JSON:', e.message);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request (${version}): ${e.message}`);
    });

    req.end();
}

console.log('Listing models...');
listModels('v1beta');
listModels('v1alpha');
