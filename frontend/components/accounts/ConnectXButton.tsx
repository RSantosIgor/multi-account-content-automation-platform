'use client';

import { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

type StartOAuthResponse = {
  data: {
    authorizationUrl: string;
  };
};

export function ConnectXButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient<StartOAuthResponse>('/api/v1/x/oauth/start');
      window.location.href = response.data.authorizationUrl;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('It was not possible to start the connection with X.');
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect} disabled={isLoading} className="gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
        Connect X Account
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
