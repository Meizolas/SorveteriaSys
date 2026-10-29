import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/app/AppShell';
import type { Store } from '@/shared/api/generated';
import { ApiProblem } from '@/shared/api/problem';
import { OperationIcon } from '@/shared/ui/OperationIcon';
import * as api from './storeApi';
import { getPrintingCapabilities, type PrintingCapabilities } from '@/shared/api/operationsApi';

type Form = {
  tradeName: string; legalName: string; taxId: string; postalCode: string; street: string;
  number: string; complement: string; district: string; city: string; stateCode: string;
  timeZone: string;
};
const emptyForm = (): Form => ({ tradeName: 'Sorvê', legalName: '', taxId: '', postalCode: '',
  street: '', number: '', complement: '', district: '', city: '', stateCode: 'BA',
  timeZone: 'America/Bahia' });
const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export function StoreConfigurationPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [printing, setPrinting] = useState<PrintingCapabilities | null>(null);

  function fill(value: Store) {
    setStore(value);
    setForm({ tradeName: value.tradeName, legalName: value.legalName ?? '', taxId: value.taxId ?? '',
      postalCode: value.address?.postalCode ?? '', street: value.address?.street ?? '',
      number: value.address?.number ?? '', complement: value.address?.complement ?? '',
      district: value.address?.district ?? '', city: value.address?.city ?? '',
      stateCode: value.address?.stateCode ?? 'BA', timeZone: value.timeZone });
  }
  async function load() {
    setLoading(true);
    try { fill(await api.getStore()); }
    catch (value) {
      if (!(value instanceof ApiProblem) || value.problem.status !== 404) {
        setError(value instanceof Error ? value.message : 'Não foi possível carregar a loja.');
      }
    } finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
    void getPrintingCapabilities().then(setPrinting).catch(() => setPrinting(null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function change(field: keyof Form, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function save() {
    if (form.tradeName.trim().length < 2) { setError('Informe o nome de uso da loja.'); return; }
    setSaving(true); setError('');
    try {
      const hasAddress = [form.postalCode, form.street, form.number, form.complement,
        form.district, form.city].some((value) => value.trim());
      const saved = await api.saveStore({ tradeName: form.tradeName.trim(),
        legalName: form.legalName.trim() || null, taxId: form.taxId.trim() || null,
        address: hasAddress ? { postalCode: digits(form.postalCode),
          street: form.street.trim(), number: form.number.trim(), complement: form.complement.trim(),
          district: form.district.trim(), city: form.city.trim(), stateCode: form.stateCode,
          countryCode: 'BR' } : null, currencyCode: 'BRL', timeZone: form.timeZone },
      store?.version ?? null);
      fill(saved); setNotice(store ? 'Configuração atualizada com sucesso.' : 'Loja configurada com sucesso.');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Não foi possível salvar a configuração.');
    } finally { setSaving(false); }
  }

  return <>
    <PageHeader title="Configuração da loja" description="Identidade e parâmetros operacionais"
      status={<Box sx={{ bgcolor: store ? '#d9f2e7' : '#fff0bd', px: 2, py: 1, fontWeight: 900 }}>
        {store ? 'CONFIGURADA' : 'CADASTRO INICIAL'}</Box>}
      action={<Button variant="contained" color="success" size="large" disabled={saving || loading}
        onClick={() => void save()} startIcon={<OperationIcon name="check" />}>
        {saving ? 'Salvando…' : 'Salvar configuração'}</Button>} />
    <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ flex: 2, width: '100%', bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: { xs: 2, sm: 3 } }}>
        <Section title="Identificação">
          <TextField label="Nome de uso" required value={form.tradeName}
            onChange={(event) => change('tradeName', event.target.value)} helperText="Nome exibido nas telas e comprovantes." />
          <TextField label="Razão social (opcional)" value={form.legalName}
            onChange={(event) => change('legalName', event.target.value)} />
          <TextField label="CNPJ (opcional)" value={form.taxId} inputMode="numeric"
            onChange={(event) => change('taxId', maskCnpj(event.target.value))} placeholder="00.000.000/0000-00" />
        </Section>
        <Section title="Endereço opcional">
          <TextField label="CEP" value={form.postalCode} inputMode="numeric"
            onChange={(event) => change('postalCode', maskCep(event.target.value))} />
          <TextField label="Logradouro" value={form.street} onChange={(event) => change('street', event.target.value)} />
          <TextField label="Número" value={form.number} onChange={(event) => change('number', event.target.value)} />
          <TextField label="Complemento" value={form.complement} onChange={(event) => change('complement', event.target.value)} />
          <TextField label="Bairro" value={form.district} onChange={(event) => change('district', event.target.value)} />
          <TextField label="Cidade" value={form.city} onChange={(event) => change('city', event.target.value)} />
          <TextField select label="UF" value={form.stateCode} onChange={(event) => change('stateCode', event.target.value)}>
            {states.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}</TextField>
        </Section>
        <Section title="Operação">
          <TextField label="Moeda" value="Real brasileiro (BRL)" disabled />
          <TextField select label="Fuso horário" value={form.timeZone} onChange={(event) => change('timeZone', event.target.value)}>
            <MenuItem value="America/Bahia">Bahia</MenuItem><MenuItem value="America/Sao_Paulo">Brasília / São Paulo</MenuItem>
            <MenuItem value="America/Manaus">Manaus</MenuItem><MenuItem value="America/Rio_Branco">Rio Branco</MenuItem>
          </TextField>
        </Section>
      </Box>
      <Stack sx={{ width: { xs: '100%', lg: 330 }, gap: 1.5 }}>
        <Box sx={{ bgcolor: '#123849', color: '#fff', p: 2.5 }}><OperationIcon name="server" size={38} />
          <Typography variant="h6" sx={{ mt: 1 }}>Resumo da unidade</Typography>
          <Typography variant="h5" sx={{ mt: 2 }}>{form.tradeName || 'Sua sorveteria'}</Typography>
          <Typography>{form.city ? `${form.city} — ${form.stateCode}` : 'Endereço não informado'}</Typography>
          <Typography sx={{ mt: 2 }}>Moeda: BRL</Typography><Typography>Fuso: {form.timeZone}</Typography></Box>
        <Alert severity="info">Razão social, CNPJ e endereço são opcionais no MVP. Estes dados ainda não habilitam emissão fiscal.</Alert>
        <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
            <OperationIcon name="print" /><Typography variant="h6">Impressão térmica</Typography>
          </Stack>
          <Typography sx={{ fontWeight: 900 }}>{printing ? `Papel ${printing.paperWidthMm} mm` : 'Verificando configuração…'}</Typography>
          <Typography variant="body2">{printing?.guidance ?? 'Use a janela de impressão do navegador.'}</Typography>
          <Box sx={{ mt: 1, bgcolor: '#d9f2e7', color: '#07563b', px: 1, py: .6, fontWeight: 900 }}>JANELA DO SISTEMA ATIVA</Box>
          <Typography variant="caption" color="text.secondary">Conexão direta ESC/POS: {printing?.directConnectorAvailable ? 'disponível' : 'não configurada'}</Typography>
        </Box>
        {store && <Typography variant="caption" color="text.secondary">Versão {store.version} · última atualização {new Date(store.updatedAt).toLocaleString('pt-BR')}</Typography>}
      </Stack>
    </Stack>
    <Snackbar open={Boolean(notice || error)} autoHideDuration={4500} onClose={() => { setNotice(''); setError(''); }}>
      <Alert severity={error ? 'error' : 'success'}>{error || notice}</Alert>
    </Snackbar>
  </>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <Box sx={{ mb: 3 }}><Typography variant="h6" sx={{ mb: 1.5, pb: .8, borderBottom: '2px solid #d5e1e8' }}>{title}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>{children}</Box></Box>;
}
function digits(value: string) { return value.replace(/\D/g, ''); }
function maskCep(value: string) { const item = digits(value).slice(0, 8); return item.replace(/(\d{5})(\d+)/, '$1-$2'); }
function maskCnpj(value: string) {
  const item = digits(value).slice(0, 14);
  return item.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
