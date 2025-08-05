
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, addDoc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import { format, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, PlusCircle, CalendarIcon, Trash2, Edit, Save, Weight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


type WeightEntry = {
    id: string;
    date: Date;
    weight: number;
    unit: 'lbs' | 'kg';
};

type WeightUnit = 'lbs' | 'kg';

export function WeightTrackerCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [startingWeight, setStartingWeight] = useState<number | null>(null);
    const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
    const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    // Form state
    const [newWeight, setNewWeight] = useState<string>("");
    const [newDate, setNewDate] = useState<Date>(new Date());
    
    // Editing state
    const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);


    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            const data = doc.data();
            if (data?.startingWeight) {
                setStartingWeight(data.startingWeight);
                setWeightUnit(data.weightUnit || 'lbs');
                setShowOnboarding(false);
            } else {
                setShowOnboarding(true);
            }
        });

        const q = query(collection(db, 'users', user.uid, 'weightTracking'), orderBy('date', 'asc'));
        const unsubscribeEntries = onSnapshot(q, (querySnapshot) => {
            const entries: WeightEntry[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                entries.push({
                    id: doc.id,
                    weight: data.weight,
                    date: data.date.toDate(),
                    unit: data.unit || 'lbs'
                });
            });
            setWeightEntries(entries);
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribeEntries();
        };
    }, [user]);

    const handleSaveStartingWeight = async () => {
        if (!user || !newWeight || isNaN(parseFloat(newWeight))) {
            toast({ variant: "destructive", title: "Invalid weight", description: "Please enter a valid number for your starting weight." });
            return;
        }
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { 
                startingWeight: parseFloat(newWeight),
                weightUnit: weightUnit 
            }, { merge: true });
            setNewWeight("");
            toast({ title: "Starting weight saved!" });
        } catch (error) {
            console.error("Error saving starting weight: ", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save your starting weight." });
        }
    };
    
    const handleAddOrUpdateEntry = async () => {
        if (!user || !newWeight || isNaN(parseFloat(newWeight))) {
            toast({ variant: "destructive", title: "Invalid weight", description: "Please enter a valid weight." });
            return;
        }
        
        const weightValue = parseFloat(newWeight);
        const entryData = {
            weight: weightValue,
            date: Timestamp.fromDate(newDate),
            unit: weightUnit,
            userId: user.uid,
        };

        try {
            if (editingEntry) {
                // Update
                const entryDocRef = doc(db, 'users', user.uid, 'weightTracking', editingEntry.id);
                await updateDoc(entryDocRef, entryData);
                toast({ title: "Weight updated successfully!" });
            } else {
                // Add
                await addDoc(collection(db, 'users', user.uid, 'weightTracking'), entryData);
                toast({ title: "Weight logged successfully!" });
            }
            // Reset form
            setNewWeight("");
            setNewDate(new Date());
            setEditingEntry(null);
        } catch (error) {
            console.error("Error saving weight entry: ", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the weight entry." });
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'weightTracking', entryId));
            toast({ title: "Entry deleted." });
        } catch (error) {
             console.error("Error deleting weight entry: ", error);
            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the weight entry." });
        }
    };
    
    const startEditing = (entry: WeightEntry) => {
        setEditingEntry(entry);
        setNewWeight(String(entry.weight));
        setNewDate(entry.date);
        setWeightUnit(entry.unit);
    };

    const cancelEditing = () => {
        setEditingEntry(null);
        setNewWeight("");
        setNewDate(new Date());
    };
    
    const handleUnitChange = async (unit: WeightUnit) => {
        setWeightUnit(unit);
        if (user && !showOnboarding) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, { weightUnit: unit });
                toast({title: "Unit preference saved!"});
            } catch (error) {
                 toast({ variant: "destructive", title: "Update Failed", description: "Could not save your unit preference." });
            }
        }
    }

    const latestEntry = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
    const totalGain = startingWeight && latestEntry ? latestEntry.weight - startingWeight : 0;
    
    const chartData = weightEntries
        .filter(e => e.unit === weightUnit)
        .map(e => ({ date: format(e.date, 'MMM d'), weight: e.weight }));


    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Weight className="text-primary" />
                        Weight Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }
    
    if (showOnboarding) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Set Your Starting Weight</CardTitle>
                    <CardDescription>Enter your weight at the beginning of your pregnancy to start tracking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <RadioGroup value={weightUnit} onValueChange={(val: WeightUnit) => setWeightUnit(val)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lbs" id="r-lbs-onboarding" />
                            <Label htmlFor="r-lbs-onboarding">Pounds (lbs)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="kg" id="r-kg-onboarding" />
                            <Label htmlFor="r-kg-onboarding">Kilograms (kg)</Label>
                        </div>
                    </RadioGroup>
                    <div className="flex gap-2">
                        <Input 
                            type="number"
                            placeholder="e.g. 150"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                        />
                        <span className="flex items-center text-muted-foreground">{weightUnit}</span>
                    </div>
                    <Button onClick={handleSaveStartingWeight} disabled={!newWeight}>
                        <Save className="mr-2" /> Save Starting Weight
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Weight className="text-primary"/>
                    Weight Tracker
                </CardTitle>
                <CardDescription>Log your weight to monitor your progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center p-4 bg-secondary/30 rounded-lg">
                    <div>
                        <p className="text-2xl font-bold text-primary">{startingWeight || '--'}</p>
                        <p className="text-sm text-muted-foreground">Starting ({weightUnit})</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-primary">{latestEntry?.weight || '--'}</p>
                        <p className="text-sm text-muted-foreground">Current ({weightUnit})</p>
                    </div>
                    <div>
                         <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalGain.toFixed(1)} {weightUnit}</p>
                        <p className="text-sm text-muted-foreground">Total Gain</p>
                    </div>
                </div>

                {chartData.length > 1 && (
                    <div className="h-48">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} unit={weightUnit} />
                                <Tooltip formatter={(value) => `${value} ${weightUnit}`}/>
                                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
                
                <div className="space-y-4">
                     <h4 className="font-semibold">{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h4>
                     <RadioGroup value={weightUnit} onValueChange={handleUnitChange} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lbs" id="r-lbs" />
                            <Label htmlFor="r-lbs">Pounds (lbs)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="kg" id="r-kg" />
                            <Label htmlFor="r-kg">Kilograms (kg)</Label>
                        </div>
                    </RadioGroup>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                            type="number" 
                            placeholder={`Weight (${weightUnit})`}
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                        />
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className="w-[240px] justify-start text-left font-normal"
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isValid(newDate) ? format(newDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={newDate}
                                    onSelect={(d) => setNewDate(d || new Date())}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleAddOrUpdateEntry} disabled={!newWeight}>
                            <PlusCircle className="mr-2" /> {editingEntry ? 'Update' : 'Add'}
                        </Button>
                        {editingEntry && <Button variant="ghost" onClick={cancelEditing}>Cancel</Button>}
                     </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold">Recent Entries ({weightUnit})</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {weightEntries.slice().reverse().filter(e => e.unit === weightUnit).map(entry => (
                            <div key={entry.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                                <div>
                                    <p className="font-medium">{entry.weight} {entry.unit}</p>
                                    <p className="text-sm text-muted-foreground">{format(entry.date, "MMMM d, yyyy")}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(entry)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteEntry(entry.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
