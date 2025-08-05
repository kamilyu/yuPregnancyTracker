
"use client";
import { WeightTrackerCard } from "@/components/dashboard/weight-tracker-card";
import withAuth from "@/components/with-auth";

function WeightPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <WeightTrackerCard />
        </div>
    )
}

export default withAuth(WeightPage);
