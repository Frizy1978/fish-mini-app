import { formatCurrency, type RequestRecord, type UserProfile } from '@fominiapp/shared';

import { Input } from '../ui/input';
import { Panel } from '../ui/panel';
import { SectionHeading } from '../ui/section-heading';

export function ProfilePanel({
  profile,
  requests,
  onChange
}: {
  profile: UserProfile;
  requests: RequestRecord[];
  onChange: (field: keyof UserProfile, value: string) => void;
}) {
  return (
    <div className='space-y-4'>
      <SectionHeading title='Профиль' subtitle='Контакты и история заказов' />

      <Panel className='bg-softblue/65'>
        <p className='text-sm text-slate-500'>Ваш Telegram</p>
        <h2 className='mt-2 font-display text-[28px] font-bold text-ink'>
          {profile.firstName}
          {profile.lastName ? ` ${profile.lastName}` : ''}
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          {profile.telegramUsername ? `@${profile.telegramUsername}` : 'username можно добавить позже'}
        </p>
      </Panel>

      <Panel className='space-y-4'>
        <SectionHeading title='Контакты' subtitle='Данные для подтверждения заказа' />
        <div className='grid gap-3'>
          <Input placeholder='Имя' value={profile.firstName} onChange={(event) => onChange('firstName', event.target.value)} />
          <Input placeholder='Фамилия' value={profile.lastName ?? ''} onChange={(event) => onChange('lastName', event.target.value)} />
          <Input placeholder='Телефон' value={profile.phone} onChange={(event) => onChange('phone', event.target.value)} />
        </div>
      </Panel>

      <Panel className='space-y-4 bg-mist'>
        <SectionHeading title='История заявок' subtitle='Последние оформленные предзаказы' />
        {requests.length ? (
          <div className='space-y-3'>
            {requests.map((request) => (
              <div key={request.requestId} className='rounded-panel border border-white bg-white p-4 shadow-soft'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='font-accent text-sm font-semibold text-ink'>{request.requestId}</p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {new Date(request.submittedAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <p className='font-accent text-sm font-semibold text-brand'>
                    {formatCurrency(request.estimatedTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm leading-6 text-slate-500'>
            После первой отправки заявки история появится здесь.
          </p>
        )}
      </Panel>
    </div>
  );
}
