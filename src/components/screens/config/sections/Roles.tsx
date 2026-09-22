'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { SCOPES, PERMS } from '@/lib/constants';
import { CfgHd, DelBtn } from '../shared';

export function CfgRoles() {
  const s = useStore();
  const used = (id: string) => (s.data?.leaderboard || []).filter((p) => (p.role || 'DSE') === id).length;

  const addRole = () =>
    s.edit((st) => st.roles.push({ id: 'ROLE' + Date.now().toString().slice(-4), label: 'New role', scope: 'self', kra: 'sales', perms: ['self.view'] }));
  const delRole = (i: number) => s.edit((st) => st.roles.splice(i, 1));
  const togglePerm = (i: number, k: string) =>
    s.edit((st) => {
      const r = st.roles[i];
      const at = r.perms.indexOf(k);
      if (at >= 0) r.perms.splice(at, 1);
      else r.perms.push(k);
    });

  return (
    <div className="cfg-card">
      <CfgHd
        t="Roles & access"
        d="Scope decides how much of the floor a role can see. Permissions decide which screens exist for them at all. Both take effect the moment they are saved — no release needed."
        action={
          <button className="btn" onClick={addRole}>
            <Icon name="i-plus" c="ico ico-s" />
            Add role
          </button>
        }
      />
      <div className="cfg-note">
        <Icon name="i-info" c="ico ico-m" />
        <span>
          A role with only <b>Own dashboard</b> never sees another person&apos;s figures. Give <b>Their team</b> to anyone who runs a desk, and keep <b>Edit the ruleset</b> to the few people who set targets.
        </span>
      </div>
      {s.roles.map((r, i) => (
        <div style={{ padding: '15px 17px', borderBottom: '1px solid var(--line)' }} key={i}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) 190px 120px 30px', gap: 12, alignItems: 'center' }}>
            <input className="cfg-in txt" value={r.label} style={{ fontWeight: 600 }} onChange={(e) => s.edit((st) => (st.roles[i].label = e.target.value))} />
            <select className="cfg-in" value={r.scope} style={{ fontSize: 11 }} onChange={(e) => s.edit((st) => (st.roles[i].scope = e.target.value as any))}>
              {Object.entries(SCOPES).map(([k, v]) => (
                <option value={k} key={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              className="cfg-in"
              value={r.kra}
              style={{ fontSize: 11 }}
              onChange={(e) =>
                s.edit((st) => {
                  st.roles[i].kra = e.target.value;
                })
              }
            >
              {Object.entries(s.kraTemplates).map(([k, v]) => (
                <option value={k} key={k}>
                  {v.label}
                </option>
              ))}
            </select>
            {s.roles.length > 1 ? <DelBtn onClick={() => delRole(i)} /> : <span />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
            {PERMS.map((pm) => {
              const on = r.perms.includes(pm.k);
              return (
                <span className={`permchip ${on ? 'on' : ''}`} title={pm.d} key={pm.k} onClick={() => togglePerm(i, pm.k)}>
                  {on && <Icon name="i-check" c="ico ico-s" />}
                  {pm.t}
                </span>
              );
            })}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--dim)', marginTop: 9 }}>
            {r.id} · {used(r.id)} {used(r.id) === 1 ? 'person' : 'people'} on this role
          </div>
        </div>
      ))}
      <div className="cfg-foot">
        <span style={{ color: 'var(--mut)' }}>
          {s.roles.length} roles · {s.roles.filter((r) => r.perms.includes('config.edit')).length} can edit the ruleset
        </span>
        <button className="btn" onClick={() => s.openSheet({ type: 'roles' })}>
          Preview a role
        </button>
      </div>
    </div>
  );
}
