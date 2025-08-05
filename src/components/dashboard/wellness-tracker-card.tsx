
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Flame, Droplets, Pill, BedDouble, Battery, Footprints, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type WellnessData = {
    waterGlasses: number;
    vitaminTaken: boolean;
    sleepQuality: number;
    energyLevel: number;
    steps: number;
    selfCare: string;
};

const defaultWellnessData: WellnessData = {
    waterGlasses: 0,
    vitaminTaken: false,
    sleepQuality: 3,
    energyLevel: 3,
    steps: 0,
    selfCare: "",
};

export function WellnessTrackerCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [wellnessData, setWellnessData] = useState<WellnessData>(defaultWellnessData);

    const todayId = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const docRef = doc(db, 'users', user.uid, 'dailyWellness', todayId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setWellnessData(doc.data() as WellnessData);
            } else {
                setWellnessData(defaultWellnessData);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching wellness data:", err);
            toast({ variant: 'destructive', title: "Could not load today's wellness data." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, todayId, toast]);

    const updateWellnessData = useCallback(async (field: keyof WellnessData, value: any) => {
        const newData = { ...wellnessData, [field]: value };
        setWellnessData(newData);
        
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'dailyWellness', todayId);
            await setDoc(docRef, { 
                ...newData,
                date: Timestamp.now()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating wellness data:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: `Could not save ${field}.` });
        }
    }, [wellnessData, user, todayId, toast]);


    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Flame className="text-primary"/>
                    Daily Wellness
                </CardTitle>
                <CardDescription>Log your daily habits to stay healthy and strong.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Water & Vitamins */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><Droplets className="text-primary/80"/> Water Intake</h4>
                        <div className='flex items-center gap-2'>
                           <Button variant="outline" size="icon" onClick={() => updateWellnessData('waterGlasses', Math.max(0, wellnessData.waterGlasses - 1))}>-</Button>
                           <span className='font-bold text-lg w-12 text-center'>{wellnessData.waterGlasses}</span>
                           <Button variant="outline" size="icon" onClick={() => updateWellnessData('waterGlasses', wellnessData.waterGlasses + 1)}>+</Button>
                           <span className='text-muted-foreground'>/ 8 glasses</span>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="vitaminTaken"
                                checked={wellnessData.vitaminTaken}
                                onCheckedChange={(checked) => updateWellnessData('vitaminTaken', checked)}
                            />
                            <label htmlFor="vitaminTaken" className="font-semibold flex items-center gap-2">
                                <Pill className="text-primary/80"/> Took Prenatal Vitamin
                            </label>
                        </div>
                    </div>
                </div>

                {/* Column 2: Sleep & Energy */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><BedDouble className="text-primary/80"/> Sleep Quality</h4>
                        <Slider 
                            defaultValue={[wellnessData.sleepQuality]} 
                            max={5} 
                            step={1} 
                            onValueCommit={(value) => updateWellnessData('sleepQuality', value[0])}
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Poor</span>
                            <span>Fair</span>
                            <span>Good</span>
                            <span>Great</span>
                            <span>Excellent</span>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><Battery className="text-primary/80"/> Energy Level</h4>
                        <Slider 
                            defaultValue={[wellnessData.energyLevel]} 
                            max={5} 
                            step={1} 
                            onValueCommit={(value) => updateWellnessData('energyLevel', value[0])}
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low</span>
                            <span></span>
                            <span>Medium</span>
                            <span></span>
                            <span>High</span>
                        </div>
                    </div>
                </div>
                
                {/* Column 3: Steps & Self-Care */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><Footprints className="text-primary/80"/> Daily Steps</h4>
                        <Input 
                            type="number"
                            placeholder="e.g., 5000"
                            defaultValue={wellnessData.steps || ''}
                            onBlur={(e) => updateWellnessData('steps', parseInt(e.target.value, 10) || 0)}
                        />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><Sparkles className="text-primary/80"/> Self-Care Moment</h4>
                        <Input 
                            placeholder="e.g., 5-min walk, deep breathing"
                            defaultValue={wellnessData.selfCare || ''}
                            onBlur={(e) => updateWellnessData('selfCare', e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
