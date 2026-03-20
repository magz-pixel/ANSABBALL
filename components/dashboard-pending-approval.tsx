import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardPendingApprovalProps {
  email: string;
  fullName: string;
}

export function DashboardPendingApproval({ email, fullName }: DashboardPendingApprovalProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Welcome, {fullName || email}! Your account is awaiting verification by Coach Brian.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-black/80">
            To access the full ANSA dashboard—player profiles, progress tracking, attendance,
            and more—your account must be approved. This typically happens after:
          </p>
          <ul className="list-inside list-disc space-y-2 text-black/80">
            <li>Completing registration and payment (M-Pesa or in-person)</li>
            <li>Coach Brian verifying your enrollment</li>
            <li>Activating your player profile (if applicable)</li>
          </ul>
          <p className="text-black/80">
            Questions? Contact Coach Brian at{" "}
            <a href="tel:0718082452" className="font-medium text-[#0066CC] hover:underline">
              0718082452
            </a>{" "}
            or{" "}
            <a href="tel:0740406721" className="font-medium text-[#0066CC] hover:underline">
              0740406721
            </a>
            .
          </p>
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            You will receive access once your account is approved. Please check back later or
            reach out if you believe this is an error.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
