import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-20" id="Aboutus">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
            <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide
                bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            >
                {t('aboutUs.badge')}
            </span>

            <h2
                className="mt-6 text-3xl sm:text-4xl font-extrabold
                bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
                text-transparent bg-clip-text"
            >
                {t('aboutUs.title')}
            </h2>

            <p
                className="mt-4 text-base sm:text-lg
                text-zinc-600 dark:text-zinc-400"
            >
                {t('aboutUs.subtitle')}
            </p>
            </div>

            {/* Content Card */}
            <div
            className="relative rounded-2xl border p-8 sm:p-12
            bg-white dark:bg-zinc-900
            border-zinc-200 dark:border-zinc-800
            shadow-sm dark:shadow-none"
            >
            <div className="grid md:grid-cols-3 gap-10 items-center">

                {/* Icon / Vector */}
                <div className="flex md:justify-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center
                    bg-yellow-500/10 text-yellow-500
                    border border-yellow-500/20"
                >
                    <ShieldCheck size={36} strokeWidth={2.2} />
                </div>
                </div>

                {/* Text Content */}
                <div className="md:col-span-2 space-y-4">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {t('aboutUs.welcome')}
                </p>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {t('aboutUs.design')}
                </p>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {t('aboutUs.focus')}
                </p>

                {/* BUTTON */}
                <div className="pt-6">
                    <Link
                    to="/aboutus"
                    className="inline-flex items-center justify-center
                    px-6 py-3 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
                    text-black hover:opacity-90 transition"
                    >
                    {t('aboutUs.readMore')}
                    </Link>
                </div>

                </div>
            </div>
            </div>

        </div>
    </section>
  );
};

export default AboutUs;
