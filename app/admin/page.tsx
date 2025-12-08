import { LogoutButton } from "@/components/ui/LogoutButton";

const page = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <div>admin page</div>
    </div>
  );
};
export default page;
