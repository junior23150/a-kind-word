import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TransactionsPage } from "@/components/transactions/TransactionsPage";

const Transactions = () => {
  return (
    <DashboardLayout>
      <TransactionsPage />
    </DashboardLayout>
  );
};

export default Transactions;
