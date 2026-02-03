
const { fetch } = require('undici');
const apiKey = 'AIzaSyC7TS8aHjN_WbYRWLj8tsg2mRvhBC-IWuY';

async function listModels(version) {
  const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
  console.log(`Listing models for ${version}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
        console.log(`Failed: ${res.status} ${res.statusText}`);
        const txt = await res.text();
        console.log(txt);
        return;
    }
    const data = await res.json();
    if (data.models) {
      console.log(`=== ${version} Models ===`);
      data.models.forEach(m => {
         if (m.name.includes('gemini') || m.name.includes('imagen')) {
             console.log(`${m.name} [Methods: ${m.supportedGenerationMethods?.join(', ')}]`);
         }
      });
    } else {
      console.log(`No models found or error:`, data);
    }
  } catch (e) {
    console.error(`Error listing ${version}:`, e.message);
  }
}

async function run() {
  await listModels('v1beta');
  console.log('---');
  await listModels('v1alpha');
}

run();
