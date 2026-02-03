import { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import MainLayout from '@/components/layouts/MainLayout';
import routes from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { initMockData } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingFallback = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/3 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-[200px] rounded-xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <PageTransition>
                {route.element}
              </PageTransition>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // 初始化模拟数据
  useEffect(() => {
    initMockData();
  }, []);

  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LanguageProvider>
          <AuthProvider>
            <IntersectObserver />
            <MainLayout>
              <Suspense fallback={<LoadingFallback />}>
                <AnimatedRoutes />
              </Suspense>
            </MainLayout>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
