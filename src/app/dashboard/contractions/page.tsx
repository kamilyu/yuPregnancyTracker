
"use client";
import { ContractionTimerCard } from "@/components/dashboard/contraction-timer-card";
import withAuth from "@/components/with-auth";

function ContractionsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <ContractionTimerCard />
        </div>
    )
}

export default withAuth(ContractionsPage);
