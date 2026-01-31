import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Home, Info } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
  onReturnHome?: () => void;
}

export default function AdminLogin({ onSuccess, onReturnHome }: AdminLoginProps) {
  const handleAccessDashboard = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="container max-w-2xl py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Admin Access</h1>
        <p className="mt-2 text-muted-foreground">
          Development and testing portal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Dashboard</CardTitle>
          <CardDescription>
            Access the admin dashboard for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">
              Development Mode
            </AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              This is a development and testing environment. All users have full administrative 
              access to the dashboard and its features.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={handleAccessDashboard}
              className="w-full gap-2"
              size="lg"
            >
              <Shield className="h-5 w-5" />
              Access Admin Dashboard
            </Button>

            {onReturnHome && (
              <Button
                onClick={onReturnHome}
                variant="outline"
                className="w-full gap-2"
              >
                <Home className="h-4 w-4" />
                Return to Home Page
              </Button>
            )}
          </div>

          <div className="rounded-lg border bg-muted p-4 text-sm">
            <p className="font-medium">Admin Features Available:</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• View vendor analytics and statistics</li>
              <li>• Verify vendor registrations</li>
              <li>• Monitor vendor activity and trends</li>
              <li>• Generate reports for policy making</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
