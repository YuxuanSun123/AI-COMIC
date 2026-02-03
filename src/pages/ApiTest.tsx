import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/lib/aiClient';

const ApiTest = () => {
  const [apiKey, setApiKey] = useState('AIzaSyC7TS8aHjN_WbYRWLj8tsg2mRvhBC-IWuY');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const testGemini2FlashExp = async () => {
    setLoading(true);
    addLog('--- Starting Gemini 2.0 Flash Exp (generateContent) Test ---');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: "Generate a cute anime character sketch." }] }],
        generationConfig: {
          responseModalities: ["IMAGE"]
        }
      };

      addLog(`Request URL: ${url}`);
      addLog(`Request Body: ${JSON.stringify(body, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      addLog(`Response Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        addLog(`Response Body: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        addLog(`Response Body (Raw): ${text}`);
      }

    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  const testGemini2Flash = async () => {
    setLoading(true);
    addLog('--- Starting Gemini 2.0 Flash (generateContent) Test ---');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: "Generate a cute anime character sketch." }] }],
        // generationConfig: { responseModalities: ["IMAGE"] } // Try without explicit modality first or with it
      };

      addLog(`Request URL: ${url}`);
      addLog(`Request Body: ${JSON.stringify(body, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      addLog(`Response Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        addLog(`Response Body: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        addLog(`Response Body (Raw): ${text}`);
      }

    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  const testImagenPredict = async () => {
    setLoading(true);
    addLog('--- Starting Imagen 3.0 (predict) Test ---');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
      const body = {
        instances: [{ prompt: "A cute anime character" }],
        parameters: { sampleCount: 1 }
      };

      addLog(`Request URL: ${url}`);
      addLog(`Request Body: ${JSON.stringify(body, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      addLog(`Response Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        addLog(`Response Body: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        addLog(`Response Body (Raw): ${text}`);
      }

    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  const testAiClient = async () => {
    setLoading(true);
    addLog('--- Starting aiClient.generateImage Test ---');
    try {
      const result = await generateImage("A cute anime character");
      addLog(`Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  const testGemini2FlashImagePrompt = async () => {
    setLoading(true);
    addLog('--- Starting Gemini 2.0 Flash (Prompt Only) Test ---');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: "Generate an image of a cute anime character. Return only the image." }] }],
        // No explicit responseModalities
      };

      addLog(`Request URL: ${url}`);
      addLog(`Request Body: ${JSON.stringify(body, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      addLog(`Response Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        addLog(`Response Body: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        addLog(`Response Body (Raw): ${text}`);
      }

    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  const listModels = async () => {
    setLoading(true);
    addLog('--- Listing Available Models (v1beta) ---');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        addLog(`Request URL: ${url}`);
        
        const response = await fetch(url);
        addLog(`Response Status: ${response.status} ${response.statusText}`);
        
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            addLog(`Response Body: ${JSON.stringify(json, null, 2)}`);
            
            // Check for image generation capability
            if (json.models) {
                const imageModels = json.models.filter((m: any) => 
                    m.supportedGenerationMethods?.includes('generateContent') && 
                    (m.name.includes('gemini-2.0') || m.name.includes('imagen'))
                );
                addLog(`Potential Image Models: ${imageModels.map((m: any) => m.name).join(', ')}`);
            }
        } catch (e) {
            addLog(`Response Body (Raw): ${text}`);
        }
    } catch (error: any) {
        addLog(`Error: ${error.message}`);
    } finally {
        setLoading(false);
        addLog('--- End List Models ---');
    }
  };

  const testSDKGenerateImage = async () => {
    setLoading(true);
    addLog('--- Starting SDK generateImage Test (Auto-Fallback) ---');
    try {
      const result = await generateImage("A cute anime character concept art");
      if (result.ok) {
        addLog(`Success! Image URL: ${result.data?.image_url}`);
        if (result.data?.warning) {
          addLog(`Warning: ${result.data.warning}`);
        }
      } else {
        addLog(`Failed: ${result.error?.message}`);
      }
    } catch (e: any) {
      addLog(`Exception: ${e.message}`);
    } finally {
      setLoading(false);
      addLog('--- End SDK Test ---');
    }
  };

  const testGenerateImage = async () => {
    setLoading(true);
    addLog('--- Starting generateImage() (Provider Integration) Test ---');
    try {
      addLog('Calling generateImage("A cute anime character")...');
      const result = await generateImage("A cute anime character");
      
      addLog(`Result OK: ${result.ok}`);
      if (result.ok && result.data) {
        addLog(`Image URL: ${result.data.image_url}`);
        if (result.data.image_url) {
             setPreviewImage(result.data.image_url);
             setLogs(prev => [`[Preview Updated]`, ...prev]);
        }
      } else {
        addLog(`Error: ${JSON.stringify(result.error)}`);
      }
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('--- End Test ---');
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>API Compatibility Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google API Key (for direct raw tests)</Label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={testGenerateImage} disabled={loading} variant="default">
              Test Configured Image Provider (e.g. Aliyun)
            </Button>
            <Button onClick={testGemini2FlashExp} disabled={loading} variant="secondary">
              Test Gemini 2.0 Flash Exp (Raw)
            </Button>
            <Button onClick={testGemini2Flash} disabled={loading}>
              Test Gemini 2.0 Flash (Text/Image)
            </Button>
            <Button onClick={testImagenPredict} disabled={loading}>
              Test Imagen 3.0 (Predict)
            </Button>
            <Button onClick={testSDKGenerateImage} disabled={loading} variant="secondary">
              Test SDK (with Fallback)
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            {previewImage ? (
              <div className="border rounded p-2 bg-muted/20">
                <img 
                  src={previewImage} 
                  alt="Test Result" 
                  className="max-w-md h-auto rounded shadow" 
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="border rounded p-8 text-center text-muted-foreground bg-muted/10">
                No image generated yet
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Logs</Label>
            <Textarea 
              className="font-mono text-xs h-[500px]" 
              value={logs.join('\n')} 
              readOnly 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
