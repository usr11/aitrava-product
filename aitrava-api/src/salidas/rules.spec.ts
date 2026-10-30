import {
  codeOf,
  holdsSeat,
  normalizeChannel,
  normalizePhone,
  numberOf,
  profile,
  refundFor,
  slugify,
} from './rules';

describe('reglas de reservas', () => {
  it('código de referencia ida y vuelta', () => {
    expect(codeOf(7)).toBe('AITRAVA-C07');
    expect(codeOf(123)).toBe('AITRAVA-C123');
    expect(numberOf('AITRAVA-C07')).toBe(7);
    expect(numberOf('c07')).toBe(7);
    expect(numberOf('123')).toBe(123);
    expect(numberOf('AITRAVA-C00')).toBeNull();
    expect(numberOf('x; drop table')).toBeNull();
  });

  it('normaliza celulares colombianos', () => {
    expect(normalizePhone('311 745 2985')).toBe('573117452985');
    expect(normalizePhone('+57 311-745-2985')).toBe('573117452985');
    expect(normalizePhone('0057 3117452985')).toBe('573117452985');
    expect(normalizePhone('6024445566')).toBeNull(); // fijo
    expect(normalizePhone('31174529')).toBeNull();
    expect(normalizePhone('')).toBeNull();
  });

  it('canal desde la URL', () => {
    expect(normalizeChannel('ig')).toBe('IG');
    expect(normalizeChannel('instagram')).toBe('IG');
    expect(normalizeChannel('GRP')).toBe('GRP');
    expect(normalizeChannel('landing')).toBe('LANDING');
    expect(normalizeChannel('<script>')).toBe('SCRIPT');
    expect(normalizeChannel('')).toBeNull();
    expect(normalizeChannel(undefined)).toBeNull();
  });

  it('el apartado vencido no ocupa cupo', () => {
    const now = new Date('2026-11-01T12:00:00Z');
    const past = new Date('2026-11-01T11:00:00Z');
    const future = new Date('2026-11-02T12:00:00Z');
    expect(holdsSeat({ status: 'requested', holdUntil: future }, now)).toBe(
      true,
    );
    expect(holdsSeat({ status: 'requested', holdUntil: past }, now)).toBe(
      false,
    );
    expect(holdsSeat({ status: 'paid', holdUntil: past }, now)).toBe(true);
    expect(holdsSeat({ status: 'cancelled', holdUntil: future }, now)).toBe(
      false,
    );
    expect(holdsSeat({ status: 'expired', holdUntil: future }, now)).toBe(
      false,
    );
  });

  it('perfil V1–V5', () => {
    const base = {
      isAdult: true,
      inCali: true,
      knowsTeam: false,
      heardFrom: 'IG',
      channel: null,
      intentValid: true,
    };
    expect(profile(base).qualifies).toBe(true);
    expect(profile({ ...base, intentValid: null }).qualifies).toBeNull();
    expect(profile({ ...base, knowsTeam: true }).qualifies).toBe(false);
    expect(profile({ ...base, inCali: false }).qualifies).toBe(false);
    // dijo "otro" pero llegó con ?c=GRP: sí vino por un canal de AiTrava
    expect(profile({ ...base, heardFrom: 'OTRO', channel: 'GRP' }).v4).toBe(
      true,
    );
    expect(
      profile({ ...base, heardFrom: 'OTRO', channel: null }).qualifies,
    ).toBe(false);
  });

  it('reembolso por anticipación', () => {
    const start = new Date('2026-11-08T11:30:00Z');
    expect(refundFor(start, new Date('2026-11-05T11:30:00Z')).percent).toBe(
      100,
    );
    expect(refundFor(start, new Date('2026-11-06T12:00:00Z')).percent).toBe(50);
    expect(refundFor(start, new Date('2026-11-08T00:00:00Z')).percent).toBe(0);
  });

  it('slug sin tildes ni símbolos', () => {
    expect(slugify('Ecoparque Lago de las Garzas (Pance)')).toBe(
      'ecoparque-lago-de-las-garzas-pance',
    );
    expect(slugify('Café & tertulia en San Antonio')).toBe(
      'cafe-tertulia-en-san-antonio',
    );
  });
});
