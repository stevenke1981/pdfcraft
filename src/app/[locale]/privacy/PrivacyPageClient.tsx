'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, Eye, Server, Trash2, Cookie, Globe, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { type Locale } from '@/lib/i18n/config';

interface PrivacyPageClientProps {
  locale: Locale;
}

export default function PrivacyPageClient({ locale }: PrivacyPageClientProps) {
  const tUi = useTranslations();
  const t = useTranslations();

  const privacyHighlights = [
    {
      icon: Server,
      title: tUi('interfaceText.noServerUploads'),
      description: tUi('interfaceText.noServerUploadsDescription'),
    },
    {
      icon: Lock,
      title: tUi('interfaceText.localProcessing'),
      description: tUi('interfaceText.localProcessingDescription'),
    },
    {
      icon: Trash2,
      title: tUi('interfaceText.automaticCleanup'),
      description: tUi('interfaceText.automaticCleanupDescription'),
    },
    {
      icon: Eye,
      title: tUi('interfaceText.noTracking'),
      description: tUi('interfaceText.noTrackingDescription'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] via-[hsl(var(--color-background))] to-[hsl(var(--color-secondary)/0.1)] py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--color-foreground))] mb-6">
                {tUi('metadata.privacy.title')}
              </h1>
              <p className="text-lg text-[hsl(var(--color-muted-foreground))]">
                {tUi('interfaceText.yourPrivacyIsOurTopPriority')} {t('common.brand')} {tUi('interfaceText.isDesignedFromTheGroundUpToProtectYourData')}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Highlights */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {privacyHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="p-6 text-center" hover>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-[hsl(var(--color-foreground))] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-8">
                {tUi('interfaceText.lastUpdatedDecember2024')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.1Introduction')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} {tUi('interfaceText.weOurOrUsIsCommittedToProtectingYourPrivacyThisPrivacyPolicyExplainsHowWeHandleYourInforma')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.2HowOurServiceWorks')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} {tUi('interfaceText.isAClientSideApplicationThisMeans')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>{tUi('interfaceText.allPdfProcessingHappensDirectlyInYourWebBrowser')}</li>
                <li>{tUi('interfaceText.yourFilesAreNeverUploadedToOurServersOrAnyThirdPartyServers')}</li>
                <li>{tUi('interfaceText.weCannotSeeAccessOrStoreYourDocuments')}</li>
                <li>{tUi('interfaceText.yourFilesRemainOnYourDeviceAtAllTimes')}</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.3InformationWeCollect')}
              </h2>
              <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))] mt-6 mb-3">
                {tUi('interfaceText.31YourFiles')}
              </h3>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                <strong>{tUi('interfaceText.weDoNotCollectYourFiles')}</strong> {tUi('interfaceText.whenYouUseOurPdfToolsYourFilesAreProcessedEntirelyWithinYourBrowserTheyAreNeverTransmitted')}
              </p>

              <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))] mt-6 mb-3">
                {tUi('interfaceText.32UsageData')}
              </h3>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.weMayCollectAnonymousUsageStatisticsToImproveOurServiceSuchAs')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>{tUi('interfaceText.whichToolsAreMostPopular')}</li>
                <li>{tUi('interfaceText.generalGeographicRegionCountryLevel')}</li>
                <li>{tUi('interfaceText.browserTypeAndVersion')}</li>
                <li>{tUi('interfaceText.deviceTypeDesktopMobileTablet')}</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.thisDataIsAggregatedAndAnonymizedItCannotBeUsedToIdentifyYouPersonally')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.4LocalStorage')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} {tUi('interfaceText.mayUseYourBrowserSLocalStorageTo')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>{tUi('interfaceText.rememberYourLanguagePreference')}</li>
                <li>{tUi('interfaceText.storeYourRecentToolHistory')}</li>
                <li>{tUi('interfaceText.saveWorkInProgressForInterruptedSessions')}</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.thisDataIsStoredOnlyOnYourDeviceAndIsNotTransmittedToUs')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.5Cookies')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.weUseMinimalCookiesForEssentialFunctionality')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li><strong>{tUi('interfaceText.essentialCookies')}</strong> {tUi('interfaceText.requiredForTheWebsiteToFunctionProperly')}</li>
                <li><strong>{tUi('interfaceText.preferenceCookies')}</strong> {tUi('interfaceText.rememberYourSettingsLikeLanguagePreference')}</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.weDoNotUseTrackingCookiesOrAdvertisingCookies')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.6ThirdPartyServices')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} {tUi('interfaceText.doesNotShareYourDataWithThirdPartiesWeDoNotUse')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>{tUi('interfaceText.thirdPartyAnalyticsThatTrackIndividualUsers')}</li>
                <li>{tUi('interfaceText.advertisingNetworks')}</li>
                <li>{tUi('interfaceText.socialMediaTrackingPixels')}</li>
                <li>{tUi('interfaceText.externalFileProcessingServices')}</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.7DataSecurity')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.sinceYourFilesNeverLeaveYourDeviceTheyAreProtectedByYourOwnDeviceSSecurityMeasuresWeRecomm')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>{tUi('interfaceText.usingAnUpToDateBrowser')}</li>
                <li>{tUi('interfaceText.keepingYourOperatingSystemUpdated')}</li>
                <li>{tUi('interfaceText.usingSecureNetworksWhenHandlingSensitiveDocuments')}</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.8YourRights')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.sinceWeDonTCollectPersonalDataThereIsNoPersonalDataToAccessCorrectOrDeleteYouCanClearYourB')} {t('common.brand')}.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.9ChildrenSPrivacy')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} {tUi('interfaceText.isNotDirectedAtChildrenUnder13WeDoNotKnowinglyCollectAnyInformationFromChildren')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.10ChangesToThisPolicy')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.weMayUpdateThisPrivacyPolicyFromTimeToTimeWeWillNotifyYouOfAnyChangesByPostingTheNewPrivac')}
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                {tUi('interfaceText.11ContactUs')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {tUi('interfaceText.ifYouHaveAnyQuestionsAboutThisPrivacyPolicyPleaseContactUsThroughOurContactPage')}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Badge */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold text-green-800">
                    {t('common.footer.privacyBadge')}
                  </p>
                  <p className="text-sm text-green-600">
                    {tUi('interfaceText.yourDocumentsAreProcessedSecurelyInYourBrowser')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
