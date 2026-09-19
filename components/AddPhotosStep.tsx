
import React, { useState, useRef } from 'react';
import { RaceResult } from '../types';

const AddPhotoModal: React.FC<{ runner: RaceResult; onClose: () => void; onPhotoAdded: (bibNumber: string, dataUrl: string) => void; }> = ({ runner, onClose, onPhotoAdded }) => {
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    
                    // Attempt 1: Higher Quality (Target 500px instead of 300px)
                    const TARGET_MAX = 500; 
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > TARGET_MAX) {
                            height *= TARGET_MAX / width;
                            width = TARGET_MAX;
                        }
                    } else {
                        if (height > TARGET_MAX) {
                            width *= TARGET_MAX / height;
                            height = TARGET_MAX;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error('Could not get canvas context'));
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Try high quality first (0.85)
                    // Google Sheets Cell Limit is ~50,000 chars.
                    let quality = 0.85;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    // Logic: If string is too long (>49000 chars safety limit), reduce quality, then resize if needed.
                    
                    // Step 1: Reduce Quality
                    if (dataUrl.length > 49000) {
                        quality = 0.6;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                    
                    // Step 2: If still too big, Resize to smaller dimensions (Fallback to original 300px)
                    if (dataUrl.length > 49000) {
                        const fallbackCanvas = document.createElement('canvas');
                        const FALLBACK_MAX = 300;
                        let fbWidth = img.width;
                        let fbHeight = img.height;

                        if (fbWidth > fbHeight) {
                            if (fbWidth > FALLBACK_MAX) {
                                fbHeight *= FALLBACK_MAX / fbWidth;
                                fbWidth = FALLBACK_MAX;
                            }
                        } else {
                            if (fbHeight > FALLBACK_MAX) {
                                fbWidth *= FALLBACK_MAX / fbHeight;
                                fbHeight = FALLBACK_MAX;
                            }
                        }
                        fallbackCanvas.width = fbWidth;
                        fallbackCanvas.height = fbHeight;
                        const fbCtx = fallbackCanvas.getContext('2d');
                        if (fbCtx) {
                            fbCtx.drawImage(img, 0, 0, fbWidth, fbHeight);
                            // Use moderate quality on small image
                            dataUrl = fallbackCanvas.toDataURL('image/jpeg', 0.7);
                            
                            // Last resort compression
                            if (dataUrl.length > 49000) {
                                dataUrl = fallbackCanvas.toDataURL('image/jpeg', 0.5);
                            }
                        }
                    }

                    resolve(dataUrl); 
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        try {
            const file = event.target.files?.[0];
            if (file) {
                const resizedDataUrl = await resizeImage(file);
                onPhotoAdded(runner.bibNumber, resizedDataUrl);
                onClose();
            }
        } catch (e: any) {
            console.error('Error processing image:', e);
            setError('لم نتمكن من معالجة الصورة. يرجى المحاولة مرة أخرى.');
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    
    const openFileDialog = (useCamera: boolean) => {
        if (fileInputRef.current) {
            if (useCamera) {
                fileInputRef.current.setAttribute('capture', 'environment');
            } else {
                fileInputRef.current.removeAttribute('capture');
            }
            fileInputRef.current.click();
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" aria-modal="true" role="dialog">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept="image/*"
                className="hidden"
            />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">إضافة صورة لـِ {runner.name}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">التقط صورة للفائز أو اختر من معرض الصور.</p>
                 {error && (
                    <div className="my-4 text-center p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex flex-col gap-4 mt-6">
                    <button onClick={() => openFileDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">التقاط صورة بالكاميرا</button>
                    <button onClick={() => openFileDialog(false)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">الاختيار من المعرض</button>
                    <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default AddPhotoModal;
