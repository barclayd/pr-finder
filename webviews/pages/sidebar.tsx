import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SidebarContainer } from '../components/SidebarContainer';

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen />
    <React.StrictMode>
      <SidebarContainer />
    </React.StrictMode>
  </QueryClientProvider>,
  document.getElementById('root'),
);
