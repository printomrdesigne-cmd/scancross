import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RaceResult, TeamResult, Runner } from '../types';
import { exportToExcel, exportQualifiedToWord, exportListToExcel } from '../utils/exporters';
import { isTeamParticipation, isIndividualParticipation, calculateIndividualRankings } from '../utils/resultCalculators';
import AddPhotoModal from './AddPhotosStep';
import { TeamPodium } from './TeamPodium';
import { IndividualPodium } from './IndividualPodium';
import { Eye, EyeOff, SlidersHorizontal, Trophy, UserCheck } from 'lucide-react';

// --- Icons ---
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const ValidIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const WordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const NewRaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// --- Edit Runner Modal ---
const EditRunnerModal: React.FC<{ 
    runner: RaceResult; 
    totalRunners: number;
    onClose: () => void; 
    onSave: (bib: string, data: Partial<RaceResult>) => void; 
}> = ({ runner, totalRunners, onClose, onSave }) => {
    const [formData, setFormData] = useState({ 
        name: runner.name || '', 
        institution: runner.institution || '', 
        rank: runner.rank,
        bibNumber: runner.bibNumber || '',
        participationType: runner.participationType || 'فردي',
        province: runner.province || '',
        academy: runner.academy || '',
        coach: runner.coach || '',
        note: runner.note || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const val = e.target.name === 'rank' ? parseInt(e.target.value, 10) || 1 : e.target.value; 
        setFormData({ ...formData, [e.target.name]: val }); 
    };

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        onSave(runner.bibNumber, formData); 
        onClose(); 
    };

    return (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg text-right max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">تعديل نتيجة المتسابق</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                الرتبة النهائية (الترتيب)
                            </label>
                            <input 
                                type="number" 
                                min={1}
                                max={totalRunners + 10}
                                name="rank" 
                                value={formData.rank} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-bold text-indigo-600 text-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                رقم الصدرية (Bib)
                            </label>
                            <input 
                                type="text" 
                                name="bibNumber" 
                                value={formData.bibNumber} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المتسابق</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">نوع المشاركة</label>
                            <input 
                                type="text" 
                                name="participationType" 
                                placeholder="فردي / فريق المؤسسة / ..."
                                value={formData.participationType} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المؤسسة التعليمية</label>
                        <input 
                            type="text" 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المديرية الإقليمية</label>
                            <input 
                                type="text" 
                                name="province" 
                                value={formData.province} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الأكاديمية الجهوية</label>
                            <input 
                                type="text" 
                                name="academy" 
                                value={formData.academy} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">ملاحظة / صفة التأهل</label>
                        <input 
                            type="text" 
                            name="note" 
                            placeholder="تأهل فردي، ضمن الفريق، إلخ..."
                            value={formData.note} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                        />
                    </div>

                    <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex-1">
                            حفظ التعديلات
                        </button>
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Add Runner To Results Modal ---
const AddRunnerToResultsModal: React.FC<{
    availableRunners: Runner[];
    existingBibs: Set<string>;
    defaultRank: number;
    onClose: () => void;
    onAdd: (runner: RaceResult) => void;
}> = ({ availableRunners, existingBibs, defaultRank, onClose, onAdd }) => {
    const [search, setSearch] = useState('');
    const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
    const [manualBib, setManualBib] = useState('');
    const [manualName, setManualName] = useState('');
    const [manualParticipationType, setManualParticipationType] = useState('فردي');
    const [manualInstitution, setManualInstitution] = useState('');
    const [manualProvince, setManualProvince] = useState('');
    const [manualAcademy, setManualAcademy] = useState('');
    const [targetRank, setTargetRank] = useState<number>(defaultRank);

    const filteredAvailable = useMemo(() => {
        const query = search.trim().toLowerCase();
        return availableRunners.filter(r => {
            if (existingBibs.has(r.bibNumber)) return false;
            if (!query) return true;
            return r.name.toLowerCase().includes(query) || 
                   r.bibNumber.includes(query) ||
                   r.institution.toLowerCase().includes(query);
        }).slice(0, 10);
    }, [availableRunners, existingBibs, search]);

    const handleSelectRunner = (runner: Runner) => {
        setSelectedRunner(runner);
        setManualBib(runner.bibNumber);
        setManualName(runner.name);
        setManualParticipationType(runner.participationType || 'فردي');
        setManualInstitution(runner.institution);
        setManualProvince(runner.province || '');
        setManualAcademy(runner.academy || '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBib.trim() || !manualName.trim() || !manualInstitution.trim()) {
            return;
        }

        const newResult: RaceResult = {
            bibNumber: manualBib.trim(),
            name: manualName.trim(),
            participationType: manualParticipationType.trim() || 'فردي',
            institution: manualInstitution.trim(),
            province: manualProvince.trim(),
            academy: manualAcademy.trim(),
            coach: selectedRunner?.coach || '',
            category: selectedRunner?.category || '',
            gender: selectedRunner?.gender || '',
            trackId: selectedRunner?.trackId || '',
            dob: selectedRunner?.dob || '',
            rank: targetRank,
            photo: selectedRunner?.photo || ''
        };

        onAdd(newResult);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 w-full max-w-xl text-right max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>إضافة عداء إلى النتائج</span>
                    </h3>
                </div>

                {/* Search from DB if available */}
                {availableRunners.length > 0 && (
                    <div className="mb-5 bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                            اختيار عداء من قاعدة البيانات المسجلة:
                        </label>
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو رقم الصدرية أو المؤسسة..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-white"
                        />
                        {filteredAvailable.length > 0 && (
                            <div className="mt-2 max-h-36 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-xs">
                                {filteredAvailable.map(runner => (
                                    <button
                                        type="button"
                                        key={runner.bibNumber}
                                        onClick={() => handleSelectRunner(runner)}
                                        className="w-full text-right p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex justify-between items-center transition-colors"
                                    >
                                        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">#{runner.bibNumber}</span>
                                        <div className="font-bold text-slate-800 dark:text-white">{runner.name} - {runner.institution}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                الرتبة في الوصول (الترتيب)
                            </label>
                            <input 
                                type="number" 
                                min={1}
                                value={targetRank} 
                                onChange={(e) => setTargetRank(parseInt(e.target.value, 10) || 1)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-bold text-indigo-600 text-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                رقم الصدرية (Bib)
                            </label>
                            <input 
                                type="text" 
                                value={manualBib} 
                                onChange={(e) => setManualBib(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم المتسابق</label>
                            <input 
                                type="text" 
                                value={manualName} 
                                onChange={(e) => setManualName(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">نوع المشاركة</label>
                            <input 
                                type="text" 
                                placeholder="فردي / فريق المؤسسة / ..."
                                value={manualParticipationType} 
                                onChange={(e) => setManualParticipationType(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المؤسسة التعليمية</label>
                        <input 
                            type="text" 
                            value={manualInstitution} 
                            onChange={(e) => setManualInstitution(e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المديرية الإقليمية</label>
                            <input 
                                type="text" 
                                value={manualProvince} 
                                onChange={(e) => setManualProvince(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الأكاديمية الجهوية</label>
                            <input 
                                type="text" 
                                value={manualAcademy} 
                                onChange={(e) => setManualAcademy(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex-1">
                            إدراج في النتائج
                        </button>
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Team Members Modal ---
const TeamMembersModal: React.FC<{
    team: TeamResult;
    members: RaceResult[];
    onClose: () => void;
    photos: { [bibNumber: string]: string };
    onAddPhoto: (runner: RaceResult) => void;
    isArchiveView?: boolean;
}> = ({ team, members, onClose, photos, onAddPhoto }) => {
    
    const institutionName = team.institution;
    const provinceName = members.length > 0 ? members[0].province : 'N/A';
    const academyName = members.length > 0 ? members[0].academy : 'N/A';
    const coachName = members.length > 0 ? members[0].coach : 'N/A';
    const scoringRunnersCount = team.topFourRanks.length;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[45] p-4 no-print">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-toast-in overflow-hidden relative">
                
                <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-20">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Header */}
                <div className="bg-white dark:bg-slate-800 p-6 shadow-sm z-10">
                    <div className="flex justify-between items-center text-right">
                        {/* Left Side: Rank */}
                        <div className="bg-yellow-400 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none flex-shrink-0">
                            <span className="text-4xl lg:text-5xl font-black text-white">{team.rank}</span>
                        </div>
                        
                        {/* Center: Team Info */}
                        <div className="flex-grow text-center px-4">
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white">{institutionName}</h3>
                            <div className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold space-y-1">
                               <p>المديرية: {provinceName}</p>
                               <p>الأكاديمية: {academyName}</p>
                               <p>🎓 المؤطر: {coachName}</p>
                               <p>👥 {scoringRunnersCount} عدائين محتسبين</p>
                            </div>
                        </div>

                        {/* Right Side: Points */}
                        <div className="text-right flex-shrink-0">
                            <h4 className="text-5xl lg:text-6xl font-black text-slate-800 dark:text-white">{team.totalRank}</h4>
                            <p className="text-slate-500 dark:text-slate-400 font-bold">مجموع النقاط</p>
                        </div>
                    </div>
                </div>

                {/* Body: Members Grid */}
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {members.map((member) => (
                            <div key={member.bibNumber} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 text-center relative border border-slate-100 dark:border-slate-700">
                                <span className="absolute top-2 right-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">#{member.rank}</span>
                                <button 
                                    onClick={() => onAddPhoto(member)}
                                    className="group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto my-4 overflow-hidden relative cursor-pointer hover:ring-4 hover:ring-indigo-300 transition-all duration-300"
                                >
                                    {photos[member.bibNumber] ? (
                                        <img src={photos[member.bibNumber]} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <PersonIcon />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                </button>
                                <h4 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">{member.name}</h4>
                                <p className="text-slate-400 font-mono font-semibold">#{member.bibNumber}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Props Interface ---
interface ResultsStepProps {
    raceConfig: { distance: string; category: string; gender: string; raceName?: string };
    individualResults: RaceResult[];
    teamResults: TeamResult[];
    photos: { [bibNumber: string]: string };
    onNewRace: () => void;
    onPhotoAdded: (bibNumber: string, dataUrl: string) => void;
    onUpdateRunner: (bibNumber: string, updatedData: Partial<RaceResult>) => void;
    onMoveRunnerRank?: (bibNumber: string, delta: -1 | 1) => void;
    onDeleteRunner: (bibNumber: string) => void;
    onAddRunnerToResults?: (runner: RaceResult) => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
    onFinalValidation: () => void;
    setIsLoading: (isLoading: boolean) => void;
    isArchiveView?: boolean;
    savedRaceId?: string | null;
    onBackToSavedRaces?: () => void;
    availableRunners?: Runner[];
}

export const ResultsStep: React.FC<ResultsStepProps> = ({ 
    raceConfig, 
    individualResults, 
    teamResults, 
    photos, 
    onNewRace, 
    onPhotoAdded, 
    onUpdateRunner, 
    onMoveRunnerRank, 
    onDeleteRunner, 
    onAddRunnerToResults, 
    addToast, 
    onFinalValidation, 
    setIsLoading, 
    isArchiveView = false,
    savedRaceId = null,
    onBackToSavedRaces,
    availableRunners = []
}) => {
    
    const [editingRunner, setEditingRunner] = useState<RaceResult | null>(null);
    const [runnerToDelete, setRunnerToDelete] = useState<RaceResult | null>(null);
    const [photoCandidate, setPhotoCandidate] = useState<RaceResult | null>(null);
    const [viewingTeam, setViewingTeam] = useState<TeamResult | null>(null);
    const [isAddRunnerModalOpen, setIsAddRunnerModalOpen] = useState(false);
    const [showWordDropdown, setShowWordDropdown] = useState(false);
    const [showExcelDropdown, setShowExcelDropdown] = useState(false);
    const [showIndividualResults, setShowIndividualResults] = useState(true);
    const [showTeamResults, setShowTeamResults] = useState(true);
    const [showIndividualPodium, setShowIndividualPodium] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const excelDropdownRef = useRef<HTMLDivElement>(null);
    
    const title = savedRaceId || isArchiveView
        ? (raceConfig.raceName || `نتائج سباق: ${raceConfig.category} (${raceConfig.gender})`)
        : `نتائج ${raceConfig.category} (${raceConfig.gender}) - ${raceConfig.distance}`;

    const [isRaceValidated, setIsRaceValidated] = useState(false);
    const [participationFilter, setParticipationFilter] = useState<'all' | 'individual' | 'team'>('all');
    const [podiumMode, setPodiumMode] = useState<'all' | 'individualOnly'>('all');

    // Individual rankings calculation for runners with individual participation
    const individualOnlyRankings = useMemo(() => {
        return calculateIndividualRankings(individualResults);
    }, [individualResults]);

    // Map bibNumber to its relative individual rank (1st individual, 2nd individual, etc.)
    const individualRankMap = useMemo(() => {
        const map = new Map<string, number>();
        individualOnlyRankings.forEach(r => {
            map.set(r.bibNumber, r.rank);
        });
        return map;
    }, [individualOnlyRankings]);

    // Individual Podium runners: Top 3 overall finishers (crowned individually even if team participation)
    const podiumRunners = useMemo(() => {
        if (podiumMode === 'individualOnly') {
            // Champions of strictly individual participation (فردي)
            return individualOnlyRankings.slice(0, 3);
        } else {
            // Official Top 3 Finishers in the race (Gold 🥇, Silver 🥈, Bronze 🥉 - crowned individually even if team)
            return [...individualResults].sort((a, b) => a.rank - b.rank).slice(0, 3);
        }
    }, [podiumMode, individualOnlyRankings, individualResults]);

    const filteredIndividualResults = useMemo(() => {
        let list = individualResults;

        // Apply participation filter
        if (participationFilter === 'individual') {
            list = list.filter(r => isIndividualParticipation(r.participationType));
        } else if (participationFilter === 'team') {
            list = list.filter(r => isTeamParticipation(r.participationType));
        }

        if (!searchTerm) return list;
        const lowercasedFilter = searchTerm.toLowerCase();
        return list.filter(runner => 
            runner.name.toLowerCase().includes(lowercasedFilter) || 
            runner.bibNumber.includes(lowercasedFilter) ||
            runner.institution.toLowerCase().includes(lowercasedFilter) ||
            (runner.participationType && runner.participationType.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, individualResults, participationFilter]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowWordDropdown(false);
            if (excelDropdownRef.current && !excelDropdownRef.current.contains(event.target as Node)) setShowExcelDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const getExportData = (type: 'winners' | 'qualified') => {
        let list: RaceResult[] = []; 
        let docTitle = ""; 
        const raceTitleInfo = `${raceConfig.distance} - ${raceConfig.category} (${raceConfig.gender})`;
        const winningTeam = teamResults.find(t => t.rank === 1); 
        const sortedResults = [...individualResults].sort((a, b) => a.rank - b.rank);
        
        if (type === 'winners') { 
            docTitle = "لائحة الفائزين"; 
            const addedBibs = new Set<string>();
            const winnersList: RaceResult[] = [];

            // 1. Top 3 overall in the race are crowned individually (even if team participation)
            const top3Overall = sortedResults.slice(0, 3);
            top3Overall.forEach((runner, index) => {
                const medalTitle = index === 0 ? 'ميدالية ذهبية 🥇' : index === 1 ? 'ميدالية فضية 🥈' : 'ميدالية برونزية 🥉';
                const isMemberOfWinningTeam = winningTeam && runner.institution === winningTeam.institution && isTeamParticipation(runner.participationType);

                winnersList.push({
                    ...runner,
                    note: isMemberOfWinningTeam 
                        ? `تتويج فردي (${medalTitle}) + بطل الفرق 🏆` 
                        : `تتويج فردي (${medalTitle})`
                });
                addedBibs.add(runner.bibNumber);
            });

            // 2. Winning School Team runners (1st Place Team)
            if (winningTeam) {
                const winningTeamRunners = sortedResults.filter(
                    r => r.institution === winningTeam.institution && isTeamParticipation(r.participationType)
                );
                winningTeamRunners.forEach((runner, index) => {
                    if (!addedBibs.has(runner.bibNumber)) {
                        winnersList.push({
                            ...runner,
                            note: index < 4 ? 'فريق المؤسسة الفائز (بطل الفرق 🏆)' : 'فريق المؤسسة الفائز (احتياطي)'
                        });
                        addedBibs.add(runner.bibNumber);
                    }
                });
            }

            list = winnersList;
        } else { 
            docTitle = "لائحة المؤهلين للمشاركة في البطولة الجهوية"; 
            const qualifiedList: RaceResult[] = [];
            const addedBibs = new Set<string>();

            // 1. Winning School Team (qualifies as a team)
            if (winningTeam) {
                const winningTeamRunners = sortedResults.filter(
                    r => r.institution === winningTeam.institution && isTeamParticipation(r.participationType)
                );
                winningTeamRunners.forEach((runner, index) => {
                    qualifiedList.push({
                        ...runner,
                        note: index < 4 ? 'ضمن الفريق المؤهل (رسمي) 🏆' : 'فريق المؤسسة (احتياطي)'
                    });
                    addedBibs.add(runner.bibNumber);
                });

                // 2. 3 Individual Qualifiers (top runners not in the qualified team)
                let indCount = 0;
                for (const runner of sortedResults) {
                    if (!addedBibs.has(runner.bibNumber)) {
                        qualifiedList.push({
                            ...runner,
                            note: 'تأهل فردي للبطولة الجهوية'
                        });
                        addedBibs.add(runner.bibNumber);
                        indCount++;
                        if (indCount === 3) break;
                    }
                }
            } else {
                // If no qualifying team, top 3 overall qualify individually
                sortedResults.slice(0, 3).forEach(runner => {
                    qualifiedList.push({
                        ...runner,
                        note: 'تأهل فردي للبطولة الجهوية'
                    });
                });
            }

            list = qualifiedList;
        }
        return { list, docTitle, raceTitleInfo };
    };
    
    const handleWordExport = async (type: 'winners' | 'qualified') => { 
        setShowWordDropdown(false);
        const { list, docTitle, raceTitleInfo } = getExportData(type); 
        if (list.length === 0) { addToast('لا توجد نتائج.', 'error'); return; } 
        setIsLoading(true);
        try {
            await exportQualifiedToWord(raceTitleInfo, list, photos, docTitle); 
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExcelExport = async (type: 'winners' | 'qualified' | 'full' | 'individual' | 'teams') => { 
        setShowExcelDropdown(false);
        setIsLoading(true);
        try {
            if (type === 'full') { 
                await exportToExcel(title, individualResults, teamResults, photos); 
            } else if (type === 'individual') {
                const individualOnly = individualOnlyRankings;
                if (individualOnly.length === 0) { addToast('لا توجد نتائج فردية.', 'error'); return; }
                await exportListToExcel(`الترتيب الفردي - ${raceConfig.category} (${raceConfig.gender})`, individualOnly, photos);
            } else if (type === 'teams') {
                if (teamResults.length === 0) { addToast('لا توجد نتائج فرق مكتملة.', 'error'); return; }
                const teamMembersList = individualResults.filter(r => isTeamParticipation(r.participationType));
                await exportToExcel(`نتائج الفرق - ${raceConfig.category} (${raceConfig.gender})`, teamMembersList, teamResults, photos);
            } else { 
                const { list, docTitle, raceTitleInfo } = getExportData(type); 
                if (list.length === 0) { addToast('لا توجد نتائج.', 'error'); return; } 
                await exportListToExcel(`${docTitle} - ${raceTitleInfo}`, list, photos); 
            } 
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveEdit = useCallback((bibNumber: string, updatedData: Partial<RaceResult>) => { 
        onUpdateRunner(bibNumber, updatedData); 
        setEditingRunner(null); 
    }, [onUpdateRunner]);
    
    const handleDelete = useCallback((runner: RaceResult) => { 
        setRunnerToDelete(runner); 
    }, []);

    const confirmDelete = () => {
        if (runnerToDelete) {
            onDeleteRunner(runnerToDelete.bibNumber);
            setRunnerToDelete(null);
        }
    };

    const handleValidationClick = () => {
        onFinalValidation();
        setIsRaceValidated(true);
    };

    const sortedResults = useMemo(() => {
        return [...individualResults].sort((a, b) => a.rank - b.rank);
    }, [individualResults]);

    const existingBibs = useMemo(() => {
        return new Set(individualResults.map(r => r.bibNumber));
    }, [individualResults]);

    return (
        <div className="text-center">
            {/* Top Bar for Loaded Completed Race */}
            {(savedRaceId || isArchiveView) && (
                <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-right shadow-sm no-print">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 dark:shadow-none flex-shrink-0">
                            🏆
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                                    سباق منجز بالأرشيف
                                </span>
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                                    مُزامن مع Firebase
                                </span>
                                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2 py-0.5 rounded-full">
                                    {individualResults.length} عداء واصل
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                                {raceConfig.raceName || `${raceConfig.category} (${raceConfig.gender}) - ${raceConfig.distance}`}
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap justify-end w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>محفوظ ومزامن تلقائياً</span>
                        </div>

                        {onBackToSavedRaces && (
                            <button
                                onClick={onBackToSavedRaces}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                                title="العودة إلى قائمة السباقات المنجزة"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>العودة إلى السباقات المنجزة</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                عرض وتعديل النتائج النهائية وترتيب الفرق والأفراد
            </p>

            {/* Results Visibility Control Bar (إظهار / إخفاء نتائج الفردي أو فرق المؤسسات) */}
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 text-right no-print">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-inner flex-shrink-0">
                        <SlidersHorizontal className="w-5 h-5" />
                    </span>
                    <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <span>خيارات عرض النتائج</span>
                            <span className="text-[11px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                                إظهار / إخفاء
                            </span>
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            تحكم في إظهار أو إخفاء نتائج الفردي أو فرق المؤسسات للعرض والطباعة
                        </p>
                    </div>
                </div>

                {/* View Toggles & Presets */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
                    {/* All View Preset */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowIndividualResults(true);
                            setShowTeamResults(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            showIndividualResults && showTeamResults
                                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none ring-2 ring-indigo-300 dark:ring-indigo-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        title="عرض شامل لجميع النتائج (فردي وفرق المؤسسات)"
                    >
                        عرض شامل (الكل) 📑
                    </button>

                    {/* Toggle Individual Results */}
                    <button
                        type="button"
                        onClick={() => setShowIndividualResults(!showIndividualResults)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            showIndividualResults
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                        title={showIndividualResults ? "إخفاء نتائج الفردي" : "إظهار نتائج الفردي"}
                    >
                        {showIndividualResults ? <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                        <span>نتائج الفردي 🏃</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                            showIndividualResults 
                                ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                            {showIndividualResults ? 'ظاهر' : 'مخفي'}
                        </span>
                    </button>

                    {/* Toggle Team/Institution Results */}
                    <button
                        type="button"
                        onClick={() => setShowTeamResults(!showTeamResults)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            showTeamResults
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                        title={showTeamResults ? "إخفاء نتائج فريق المؤسسة" : "إظهار نتائج فريق المؤسسة"}
                    >
                        {showTeamResults ? <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                        <span>فريق المؤسسة 🏢</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                            showTeamResults 
                                ? 'bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                            {showTeamResults ? 'ظاهر' : 'مخفي'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="results-container flex flex-col gap-8 text-right">
                
                {/* Warning if both Individual and Team results are hidden */}
                {!showIndividualResults && !showTeamResults && (
                    <div className="w-full bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-3xl p-8 text-center my-2">
                        <p className="text-base font-bold text-amber-900 dark:text-amber-200 mb-3">
                            تم إخفاء كلا القسمين (نتائج الفردي وفرق المؤسسات).
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <button
                                onClick={() => setShowIndividualResults(true)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                            >
                                <Eye className="w-4 h-4" />
                                <span>إظهار نتائج الفردي 🏃</span>
                            </button>
                            <button
                                onClick={() => setShowTeamResults(true)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                            >
                                <Eye className="w-4 h-4" />
                                <span>إظهار نتائج فرق المؤسسات 🏢</span>
                            </button>
                            <button
                                onClick={() => { setShowIndividualResults(true); setShowTeamResults(true); }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                            >
                                إظهار الجميع (عرض شامل) 📑
                            </button>
                        </div>
                    </div>
                )}

                {/* Individual Champions Podium (1 • 2 • 3) */}
                {showIndividualResults && individualResults.length > 0 && showIndividualPodium && (
                    <div className="space-y-3">
                        {/* Podium Mode Selector Toggle */}
                        <div className="flex items-center justify-between flex-wrap gap-2 px-1 no-print">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <span>منصة التتويج الفردي:</span>
                                </span>
                                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setPodiumMode('all')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            podiumMode === 'all'
                                                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>🥇🥈🥉 أبطال السباق (3 الأوائل)</span>
                                        <span className="text-[10px] opacity-80">(يتوج فردياً ولو كان فريق)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPodiumMode('individualOnly')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            podiumMode === 'individualOnly'
                                                ? 'bg-indigo-600 text-white shadow-sm font-black'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>فئة المشاركة الفردية فقط</span>
                                        <span className="text-[10px] opacity-80">({individualOnlyRankings.length})</span>
                                    </button>
                                </div>
                            </div>

                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {podiumMode === 'all' 
                                    ? 'يتم تتويج الـ 3 الأوائل في السباق بالميداليات فردياً أياً كان نوع مشاركتهم' 
                                    : 'عرض منصة التتويج للمشاركين بصفة فردية فقط'}
                            </span>
                        </div>

                        <IndividualPodium
                            individualResults={podiumRunners}
                            photos={photos}
                            title={podiumMode === 'all' 
                                ? 'منصة التتويج الفردي (أبطال السباق 1 • 2 • 3)' 
                                : 'منصة تتويج فئة المشاركة الفردية (1 • 2 • 3)'}
                            subtitle={podiumMode === 'all'
                                ? 'المراكز الثلاثة الأولى المتوجة بالميداليات (الذهبية 🥇، الفضية 🥈، البرونزية 🥉) - يتوج الثلاثة الأوائل فردياً ولو كان نوع المشاركة فريق'
                                : 'المراكز الثلاثة الأولى من فئة المشاركة الفردية'}
                            onPhotoClick={(runner) => setPhotoCandidate(runner)}
                            onEditRunner={(runner) => setEditingRunner(runner)}
                        />
                    </div>
                )}

                {/* Team Standings (Podium & Complete Ranking) */}
                {showTeamResults && teamResults.length > 0 && (
                    <TeamPodium
                        teamResults={teamResults}
                        individualResults={individualResults}
                        photos={photos}
                        onViewTeam={(team) => setViewingTeam(team)}
                        onHide={() => setShowTeamResults(false)}
                    />
                )}

                {/* Team Results Hidden Placeholder */}
                {!showTeamResults && teamResults.length > 0 && showIndividualResults && (
                    <div className="bg-slate-50 dark:bg-slate-800/70 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2 text-right no-print">
                        <div className="flex items-center gap-2.5">
                            <EyeOff className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                قسم نتائج فرق المؤسسات مخفي حالياً ({teamResults.length} مؤسسة).
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTeamResults(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>إظهار نتائج فريق المؤسسة</span>
                        </button>
                    </div>
                )}

                {/* Individual Standings */}
                {showIndividualResults && (
                <div className="w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span>🏃</span>
                                <span>ترتيب العدائين ({filteredIndividualResults.length} من {individualResults.length})</span>
                            </h3>

                            {/* Participation Type Filter Tabs */}
                            <div className="inline-flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl no-print">
                                <button
                                    type="button"
                                    onClick={() => setParticipationFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        participationFilter === 'all'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    الكل ({individualResults.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setParticipationFilter('individual')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        participationFilter === 'individual'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    <span>الترتيب الفردي فقط</span>
                                    <span className="text-[10px] opacity-80">({individualOnlyRankings.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setParticipationFilter('team')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        participationFilter === 'team'
                                            ? 'bg-amber-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    <span>فرق المؤسسات</span>
                                    <span className="text-[10px] opacity-80">({individualResults.filter(r => isTeamParticipation(r.participationType)).length})</span>
                                </button>
                            </div>

                            {individualResults.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowIndividualPodium(!showIndividualPodium)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm no-print ${
                                        showIndividualPodium
                                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                                    }`}
                                    title="إظهار أو إخفاء منصة تتويج أبطال الفردي (1 • 2 • 3)"
                                >
                                    <span>🏆</span>
                                    <span>{showIndividualPodium ? 'إخفاء بوديوم 1 • 2 • 3' : 'عرض بوديوم 1 • 2 • 3 🥇'}</span>
                                </button>
                            )}

                            {/* Hide Individual Results Button */}
                            <button
                                type="button"
                                onClick={() => setShowIndividualResults(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 no-print"
                                title="إخفاء قسم نتائج الفردي"
                            >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>إخفاء القسم</span>
                            </button>

                            {onAddRunnerToResults && (
                                <button
                                    onClick={() => setIsAddRunnerModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors shadow-sm"
                                    title="إضافة عداء للنتائج يدوياً أو من قاعدة البيانات"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>إضافة عداء</span>
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="بحث بالاسم أو رقم الصدرية أو المؤسسة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white dark:bg-slate-800 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3 text-center">الوصول العام</th>
                                    {participationFilter !== 'team' && (
                                        <th className="p-3 text-center">الترتيب الفردي</th>
                                    )}
                                    <th className="p-3 text-center">الصورة</th>
                                    <th className="p-3 text-right">الاسم</th>
                                    <th className="p-3 text-center">نوع المشاركة</th>
                                    <th className="p-3 text-right">المؤسسة</th>
                                    <th className="p-3 text-right">المديرية</th>
                                    <th className="p-3 text-right">الأكاديمية</th>
                                    <th className="p-3 text-center">الصدرية</th>
                                    <th className="p-3 text-center no-print">إجراءات وتعديل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredIndividualResults.length === 0 ? (
                                    <tr><td colSpan={10} className="px-6 py-8 text-center text-slate-400">لا توجد نتائج تطابق التصفية الحالية.</td></tr>
                                ) : (
                                    filteredIndividualResults.slice().sort((a, b) => a.rank - b.rank).map((runner) => {
                                        const isRank1 = runner.rank === 1;
                                        const isRank2 = runner.rank === 2;
                                        const isRank3 = runner.rank === 3;
                                        
                                        const indRank = individualRankMap.get(runner.bibNumber);
                                        const isIndParticipant = isIndividualParticipation(runner.participationType);

                                        const rowHighlight = isRank1 
                                            ? 'bg-amber-50/70 dark:bg-amber-950/20' 
                                            : isRank2 
                                            ? 'bg-slate-50/80 dark:bg-slate-800/40' 
                                            : isRank3 
                                            ? 'bg-amber-100/30 dark:bg-amber-950/10' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50';

                                        return (
                                        <tr key={runner.bibNumber} className={`${rowHighlight} transition-colors`}>
                                            {/* General Arrival Rank */}
                                            <td className="p-3 text-center">
                                                {isRank1 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs shadow-md border border-amber-300">
                                                        1 🥇
                                                    </span>
                                                ) : isRank2 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-200 font-black text-xs shadow-sm border border-slate-300 dark:border-slate-500">
                                                        2 🥈
                                                    </span>
                                                ) : isRank3 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-black text-xs shadow-sm border border-amber-400">
                                                        3 🥉
                                                    </span>
                                                ) : (
                                                    <span className="font-black text-slate-700 dark:text-slate-300 text-base">
                                                        {runner.rank}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Individual Category Rank */}
                                            {participationFilter !== 'team' && (
                                                <td className="p-3 text-center">
                                                    {isIndParticipant && indRank !== undefined ? (
                                                        indRank === 1 ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                                                                1 🥇 فردي
                                                            </span>
                                                        ) : indRank === 2 ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-300 text-slate-900 font-bold text-xs shadow-sm">
                                                                2 🥈 فردي
                                                            </span>
                                                        ) : indRank === 3 ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700 text-amber-100 font-bold text-xs shadow-sm">
                                                                3 🥉 فردي
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                                                                {indRank} فردي
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold">
                                                            ضمن فريق
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            <td className="p-3 text-center">
                                                <div 
                                                    onClick={() => setPhotoCandidate(runner)} 
                                                    className="w-10 h-10 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden cursor-pointer hover:ring-2 ring-indigo-400 transition-all"
                                                    title="إضافة أو تعديل الصورة"
                                                >
                                                    {photos[runner.bibNumber] ? (
                                                        <img src={photos[runner.bibNumber]} alt={runner.name} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <div className="p-2 opacity-50"><CameraIcon/></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 font-bold text-slate-800 dark:text-white">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span>{runner.name}</span>
                                                    {isIndParticipant && indRank === 1 && (
                                                        <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 bg-amber-200 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                                                            بطل الفردي 🥇
                                                        </span>
                                                    )}
                                                </div>
                                                {runner.note && (
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                        {runner.note}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                    isTeamParticipation(runner.participationType)
                                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                }`}>
                                                    {runner.participationType || 'فردي'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{runner.institution}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{runner.province}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{runner.academy}</td>
                                            <td className="p-3 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                                                #{runner.bibNumber}
                                            </td>
                                        <td className="p-3 text-center no-print">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Re-order Up button */}
                                                {onMoveRunnerRank && (
                                                    <button 
                                                        onClick={() => onMoveRunnerRank(runner.bibNumber, -1)} 
                                                        disabled={runner.rank <= 1}
                                                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 p-1 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                        title="تقديم الرتبة للأعلى (▲)"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Re-order Down button */}
                                                {onMoveRunnerRank && (
                                                    <button 
                                                        onClick={() => onMoveRunnerRank(runner.bibNumber, 1)} 
                                                        disabled={runner.rank >= sortedResults.length}
                                                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 p-1 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                        title="تأخير الرتبة للأسفل (▼)"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Edit Runner Button */}
                                                <button 
                                                    onClick={() => setEditingRunner(runner)} 
                                                    className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                                                    title="تعديل بيانات النتيجة والرتبة"
                                                >
                                                    <EditIcon />
                                                </button>

                                                {/* Delete Runner Button */}
                                                <button 
                                                    onClick={() => handleDelete(runner)} 
                                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                                                    title="حذف من النتائج"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                }))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* Individual Results Hidden Placeholder */}
                {!showIndividualResults && individualResults.length > 0 && showTeamResults && (
                    <div className="bg-slate-50 dark:bg-slate-800/70 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2 text-right no-print">
                        <div className="flex items-center gap-2.5">
                            <EyeOff className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                قسم نتائج الفردي مخفي حالياً ({individualResults.length} عداء).
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowIndividualResults(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>إظهار نتائج الفردي</span>
                        </button>
                    </div>
                )}

                {/* Sticky Action Footer */}
                <div className="mt-4 no-print sticky bottom-4 z-30">
                     <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-2xl flex flex-wrap justify-center items-center gap-3 max-w-4xl mx-auto">
                        
                        {/* Auto-saved badge */}
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>تم الحفظ تلقائياً ✓</span>
                        </div>

                        {/* Word Export */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setShowWordDropdown(!showWordDropdown)} 
                                title="تصدير Word" 
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 font-bold transition-colors text-xs sm:text-sm"
                            >
                                <WordIcon />
                                <span>تصدير Word</span>
                            </button>
                            {showWordDropdown && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-700 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-600 animate-toast-in z-50">
                                    <button onClick={() => handleWordExport('winners')} className="block w-full text-right px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white">لائحة الفائزين (أفراد + فريق)</button>
                                    <button onClick={() => handleWordExport('qualified')} className="block w-full text-right px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white border-t border-slate-100 dark:border-slate-600">لائحة المؤهلين للبطولة الجهوية</button>
                                </div>
                            )}
                        </div>

                        {/* Excel Export */}
                        <div className="relative" ref={excelDropdownRef}>
                            <button 
                                onClick={() => setShowExcelDropdown(!showExcelDropdown)} 
                                title="تصدير Excel" 
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-300 font-bold transition-colors text-xs sm:text-sm"
                            >
                                <ExcelIcon />
                                <span>تصدير Excel</span>
                            </button>
                            {showExcelDropdown && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-white dark:bg-slate-700 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-600 animate-toast-in z-50">
                                    <button onClick={() => handleExcelExport('full')} className="block w-full text-right px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white">كافة النتائج (شامل)</button>
                                    <button onClick={() => handleExcelExport('individual')} className="block w-full text-right px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white border-t border-slate-100 dark:border-slate-600">الترتيب الفردي فقط (فردي)</button>
                                    <button onClick={() => handleExcelExport('teams')} className="block w-full text-right px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white border-t border-slate-100 dark:border-slate-600">ترتيب فرق المؤسسات</button>
                                    <button onClick={() => handleExcelExport('qualified')} className="block w-full text-right px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white border-t border-slate-100 dark:border-slate-600">لائحة المؤهلين</button>
                                    <button onClick={() => handleExcelExport('winners')} className="block w-full text-right px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-white border-t border-slate-100 dark:border-slate-600">لائحة الفائزين</button>
                                </div>
                            )}
                        </div>

                        <div className="w-px bg-slate-200 dark:bg-slate-600 h-6 mx-1"></div>

                        {/* Final Validation */}
                        <button 
                            onClick={handleValidationClick} 
                            title="مصادقة نهائية وإعادة ترتيب" 
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold shadow-md transition-all text-xs sm:text-sm active:scale-95 ${
                                isRaceValidated 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                            }`}
                        >
                            <ValidIcon />
                            <span>{isRaceValidated ? 'تمت المصادقة' : 'مصادقة نهائية'}</span>
                        </button>
                        
                        {/* Return to Saved Races Button */}
                        {onBackToSavedRaces && (
                            <button 
                                onClick={onBackToSavedRaces} 
                                title="العودة إلى قائمة السباقات المنجزة" 
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold transition-colors text-xs sm:text-sm"
                            >
                                <BackIcon />
                                <span>السباقات المنجزة</span>
                            </button>
                        )}

                        {/* New Race Button */}
                        <button 
                            onClick={onNewRace} 
                            title="سباق جديد" 
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold transition-colors text-xs sm:text-sm"
                        >
                            <NewRaceIcon />
                            <span>سباق جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {editingRunner && (
                <EditRunnerModal 
                    runner={editingRunner} 
                    totalRunners={individualResults.length}
                    onClose={() => setEditingRunner(null)} 
                    onSave={handleSaveEdit} 
                />
            )}

            {isAddRunnerModalOpen && onAddRunnerToResults && (
                <AddRunnerToResultsModal
                    availableRunners={availableRunners}
                    existingBibs={existingBibs}
                    defaultRank={individualResults.length + 1}
                    onClose={() => setIsAddRunnerModalOpen(false)}
                    onAdd={onAddRunnerToResults}
                />
            )}

            {photoCandidate && (
                <AddPhotoModal 
                    runner={photoCandidate} 
                    onClose={() => setPhotoCandidate(null)} 
                    onPhotoAdded={onPhotoAdded} 
                />
            )}

            {viewingTeam && (
                <TeamMembersModal 
                    team={viewingTeam} 
                    members={individualResults.filter(r => r.institution === viewingTeam.institution && isTeamParticipation(r.participationType)).sort((a, b) => a.rank - b.rank)} 
                    onClose={() => setViewingTeam(null)} 
                    photos={photos} 
                    onAddPhoto={setPhotoCandidate} 
                    isArchiveView={isArchiveView}
                />
            )}
            
            {/* Delete Confirmation Modal */}
            {runnerToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 no-print">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100 dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            هل أنت متأكد من حذف العداء <span className="font-bold text-slate-800 dark:text-slate-200">{runnerToDelete.name}</span> من النتائج؟
                            <br />
                            سيتم إعادة ترتيب رتب باقي العدائين وإعادة احتساب نقاط الفرق تلقائياً.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-rose-200 dark:shadow-none flex-1 text-sm">
                                حذف
                            </button>
                            <button onClick={() => setRunnerToDelete(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-colors flex-1 text-sm">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
