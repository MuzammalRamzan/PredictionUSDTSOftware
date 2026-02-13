import React from "react";
import { useTranslation } from "react-i18next";

const TermsandPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {t('terms.title')}
          </h1>
          <p className="text-sm text-gray-400">
            {t('terms.lastUpdated')}
          </p>
        </div>

        <div className="mb-8">
          <p className="leading-relaxed text-gray-300">
            {t('terms.intro')}
          </p>
        </div>

        <div className="space-y-8">

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.acceptanceTitle')}</h2>
            <p className="text-gray-300 leading-relaxed">{t('terms.acceptanceBody')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.eligibilityTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.eligibility1')}</li>
              <li>{t('terms.eligibility2')}</li>
              <li>{t('terms.eligibility3')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.userAccountTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.userAccount1')}</li>
              <li>{t('terms.userAccount2')}</li>
              <li>{t('terms.userAccount3')}</li>
              <li>{t('terms.userAccount4')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.bettingRulesTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.bettingRules1')}</li>
              <li>{t('terms.bettingRules2')}</li>
              <li>{t('terms.bettingRules3')}</li>
              <li>{t('terms.bettingRules4')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.depositsTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.deposits1')}</li>
              <li>{t('terms.deposits2')}</li>
              <li>{t('terms.deposits3')}</li>
              <li>{t('terms.deposits4')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.responsibleTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.responsible1')}</li>
              <li>{t('terms.responsible2')}</li>
              <li>{t('terms.responsible3')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.privacyTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.privacy1')}</li>
              <li>{t('terms.privacy2')}</li>
              <li>{t('terms.privacy3')}</li>
              <li>{t('terms.privacy4')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.prohibitedTitle')}</h2>
            <p className="text-gray-300 mb-2">{t('terms.prohibitedIntro')}</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.prohibited1')}</li>
              <li>{t('terms.prohibited2')}</li>
              <li>{t('terms.prohibited3')}</li>
            </ul>
            <p className="text-gray-300 mt-2">{t('terms.prohibitedOutro')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.ipTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.ip1')}</li>
              <li>{t('terms.ip2')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.liabilityTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.liability1')}</li>
              <li>{t('terms.liability2')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.changesTitle')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>{t('terms.changes1')}</li>
              <li>{t('terms.changes2')}</li>
              <li>{t('terms.changes3')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('terms.contactTitle')}</h2>
            <p className="text-gray-300">{t('terms.contactBody')}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsandPolicy;
