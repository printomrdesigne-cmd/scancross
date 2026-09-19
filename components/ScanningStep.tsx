
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RaceResult, TeamResult, ScanResult } from '../types';
import AddPhotoModal from './AddPhotosStep';
import { TeamPodium } from './TeamPodium';
import { IndividualPodium } from './IndividualPodium';

interface ScanningStepProps {
    onRunnerScanned: (bibNumber: string) => ScanResult;
    finishedRunners: RaceResult[];
    teamResults: TeamResult[];
    onFinishScanning: () => void;
    photos: { [bibNumber: string]: string };
    onPhotoAdded: (bibNumber: string, dataUrl: string) => void;
    onUpdateRunner: (bibNumber: string, updatedData: Partial<RaceResult>) => void;
    onDeleteRunner: (bibNumber: string) => void;
}

const ScanSuccessIcon = () => <svg className="w-20 h-20 text-emerald-400 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ScanErrorIcon = () => <svg className="w-20 h-20 text-rose-400 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const CameraErrorIcon = () => <svg className="w-16 h-16 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

const EditRunnerModal: React.FC<{ runner: RaceResult; onClose: () => void; onSave: (bib: string, data: Partial<RaceResult>) => void; }> = ({ runner, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: runner.name, institution: runner.institution, rank: runner.rank });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.name === 'rank' ? parseInt(e.target.value) || 0 : e.target.value; setFormData({ ...formData, [e.target.name]: val }); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(runner.bibNumber, formData); onClose(); };

    return (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg text-right">
                <h3 className="text-xl font-bold mb-4 text-center text-slate-800 dark:text-white">تعديل بيانات المتسابق</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {['rank', 'name', 'institution'].map(f => (
                        <div key={f}><label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{f==='rank'?'الترتيب':f==='name'?'الاسم':'المؤسسة'}</label>
                        <input type={f==='rank'?'number':'text'} name={f} value={(formData as any)[f]} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"/></div>
                    ))}
                    <div className="flex justify-center gap-3 pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all">حفظ</button>
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-8 rounded-xl transition-all">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ScanningStep: React.FC<ScanningStepProps> = ({ onRunnerScanned, finishedRunners, teamResults, onFinishScanning, photos, onPhotoAdded, onUpdateRunner, onDeleteRunner }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [manualBib, setManualBib] = useState('');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [activeTab, setActiveTab] = useState<'individual' | 'individual_podium' | 'teams'>('individual');
    const [photoCandidate, setPhotoCandidate] = useState<RaceResult | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const isProcessingScan = useRef(false);
    const [lastScannedRunner, setLastScannedRunner] = useState<RaceResult | null>(null);
    const [editingRunner, setEditingRunner] = useState<RaceResult | null>(null);
    const [runnerToDelete, setRunnerToDelete] = useState<string | null>(null);

    const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
        setScanResult({ type, message });
        if (navigator.vibrate) navigator.vibrate(type === 'success' ? 100 : [200, 50, 200]);
        setTimeout(() => setScanResult(null), 2000);
    }, []);

    const handleRegistration = useCallback((bibNumber: string) => {
        const result = onRunnerScanned(bibNumber);
        if (result.success === false) {
            let errorMessage = 'خطأ غير معروف.';
            switch (result.error) {
                case 'ALREADY_SCANNED':
                    errorMessage = `المتسابق رقم ${bibNumber} مسجل بالفعل.`;
                    break;
                case 'NOT_FOUND':
                    errorMessage = `المتسابق رقم ${bibNumber} غير موجود.`;
                    break;
                case 'WRONG_RACE':
                    errorMessage = `المتسابق لا ينتمي لهذا السباق (الفئة/الجنس).`;
                    break;
            }
            showFeedback('error', errorMessage);
        } else {
            setLastScannedRunner(result.data);
            showFeedback('success', `تم تسجيل المتسابق رقم ${bibNumber} بنجاح!`);
        }
        setTimeout(() => { isProcessingScan.current = false; }, 2000);
    }, [onRunnerScanned, showFeedback]);

    const handleManualBibChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const bib = e.target.value;
        if (/^\d*$/.test(bib)) {
            setManualBib(bib);
            // Auto-submit only if 4 digits are entered
            if (bib.length === 4) {
                if (!isProcessingScan.current) {
                    isProcessingScan.current = true;
                    handleRegistration(bib);
                    setTimeout(() => setManualBib(''), 250);
                }
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (manualBib.length > 0 && !isProcessingScan.current) {
                isProcessingScan.current = true;
                handleRegistration(manualBib);
                setManualBib('');
            }
        }
    };

    const handleStartCamera = async () => {
        setCameraError(null);
        setIsCameraActive(true);
    };

    const tick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                if (code && code.data) {
                    if (!isProcessingScan.current) {
                        isProcessingScan.current = true;
                        handleRegistration(code.data);
                    }
                }
            }
        }
       animationFrameId.current = requestAnimationFrame(tick);
    }, [handleRegistration]);
    
    useEffect(() => {
        let stream: MediaStream | null = null;
        const startScan = async () => {
             if (!isCameraActive) return;
             if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError("هذا المتصفح لا يدعم الوصول إلى الكاميرا.");
                return;
            }
            try {
                 stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                    animationFrameId.current = requestAnimationFrame(tick);
                }
            } catch (err: any) {
                console.error("Error accessing camera:", err);
                setCameraError('لا يمكن الوصول إلى الكاميرا.');
            }
        };
        startScan();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isCameraActive, tick]);
    
    const handleSaveEdit = (bibNumber: string, data: Partial<RaceResult>) => {
        onUpdateRunner(bibNumber, data);
        setEditingRunner(null);
    };

    const confirmDelete = () => {
        if (runnerToDelete) {
            onDeleteRunner(runnerToDelete);
            setRunnerToDelete(null);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 flex flex-col items-center">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6">الخطوة 3: تسجيل النتائج</h2>
                
                <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/30 ring-4 ring-slate-100 dark:ring-slate-700 flex items-center justify-center group">
                    {!isCameraActive ? (
                         <div className="p-6 text-center">
                            {cameraError ? (
                                <div className="text-white">
                                    <CameraErrorIcon />
                                    <p className="mt-4 font-bold">{cameraError}</p>
                                    <button onClick={handleStartCamera} className="mt-6 bg-white text-rose-600 hover:bg-rose-50 font-bold py-3 px-8 rounded-xl transition-colors">إعادة المحاولة</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <button onClick={handleStartCamera} className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg text-lg">
                                        تشغيل الكاميرا
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} className={`w-full h-full object-cover ${cameraError ? 'hidden' : ''}`} muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {cameraError ? (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white bg-slate-800">
                                     <CameraErrorIcon />
                                     <p className="mt-4 font-bold">{cameraError}</p>
                                 </div>
                            ) : (
                                <>
                                    <div className="absolute inset-0 border-[12px] border-slate-900/40 rounded-3xl pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                                    </div>
                                </>
                            )}
                            {scanResult && (
                                <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white font-bold text-xl backdrop-blur-md transition-opacity ${scanResult.type === 'success' ? 'bg-emerald-600/80' : 'bg-rose-600/80'}`}>
                                    {scanResult.type === 'success' ? <ScanSuccessIcon/> : <ScanErrorIcon />}
                                    <p className="mt-4 drop-shadow-md">{scanResult.message}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {lastScannedRunner && (
                    <div className="w-full max-w-sm mt-4 p-3 bg-gradient-to-r from-indigo-700 to-blue-700 rounded-xl shadow-lg border-2 border-white/20 animate-toast-in flex items-center justify-between gap-3 text-white">
                         <div className="flex items-center gap-2">
                             <div className="bg-white/20 rounded-lg p-2 text-center min-w-[3.5rem] flex flex-col justify-center">
                                 <span className="block text-[10px] text-indigo-100 font-bold opacity-75 leading-tight">صدرية</span>
                                 <span className="block text-2xl font-black leading-none font-mono tracking-tighter mt-1">{lastScannedRunner.bibNumber}</span>
                             </div>
                             <div className="bg-white/20 rounded-lg p-2 text-center min-w-[3.5rem] flex flex-col justify-center">
                                 <span className="block text-[10px] text-indigo-100 font-bold opacity-75 leading-tight">ترتيب</span>
                                 <span className="block text-2xl font-black leading-none mt-1">{lastScannedRunner.rank}</span>
                             </div>
                         </div>
                         <div className="flex-grow text-right overflow-hidden">
                             <span className="block text-xl font-bold truncate leading-tight">{lastScannedRunner.name}</span>
                             <span className="block text-xs text-indigo-200 truncate mt-0.5">{lastScannedRunner.institution}</span>
                             <span className="block text-xs text-indigo-300 truncate mt-0.5">{lastScannedRunner.province}</span>
                         </div>
                    </div>
                )}
                
                <div className="w-full max-w-sm mt-4 flex flex-row flex-nowrap items-center gap-2">
                    <input 
                        type="tel" 
                        inputMode="numeric" 
                        pattern="[0-9]*"
                        maxLength={4} 
                        value={manualBib} 
                        onChange={handleManualBibChange}
                        onKeyDown={handleKeyDown}
                        placeholder="رقم (1-4)"
                        className="w-32 px-1 py-3 text-2xl text-center font-mono font-black tracking-widest bg-black text-white border-2 border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-600 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                    />
                    <button 
                        onClick={onFinishScanning} 
                        className="flex-grow py-3 px-2 rounded-xl shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm whitespace-nowrap transition-all"
                    >
                        إنهاء السباق
                    </button>
                </div>
            </div>

            <div className="lg:w-1/2">
                <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex mb-6 gap-1">
                    <button 
                        onClick={() => setActiveTab('individual')} 
                        className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
                            activeTab === 'individual' 
                                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        الأفراد ({finishedRunners.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('individual_podium')} 
                        className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
                            activeTab === 'individual_podium' 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        بوديوم 1•2•3 🥇
                    </button>
                    <button 
                        onClick={() => setActiveTab('teams')} 
                        className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
                            activeTab === 'teams' 
                                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-md' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        بوديوم الفرق ({teamResults.length})
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-100 dark:border-slate-700 h-[500px] overflow-y-auto custom-scrollbar relative">
                    {activeTab === 'individual' ? (
                        finishedRunners.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p className="font-medium text-lg">في انتظار وصول أول متسابق...</p>
                            </div>
                        ) : (
                            <ul className="space-y-3 p-2">
                                {finishedRunners.slice().reverse().map((runner) => {
                                    const isRank1 = runner.rank === 1;
                                    const isRank2 = runner.rank === 2;
                                    const isRank3 = runner.rank === 3;

                                    return (
                                    <li key={runner.bibNumber} className={`p-4 rounded-xl flex items-center justify-between transition-all duration-500 ${
                                        runner.bibNumber === lastScannedRunner?.bibNumber 
                                            ? 'bg-indigo-50 border-2 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 scale-[1.02] shadow-md' 
                                            : isRank1 
                                            ? 'bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                                            : isRank2
                                            ? 'bg-slate-100/70 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                                            : isRank3
                                            ? 'bg-amber-50/40 border border-amber-200/50 dark:bg-amber-950/10 dark:border-amber-900'
                                            : 'bg-slate-50 border border-slate-100 dark:bg-slate-700 dark:border-slate-600'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${
                                                isRank1 
                                                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 ring-2 ring-amber-300' 
                                                    : isRank2
                                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 ring-2 ring-slate-300 dark:ring-slate-600'
                                                    : isRank3
                                                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                                    : 'bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-600 text-indigo-600'
                                            }`}>
                                                {isRank1 ? '1 🥇' : isRank2 ? '2 🥈' : isRank3 ? '3 🥉' : runner.rank}
                                            </div>
                                            
                                            <button onClick={() => setPhotoCandidate(runner)} className="relative group w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 ring-2 ring-transparent hover:ring-indigo-400 transition-all">
                                                {photos[runner.bibNumber] ? (
                                                    <img src={photos[runner.bibNumber]} alt={runner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500"><CameraIcon /></div>
                                                )}
                                            </button>

                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 dark:text-white text-lg">{runner.name}</span>
                                                    {isRank1 && <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full">بطل السباق</span>}
                                                    {isRank2 && <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-full">الوصيف</span>}
                                                    {isRank3 && <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">المرتبة 3</span>}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block self-start shadow-sm border border-slate-100 dark:border-slate-600">{runner.institution}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{runner.province}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <button onClick={() => setEditingRunner(runner)} className="text-indigo-400 hover:text-indigo-600 p-1"><EditIcon /></button>
                                                <button onClick={() => setRunnerToDelete(runner.bibNumber)} className="text-rose-400 hover:text-rose-600 p-1"><DeleteIcon /></button>
                                            </div>
                                            <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-lg tracking-wider">#{runner.bibNumber}</span>
                                        </div>
                                    </li>
                                    );
                                })}
                            </ul>
                        )
                    ) : activeTab === 'individual_podium' ? (
                        <div className="p-1 space-y-2">
                            {finishedRunners.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                    <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <p className="font-medium text-lg">في انتظار وصول المتسابقين لعرض منصة التتويج...</p>
                                </div>
                            ) : (
                                <IndividualPodium
                                    individualResults={finishedRunners}
                                    photos={photos}
                                    onPhotoClick={(runner) => setPhotoCandidate(runner)}
                                    onEditRunner={(runner) => setEditingRunner(runner)}
                                    compact={true}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="p-1 space-y-2">
                            <TeamPodium
                                teamResults={teamResults}
                                individualResults={finishedRunners}
                                photos={photos}
                                compact={true}
                            />
                        </div>
                    )}
                </div>
            </div>
            {photoCandidate && <AddPhotoModal runner={photoCandidate} onClose={() => setPhotoCandidate(null)} onPhotoAdded={onPhotoAdded} />}
            {editingRunner && <EditRunnerModal runner={editingRunner} onClose={() => setEditingRunner(null)} onSave={handleSaveEdit} />}
            
            {runnerToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100 dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">هل أنت متأكد من حذف هذا المتسابق رقم <span className="font-bold text-slate-800 dark:text-slate-200">{runnerToDelete}</span>؟</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-rose-200 dark:shadow-none flex-1">حذف</button>
                            <button onClick={() => setRunnerToDelete(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-colors flex-1">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
