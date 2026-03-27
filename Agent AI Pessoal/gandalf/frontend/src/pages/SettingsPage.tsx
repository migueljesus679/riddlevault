import { PageWrapper, Header } from '../components/layout';
import { ApiKeyManager, ProviderConfig, PlatformConnections, StorageConfig } from '../components/settings';

export default function SettingsPage() {
  return (
    <PageWrapper>
      <Header title="Forja" subtitle="Configuracoes e chaves API" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ApiKeyManager />
          <PlatformConnections />
        </div>
        <div className="space-y-8">
          <ProviderConfig />
          <StorageConfig />
        </div>
      </div>
    </PageWrapper>
  );
}
