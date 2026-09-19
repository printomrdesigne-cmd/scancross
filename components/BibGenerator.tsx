
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Runner } from '../types';

interface BibGeneratorProps {
    runners: Runner[];
    onClose: () => void;
}

const BibIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const BibGenerator: React.FC<BibGeneratorProps> = ({ runners, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedGender, setSelectedGender] = useState<string>('All');
    const [bibColor, setBibColor] = useState<string>('#ffffff'); // Default to white
    const containerRef = useRef<HTMLDivElement>(null);

    const categories = useMemo(() => {
        const cats = new Set(runners.map(r => r.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [runners]);

    const genders = useMemo(() => {
        const relevantRunners = runners.filter(r => selectedCategory === 'All' || r.category === selectedCategory);
        const genderSet = new Set(relevantRunners.map(r => r.gender).filter(Boolean));
        return Array.from(genderSet).sort();
    }, [runners, selectedCategory]);

    useEffect(() => {
        if (selectedGender !== 'All' && !genders.includes(selectedGender)) {
            setSelectedGender('All');
        }
    }, [genders, selectedGender]);

    const filteredRunners = useMemo(() => {
        return runners.filter(r => {
            const categoryMatch = selectedCategory === 'All' || r.category === selectedCategory;
            const genderMatch = selectedGender === 'All' || r.gender === selectedGender;
            return r.bibNumber && categoryMatch && genderMatch;
        });
    }, [runners, selectedCategory, selectedGender]);

    const generatePDF = async () => {
        setIsGenerating(true);
        setProgress(0);
        
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        if (!jsPDF || !html2canvas) {
            alert("مكتبات PDF غير متوفرة. يرجى تحديث الصفحة.");
            setIsGenerating(false);
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const bibElements = document.querySelectorAll('.bib-card-container');
        
        try {
            for (let i = 0; i < bibElements.length; i++) {
                const element = bibElements[i] as HTMLElement;
                
                element.style.display = 'block';
                
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                
                const imgWidth = 210; 
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0 && i % 2 === 0) {
                    doc.addPage();
                }

                const yPos = (i % 2 === 0) ? 0 : 148.5;
                
                doc.addImage(imgData, 'JPEG', 0, yPos, imgWidth, imgHeight);
                
                element.style.display = 'none';
                
                setProgress(Math.round(((i + 1) / bibElements.length) * 100));
                
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            const timestamp = new Date().getTime();
            const filenameCategory = selectedCategory === 'All' ? 'AllCat' : selectedCategory.replace(/[^a-z0-9]/gi, '_');
            const filenameGender = selectedGender === 'All' ? 'AllGen' : selectedGender.replace(/[^a-z0-9أ-ي]/gi, '_');
            doc.save(`Bibs_${filenameCategory}_${filenameGender}_${timestamp}.pdf`);
            onClose();

        } catch (error) {
            console.error("Error generating bibs:", error);
            alert("حدث خطأ أثناء إنشاء ملف PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!isGenerating) {
            filteredRunners.forEach(runner => {
                const qrContainer = document.getElementById(`qr-${runner.bibNumber}`);
                if (qrContainer && qrContainer.innerHTML === '') {
                    try {
                        new (window as any).QRCode(qrContainer, {
                            text: runner.bibNumber,
                            width: 256, // Reduced by 8px for padding (4px each side)
                            height: 248, // Reduced by 8px for padding
                            colorDark : "#000000",
                            colorLight : "#ffffff",
                            correctLevel : (window as any).QRCode.CorrectLevel.H
                        });
                    } catch (e) {
                        console.error("QR Gen Error", e);
                    }
                }
            });
        }
    }, [filteredRunners, isGenerating]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[80] p-4 overflow-hidden">
            <style>{`
                .qr-code-wrapper img, .qr-code-wrapper canvas {
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                    object-fit: fill !important;
                }
            `}</style>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-5xl flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <BibIcon />
                        إنشاء الصدريات (PDF)
                    </h3>
                    <button onClick={onClose} disabled={isGenerating} className="text-gray-500 hover:text-red-500 text-3xl">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">تصفية حسب الفئة</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white font-semibold"
                            disabled={isGenerating}
                        >
                            <option value="All">جميع الفئات ({runners.length})</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat} ({runners.filter(r => r.category === cat).length})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">تصفية حسب الجنس</label>
                        <select 
                            value={selectedGender} 
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white font-semibold"
                            disabled={isGenerating}
                        >
                            <option value="All">جميع الأجناس ({runners.filter(r => selectedCategory === 'All' || r.category === selectedCategory).length})</option>
                            {genders.map(g => (
                                <option key={g} value={g}>{g} ({runners.filter(r => (selectedCategory === 'All' || r.category === selectedCategory) && r.gender === g).length})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">لون الصدرية</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={bibColor} 
                                onChange={(e) => setBibColor(e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                disabled={isGenerating}
                            />
                            <span className="text-sm font-mono text-gray-500">{bibColor}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        سيتم إنشاء ملف PDF لـ <span className="font-bold text-indigo-600">{filteredRunners.length}</span> متسابق.
                    </p>
                    
                    {isGenerating ? (
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-2 max-w-lg mx-auto">
                            <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            <p className="mt-2 font-bold text-blue-600">{progress}%</p>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={generatePDF}
                                disabled={filteredRunners.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                تحميل الصدريات
                            </button>
                            <button 
                                onClick={onClose}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                            >
                                إلغاء
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-auto bg-gray-200 p-4 rounded border flex-grow" style={{ opacity: isGenerating ? 0.5 : 1 }}>
                    <p className="text-center text-sm text-gray-500 mb-2 sticky top-0 bg-gray-200 py-1 z-10">معاينة مباشرة</p>
                    <div ref={containerRef} className="flex flex-wrap justify-center gap-4">
                        {filteredRunners.map(runner => (
                            <div 
                                key={runner.bibNumber} 
                                id={`bib-${runner.bibNumber}`}
                                className="bib-card-container bg-white border-[6px] border-black box-border relative"
                                style={{ 
                                    width: '794px',
                                    height: '561px',
                                    display: isGenerating ? 'none' : 'block',
                                    fontFamily: 'Cairo, sans-serif',
                                    direction: 'rtl'
                                }}
                            >
                                <div className="flex border-b-[6px] border-black" style={{ height: '256px', backgroundColor: bibColor }}>
                                    
                                    <div className="border-l-[6px] border-black flex flex-col" style={{ width: '265px' }}>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1 overflow-hidden" style={{ height: '64px' }}>
                                            <span className="text-lg font-black text-black text-center leading-tight break-words">{runner.name}</span>
                                        </div>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1" style={{ height: '64px' }}>
                                            <span className="text-2xl font-black text-black">{runner.trackId}</span>
                                        </div>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1 overflow-hidden" style={{ height: '64px' }}>
                                            <span className="text-base font-black text-black text-center leading-tight break-words">{runner.institution}</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center px-1 overflow-hidden" style={{ height: '64px' }}>
                                            <span className="text-base font-black text-black text-center leading-tight break-words">{runner.province}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center bg-white" style={{ width: '264px', height: '256px', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', margin: 0 }}>
                                        <div id={`qr-${runner.bibNumber}`} className="qr-code-wrapper" style={{ display: 'block', width: '100%', height: '100%', margin: 0, padding: 0 }}></div>
                                    </div>

                                    <div className="border-r-[6px] border-black flex flex-col" style={{ width: '265px' }}>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1 overflow-hidden" style={{ height: '64px' }}>
                                            <span className="text-lg font-black text-black text-center leading-tight">{runner.category}</span>
                                        </div>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1" style={{ height: '64px' }}>
                                            <span className="text-xl font-black text-black">{runner.dob}</span>
                                        </div>
                                        <div className="flex-1 border-b-[3px] border-black flex items-center justify-center px-1" style={{ height: '64px' }}>
                                            <span className="text-xl font-black text-black">{runner.gender}</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center px-1 overflow-hidden" style={{ height: '64px' }}>
                                            <span className="text-base font-black text-black text-center leading-tight break-words">{runner.coach}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center" style={{ height: '305px', backgroundColor: bibColor }}>
                                    <span className="text-[200px] font-black leading-none tracking-tighter text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {runner.bibNumber}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
