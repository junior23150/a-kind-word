console.log('main.tsx starting...');

import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';

console.log('main.tsx imports loaded...');

try {
  console.log('main.tsx trying dynamic import...');
  
  // Dynamic import to catch any import errors
  import('./App.tsx').then((AppModule) => {
    console.log('App module loaded successfully');
    const App = AppModule.default;
    
    const rootElement = document.getElementById("root");
    console.log('Root element found:', !!rootElement);
    
    if (rootElement) {
      console.log('Creating React root...');
      const root = createRoot(rootElement);
      
      console.log('Rendering app...');
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      console.log('App rendered successfully!');
    } else {
      console.error('Root element not found!');
      document.body.innerHTML = '<div style="color: red; font-size: 24px;">ROOT ELEMENT NOT FOUND!</div>';
    }
  }).catch((error) => {
    console.error('Failed to load App module:', error);
    document.body.innerHTML = `<div style="color: red; font-size: 20px;">IMPORT ERROR: ${error.message}</div>`;
  });
  
} catch (error) {
  console.error('main.tsx error:', error);
  document.body.innerHTML = `<div style="color: red; font-size: 20px;">MAIN ERROR: ${error.message}</div>`;
}

console.log('main.tsx completed...');