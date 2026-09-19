import React, { useState, useEffect, useMemo } from 'react';
import { SavedRace } from '../types';
import { fetchSavedRacesFromFirestore, deleteRaceFromFirestore, FIREBASE_PROJECT_ID } from '../services/firebase';

interface SavedRacesViewProps {
    onClose: () => void;
    onLoadRace: (race: SavedRace, editMode?: boolean) => void;
    onShowToast: (msg: string, type: 'success' | 'error') => void;
    onRacesCountChange?: (count: number) => void;
}

export const SavedRacesView: React.FC<SavedRacesViewProps> = ({
    onClose,
    onLoadRace,
    onShowToast,
    onRacesCountChange
}) => {
    const [races, setRaces] = useState<SavedRace[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [raceToDelete, setRaceToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const loadAllRaces = async () => {
        setIsSyncing(true);
        try {
            const savedLocalStr = localStorage.getItem('savedRaces');
            const localRaces: SavedRace[] = savedLocalStr ? JSON.parse(savedLocalStr) : [];
            
            // Fetch from Firestore
            const cloudRaces = await fetchSavedRacesFromFirestore().catch(() => []);
            
            // Merge by ID (cloud races preferred if conflict)
            const map = new Map<string, SavedRace>();
            localRaces.forEach(r => map.set(r.id, r));
            cloudRaces.forEach(r => map.set(r.id, r));
            
            const merged = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
            setRaces(merged);
            localStorage.setItem('savedRaces', JSON.stringify(merged));
            if (onRacesCountChange) {
                onRacesCountChange(merged.length);
            }
        } catch (e) {
            console.error('Error loading races:', e);
            const saved = localStorage.getItem('savedRaces');
            if (saved) {
                const parsed = JSON.parse(saved);
                setRaces(parsed);
                if (onRacesCountChange) onRacesCountChange(parsed.length);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        loadAllRaces();
    }, []);

    const confirmDelete = async () => {
        if (!raceToDelete) return;
        const targetId = raceToDelete;
        const updated = races.filter(r => r.id !== targetId);
        setRaces(updated);
        localStorage.setItem('savedRaces', JSON.stringify(updated));
        if (onRacesCountChange) onRacesCountChange(updated.length);
        
        try {
            await deleteRaceFromFirestore(targetId);
            onShowToast('تم حذف السباق من الأرشيف وسحابة Firebase بنجاح', 'success');
        } catch (e) {
            console.error('Error deleting from Firestore:', e);
            onShowToast('تم حذف السباق محلياً', 'success');
        }
        setRaceToDelete(null);
    };

    const filteredRaces = useMemo(() => {
        return races.filter(race => {
            const matchCat = selectedCategory === 'ALL' || race.config.category === selectedCategory;
            const term = searchTerm.trim().toLowerCase();
            if (!term) return matchCat;
            const raceName = (race.config.raceName || '').toLowerCase();
            const category = (race.config.category || '').toLowerCase();
            const gender = (race.config.gender || '').toLowerCase();
            const distance = (race.config.distance || '').toLowerCase();
            const date = (race.date || '').toLowerCase();
            return matchCat && (
                raceName.includes(term) ||
                category.includes(term) ||
                gender.includes(term) ||
                distance.includes(term) ||
                date.includes(term)
            );
        });
    }, [races, searchTerm, selectedCategory]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        races.forEach(r => {
            if (r.config.category) set.add(r.config.category);
        });
        return Array.from(set);
    }, [races]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-5xl mx-auto text-right relative border border-slate-100 dark:border-slate-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <span>السباقات المنجزة والأرشيف</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full">
                                {races.length} سباق
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            استعراض النتائج النهائية، تعديل المراتب والعدائين، وتصدير التقارير
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        onClick={loadAllRaces}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
                        title="مزامنة فورية مع Firebase"
                    >
                        <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السحابة'}</span>
                    </button>

                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="العودة"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            {races.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="بحث باسم السباق، الفئة، الجنس، التاريخ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                        <span className="absolute right-3.5 top-3 text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>

                    {categories.length > 0 && (
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="ALL">جميع الفئات</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* List */}
            {races.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">لا توجد سباقات منجزة محفوظة بعد</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        عند اختتام أي سباق والنقر على &quot;حفظ السباق&quot;، سيتم حفظ النتائج تلقائياً في سحابة Firebase ({FIREBASE_PROJECT_ID}) والأرشيف للرجوع إليها وتعديلها في أي وقت.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all text-sm"
                    >
                        العودة إلى واجهة السباقات
                    </button>
                </div>
            ) : filteredRaces.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    لا توجد سباقات تطابق بحثك.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRaces.map(race => {
                        const topWinner = race.individualResults?.length > 0
                            ? [...race.individualResults].sort((a, b) => a.rank - b.rank)[0]
                            : null;
                        const topTeam = race.teamResults?.length > 0
                            ? [...race.teamResults].sort((a, b) => a.rank - b.rank)[0]
                            : null;

                        return (
                            <div 
                                key={race.id} 
                                className="bg-slate-50 dark:bg-slate-700/60 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Left: Info */}
                                    <div className="flex-grow text-right">
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                            <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                                                Firebase Cloud
                                            </span>
                                            <span className="text-[11px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                                                {race.config.category}
                                            </span>
                                            <span className="text-[11px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                                                {race.config.gender}
                                            </span>
                                            {race.config.distance && (
                                                <span className="text-[11px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                                                    {race.config.distance}
                                                </span>
                                            )}
                                            <span className="text-[11px] text-slate-400 font-mono">
                                                {race.date}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                            {race.config.raceName || `سباق ${race.config.category} (${race.config.gender})`}
                                        </h3>

                                        {/* Stats snippet */}
                                        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                                            <div className="flex items-center gap-1.5 font-semibold">
                                                <span>🏃 الواصلين:</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {race.individualResults?.length || 0} عداء
                                                </span>
                                            </div>

                                            {topWinner && (
                                                <div className="flex items-center gap-1.5">
                                                    <span>🥇 الأول:</span>
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {topWinner.name} ({topWinner.institution})
                                                    </span>
                                                </div>
                                            )}

                                            {topTeam && (
                                                <div className="flex items-center gap-1.5">
                                                    <span>🏆 الفريق المتصدر:</span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {topTeam.institution} ({topTeam.totalRank} نقطة)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-600">
                                        <button 
                                            onClick={() => setRaceToDelete(race.id)} 
                                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 p-2.5 rounded-xl transition-colors" 
                                            title="حذف هذا السباق من الأرشيف والسحابة"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>

                                        <button 
                                            onClick={() => onLoadRace(race, false)} 
                                            className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all"
                                            title="عرض النتائج النهائية والتصدير"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>عرض النتائج</span>
                                        </button>

                                        <button 
                                            onClick={() => onLoadRace(race, true)} 
                                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                                            title="تعديل النتائج والمراتب والعدائين"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span>تعديل النتائج</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Modal */}
            {raceToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100 dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            هل أنت متأكد من حذف هذا السباق من الأرشيف وسحابة Firebase نهائياً؟
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={confirmDelete} 
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-rose-200 dark:shadow-none flex-1 text-sm"
                            >
                                حذف نهائي
                            </button>
                            <button 
                                onClick={() => setRaceToDelete(null)} 
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-colors flex-1 text-sm"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
