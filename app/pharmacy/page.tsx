// app/pharmacy/page.tsx
import { LogoutButton } from "@/components/ui/LogoutButton";

const PharmacyDashboardPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="space-y-4">
        <p>Welcome to your pharmacy dashboard.</p>
        <p>Use the navigation to manage your profile and inventory.</p>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
