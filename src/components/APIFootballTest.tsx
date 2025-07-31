import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFootballService } from '@/services/apiFootballService';

export const APIFootballTest: React.FC = () => {
  const handleQuickTest = async () => {
    console.log('🚀 Starting API-Football Quick Test...');
    await apiFootballService.quickTest();
  };

  const handlePremierLeagueTest = async () => {
    console.log('🚀 Starting Premier League Test...');
    await apiFootballService.testPremierLeague();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API-Football Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleQuickTest}
          className="w-full"
          variant="default"
        >
          Quick API Test
        </Button>
        
        <Button 
          onClick={handlePremierLeagueTest}
          className="w-full"
          variant="outline"
        >
          Premier League Test
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Check console for test results
        </p>
      </CardContent>
    </Card>
  );
};