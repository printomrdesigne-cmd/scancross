
import React, { useState } from 'react';
import { Runner } from '../types';
import { exportTemplateToExcel } from '../utils/exporters';
import { 
    fetchRunnersFromFirestore, 
    batchSyncRunnersToFirestore, 
    FIREBASE_PROJECT_ID 
} from '../services/firebase';

interface FileUploadStepProps {
    onRunnersLoaded: (runners: Runner[]) => void;
    onSettingsSaved?: (scriptUrl: string, sheetId: string) => void;
    existingRunnersCount?: number;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const FileUploadStep: React.FC<FileUploadStepProps> = ({ onRunnersLoaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCloudLoading, setIsCloudLoading] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLoadFromFirebase = async () => {
        setIsCloudLoading(true);
        setError(null);
        setSyncMessage(null);
        try {
            const cloudRunners = await fetchRunnersFromFirestore();
            if (cloudRunners.length === 0) {
                setError('لا يوجد متسابقين مخزنين حالياً في سحابة Firebase. يرجى رفع ملف Excel أولاً للمزامنة.');
            } else {
                onRunnersLoaded(cloudRunners);
            }
        } catch (err: any) {
            console.error('Error fetching from Firebase:', err);
            setError('تعذر جلب البيانات من سحابة Firebase: ' + (err.message || 'خطأ في الاتصال'));
        } finally {
            setIsCloudLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setSyncMessage(null);

        try {
            // Ensure XLSX is available (loaded via CDN as per utils/exporters.ts implies)
            const XLSX = (window as any).XLSX;
            if (!XLSX) {
                throw new Error("مكتبة معالجة الملفات غير متوفرة. يرجى التحقق من الاتصال بالإنترنت.");
            }

            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Header and row parsing
            const headerRow: any[] = (jsonData[0] as any[]) || [];
            const headerMap: { [key: string]: number } = {};
            headerRow.forEach((col, idx) => {
                const headerStr = String(col || '').trim().toLowerCase();
                if (headerStr.includes('صدرية') || headerStr.includes('dossard') || headerStr.includes('bib')) headerMap.bibNumber = idx;
                else if (headerStr.includes('اسم') || headerStr.includes('nom')) headerMap.name = idx;
                else if (headerStr.includes('مسار') || headerStr.includes('massar')) headerMap.trackId = idx;
                else if (headerStr.includes('ازدياد') || headerStr.includes('ميلاد') || headerStr.includes('naissance') || headerStr.includes('dob')) headerMap.dob = idx;
                else if (headerStr.includes('مؤسسة') || headerStr.includes('etablissement') || headerStr.includes('school')) headerMap.institution = idx;
                else if (headerStr.includes('مؤطر') || headerStr.includes('أستاذ') || headerStr.includes('coach')) headerMap.coach = idx;
                else if (headerStr.includes('فئة') || headerStr.includes('categorie')) headerMap.category = idx;
                else if (headerStr.includes('جنس') || headerStr.includes('genre') || headerStr.includes('sexe')) headerMap.gender = idx;
                else if (headerStr.includes('مشاركة') || headerStr.includes('participation') || headerStr.includes('صفة')) headerMap.participationType = idx;
                else if (headerStr.includes('مديرية') || headerStr.includes('delegation') || headerStr.includes('province')) headerMap.province = idx;
                else if (headerStr.includes('أكاديمية') || headerStr.includes('academie')) headerMap.academy = idx;
                else if (headerStr.includes('صورة') || headerStr.includes('photo')) headerMap.photo = idx;
            });

            const rows = jsonData.slice(1);

            const runners: Runner[] = rows.map((row: any[]) => {
                // If header mapping didn't find specific columns, fallback to positional
                const hasCustomHeader = Object.keys(headerMap).length >= 3;
                const is12ColFormat = row.length >= 12;

                const getVal = (field: string, defaultPos: number) => {
                    if (hasCustomHeader && headerMap[field] !== undefined) {
                        return row[headerMap[field]];
                    }
                    return row[defaultPos];
                };

                const dobValue = hasCustomHeader && headerMap.dob !== undefined ? row[headerMap.dob] : row[3];
                let dobString = '';
                if (dobValue instanceof Date) {
                    const day = String(dobValue.getDate()).padStart(2, '0');
                    const month = String(dobValue.getMonth() + 1).padStart(2, '0');
                    const year = dobValue.getFullYear();
                    dobString = `${day}/${month}/${year}`;
                } else {
                    dobString = String(dobValue || '').trim();
                }

                // Photo resolution
                let photoRaw = '';
                if (hasCustomHeader && headerMap.photo !== undefined) {
                    photoRaw = String(row[headerMap.photo] || '').trim();
                } else if (is12ColFormat) {
                    photoRaw = String(row[11] || '').trim();
                } else {
                    photoRaw = String(row[10] || '').trim();
                }

                if (photoRaw.length > 200 && !photoRaw.startsWith('data:') && !photoRaw.startsWith('http')) {
                    photoRaw = `data:image/jpeg;base64,${photoRaw}`;
                }

                // Participation type resolution
                let participationType = '';
                if (hasCustomHeader && headerMap.participationType !== undefined) {
                    participationType = String(row[headerMap.participationType] || '').trim();
                } else if (is12ColFormat) {
                    participationType = String(row[8] || '').trim();
                } else {
                    participationType = 'فردي';
                }

                const provinceVal = hasCustomHeader && headerMap.province !== undefined 
                    ? String(row[headerMap.province] || '').trim() 
                    : (is12ColFormat ? String(row[9] || '').trim() : String(row[8] || '').trim());

                const academyVal = hasCustomHeader && headerMap.academy !== undefined 
                    ? String(row[headerMap.academy] || '').trim() 
                    : (is12ColFormat ? String(row[10] || '').trim() : String(row[9] || '').trim());

                return {
                    bibNumber: String(getVal('bibNumber', 0) || '').trim(),
                    name: String(getVal('name', 1) || '').trim(),
                    trackId: String(getVal('trackId', 2) || '').trim(),
                    dob: dobString,
                    institution: String(getVal('institution', 4) || '').trim(),
                    coach: String(getVal('coach', 5) || '').trim(),
                    category: String(getVal('category', 6) || '').trim(),
                    gender: String(getVal('gender', 7) || '').trim(),
                    participationType: participationType || 'فردي',
                    province: provinceVal,
                    academy: academyVal,
                    photo: photoRaw || undefined,
                };
            }).filter((r: Runner) => r.bibNumber && r.name);

            if (runners.length === 0) {
                throw new Error("لم يتم العثور على بيانات صالحة في الملف.");
            }

            // Sync with Firebase in the background
            batchSyncRunnersToFirestore(runners)
                .then(count => {
                    console.log(`Synced ${count} runners to Firebase Firestore`);
                })
                .catch(err => {
                    console.error("Firebase sync error:", err);
                });

            onRunnersLoaded(runners);
        } catch (err: any) {
            console.error("Error reading file:", err);
            setError(err.message || "حدث خطأ أثناء قراءة الملف. تأكد من أن الملف بصيغة Excel الصحيحة.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-center p-8 md:p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in-up relative">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">الخطوة 1: تحميل قاعدة البيانات</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">قم برفع ملف Excel أو استرجاع المتسابقين مباشرة من سحابة Firebase</p>
            
            <div className="max-w-xl mx-auto space-y-6">
                {/* Cloud Firebase Option */}
                <div className="bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">سحابة Firebase ({FIREBASE_PROJECT_ID})</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تحميل المتسابقين المحفوظين مسبقاً في السحابة دون الحاجة لملف Excel</p>
                    </div>
                    <button
                        onClick={handleLoadFromFirebase}
                        disabled={isCloudLoading || isLoading}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-amber-200 dark:shadow-none text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isCloudLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <span>جاري الجلب...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                <span>استرجاع من Firebase</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Excel File Upload Option */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 transition-all">
                        
                        <div className="flex justify-end mb-6">
                            <button 
                                onClick={exportTemplateToExcel} 
                                className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg transition-colors"
                            >
                                تحميل نموذج فارغ Excel
                                <DownloadIcon />
                            </button>
                        </div>

                        <div className="mb-8 flex justify-center">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                <svg className="w-20 h-20 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                        </div>
                        
                        <label htmlFor="file-upload" className={`block w-full py-6 px-6 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block mb-2">{isLoading ? 'جاري معالجة الملف والمزامنة...' : 'اضغط هنا لاختيار ملف Excel'}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">يدعم ملفات .xlsx و .xls (سيتم حفظها وتحديثها في Firebase)</span>
                            <input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isLoading} className="hidden" />
                        </label>

                        {syncMessage && (
                            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                {syncMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 rounded-xl">
                                <p className="text-rose-600 dark:text-rose-400 font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

