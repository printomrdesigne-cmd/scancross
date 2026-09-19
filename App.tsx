import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { StepTracker } from './components/StepTracker';
import { FileUploadStep } from './components/FileUploadStep';
import { RaceConfigStep } from './components/RaceConfigStep';
import { ScanningStep } from './components/ScanningStep';
import { ResultsStep } from './components/ResultsStep';
import { SavedRacesView } from './components/SavedRacesView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { AppState } from './constants';
import { Runner, RaceResult, SavedRace, ScanResult } from './types';
import { calculateTeamResults } from './utils/resultCalculators';
import {
    auth,
    fetchRunnersFromFirestore,
    saveSingleRunnerToFirestore,
    deleteSingleRunnerFromFirestore,
    batchSyncRunnersToFirestore,
    saveRaceToFirestore
} from './services/firebase';

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzIiKAKzc-SGhFXlxzbeX_GSmGM7kxvIkmCrdzR2We9ffJn8XjTrGLzmrl_A9KhRFflDw/exec";

export const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => {
        const u = auth.currentUser;
        return (u && !u.isAnonymous) ? u : null;
    });
    const [authChecking, setAuthChecking] = useState(true);

    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    const [previousAppState, setPreviousAppState] = useState<AppState>(AppState.CONFIG);
    const [runners, setRunners] = useState<Runner[]>([]);
    const [raceConfig, setRaceConfig] = useState<{ distance: string; category: string; gender: string; raceName?: string }>({ 
        distance: '', 
        category: '', 
        gender: '' 
    });
    const [finishedRunners, setFinishedRunners] = useState<RaceResult[]>([]);
    const [photos, setPhotos] = useState<{ [bib: string]: string }>({});
    
    // Loaded Race metadata (when viewing/editing an archived race)
    const [savedRaceId, setSavedRaceId] = useState<string | null>(null);
    const [savedRaceDate, setSavedRaceDate] = useState<string | null>(null);
    const [savedRacesCount, setSavedRacesCount] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('savedRaces');
            return saved ? JSON.parse(saved).length : 0;
        } catch {
            return 0;
        }
    });

    // Settings State
    const [scriptUrl, setScriptUrl] = useState(() => localStorage.getItem('SCRIPT_URL') || DEFAULT_SCRIPT_URL);
    const [sheetId, setSheetId] = useState(() => localStorage.getItem('SHEET_ID') || '');

    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

    const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
            setAuthChecking(false);
        });
        return () => unsubscribe();
    }, []);

    // Initial Load
    useEffect(() => {
        const savedDb = localStorage.getItem('runnersDb');
        if (savedDb) {
            setRunners(JSON.parse(savedDb));
        } else {
            // Attempt to load existing runners from Firebase cloud
            fetchRunnersFromFirestore()
                .then(cloudRunners => {
                    if (cloudRunners.length > 0) {
                        setRunners(cloudRunners);
                        localStorage.setItem('runnersDb', JSON.stringify(cloudRunners));
                    }
                })
                .catch(err => console.error('Initial Firebase load error:', err));
        }
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSettingsSaved = (newUrl: string, newSheetId: string) => {
        setScriptUrl(newUrl);
        setSheetId(newSheetId);
        localStorage.setItem('SCRIPT_URL', newUrl);
        localStorage.setItem('SHEET_ID', newSheetId);
        showToast('تم حفظ الإعدادات بنجاح');
    };

    // Helper to update just the sheet ID from the config step
    const handleSheetIdUpdate = (newSheetId: string) => {
        setSheetId(newSheetId);
        localStorage.setItem('SHEET_ID', newSheetId);
        showToast('تم حفظ معرف الشيت');
    };

    const sendActionToScript = async (payload: any) => {
        if (!scriptUrl) return;
        const currentSheetName = localStorage.getItem('CURRENT_RACE_NAME') || `${raceConfig.category} - ${raceConfig.gender}`;
        
        const payloadWithConfig = { 
            sheetName: currentSheetName, 
            spreadsheetId: sheetId,
            ...payload 
        };

        try {
            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadWithConfig),
            });
        } catch (error) {
            console.error("Script Action Error:", error);
        }
    };

    const handleRunnersLoaded = (loadedRunners: Runner[]) => {
        setRunners(loadedRunners);
        localStorage.setItem('runnersDb', JSON.stringify(loadedRunners));
        
        // Sync to Firebase in background
        batchSyncRunnersToFirestore(loadedRunners)
            .then(count => {
                if (count > 0) {
                    showToast(`تم حفظ وتحديث ${count} متسابق في سحابة Firebase بنجاح`);
                }
            })
            .catch(err => console.error('Firebase batch sync error:', err));

        setAppState(AppState.CONFIG);
    };

    // Runner DB Handlers with Firebase Sync
    const handleAddRunnerDb = (newRunner: Runner): boolean => {
        if (runners.some(r => r.bibNumber === newRunner.bibNumber)) {
            showToast('رقم الصدرية موجود مسبقاً', 'error');
            return false;
        }
        const updated = [...runners, newRunner];
        setRunners(updated);
        localStorage.setItem('runnersDb', JSON.stringify(updated));
        
        saveSingleRunnerToFirestore(newRunner).catch(err => console.error('Firebase save error:', err));
        showToast('تمت إضافة المتسابق إلى قاعدة البيانات');
        return true;
    };

    const handleUpdateRunnerDb = (bibNumber: string, updatedData: Partial<Runner>) => {
        let updatedRunner: Runner | null = null;
        const updated = runners.map(r => {
            if (r.bibNumber === bibNumber) {
                updatedRunner = { ...r, ...updatedData };
                return updatedRunner;
            }
            return r;
        });
        setRunners(updated);
        localStorage.setItem('runnersDb', JSON.stringify(updated));

        if (updatedRunner) {
            saveSingleRunnerToFirestore(updatedRunner).catch(err => console.error('Firebase update error:', err));
        }
        showToast('تم تحديث بيانات المتسابق');
    };

    const handleDeleteRunnerDb = (bibNumber: string) => {
        const updated = runners.filter(r => r.bibNumber !== bibNumber);
        setRunners(updated);
        localStorage.setItem('runnersDb', JSON.stringify(updated));
        
        deleteSingleRunnerFromFirestore(bibNumber).catch(err => console.error('Firebase delete error:', err));
        showToast('تم حذف المتسابق من قاعدة البيانات');
    };

    const handleRaceConfigured = (distance: string, category: string, gender: string) => {
        setSavedRaceId(null);
        setSavedRaceDate(null);
        setRaceConfig({ distance, category, gender });
        setFinishedRunners([]);
        setPhotos({});
        setAppState(AppState.SCANNING);
    };

    const handleRunnerScanned = (scannedBib: string): ScanResult => {
        const cleanBib = scannedBib.trim();
        
        if (finishedRunners.some(r => r.bibNumber === cleanBib)) {
            return { success: false, error: 'ALREADY_SCANNED' };
        }

        const runner = runners.find(r => r.bibNumber === cleanBib);
        if (!runner) {
            return { success: false, error: 'NOT_FOUND' };
        }

        if (runner.category !== raceConfig.category || runner.gender !== raceConfig.gender) {
            return { success: false, error: 'WRONG_RACE' };
        }

        const newResult: RaceResult = {
            ...runner,
            rank: finishedRunners.length + 1
        };

        setFinishedRunners(prev => [...prev, newResult]);

        // Background sync to Google Sheet
        sendActionToScript({
            action: 'record',
            rank: newResult.rank,
            bibNumber: newResult.bibNumber,
            name: newResult.name,
            institution: newResult.institution,
            province: newResult.province,
            regionalAcademy: newResult.academy,
            coach: newResult.coach,
            photo: newResult.photo || ''
        });

        return { success: true, data: newResult };
    };

    // Update runner result (rank adjustment, info changes)
    const handleUpdateRunnerResult = (bibNumber: string, data: Partial<RaceResult>) => {
        setFinishedRunners(prev => {
            const currentRunner = prev.find(r => r.bibNumber === bibNumber);
            if (!currentRunner) return prev;
            
            // If rank was modified, intelligently shift other runners
            if (data.rank !== undefined && data.rank !== currentRunner.rank) {
                const targetRank = Math.max(1, Math.min(prev.length, data.rank));
                const oldRank = currentRunner.rank;
                
                return prev.map(r => {
                    if (r.bibNumber === bibNumber) {
                        return { ...r, ...data, rank: targetRank };
                    }
                    if (oldRank < targetRank) {
                        // Moved down: runners between oldRank and targetRank shift up (-1)
                        if (r.rank > oldRank && r.rank <= targetRank) {
                            return { ...r, rank: r.rank - 1 };
                        }
                    } else {
                        // Moved up: runners between targetRank and oldRank shift down (+1)
                        if (r.rank >= targetRank && r.rank < oldRank) {
                            return { ...r, rank: r.rank + 1 };
                        }
                    }
                    return r;
                }).sort((a, b) => a.rank - b.rank);
            }

            return prev.map(r => r.bibNumber === bibNumber ? { ...r, ...data } : r);
        });

        sendActionToScript({ action: 'update', bibNumber: String(bibNumber), ...data }).catch(() => {});
        showToast('تم تحديث نتيجة المتسابق بنجاح');
    };

    // Quick Move Up / Down
    const handleMoveRunnerRank = (bibNumber: string, delta: -1 | 1) => {
        setFinishedRunners(prev => {
            const sorted = [...prev].sort((a, b) => a.rank - b.rank);
            const index = sorted.findIndex(r => r.bibNumber === bibNumber);
            if (index === -1) return prev;
            const targetIndex = index + delta;
            if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
            
            const currentRunner = sorted[index];
            const targetRunner = sorted[targetIndex];
            
            const currentRank = currentRunner.rank;
            const targetRank = targetRunner.rank;
            
            return sorted.map(r => {
                if (r.bibNumber === currentRunner.bibNumber) return { ...r, rank: targetRank };
                if (r.bibNumber === targetRunner.bibNumber) return { ...r, rank: currentRank };
                return r;
            }).sort((a, b) => a.rank - b.rank);
        });
        showToast('تم تعديل الترتيب');
    };

    // Add runner directly to results
    const handleAddRunnerToResults = (newRunner: RaceResult) => {
        setFinishedRunners(prev => {
            const targetRank = Math.max(1, Math.min(prev.length + 1, newRunner.rank));
            const shifted = prev.map(r => {
                if (r.rank >= targetRank) {
                    return { ...r, rank: r.rank + 1 };
                }
                return r;
            });
            const completeRunner = { ...newRunner, rank: targetRank };
            return [...shifted, completeRunner].sort((a, b) => a.rank - b.rank);
        });
        showToast(`تمت إضافة العداء ${newRunner.name} بالرتبة ${newRunner.rank}`);
    };

    const handleDeleteRunnerResult = async (bibNumber: string) => {
        const bibStr = String(bibNumber);
        const filtered = finishedRunners.filter(r => String(r.bibNumber) !== bibStr);
        
        if (filtered.length === finishedRunners.length) {
             showToast('لم يتم العثور على المتسابق للحذف', 'error');
             return;
        }

        const reRanked = filtered
            .sort((a, b) => a.rank - b.rank)
            .map((r, i) => ({ ...r, rank: i + 1 }));
        setFinishedRunners(reRanked);
        
        showToast('تم حذف العداء وإعادة ترتيب باقي النتائج', 'success');

        const currentSheetName = localStorage.getItem('CURRENT_RACE_NAME') || `${raceConfig.category} - ${raceConfig.gender}`;
        sendActionToScript({ action: 'delete', bibNumber: bibStr, sheetName: currentSheetName }).catch(() => {});
        
        await delay(2000); 
        sendActionToScript({ action: 'reRankAndValidate', sheetName: currentSheetName }).catch(() => {});
    };

    const handlePhotoAdded = (bibNumber: string, dataUrl: string) => {
        setPhotos(prev => ({ ...prev, [bibNumber]: dataUrl }));
        sendActionToScript({ action: 'update', bibNumber: String(bibNumber), photo: dataUrl }).catch(() => {});
        showToast('تم حفظ الصورة بنجاح');
    };

    const teamResults = calculateTeamResults(finishedRunners);

    const handleSaveRace = async () => {
        const raceId = savedRaceId || new Date().toISOString();
        const raceName = raceConfig.raceName || localStorage.getItem('CURRENT_RACE_NAME') || `سباق ${raceConfig.category} (${raceConfig.gender})`;
        const raceDate = savedRaceDate || new Date().toLocaleDateString('ar-MA');

        const raceToSave: SavedRace = {
            id: raceId,
            date: raceDate,
            config: { ...raceConfig, raceName },
            individualResults: finishedRunners,
            teamResults: teamResults,
            photos: photos
        };

        // Save / Update locally
        const saved: SavedRace[] = JSON.parse(localStorage.getItem('savedRaces') || '[]');
        const existingIndex = saved.findIndex(r => r.id === raceId);
        let updatedSaved: SavedRace[];
        if (existingIndex >= 0) {
            updatedSaved = saved.map(r => r.id === raceId ? raceToSave : r);
        } else {
            updatedSaved = [raceToSave, ...saved];
        }
        localStorage.setItem('savedRaces', JSON.stringify(updatedSaved));
        setSavedRacesCount(updatedSaved.length);
        setSavedRaceId(raceId);
        setSavedRaceDate(raceDate);

        try {
            await saveRaceToFirestore(raceToSave);
            showToast('تم حفظ وتحديث نتائج السباق في الأرشيف وسحابة Firebase بنجاح', 'success');
        } catch (error) {
            console.error('Firebase save race error:', error);
            showToast('تم حفظ السباق محلياً (حدث خطأ في مزامنة السحابة)', 'error');
        }
    };

    const handleFinalValidation = async () => {
         const currentSheetName = localStorage.getItem('CURRENT_RACE_NAME') || `${raceConfig.category} - ${raceConfig.gender}`;
         await sendActionToScript({ action: 'reRankAndValidate', sheetName: currentSheetName });
         showToast('تمت المصادقة النهائية وإعادة الترتيب');
    };

    const handleLoadRace = (race: SavedRace, editMode = false) => {
        setSavedRaceId(race.id);
        setSavedRaceDate(race.date);
        setRaceConfig({ 
            distance: race.config.distance, 
            category: race.config.category, 
            gender: race.config.gender,
            raceName: race.config.raceName 
        });
        setFinishedRunners(race.individualResults || []);
        setPhotos(race.photos || {});
        setAppState(AppState.RESULTS);
        if (editMode) {
            showToast('تم تحميل السباق في وضع التعديل، يمكنك تعديل الرتب والعدائين وحفظها', 'success');
        } else {
            showToast('تم تحميل نتائج السباق بنجاح', 'success');
        }
    };

    const handleOpenSavedRaces = () => {
        if (appState !== AppState.SAVED_RACES) {
            setPreviousAppState(appState);
            setAppState(AppState.SAVED_RACES);
        } else {
            setAppState(previousAppState);
        }
    };

    const handleCloseSavedRaces = () => {
        setAppState(previousAppState);
    };

    const handleNewRace = () => {
        setSavedRaceId(null);
        setSavedRaceDate(null);
        setFinishedRunners([]);
        setPhotos({});
        setAppState(AppState.CONFIG);
    };

    return (
        <div className="min-h-screen pb-12 flex flex-col font-sans" dir="rtl">
            <div className="container mx-auto px-4 pt-6 flex-grow">
                <Header 
                    onOpenSavedRaces={handleOpenSavedRaces}
                    savedRacesCount={savedRacesCount}
                    isInSavedRaces={appState === AppState.SAVED_RACES}
                    onOpenAuthModal={handleOpenAuth}
                    onToast={showToast}
                />
                
                <div className="max-w-5xl mx-auto mt-6">
                    {/* Compulsory Authentication Gate */}
                    {authChecking ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">جاري التحقق من الحساب...</p>
                        </div>
                    ) : !currentUser ? (
                        <AuthGate onAuthSuccess={(msg) => showToast(msg, 'success')} />
                    ) : (
                        <>
                            {appState !== AppState.UPLOAD && appState !== AppState.SAVED_RACES && (
                                <StepTracker 
                                    currentStep={appState === AppState.CONFIG ? 2 : appState === AppState.SCANNING ? 3 : 4} 
                                    onStepClick={(s) => {
                                        if (s === 1) setAppState(AppState.UPLOAD);
                                        if (s === 2) setAppState(AppState.CONFIG);
                                        if (s === 3 && finishedRunners.length > 0) setAppState(AppState.SCANNING);
                                        if (s === 4 && finishedRunners.length > 0) setAppState(AppState.RESULTS);
                                    }}
                                />
                            )}
                            
                            <div className="mt-6">
                                {appState === AppState.UPLOAD && (
                                    <FileUploadStep 
                                        onRunnersLoaded={handleRunnersLoaded} 
                                        onSettingsSaved={handleSettingsSaved}
                                    />
                                )}
                                
                                {appState === AppState.CONFIG && (
                                    <RaceConfigStep 
                                        runners={runners} 
                                        onRaceConfigured={handleRaceConfigured}
                                        onViewSavedRaces={handleOpenSavedRaces}
                                        onAddRunner={handleAddRunnerDb}
                                        onUpdateRunnerInDb={handleUpdateRunnerDb}
                                        onDeleteRunnerFromDb={handleDeleteRunnerDb}
                                        onManageSheets={() => sendActionToScript({ action: 'getSheets' })}
                                        onShowScriptHelp={() => {}} 
                                        scriptUrl={scriptUrl}
                                        onScriptUrlChange={setScriptUrl}
                                        sheetId={sheetId}
                                        onSheetIdUpdate={handleSheetIdUpdate}
                                    />
                                )}

                                {appState === AppState.SCANNING && (
                                    <ScanningStep 
                                        onRunnerScanned={handleRunnerScanned}
                                        finishedRunners={finishedRunners}
                                        teamResults={teamResults}
                                        onFinishScanning={() => setAppState(AppState.RESULTS)}
                                        photos={photos}
                                        onPhotoAdded={handlePhotoAdded}
                                        onUpdateRunner={handleUpdateRunnerResult}
                                        onDeleteRunner={handleDeleteRunnerResult}
                                    />
                                )}

                                {appState === AppState.RESULTS && (
                                    <ResultsStep 
                                        raceConfig={raceConfig}
                                        individualResults={finishedRunners}
                                        teamResults={teamResults}
                                        photos={photos}
                                        onNewRace={handleNewRace}
                                        onPhotoAdded={handlePhotoAdded}
                                        onUpdateRunner={handleUpdateRunnerResult}
                                        onMoveRunnerRank={handleMoveRunnerRank}
                                        onDeleteRunner={handleDeleteRunnerResult}
                                        onAddRunnerToResults={handleAddRunnerToResults}
                                        onSaveRace={handleSaveRace}
                                        addToast={showToast}
                                        onFinalValidation={handleFinalValidation}
                                        setIsLoading={setIsLoading}
                                        savedRaceId={savedRaceId}
                                        isArchiveView={!!savedRaceId}
                                        onBackToSavedRaces={handleOpenSavedRaces}
                                        availableRunners={runners}
                                    />
                                )}

                                {appState === AppState.SAVED_RACES && (
                                    <SavedRacesView 
                                        onClose={handleCloseSavedRaces} 
                                        onLoadRace={handleLoadRace} 
                                        onShowToast={showToast}
                                        onRacesCountChange={setSavedRacesCount}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {toast && (
                <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 text-white font-bold animate-toast-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {toast.msg}
                </div>
            )}
            
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl flex flex-col items-center shadow-2xl">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 font-bold text-slate-700 dark:text-slate-200">جاري المعالجة والتصدير...</p>
                    </div>
                </div>
            )}

            <OfflineIndicator />

            <AuthModal
                isOpen={isAuthModalOpen}
                initialMode={authModalMode}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(msg) => showToast(msg, 'success')}
            />
        </div>
    );
};
