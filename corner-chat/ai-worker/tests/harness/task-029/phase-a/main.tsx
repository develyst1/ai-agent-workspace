// Throwaway (TASK-029 phase A): mounts the two NEW screens on their in-memory fakes, because the routes are not wired until phase B.
// ?screen=conditions | conditions-empty | conditions-prefill | zimbra | zimbra-connected . Not part of the product.
import { createRoot } from 'react-dom/client'
import 'antd-mobile/es/global'
import { ConditionsScreen, createFakeConditions, fakeGroups } from '@app/features/conditions'
import { CS } from '@app/features/conditions/strings'
import { ZimbraScreen, createFakeZimbra } from '@app/features/zimbra'
import { ZS } from '@app/features/zimbra/strings'

const screen = new URLSearchParams(location.search).get('screen') ?? 'conditions'
const loadGroups = () => Promise.resolve(fakeGroups)

const conditionsRepo = createFakeConditions(screen === 'conditions-empty' ? { rules: [] } : {})
const zimbraRepo = createFakeZimbra(screen === 'zimbra-connected' ? 'me@example.test' : null)

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', minHeight: 48, padding: '0 16px', borderBottom: '1px solid #eee' }}>
        <h1 data-testid="screen-title" style={{ margin: 0, fontSize: 18 }}>{title}</h1>
      </header>
      {children}
    </section>
  )
}

createRoot(document.getElementById('root')!).render(
  screen.startsWith('zimbra') ? (
    <Frame title={ZS.title}>
      <ZimbraScreen repo={zimbraRepo} />
    </Frame>
  ) : (
    <Frame title={CS.title}>
      <ConditionsScreen
        repo={conditionsRepo}
        loadGroups={loadGroups}
        prefillRule={screen === 'conditions-prefill' ? { kind: 'sender', value: 'boss@example.test' } : undefined}
      />
    </Frame>
  ),
)
