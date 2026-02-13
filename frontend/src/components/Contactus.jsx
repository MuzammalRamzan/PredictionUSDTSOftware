import React from "react";
import { useTranslation } from "react-i18next";

const Contactus = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                {/* PAGE HEADER */}
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-transparent bg-clip-text">
                        {t('contact.title')}
                    </h1>
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {t('contact.intro1')}
                    </p>
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {t('contact.intro2')}
                    </p>
                </div>
                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
                    {/* LEFT SIDE - BOXED CONTACT INFO */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text"> {t('contact.contactInfo')}</h2>
                        {/* BOX 1 */}
                        <div className="rounded-xl border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" >
                            <p className="text-sm text-zinc-500 mb-1"> {t('contact.generalSupport')}</p>
                            <p className="font-semibold text-zinc-900 dark:text-white">support@perbet.live</p>
                        </div>
                        {/* BOX 2 */}
                        <div className="rounded-xl border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500 mb-1">{t('contact.infoBusiness')}</p>
                            <p className="font-semibold text-zinc-900 dark:text-white">info@perbet.live</p>
                        </div>
                        {/* BOX 3 */}
                        <div className="rounded-xl border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500 mb-1">{t('contact.supportHours')}</p>
                            <p className="font-semibold text-zinc-900 dark:text-white">{t('contact.mondayToSunday')}</p>
                            <p className="text-zinc-700 dark:text-zinc-300">{t('contact.hoursDetail')}</p>
                        </div>
                        {/* NOTE */}
                        <div className="text-sm text-zinc-500">{t('contact.emailNote')}</div>
                    </div>
                    {/* RIGHT SIDE - CONTACT FORM */}
                    <div className="rounded-2xl border p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text" >{t('contact.formTitle')}</h2>
                        <p className="mb-6 text-zinc-600 dark:text-zinc-400">{t('contact.formDesc')}</p>
                        <form className="space-y-5">
                            {/* FULL NAME */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white">{t('contact.fullName')}<span className="text-yellow-500">*</span></label>
                                <input type="text" placeholder={t('contact.placeholderFullName')} className="w-full rounded-lg px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                                <p className="text-xs text-zinc-500 mt-1"> {t('contact.fullNameHint')}</p>
                            </div>
                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white"> {t('contact.emailAddress')}<span className="text-yellow-500">*</span></label>
                                <input type="email" placeholder={t('contact.placeholderEmail')} className="w-full rounded-lg px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                                <p className="text-xs text-zinc-500 mt-1">{t('contact.emailHint')}</p>
                            </div>
                            {/* SUBJECT */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white"> {t('contact.subject')}<span className="text-yellow-500">*</span></label>
                                <input type="text" placeholder={t('contact.placeholderSubject')} className="w-full rounded-lg px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                                <p className="text-xs text-zinc-500 mt-1"> {t('contact.subjectHint')}</p>
                            </div>
                            {/* MESSAGE */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white">{t('contact.message')}<span className="text-yellow-500">*</span></label>
                                <textarea rows="5" placeholder={t('contact.placeholderMessage')} className="w-full rounded-lg px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                                <p className="text-xs text-zinc-500 mt-1"> {t('contact.messageHint')}</p>
                            </div>
                            {/* BUTTON */}
                            <button type="submit" className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:opacity-90 transition">{t('contact.sendMessage')}</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contactus;
