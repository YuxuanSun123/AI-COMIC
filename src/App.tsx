import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import MainLayout from '@/components/layouts/MainLayout';
import routes from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { initMockData } from '@/lib/mockData';

const App = () => {
  // 初始化模拟数据
  useEffect(() => {
    initMockData();
  }, []);

  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <IntersectObserver />
          <MainLayout>
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </MainLayout>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
