import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MainDashboard } from "@/components/dashboard/MainDashboard";

const Index = () => {
  console.log('Index component rendering...');
  
  return (
    <DashboardLayout>
      <MainDashboard />
    </DashboardLayout>
  );
};

export default Index;
