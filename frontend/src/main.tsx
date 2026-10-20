import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz ausente');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

