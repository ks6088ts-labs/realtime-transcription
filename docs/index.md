# Logs

```shell
# Create a new Vite project with React, SWC, and TypeScript template
pnpm create vite realtime-transcription --template react-swc-ts

# Navigate into the project directory
cd realtime-transcription

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

## リアルタイムトランスクリプションの実装

[Real Time Transcription - Simple > webapp/src/Components/Transcription.js](https://github.com/Azure-Samples/real-time-transcription-simple/blob/main/webapp/src/Components/Transcription.js) からコードをインポートします。元のコードを GitHub Copilot の Agent mode を使って、依存関係を解決し、TypeScript に対応させて、[src/components/Transcription.tsx](../src/components/Transcription.tsx) に変換します。

SDK として、[Microsoft Cognitive Services Speech SDK for JavaScript](https://github.com/microsoft/cognitive-services-speech-sdk-js) がリアルタイム音声認識のための強力なツールセットを提供します。
