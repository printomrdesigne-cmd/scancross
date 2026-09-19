
import React from 'react';

interface StepTrackerProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const steps = ["تحميل البيانات", "تهيئة السباق", "مسح النتائج", "النتائج النهائية"];

export const StepTracker: React.FC<StepTrackerProps> = ({ currentStep, onStepClick }) => {
    return (
        <div className="w-full px-2 sm:px-0 no-print py-4">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full"></div>
                
                {/* Active Line Progress (approximate) */}
                <div 
                    className="absolute top-1/2 right-0 h-1 bg-indigo-500 -z-0 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;

                    return (
                        <div key={step} className="flex flex-col items-center group cursor-pointer" onClick={() => onStepClick && onStepClick(stepNumber)}>
                            <div className={`
                                w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 border-4 cursor-pointer
                                ${isCompleted 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-100 hover:scale-110' 
                                    : isActive 
                                        ? 'bg-white dark:bg-gray-800 border-indigo-600 text-indigo-600 scale-110 shadow-xl' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-400'
                                }
                            `}>
                                {isCompleted ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            <div className={`
                                mt-2 text-[10px] sm:text-xs font-semibold transition-colors duration-300 absolute -bottom-6 w-32 text-center
                                ${isActive ? 'text-indigo-700 dark:text-indigo-400' : isCompleted ? 'text-indigo-600/70 dark:text-indigo-400/70' : 'text-gray-400'}
                            `}>
                                {step}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="h-8"></div> {/* Spacer for absolute text */}
        </div>
    );
};
