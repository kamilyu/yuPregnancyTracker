
"use client";
import { KickCounterCard } from "@/components/dashboard/kick-counter-card";
import withAuth from "@/components/with-auth";

function KicksPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <KickCounterCard />
        </div>
    )
}

export default withAuth(KicksPage);
