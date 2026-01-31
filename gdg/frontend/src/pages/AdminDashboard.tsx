import { useGetAllVendors, useVerifyVendor } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, MapPin, CheckCircle, Activity, Home } from 'lucide-react';
import { useMemo } from 'react';

interface AdminDashboardProps {
  onReturnHome?: () => void;
}

export default function AdminDashboard({ onReturnHome }: AdminDashboardProps) {
  const { data: vendors = [], isLoading } = useGetAllVendors();
  const verifyVendor = useVerifyVendor();

  const stats = useMemo(() => {
    const total = vendors.length;
    const verified = vendors.filter((v) => v.isVerified).length;
    const available = vendors.filter((v) => v.availability).length;
    const foodTypes = Array.from(new Set(vendors.map((v) => v.foodType)));

    const foodTypeData = foodTypes.map((type) => ({
      name: type,
      count: vendors.filter((v) => v.foodType === type).length,
    }));

    const verificationData = [
      { name: 'Verified', value: verified },
      { name: 'Unverified', value: total - verified },
    ];

    const availabilityData = [
      { name: 'Open', value: available },
      { name: 'Closed', value: total - available },
    ];

    return {
      total,
      verified,
      available,
      foodTypes: foodTypes.length,
      foodTypeData,
      verificationData,
      availabilityData,
    };
  }, [vendors]);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor vendor activity, verify registrations, and analyze trends
          </p>
        </div>
        {onReturnHome && (
          <Button
            onClick={onReturnHome}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home Page
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Vendors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Open</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Active right now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.foodTypes}</div>
            <p className="text-xs text-muted-foreground">Different cuisines</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendors by Food Type</CardTitle>
            <CardDescription>Distribution of vendor categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.foodTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Vendor verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.verificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Management</CardTitle>
          <CardDescription>Review and verify vendor registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No vendors registered yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.foodType}</TableCell>
                      <TableCell className="max-w-xs truncate">{vendor.address}</TableCell>
                      <TableCell>
                        {vendor.availability ? (
                          <Badge variant="default" className="bg-green-500">
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {vendor.isVerified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!vendor.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => verifyVendor.mutate(vendor.id)}
                            disabled={verifyVendor.isPending}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
