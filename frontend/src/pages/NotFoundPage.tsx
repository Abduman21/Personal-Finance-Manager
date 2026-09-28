import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 text-center bg-slate-950 text-slate-100 space-y-4">
      <h1 className="text-6xl font-black text-emerald-500">404</h1>
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The page or financial resource you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button icon={<Home className="w-4 h-4" />}>Back to Dashboard</Button>
      </Link>
    </div>
  );
};
