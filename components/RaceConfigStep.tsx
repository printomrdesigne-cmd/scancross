
import React, { useState, useMemo, useEffect } from 'react';
import { Runner } from '../types';
import { RACE_DISTANCES, RACE_CATEGORIES, GENDERS } from '../constants';
import { BibGenerator } from './BibGenerator';

// --- Icons ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const SavedRacesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const AddRunnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const ManageDBIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const BibIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// --- Stat Icons ---
const StatRunnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const StatInstitutionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const StatProvinceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const StatAcademyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>;


const AddRunnerModal: React.FC<{
    onClose: () => void;
    onAddRunner: (newRunner: Runner) => boolean;
    availableCategories: string[];
    existingInstitutions: string[];
    existingProvinces: string[];
    existingAcademies: string[];
    existingCoaches: string[];
    existingTracks: string[];
}> = ({ 
    onClose, 
    onAddRunner, 
    availableCategories,
    existingInstitutions,
    existingProvinces,
    existingAcademies,
    existingCoaches,
    existingTracks
}) => {
    const categoriesToUse = availableCategories && availableCategories.length > 0 ? availableCategories : RACE_CATEGORIES;
    
    const [formData, setFormData] = useState<Runner>({ 
        bibNumber: '', 
        name: '', 
        institution: '', 
        province: '', 
        academy: '',
        coach: '', 
        category: categoriesToUse[0], 
        gender: GENDERS[0], 
        trackId: '', 
        dob: '',
        photo: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bibNumber || !formData.name || !formData.institution || !formData.province) {
            setError('الرجاء ملء الحقول الإلزامية.');
            return;
        }
        const newRunner: Runner = { ...formData, bibNumber: formData.bibNumber.trim(), name: formData.name.trim(), institution: formData.institution.trim(), province: formData.province.trim(), academy: formData.academy.trim(), coach: formData.coach.trim(), trackId: formData.trackId.trim(), dob: formData.dob.trim(), photo: formData.photo?.trim() };
        if (onAddRunner(newRunner)) onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg text-right border border-slate-100 dark:border-slate-700">
                <h3 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white">إضافة متسابق جديد</h3>
                {error && <p className="mb-4 text-center text-rose-600 bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">رقم الصدرية <span className="text-rose-500">*</span></label>
                            <input type="text" name="bibNumber" value={formData.bibNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">الاسم الكامل <span className="text-rose-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">المؤسسة <span className="text-rose-500">*</span></label>
                            <input type="text" name="institution" value={formData.institution} onChange={handleChange} list="institution-list" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                            <datalist id="institution-list">{existingInstitutions.map(inst => <option key={inst} value={inst} />)}</datalist>
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">المديرية الإقليمية <span className="text-rose-500">*</span></label>
                            <input type="text" name="province" value={formData.province} onChange={handleChange} list="province-list" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                            <datalist id="province-list">{existingProvinces.map(prov => <option key={prov} value={prov} />)}</datalist>
                         </div>
                         <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">الأكاديمية الجهوية</label>
                            <input type="text" name="academy" value={formData.academy} onChange={handleChange} list="academy-list" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                            <datalist id="academy-list">{existingAcademies.map(ac => <option key={ac} value={ac} />)}</datalist>
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">الفئة</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                                {categoriesToUse.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">الجنس</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">المؤطر</label>
                             <input type="text" name="coach" value={formData.coach} onChange={handleChange} list="coach-list" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                            <datalist id="coach-list">{existingCoaches.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">رقم مسار</label>
                             <input type="text" name="trackId" value={formData.trackId} onChange={handleChange} list="track-list" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                            <datalist id="track-list">{existingTracks.map(t => <option key={t} value={t} />)}</datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">تاريخ الازدياد</label>
                            <input type="text" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">الصورة (الكود)</label>
                            <input type="text" name="photo" value={formData.photo} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all">إضافة</button>
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-8 rounded-xl transition-all">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditRunnerModal: React.FC<{ runner: Runner; onClose: () => void; onSave: (bib: string, data: Partial<Runner>) => void; }> = ({ runner, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: runner.name, institution: runner.institution, province: runner.province, academy: runner.academy, dob: runner.dob, gender: runner.gender, coach: runner.coach, category: runner.category, trackId: runner.trackId, photo: runner.photo || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(runner.bibNumber, formData); onClose(); };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg text-right">
                <h3 className="text-xl font-bold mb-4 text-center text-slate-800 dark:text-white">تعديل بيانات المتسابق</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                     <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-1">رقم الصدرية</label>
                        <input type="text" value={runner.bibNumber} readOnly className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
                    </div>
                    {['name', 'institution', 'province', 'academy', 'photo'].map(f => (
                         <div key={f}><label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{f === 'name' ? 'الاسم' : f === 'institution' ? 'المؤسسة' : f === 'province' ? 'المديرية' : f === 'photo' ? 'الصورة (كود)' : 'الأكاديمية'}</label>
                         <input type="text" name={f} value={(formData as any)[f]} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"/></div>
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

const DatabaseManagerModal: React.FC<{ runners: Runner[], onClose: () => void, onEdit: (runner: Runner) => void, onDelete: (bibNumber: string) => void }> = ({ runners, onClose, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionFilter, setInstitutionFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [runnerToDelete, setRunnerToDelete] = useState<string | null>(null);

    const uniqueInstitutions = useMemo(() => Array.from(new Set(runners.map(r => r.institution))).sort(), [runners]);
    const uniqueCategories = useMemo(() => Array.from(new Set(runners.map(r => r.category))).sort(), [runners]);

    const filteredRunners = useMemo(() => {
        return runners.filter(r => 
            (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.bibNumber.includes(searchTerm)) &&
            (institutionFilter === 'All' || r.institution === institutionFilter) &&
            (categoryFilter === 'All' || r.category === categoryFilter) &&
            (genderFilter === 'All' || r.gender === genderFilter)
        );
    }, [runners, searchTerm, institutionFilter, categoryFilter, genderFilter]);

    const confirmDelete = () => {
        if (runnerToDelete) {
            onDelete(runnerToDelete);
            setRunnerToDelete(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-5xl text-right flex flex-col h-[85vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">قاعدة البيانات ({filteredRunners.length} / {runners.length})</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input type="text" placeholder="بحث بالاسم أو الرقم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-4 w-full pr-4 pl-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white shadow-sm" />
                    
                    <select value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                        <option value="All">كل المؤسسات</option>
                        {uniqueInstitutions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                    </select>

                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                        <option value="All">كل الفئات</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                     <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                        <option value="All">كل الأجناس</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="flex-grow overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                            <tr>
                                <th className="px-3 py-4 text-center">رقم الصدرية</th>
                                <th className="px-4 py-4">الاسم</th>
                                <th className="px-4 py-4">المؤسسة</th>
                                <th className="px-4 py-4">المديرية</th>
                                <th className="px-4 py-4">الأكاديمية</th>
                                <th className="px-4 py-4">الصورة</th>
                                <th className="px-2 py-4">الفئة/الجنس</th>
                                <th className="px-4 py-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredRunners.map(runner => (
                                <tr key={runner.bibNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-3 py-3 font-mono text-center font-bold text-indigo-600 dark:text-indigo-400">{runner.bibNumber}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{runner.name}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{runner.institution}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{runner.province}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{runner.academy}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{runner.photo}</td>
                                    <td className="px-2 py-3 text-xs text-slate-500">{runner.category}<br/>{runner.gender}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onEdit(runner)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg dark:hover:bg-slate-600 transition-colors"><EditIcon/></button>
                                            <button onClick={() => setRunnerToDelete(runner.bibNumber)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-slate-600 transition-colors"><DeleteIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {runnerToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100 dark:border-slate-700 animate-scale-in">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">هل أنت متأكد من رغبتك في حذف المتسابق رقم <span className="font-bold text-slate-800 dark:text-slate-200">{runnerToDelete}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
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

interface RaceConfigStepProps {
    runners: Runner[];
    onRaceConfigured: (distance: string, category: string, gender: string) => void;
    onViewSavedRaces: () => void;
    onAddRunner: (newRunner: Runner) => boolean;
    onUpdateRunnerInDb: (bibNumber: string, updatedData: Partial<Runner>) => void;
    onDeleteRunnerFromDb: (bibNumber: string) => void;
    onManageSheets?: () => void;
    onShowScriptHelp?: () => void;
    scriptUrl?: string;
    onScriptUrlChange?: (url: string) => void;
    sheetId: string;
    onSheetIdUpdate: (newSheetId: string) => void;
}

export const RaceConfigStep: React.FC<RaceConfigStepProps> = ({ 
    runners, onRaceConfigured, onViewSavedRaces, 
    onAddRunner, onUpdateRunnerInDb, onDeleteRunnerFromDb, 
    sheetId, onSheetIdUpdate
}) => {
    const [distance, setDistance] = useState(RACE_DISTANCES[0]);
    const [category, setCategory] = useState(RACE_CATEGORIES[0]);
    const [gender, setGender] = useState(GENDERS[0]);
    const [raceName, setRaceName] = useState('');
    const [showRunnersList, setShowRunnersList] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDbManagerOpen, setIsDbManagerOpen] = useState(false);
    const [isBibGeneratorOpen, setIsBibGeneratorOpen] = useState(false);
    const [runnerToEdit, setRunnerToEdit] = useState<Runner | null>(null);

    // New State for Sheet ID Warning Modal
    const [isMissingSheetIdModalOpen, setIsMissingSheetIdModalOpen] = useState(false);
    const [tempSheetId, setTempSheetId] = useState('');

    const uniqueInstitutions = useMemo(() => Array.from(new Set(runners.map(r => r.institution).filter(Boolean))).sort(), [runners]);
    const uniqueProvinces = useMemo(() => Array.from(new Set(runners.map(r => r.province).filter(Boolean))).sort(), [runners]);
    const uniqueAcademies = useMemo(() => Array.from(new Set(runners.map(r => r.academy).filter(Boolean))).sort(), [runners]);
    const uniqueCoaches = useMemo(() => Array.from(new Set(runners.map(r => r.coach).filter(Boolean))).sort(), [runners]);
    const uniqueTracks = useMemo(() => Array.from(new Set(runners.map(r => r.trackId).filter(Boolean))).sort(), [runners]);
    
    const stats = useMemo(() => {
        const institutions = new Set(runners.map(r => r.institution));
        const provinces = new Set(runners.map(r => r.province));
        const academies = new Set(runners.map(r => r.academy));
        return {
            totalRunners: runners.length,
            totalInstitutions: institutions.size,
            totalProvinces: provinces.size,
            totalAcademies: academies.size,
        };
    }, [runners]);

    const availableCategories = useMemo(() => {
        if (runners.length === 0) return RACE_CATEGORIES;
        const categories = new Set(runners.map(r => r.category));
        return Array.from(categories).sort();
    }, [runners]);
    
    useEffect(() => { if (availableCategories.length > 0 && !availableCategories.includes(category)) setCategory(availableCategories[0]); }, [availableCategories, category]);

    const availableGenders = useMemo(() => {
        if (runners.length === 0) return GENDERS;
        const genders = new Set(runners.filter(r => r.category === category).map(r => r.gender));
        return genders.size > 0 ? Array.from(genders) : GENDERS;
    }, [runners, category]);

    useEffect(() => { if(availableGenders.length > 0 && !availableGenders.includes(gender)) setGender(availableGenders[0]); }, [availableGenders, gender]);

    useEffect(() => {
        const getAutoDistance = (cat: string, gen: string) => {
            const normalizedGen = gen.trim().toLowerCase();
            const isFemale = ['إناث','أنثى','انثى','fille','female','f'].includes(normalizedGen);
            if (cat.includes('2013') || cat.includes('فما فوق')) return isFemale ? '1000 م' : '1500 م';
            if (cat.includes('2011') || cat.includes('2012')) return isFemale ? '2000 م' : '3000 م';
            if (cat.includes('2009') || cat.includes('2010')) return isFemale ? '3000 م' : '4000 م';
            if (cat.includes('2007') || cat.includes('2008')) return isFemale ? '3000 م' : '5000 م';
            return null;
        };
        const autoDist = getAutoDistance(category, gender);
        if (autoDist && RACE_DISTANCES.includes(autoDist)) setDistance(autoDist);
    }, [category, gender]);

    const filteredRunners = useMemo(() => runners.filter(r => r.category === category && r.gender === gender), [runners, category, gender]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for Sheet ID
        if (!sheetId || sheetId.trim() === '') {
            setTempSheetId(''); // Reset temp input
            setIsMissingSheetIdModalOpen(true);
            return;
        }

        startRace();
    };

    const startRace = () => {
        localStorage.setItem('CURRENT_RACE_NAME', raceName);
        onRaceConfigured(distance, category, gender);
    }

    const handleSaveIdAndStart = () => {
        if (tempSheetId.trim()) {
            onSheetIdUpdate(tempSheetId);
        }
        setIsMissingSheetIdModalOpen(false);
        startRace();
    };

    const handleEditRunner = (runner: Runner) => setRunnerToEdit(runner);
    const handleSaveEdit = (bibNumber: string, updatedData: Partial<Runner>) => { onUpdateRunnerInDb(bibNumber, updatedData); setRunnerToEdit(null); };
    
    // Removed Sheet Manager and Script Code buttons to keep them background-only
    const managementButtons = [
        { title: 'إضافة متسابق', icon: <AddRunnerIcon />, action: () => setIsAddModalOpen(true), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { title: 'قاعدة البيانات', icon: <ManageDBIcon />, action: () => setIsDbManagerOpen(true), color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
        { title: 'إنشاء الصدريات', icon: <BibIcon />, action: () => setIsBibGeneratorOpen(true), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { title: 'الأرشيف', icon: <SavedRacesIcon />, action: onViewSavedRaces, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ];

    return (
        <div className="text-center">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-10 tracking-tight">الخطوة 2: تهيئة السباق</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <StatRunnerIcon />
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{stats.totalRunners}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">متسابق</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <StatInstitutionIcon />
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.totalInstitutions}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">مؤسسة</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <StatProvinceIcon />
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.totalProvinces}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">مديرية إقليمية</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <StatAcademyIcon />
                    <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">{stats.totalAcademies}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">أكاديمية جهوية</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                    <div className="mb-8 text-right">
                        <label htmlFor="raceName" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم السباق <span className="text-slate-400 font-normal text-xs">(اختياري)</span></label>
                        <input type="text" id="raceName" value={raceName} onChange={(e) => setRaceName(e.target.value)} placeholder="مثال: سباق 2007 ذكور"
                            className="block w-full px-5 py-3 text-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl shadow-sm transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 'category', label: 'الفئة العمرية والنوع', val: category, set: setCategory, opts: availableCategories },
                            { id: 'gender', label: 'الجنس', val: gender, set: setGender, opts: availableGenders },
                            { id: 'distance', label: 'المسافة', val: distance, set: setDistance, opts: RACE_DISTANCES, dis: true }
                        ].map(field => (
                            <div key={field.id} className="text-right">
                                <label htmlFor={field.id} className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                                <div className="relative">
                                    <select id={field.id} value={field.val} onChange={(e) => field.set(e.target.value)} disabled={field.dis}
                                        className={`block w-full px-4 py-3 text-base font-semibold border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${field.dis ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                                    >
                                        {field.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                            عدد المتسابقين المؤهلين: <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold mx-2 text-xl">{filteredRunners.length}</span>
                        </p>
                        {filteredRunners.length > 0 && (
                            <button type="button" onClick={() => setShowRunnersList(!showRunnersList)} className="mt-2 text-sm text-indigo-500 hover:text-indigo-700 font-semibold underline decoration-2 decoration-indigo-200 hover:decoration-indigo-500 transition-all">
                                {showRunnersList ? 'إخفاء القائمة' : 'عرض الأسماء'}
                            </button>
                        )}
                    </div>
                </div>

                 {showRunnersList && filteredRunners.length > 0 && (
                    <div className="mt-4 mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">رقم الصدرية</th>
                                    <th className="px-4 py-2">الاسم</th>
                                    <th className="px-4 py-2">المؤسسة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredRunners.map(r => (
                                    <tr key={r.bibNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-2 font-mono">{r.bibNumber}</td>
                                        <td className="px-4 py-2 font-medium">{r.name}</td>
                                        <td className="px-4 py-2 text-slate-500">{r.institution}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button type="submit" disabled={filteredRunners.length === 0}
                        className="w-full sm:w-auto flex-1 py-4 px-10 rounded-2xl shadow-lg shadow-indigo-300/50 dark:shadow-none text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-1"
                    >
                        بدء السباق
                    </button>
                </div>
            </form>
            
            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
                {/* Script URL input hidden for user safety, runs in background */}
                <h3 className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-wider">أدوات الإدارة</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {managementButtons.map((btn, idx) => (
                        <button key={idx} onClick={btn.action} className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <div className={`p-3 rounded-full mb-3 transition-colors ${btn.bg} ${btn.color} group-hover:scale-110 transform duration-300`}>
                                {btn.icon}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">{btn.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {isAddModalOpen && <AddRunnerModal onClose={() => setIsAddModalOpen(false)} onAddRunner={onAddRunner} availableCategories={availableCategories} existingInstitutions={uniqueInstitutions} existingProvinces={uniqueProvinces} existingAcademies={uniqueAcademies} existingCoaches={uniqueCoaches} existingTracks={uniqueTracks} />}
            {isDbManagerOpen && <DatabaseManagerModal runners={runners} onClose={() => setIsDbManagerOpen(false)} onEdit={handleEditRunner} onDelete={onDeleteRunnerFromDb} />}
            {isBibGeneratorOpen && <BibGenerator runners={runners} onClose={() => setIsBibGeneratorOpen(false)} />}
            {runnerToEdit && <EditRunnerModal runner={runnerToEdit} onClose={() => setRunnerToEdit(null)} onSave={handleSaveEdit} />}
            
            {/* Missing Sheet ID Modal */}
            {isMissingSheetIdModalOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4 text-right" dir="rtl">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-amber-400 dark:border-amber-600 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">تنبيه: معرف الشيت مفقود</h3>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            لم يتم إدخال <b>معرف الشيت (Sheet ID)</b>. بدون هذا المعرف، لن يتم إرسال النتائج إلى جداول Google وسيتم حفظها محلياً فقط.
                            <br/><br/>
                            المرجو التأكد من إدخال معرف الشيت الصحيح للمتابعة.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">معرف الشيت (Spreadsheet ID)</label>
                            <input 
                                type="text" 
                                value={tempSheetId} 
                                onChange={(e) => setTempSheetId(e.target.value)} 
                                placeholder="مثال: 1DRmsFNhJ9dYwEHDgNE_..."
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white dir-ltr text-left font-mono text-sm" 
                            />
                            <p className="text-xs text-slate-400 mt-1">يوجد بين /d/ و /edit في رابط الشيت.</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleSaveIdAndStart} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-amber-200 dark:shadow-none">
                                حفظ المعرف وبدء السباق
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => { setIsMissingSheetIdModalOpen(false); startRace(); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm">
                                    متابعة بدون شيت (محلي)
                                </button>
                                <button onClick={() => setIsMissingSheetIdModalOpen(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/50 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm">
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
