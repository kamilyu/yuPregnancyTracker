
"use client";
import { SymptomLogCard } from "@/components/dashboard/symptom-log-card";
import withAuth from "@/components/with-auth";

function NotesPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <SymptomLogCard />
        </div>
    )
}

export default withAuth(NotesPage);
