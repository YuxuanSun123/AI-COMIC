import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Studio from './pages/Studio';
import ScriptGenerator from './pages/tools/ScriptGenerator';
import StoryboardGenerator from './pages/tools/StoryboardGenerator';
import VideoCards from './pages/tools/VideoCards';
import Editing from './pages/tools/Editing';
import Links from './pages/Links';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'News',
    path: '/news',
    element: <News />
  },
  {
    name: 'NewsDetail',
    path: '/news/:id',
    element: <NewsDetail />
  },
  {
    name: 'Studio',
    path: '/studio',
    element: <Studio />
  },
  {
    name: 'ScriptGenerator',
    path: '/tools/script',
    element: <ScriptGenerator />
  },
  {
    name: 'StoryboardGenerator',
    path: '/tools/storyboard',
    element: <StoryboardGenerator />
  },
  {
    name: 'VideoCards',
    path: '/tools/video',
    element: <VideoCards />
  },
  {
    name: 'Editing',
    path: '/tools/edit',
    element: <Editing />
  },
  {
    name: 'Links',
    path: '/links',
    element: <Links />
  },
  {
    name: 'Pricing',
    path: '/pricing',
    element: <Pricing />
  },
  {
    name: 'About',
    path: '/about',
    element: <About />
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <Contact />
  },
  {
    name: 'Privacy',
    path: '/privacy',
    element: <Privacy />
  },
  {
    name: 'Terms',
    path: '/terms',
    element: <Terms />
  },
  {
    name: 'NotFound',
    path: '*',
    element: <NotFound />
  }
];

export default routes;
