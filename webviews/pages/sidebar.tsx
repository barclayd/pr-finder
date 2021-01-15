import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClientProvider, QueryClient } from 'react-query';
import React from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from '../components/Sidebar';

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen />
    <React.StrictMode>
        <Sidebar />
    </React.StrictMode>
  </QueryClientProvider>,
  document.getElementById('root'),
);
