import React from "react";
import { useTranslation } from "react-i18next";

const SECTION_KEYS = [
  'whoWeAre',
  'ourPurpose',
  'whatWeOffer',
  'easyToUsePlatform',
  'responsibleGaming',
  'safetyAndPrivacy',
  'fairPlay',
  'continuousImprovement',
  'legalUse',
  'supportAndAssistance'
];

const SECTION_IMAGES = {
  whoWeAre: "../../public/webimage/whoweare.png",
  ourPurpose: "../../public/webimage/our-purpose.png",
  whatWeOffer: "../../public/webimage/what-we-offer.png",
  easyToUsePlatform: "../../public/webimage/fair-play.png",
  responsibleGaming: "../../public/webimage/responsible-gaming.png",
  safetyAndPrivacy: "../../public/webimage/safety-privacy.png",
  fairPlay: "../../public/webimage/fair-play.png",
  continuousImprovement: "../../public/webimage/continuous-improvement.png",
  legalUse: "../../public/webimage/legal.png",
  supportAndAssistance: "../../public/webimage/support.png"
};

const AboutsPage = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        <div className="text-center max-w-3xl mx-auto py-20">
          <h1
            className="text-4xl sm:text-5xl font-extrabold
            bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
            text-transparent bg-clip-text"
          >
            {t('aboutPage.pageTitle')}
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            {t('aboutPage.pageSubtitle')}
          </p>
        </div>

        {SECTION_KEYS.map((key, index) => {
          const imageLeft = index % 2 === 0;
          const title = t(`aboutPage.sections.${key}.title`);
          const content = t(`aboutPage.sections.${key}.content`, { returnObjects: true });
          const contentArray = Array.isArray(content) ? content : [content];

          return (
            <div
              key={key}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div
                className={`flex justify-center ${
                  imageLeft ? "md:order-1" : "md:order-2"
                }`}
              >
                <div
                  className="w-full max-w-sm rounded-2xl overflow-hidden
                  border border-yellow-500/20
                  bg-yellow-500/5"
                >
                  <img
                    src={SECTION_IMAGES[key]}
                    alt={title}
                    className="w-full h-auto object-contain p-6"
                  />
                </div>
              </div>

              <div
                className={`${imageLeft ? "md:order-2" : "md:order-1"}`}
              >
                <h2
                  className="text-2xl font-bold mb-4
                  bg-gradient-to-r from-yellow-400 to-yellow-600
                  text-transparent bg-clip-text"
                >
                  {title}
                </h2>

                <div className="space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {contentArray.map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
};

export default AboutsPage;
