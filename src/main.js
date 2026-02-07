import './style.css'
import { Game } from './Game.js'

// エラーハンドリング（デバッグ用）
window.addEventListener('error', (event) => {
  const errorMsg = document.createElement('div');
  errorMsg.style.position = 'fixed';
  errorMsg.style.top = '10px';
  errorMsg.style.left = '10px';
  errorMsg.style.right = '10px';
  errorMsg.style.padding = '20px';
  errorMsg.style.background = 'rgba(220, 38, 38, 0.9)';
  errorMsg.style.color = 'white';
  errorMsg.style.zIndex = '10000';
  errorMsg.style.fontFamily = 'monospace';
  errorMsg.style.whiteSpace = 'pre-wrap';
  errorMsg.textContent = `JS Error: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}`;
  document.body.appendChild(errorMsg);
});

// Promiseのリジェクトもキャッチ
window.addEventListener('unhandledrejection', (event) => {
  const errorMsg = document.createElement('div');
  errorMsg.style.position = 'fixed';
  errorMsg.style.top = '100px'; // 重ならないようにずらす
  errorMsg.style.left = '10px';
  errorMsg.style.padding = '20px';
  errorMsg.style.background = 'rgba(220, 38, 38, 0.9)';
  errorMsg.style.color = 'white';
  errorMsg.style.zIndex = '10000';
  errorMsg.textContent = `Unhandled Promise Rejection: ${event.reason}`;
  document.body.appendChild(errorMsg);
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing game...');
    // インスタンス化してグローバルに残す（GC対策＆コンソールデバッグ用）
    window.game = new Game('gameCanvas');
    console.log('Game initialized successfully');
  } catch (err) {
    console.error(err);
    const errorMsg = document.createElement('div');
    errorMsg.style.position = 'fixed';
    errorMsg.style.top = '50%';
    errorMsg.style.left = '50%';
    errorMsg.style.transform = 'translate(-50%, -50%)';
    errorMsg.style.background = 'red';
    errorMsg.style.padding = '20px';
    errorMsg.style.color = 'white';
    errorMsg.textContent = `Initialization Error: ${err.message}\n${err.stack}`;
    document.body.appendChild(errorMsg);
  }
});
